import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

export { MOTION_OK, prefersReducedMotion } from "./reduced-motion"
export { gsap, ScrollTrigger, SplitText, useGSAP }
