import {
  ACESFilmicToneMapping,
  CanvasTexture,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  WebGLRenderer,
} from "three"
import type { BufferGeometry, Material, Texture } from "three"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"

import gsap from "gsap"
import {
  drawCardBack,
  drawCardFace,
  drawContactShadow,
} from "@/lib/three/card-art"
import type { CardArt } from "@/lib/three/card-art"

const CARD_WIDTH = 2.5
const CARD_HEIGHT = 3.5
const CARD_RADIUS = 0.17
const CARD_DEPTH = 0.035
const BEVEL = 0.012
const FIELD_OF_VIEW = 28
const FIT_MARGIN = 1.32

export interface HeroCardScene {
  readonly show: (art: CardArt) => void
  readonly point: (x: number, y: number) => void
  readonly dispose: () => void
}

export interface HeroCardSceneOptions {
  readonly canvas: HTMLCanvasElement
  readonly art: CardArt
  readonly fontFamily: string
  readonly reducedMotion: boolean
}

const cardShape = (): Shape => {
  const left = -CARD_WIDTH / 2
  const bottom = -CARD_HEIGHT / 2
  const right = CARD_WIDTH / 2
  const top = CARD_HEIGHT / 2
  const r = CARD_RADIUS
  const shape = new Shape()
  shape.moveTo(left + r, bottom)
  shape.lineTo(right - r, bottom)
  shape.absarc(right - r, bottom + r, r, -Math.PI / 2, 0, false)
  shape.lineTo(right, top - r)
  shape.absarc(right - r, top - r, r, 0, Math.PI / 2, false)
  shape.lineTo(left + r, top)
  shape.absarc(left + r, top - r, r, Math.PI / 2, Math.PI, false)
  shape.lineTo(left, bottom + r)
  shape.absarc(left + r, bottom + r, r, Math.PI, Math.PI * 1.5, false)
  return shape
}

const faceGeometry = (shape: Shape): ShapeGeometry => {
  const geometry = new ShapeGeometry(shape, 18)
  const positions = geometry.getAttribute("position")
  const uvs = geometry.getAttribute("uv")
  for (let index = 0; index < positions.count; index += 1) {
    uvs.setXY(
      index,
      (positions.getX(index) + CARD_WIDTH / 2) / CARD_WIDTH,
      (positions.getY(index) + CARD_HEIGHT / 2) / CARD_HEIGHT
    )
  }
  uvs.needsUpdate = true
  return geometry
}

const toTexture = (
  canvas: HTMLCanvasElement,
  renderer: WebGLRenderer
): CanvasTexture => {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  return texture
}

const fitDistance = (aspect: number): number => {
  const halfFov = (FIELD_OF_VIEW * Math.PI) / 360
  const byHeight = (CARD_HEIGHT * FIT_MARGIN) / 2 / Math.tan(halfFov)
  const byWidth = (CARD_WIDTH * FIT_MARGIN) / 2 / Math.tan(halfFov) / aspect
  return Math.max(byHeight, byWidth)
}

export const createHeroCardScene = ({
  canvas,
  art,
  fontFamily,
  reducedMotion,
}: HeroCardSceneOptions): HeroCardScene => {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment
  scene.environmentIntensity = 0.55

  const camera = new PerspectiveCamera(FIELD_OF_VIEW, 1, 0.1, 50)
  camera.position.set(0, 0.15, fitDistance(1))

  const key = new DirectionalLight(new Color("#fff1d6"), 2.1)
  key.position.set(-3, 4, 5)
  const rim = new DirectionalLight(new Color("#e2b84b"), 1.3)
  rim.position.set(4, -1, -3)
  scene.add(key, rim, new HemisphereLight("#f6efe0", "#0e3b2e", 0.7))

  const shape = cardShape()
  const body = new ExtrudeGeometry(shape, {
    depth: CARD_DEPTH,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 3,
    curveSegments: 18,
  })
  body.translate(0, 0, -CARD_DEPTH / 2)
  const surface = faceGeometry(shape)

  const faceTexture = {
    current: toTexture(drawCardFace(art, fontFamily), renderer),
  }
  const backTexture = toTexture(drawCardBack(fontFamily), renderer)
  const shadowTexture = new CanvasTexture(drawContactShadow())

  const edgeMaterial = new MeshPhysicalMaterial({
    color: "#d9ab3f",
    metalness: 0.9,
    roughness: 0.28,
  })
  const faceMaterial = new MeshPhysicalMaterial({
    map: faceTexture.current,
    roughness: 0.46,
    clearcoat: 0.4,
    clearcoatRoughness: 0.35,
  })
  const backMaterial = new MeshPhysicalMaterial({
    map: backTexture,
    roughness: 0.5,
    clearcoat: 0.35,
    clearcoatRoughness: 0.4,
  })
  const shadowMaterial = new MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
  })

  const card = new Group()
  const edge = new Mesh(body, edgeMaterial)
  const face = new Mesh(surface, faceMaterial)
  face.position.z = CARD_DEPTH / 2 + BEVEL + 0.0015
  const back = new Mesh(surface, backMaterial)
  back.position.z = -(CARD_DEPTH / 2 + BEVEL + 0.0015)
  back.rotation.y = Math.PI
  card.add(edge, face, back)

  const shadowGeometry = new PlaneGeometry(3.4, 1.2)
  const shadow = new Mesh(shadowGeometry, shadowMaterial)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -CARD_HEIGHT / 2 - 0.45

  const rig = new Group()
  rig.add(card)
  scene.add(rig, shadow)

  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }
  const spin = {
    y: reducedMotion ? 0 : -Math.PI,
    lift: reducedMotion ? 0 : -0.5,
  }
  let frame = 0
  let running = false

  const resize = () => {
    const { clientWidth, clientHeight } = canvas
    if (!clientWidth || !clientHeight) return
    renderer.setSize(clientWidth, clientHeight, false)
    camera.aspect = clientWidth / clientHeight
    camera.position.z = fitDistance(camera.aspect)
    camera.updateProjectionMatrix()
  }

  const draw = () => {
    frame += 1
    const time = frame / 60
    pointer.x += (pointer.targetX - pointer.x) * 0.06
    pointer.y += (pointer.targetY - pointer.y) * 0.06
    const bob = reducedMotion ? 0 : Math.sin(time * 1.15) * 0.07
    card.rotation.y = spin.y + pointer.x * 0.35
    card.rotation.x = -0.08 + pointer.y * 0.22
    card.rotation.z = reducedMotion
      ? -0.06
      : -0.06 + Math.sin(time * 0.6) * 0.025
    rig.position.y = spin.lift + bob
    const height = rig.position.y + 0.5
    shadow.scale.setScalar(1 - height * 0.25)
    shadowMaterial.opacity = 0.75 - height * 0.35
    renderer.render(scene, camera)
  }

  const start = () => {
    if (running) return
    running = true
    renderer.setAnimationLoop(draw)
  }

  const stop = () => {
    running = false
    renderer.setAnimationLoop(null)
  }

  const resizer = new ResizeObserver(() => {
    resize()
    if (!running) draw()
  })
  resizer.observe(canvas)

  const visibility = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting && !document.hidden) start()
    else stop()
  })
  visibility.observe(canvas)

  const onVisibilityChange = () => {
    if (document.hidden) stop()
    else start()
  }
  document.addEventListener("visibilitychange", onVisibilityChange)

  resize()
  if (!reducedMotion) {
    gsap.to(spin, {
      y: 0,
      lift: 0,
      duration: 1.4,
      ease: "expo.out",
      delay: 0.2,
    })
  }

  const swapFace = (next: CardArt) => {
    const previous = faceTexture.current
    faceTexture.current = toTexture(drawCardFace(next, fontFamily), renderer)
    faceMaterial.map = faceTexture.current
    faceMaterial.needsUpdate = true
    previous.dispose()
  }

  const show = (next: CardArt) => {
    if (reducedMotion) {
      swapFace(next)
      draw()
      return
    }
    gsap.killTweensOf(spin)
    let swapped = false
    gsap.fromTo(
      spin,
      { y: spin.y % (Math.PI * 2) },
      {
        y: Math.PI * 2,
        duration: 0.9,
        ease: "power3.inOut",
        onUpdate: () => {
          if (!swapped && spin.y >= Math.PI) {
            swapped = true
            swapFace(next)
          }
        },
        onComplete: () => {
          spin.y = 0
        },
      }
    )
  }

  const point = (x: number, y: number) => {
    pointer.targetX = reducedMotion ? 0 : x
    pointer.targetY = reducedMotion ? 0 : y
  }

  const dispose = () => {
    stop()
    gsap.killTweensOf(spin)
    resizer.disconnect()
    visibility.disconnect()
    document.removeEventListener("visibilitychange", onVisibilityChange)
    const geometries: BufferGeometry[] = [body, surface, shadowGeometry]
    const materials: Material[] = [
      edgeMaterial,
      faceMaterial,
      backMaterial,
      shadowMaterial,
    ]
    const textures: Texture[] = [
      faceTexture.current,
      backTexture,
      shadowTexture,
      environment,
    ]
    for (const geometry of geometries) geometry.dispose()
    for (const material of materials) material.dispose()
    for (const texture of textures) texture.dispose()
    pmrem.dispose()
    renderer.dispose()
  }

  return { show, point, dispose }
}
