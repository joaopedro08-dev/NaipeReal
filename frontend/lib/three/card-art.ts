import type { Suit } from "@/lib/game/domain/types"

export interface CardArt {
  readonly rank: string
  readonly suit: Suit
  readonly label: string
}

export const CARD_TEXTURE_WIDTH = 1024
export const CARD_TEXTURE_HEIGHT = 1434

const SUIT_PATHS: Readonly<Record<Suit, readonly string[]>> = {
  S: [
    "M2 14.499a5.5 5.5 0 0 0 9.591 3.675.6.6 0 0 1 .818.001A5.5 5.5 0 0 0 22 14.5c0-2.29-1.5-4-3-5.5l-5.492-5.312a2 2 0 0 0-3-.02L5 8.999c-1.5 1.5-3 3.2-3 5.5",
    "M12 18v4",
  ],
  H: [
    "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
  ],
  D: [
    "M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z",
  ],
  C: [
    "M17.28 9.05a5.5 5.5 0 1 0-10.56 0A5.5 5.5 0 1 0 12 17.66a5.5 5.5 0 1 0 5.28-8.6Z",
    "M12 17.66L12 22",
  ],
}

const PALETTE = {
  paper: "#f8f3e7",
  paperShade: "#ece4d0",
  ink: "#1b1d24",
  red: "#b0242c",
  gold: "#e2b84b",
  goldDeep: "#a9822a",
  back: "#9c2a26",
  backDeep: "#5e1715",
} as const

const inkOf = (suit: Suit): string =>
  suit === "H" || suit === "D" ? PALETTE.red : PALETTE.ink

const drawSuit = (
  context: CanvasRenderingContext2D,
  suit: Suit,
  centerX: number,
  centerY: number,
  size: number,
  color: string
) => {
  const scale = size / 24
  context.save()
  context.translate(centerX - size / 2, centerY - size / 2)
  context.scale(scale, scale)
  context.fillStyle = color
  context.strokeStyle = color
  context.lineWidth = 1.6
  context.lineCap = "round"
  context.lineJoin = "round"
  for (const data of SUIT_PATHS[suit]) {
    const path = new Path2D(data)
    context.fill(path)
    context.stroke(path)
  }
  context.restore()
}

const roundedRect = (
  context: CanvasRenderingContext2D,
  inset: number,
  radius: number
) => {
  const { width, height } = context.canvas
  context.beginPath()
  context.roundRect(inset, inset, width - inset * 2, height - inset * 2, radius)
}

const createCanvas = (): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const canvas = document.createElement("canvas")
  canvas.width = CARD_TEXTURE_WIDTH
  canvas.height = CARD_TEXTURE_HEIGHT
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas 2D indisponível")
  return [canvas, context]
}

const drawIndex = (
  context: CanvasRenderingContext2D,
  art: CardArt,
  fontFamily: string
) => {
  const color = inkOf(art.suit)
  context.fillStyle = color
  context.textAlign = "center"
  context.textBaseline = "alphabetic"
  context.font = `600 178px ${fontFamily}`
  context.fillText(art.rank, 150, 236)
  drawSuit(context, art.suit, 150, 330, 104, color)
}

export const drawCardFace = (
  art: CardArt,
  fontFamily: string
): HTMLCanvasElement => {
  const [canvas, context] = createCanvas()
  const { width, height } = canvas

  const paper = context.createLinearGradient(0, 0, width * 0.4, height)
  paper.addColorStop(0, PALETTE.paper)
  paper.addColorStop(1, PALETTE.paperShade)
  context.fillStyle = paper
  context.fillRect(0, 0, width, height)

  context.strokeStyle = "rgba(27, 29, 36, 0.16)"
  context.lineWidth = 4
  roundedRect(context, 44, 40)
  context.stroke()

  context.strokeStyle = PALETTE.goldDeep
  context.globalAlpha = 0.55
  context.lineWidth = 2
  roundedRect(context, 58, 30)
  context.stroke()
  context.globalAlpha = 1

  drawIndex(context, art, fontFamily)
  context.save()
  context.translate(width, height)
  context.rotate(Math.PI)
  drawIndex(context, art, fontFamily)
  context.restore()

  drawSuit(context, art.suit, width / 2, height * 0.46, 470, inkOf(art.suit))

  context.fillStyle = PALETTE.ink
  context.globalAlpha = 0.82
  context.textAlign = "center"
  context.font = `italic 500 76px ${fontFamily}`
  context.fillText(art.label, width / 2, height * 0.8)
  context.globalAlpha = 1

  context.fillStyle = PALETTE.goldDeep
  context.fillRect(width / 2 - 90, height * 0.835, 180, 3)

  return canvas
}

export const drawCardBack = (fontFamily: string): HTMLCanvasElement => {
  const [canvas, context] = createCanvas()
  const { width, height } = canvas

  context.fillStyle = PALETTE.paper
  context.fillRect(0, 0, width, height)

  const cloth = context.createLinearGradient(0, 0, width, height)
  cloth.addColorStop(0, PALETTE.back)
  cloth.addColorStop(1, PALETTE.backDeep)
  context.fillStyle = cloth
  roundedRect(context, 52, 34)
  context.fill()

  context.save()
  roundedRect(context, 52, 34)
  context.clip()
  context.strokeStyle = "rgba(255, 244, 220, 0.16)"
  context.lineWidth = 5
  for (let offset = -height; offset < width + height; offset += 34) {
    context.beginPath()
    context.moveTo(offset, 0)
    context.lineTo(offset + height, height)
    context.moveTo(offset, height)
    context.lineTo(offset + height, 0)
    context.stroke()
  }
  context.restore()

  context.strokeStyle = PALETTE.gold
  context.lineWidth = 6
  roundedRect(context, 76, 22)
  context.stroke()

  const centerX = width / 2
  const centerY = height / 2
  context.fillStyle = PALETTE.backDeep
  context.beginPath()
  context.arc(centerX, centerY, 190, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = PALETTE.gold
  context.lineWidth = 8
  context.stroke()
  context.lineWidth = 3
  context.beginPath()
  context.arc(centerX, centerY, 162, 0, Math.PI * 2)
  context.stroke()
  drawSuit(context, "S", centerX, centerY - 18, 170, PALETTE.gold)

  context.fillStyle = PALETTE.gold
  context.textAlign = "center"
  context.font = `600 44px ${fontFamily}`
  context.fillText("NAIPE REAL", centerX, centerY + 122)

  return canvas
}

export const drawContactShadow = (): HTMLCanvasElement => {
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext("2d")
  if (!context) return canvas
  const shade = context.createRadialGradient(128, 128, 0, 128, 128, 128)
  shade.addColorStop(0, "rgba(0, 0, 0, 0.55)")
  shade.addColorStop(1, "rgba(0, 0, 0, 0)")
  context.fillStyle = shade
  context.fillRect(0, 0, 256, 256)
  return canvas
}
