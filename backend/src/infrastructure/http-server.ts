import { createServer } from "node:http"
import type { RequestListener, Server, ServerResponse } from "node:http"
import type { AddressInfo } from "node:net"
import type { Registry } from "prom-client"
import type { Logger } from "../application/ports.js"
import type { FrontendHandler } from "./next-frontend.js"

const writeJson = (res: ServerResponse, status: number, body: object): void => {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  })
  res.end(JSON.stringify(body))
}

export interface AppHttpServer {
  readonly server: Server
  setFrontend(handler: FrontendHandler): void
  setReady(ready: boolean): void
}

export const createAppHttpServer = (logger: Logger): AppHttpServer => {
  let frontend: FrontendHandler | null = null
  let ready = false

  const listener: RequestListener = (req, res) => {
    const path = req.url?.split("?")[0]
    if (path === "/healthz") return writeJson(res, 200, { status: "ok" })
    if (path === "/readyz") {
      return writeJson(res, ready ? 200 : 503, { status: ready ? "ready" : "starting" })
    }
    if (frontend) {
      return void frontend(req, res).catch((failure: unknown) => {
        logger.error({ err: failure }, "frontend request failed")
        if (res.headersSent) res.destroy()
        else writeJson(res, 500, { error: "internal_error" })
      })
    }
    return writeJson(res, 404, { error: "not_found" })
  }

  return {
    server: createServer(listener),
    setFrontend: (handler) => {
      frontend = handler
    },
    setReady: (value) => {
      ready = value
    },
  }
}

export const createMetricsServer = (registry: Registry, logger: Logger): Server =>
  createServer((req, res) => {
    if (req.url?.split("?")[0] !== "/metrics") return writeJson(res, 404, { error: "not_found" })
    if (req.method !== "GET") return writeJson(res, 405, { error: "method_not_allowed" })
    return void registry.metrics().then(
      (body) => {
        res.writeHead(200, { "content-type": registry.contentType, "cache-control": "no-store" })
        res.end(body)
      },
      (failure: unknown) => {
        logger.error({ err: failure }, "metrics collection failed")
        writeJson(res, 500, { error: "internal_error" })
      }
    )
  })

export const listen = (server: Server, port: number, host: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const fail = (failure: Error) => reject(failure)
    server.once("error", fail)
    server.listen(port, host, () => {
      server.off("error", fail)
      resolve((server.address() as AddressInfo).port)
    })
  })

export const closeServer = (server: Server): Promise<void> =>
  new Promise((resolve) => {
    if (!server.listening) return resolve()
    server.close(() => resolve())
    server.closeAllConnections()
  })
