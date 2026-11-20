import { describe, expect, it } from "vitest"
import { AddressRateLimiter } from "../../src/adapters/socket/rate-limiter.js"

describe("limite por endereço", () => {
  it("mantém o bloqueio de quem já esgotou a cota mesmo com muitos endereços novos", () => {
    const limiter = new AddressRateLimiter(1, 0, { now: () => 0 })
    expect(limiter.tryConsume("abusivo")).toBe(true)
    expect(limiter.tryConsume("abusivo")).toBe(false)
    for (let index = 0; index < 500; index++) limiter.tryConsume(`novo-${index}`)
    expect(limiter.tryConsume("abusivo")).toBe(false)
  })
})
