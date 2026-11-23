import type { IncomingMessage, Server as HttpServer } from "node:http"
import { Server } from "socket.io"
import type { Socket } from "socket.io"
import type { ClientConnection, RawAck } from "../adapters/socket/connection.js"

const MAX_MESSAGE_BYTES = 4096
const PING_INTERVAL_MS = 15_000
const PING_TIMEOUT_MS = 10_000
const CONNECT_TIMEOUT_MS = 10_000
const SECOND_SOCKET_REFUSED = "ONE_SOCKET_PER_CONNECTION"

const noopAck: RawAck = () => undefined

interface EngineConnection {
  readonly request: IncomingMessage
  once(event: "close", listener: () => void): unknown
}

export interface SocketServerOptions {
  readonly corsOrigins: readonly string[]
  readonly keepForeignUpgrades: boolean
  readonly trustProxy: boolean
  readonly clientIpHeader: string
  readonly maxConnectionsPerAddress: number
}

const FORWARDED_FOR = "x-forwarded-for"

const headerValues = (value: string | string[] | undefined): string[] =>
  (Array.isArray(value) ? value.join(",") : (value ?? ""))
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)

const firstHeaderValue = (value: string | string[] | undefined): string | undefined =>
  headerValues(value)[0]

const nearestForwardedAddress = (req: IncomingMessage): string | undefined =>
  headerValues(req.headers[FORWARDED_FOR]).at(-1)

const proxiedAddressOf = (req: IncomingMessage, clientIpHeader: string): string | undefined =>
  (clientIpHeader === FORWARDED_FOR ? undefined : firstHeaderValue(req.headers[clientIpHeader])) ??
  nearestForwardedAddress(req)

const addressOf = (req: IncomingMessage, options: SocketServerOptions): string =>
  (options.trustProxy ? proxiedAddressOf(req, options.clientIpHeader) : undefined) ??
  req.socket.remoteAddress ??
  "desconhecido"

const hostOf = (origin: string): string | null => {
  try {
    return new URL(origin).host
  } catch {
    return null
  }
}

const isAllowedOrigin = (req: IncomingMessage, options: SocketServerOptions): boolean => {
  const { origin } = req.headers
  if (!origin || options.corsOrigins.includes(origin)) return true
  const forwardedHost = options.trustProxy
    ? firstHeaderValue(req.headers["x-forwarded-host"])
    : undefined
  const expectedHost = forwardedHost ?? req.headers.host
  return expectedHost !== undefined && hostOf(origin) === expectedHost
}

const trackConnections = (limit: number) => {
  const open = new Map<string, number>()
  return {
    hasRoom: (address: string): boolean => (open.get(address) ?? 0) < limit,
    opened: (address: string): void => {
      open.set(address, (open.get(address) ?? 0) + 1)
    },
    closed: (address: string): void => {
      const remaining = (open.get(address) ?? 1) - 1
      if (remaining > 0) open.set(address, remaining)
      else open.delete(address)
    },
  }
}

const oneSocketPerConnection = () => {
  const claimed = new WeakSet<object>()
  return (socket: Socket, next: (failure?: Error) => void): void => {
    const { client } = socket
    if (claimed.has(client)) return next(new Error(SECOND_SOCKET_REFUSED))
    claimed.add(client)
    socket.once("disconnect", () => claimed.delete(client))
    next()
  }
}

const toConnection = (socket: Socket, clientAddress: string): ClientConnection => ({
  clientAddress,
  on: (event, listener) => {
    socket.on(event, (...args: unknown[]) => {
      const last = args.at(-1)
      const ack = typeof last === "function" ? (last as RawAck) : noopAck
      const payload = args.length > 0 && typeof args[0] !== "function" ? args[0] : undefined
      listener(payload, ack)
    })
  },
  onDisconnect: (listener) => {
    socket.on("disconnect", listener)
  },
  emit: (event, payload) => {
    socket.emit(event, payload)
  },
  close: () => {
    socket.disconnect(true)
  },
})

export const createSocketServer = (
  httpServer: HttpServer,
  options: SocketServerOptions,
  onConnection: (connection: ClientConnection) => void
): Server => {
  const connections = trackConnections(options.maxConnectionsPerAddress)
  const io = new Server(httpServer, {
    allowRequest: (req, decide) => {
      const allowed = isAllowedOrigin(req, options) && connections.hasRoom(addressOf(req, options))
      decide(null, allowed)
    },
    serveClient: false,
    perMessageDeflate: false,
    httpCompression: false,
    maxHttpBufferSize: MAX_MESSAGE_BYTES,
    pingInterval: PING_INTERVAL_MS,
    pingTimeout: PING_TIMEOUT_MS,
    connectTimeout: CONNECT_TIMEOUT_MS,
    destroyUpgrade: !options.keepForeignUpgrades,
    ...(options.corsOrigins.length > 0 ? { cors: { origin: [...options.corsOrigins] } } : {}),
  })
  io.engine.on("connection", (raw: EngineConnection) => {
    const address = addressOf(raw.request, options)
    connections.opened(address)
    raw.once("close", () => connections.closed(address))
  })
  io.use(oneSocketPerConnection())
  io.on("connection", (socket) => {
    onConnection(toConnection(socket, addressOf(socket.request, options)))
  })
  return io
}
