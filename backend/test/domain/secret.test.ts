import { describe, expect, it } from "vitest"
import { sameSecret } from "../../src/domain/shared/secret.js"

describe("comparação de segredos", () => {
  it.each([
    ["token-igual-123456", "token-igual-123456", true],
    ["token-igual-123456", "token-igual-123457", false],
    ["token-igual-123456", "token-igual-12345", false],
    ["token-igual-123456", "token-igual-1234567", false],
    ["token-igual-123456", "", false],
  ])("compara %s com %s", (expected, received, same) => {
    expect(sameSecret(expected, received)).toBe(same)
  })
})
