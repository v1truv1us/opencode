import { describe, expect, test } from "bun:test"
import path from "path"
import { Session } from "../../src/session"
import { Log } from "../../src/util/log"
import { Instance } from "../../src/project/instance"

const projectRoot = path.join(__dirname, "../..")
Log.init({ print: false })

describe("Session.setModel", () => {
  test("setModel persists model on session", async () => {
    await Instance.provide({
      directory: projectRoot,
      fn: async () => {
        const session = await Session.create({})
        expect(session.model).toBeUndefined()

        const updated = await Session.setModel({
          sessionID: session.id,
          model: { providerID: "anthropic", modelID: "claude-sonnet-4" },
        })

        expect(updated.model).toEqual({ providerID: "anthropic", modelID: "claude-sonnet-4" })

        const fetched = await Session.get(session.id)
        expect(fetched.model).toEqual({ providerID: "anthropic", modelID: "claude-sonnet-4" })

        await Session.remove(session.id)
      },
    })
  })

  test("setModel with variant persists both model and variant", async () => {
    await Instance.provide({
      directory: projectRoot,
      fn: async () => {
        const session = await Session.create({})

        const updated = await Session.setModel({
          sessionID: session.id,
          model: { providerID: "openai", modelID: "gpt-4o" },
          variant: "gpt-4o-2024-08-06",
        })

        expect(updated.model).toEqual({ providerID: "openai", modelID: "gpt-4o" })
        expect(updated.modelVariant).toBe("gpt-4o-2024-08-06")

        await Session.remove(session.id)
      },
    })
  })

  test("setModel logs warning for unknown model but still succeeds", async () => {
    await Instance.provide({
      directory: projectRoot,
      fn: async () => {
        const session = await Session.create({})

        // This should not throw even though the model doesn't exist
        const updated = await Session.setModel({
          sessionID: session.id,
          model: { providerID: "unknown-provider", modelID: "unknown-model" },
        })

        expect(updated.model).toEqual({ providerID: "unknown-provider", modelID: "unknown-model" })

        await Session.remove(session.id)
      },
    })
  })
})
