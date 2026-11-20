import { createPinoLogger } from "../infrastructure/pino-logger.js"
import { startApp } from "./app.js"
import { loadConfig } from "./config.js"

const SHUTDOWN_TIMEOUT_MS = 10_000

const config = loadConfig(process.env)
const logger = createPinoLogger(config.logLevel)

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "unhandled rejection")
})

process.on("uncaughtException", (failure) => {
  logger.error({ err: failure }, "uncaught exception")
  process.exit(1)
})

const app = await startApp(config, logger).catch((failure: unknown) => {
  logger.error({ err: failure }, "server failed to start")
  process.exit(1)
})

logger.info({ port: app.port, metricsPort: app.metricsPort }, "server ready")

const shutdown = (signal: string) => {
  logger.info({ signal }, "shutting down")
  setTimeout(() => {
    logger.error({ signal }, "shutdown timed out")
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS).unref()
  app.stop().then(
    () => process.exit(0),
    (failure: unknown) => {
      logger.error({ err: failure }, "shutdown failed")
      process.exit(1)
    }
  )
}

process.once("SIGTERM", () => shutdown("SIGTERM"))
process.once("SIGINT", () => shutdown("SIGINT"))
