import { describe, expect, it } from "vitest"
import {
  awayMessage,
  connectionMessage,
  secondsUntil,
} from "./connection-banner"

describe("indicador de conexão", () => {
  it.each([
    ["replaced", false, "outra aba"],
    ["offline", true, "Reconectando"],
    ["offline", false, "Sem conexão"],
  ] as const)("descreve %s", (connection, restoring, expected) => {
    expect(connectionMessage(connection, restoring)).toContain(expected)
  })

  it("não acusa falta de conexão de quem está online", () => {
    expect(connectionMessage("online", false)).toBeNull()
  })

  it.each([
    [[], null],
    [["Ana"], "Ana caiu da mesa."],
    [["Ana", "Bia", "Caio"], "Ana, Bia e Caio caíram da mesa."],
  ] as const)("avisa quem caiu: %j", (nicknames, expected) => {
    expect(awayMessage(nicknames)).toBe(expected)
  })

  it("conta os segundos restantes sem ficar negativo", () => {
    expect(secondsUntil(10_500, 1_000)).toBe(10)
    expect(secondsUntil(500, 1_000)).toBe(0)
    expect(secondsUntil(null, 1_000)).toBeNull()
  })
})
