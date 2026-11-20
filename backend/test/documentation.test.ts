import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..")
const index = join(repository, "docs", "requisitos.md")
const SCANNED = [
  "backend/src",
  "backend/test",
  "frontend/lib",
  "frontend/components",
  "frontend/app",
]
const REQUIREMENT = /(?<![A-Z-])(?:(?:TR|TT|PK|CA|BJ)-)?(?:RNF|RN|RF)-\d{2}\b/g

const sourcesIn = (directory: string): string[] =>
  existsSync(directory)
    ? readdirSync(directory).flatMap((entry) => {
        if (entry === "node_modules") return []
        const path = join(directory, entry)
        if (statSync(path).isDirectory()) return sourcesIn(path)
        return /\.(ts|tsx)$/.test(entry) ? [path] : []
      })
    : []

const citedCodes = (): string[] => {
  const codes = SCANNED.flatMap((folder) => sourcesIn(join(repository, folder))).flatMap(
    (file) => readFileSync(file, "utf8").match(REQUIREMENT) ?? []
  )
  return [...new Set(codes)].sort()
}

describe("índice de requisitos", () => {
  it("lista todo código de requisito citado no código e nos testes", () => {
    const documented = new Set(
      [...readFileSync(index, "utf8").matchAll(/^\| ([A-Z]+(?:-[A-Z]+)?-\d{2}) +\|/gm)].map(
        (row) => row[1]
      )
    )
    const missing = citedCodes().filter((code) => !documented.has(code))
    expect(missing).toEqual([])
  })
})
