import type { Clock } from "../../application/ports.js"

const MAX_TRACKED_ADDRESSES = 10_000

export class TokenBucket {
  private tokens: number
  private updatedAt: number

  constructor(
    private readonly capacity: number,
    private readonly refillPerSecond: number,
    private readonly clock: Clock
  ) {
    this.tokens = capacity
    this.updatedAt = clock.now()
  }

  tryConsume(): boolean {
    const now = this.clock.now()
    const refilled = ((now - this.updatedAt) / 1000) * this.refillPerSecond
    this.tokens = Math.min(this.capacity, this.tokens + refilled)
    this.updatedAt = now
    if (this.tokens < 1) return false
    this.tokens -= 1
    return true
  }
}

export class AddressRateLimiter {
  private readonly buckets = new Map<string, TokenBucket>()

  constructor(
    private readonly capacity: number,
    private readonly refillPerSecond: number,
    private readonly clock: Clock
  ) {}

  tryConsume(address: string): boolean {
    const bucket =
      this.buckets.get(address) ?? new TokenBucket(this.capacity, this.refillPerSecond, this.clock)
    this.buckets.delete(address)
    this.buckets.set(address, bucket)
    this.forgetLeastRecent()
    return bucket.tryConsume()
  }

  private forgetLeastRecent(): void {
    for (const address of this.buckets.keys()) {
      if (this.buckets.size <= MAX_TRACKED_ADDRESSES) return
      this.buckets.delete(address)
    }
  }
}
