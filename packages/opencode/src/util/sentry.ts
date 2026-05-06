import * as Sentry from "@sentry/bun"
import { InstallationVersion } from "@opencode-ai/core/installation/version"

export { Sentry }

let initialized = false

export function initSentry(): void {
  if (initialized) return

  const dsn = process.env.SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    release: `opencode@${InstallationVersion}`,
    environment: InstallationVersion === "local" ? "development" : "production",
  })

  initialized = true
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!initialized) return

  Sentry.captureException(error, {
    extra: context,
  })
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {
  if (!initialized) return

  Sentry.captureMessage(message, level)
}