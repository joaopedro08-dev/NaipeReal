"use client"

import { useSyncExternalStore } from "react"

import {
  loadPlayerPreferences,
  subscribeToPreferences,
} from "./player-preferences"

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

const subscribeToMotion = (listener: () => void): (() => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  const unsubscribe = subscribeToPreferences(listener)
  query.addEventListener("change", listener)
  return () => {
    unsubscribe()
    query.removeEventListener("change", listener)
  }
}

const prefersReducedMotion = (): boolean =>
  loadPlayerPreferences().reducedMotion ||
  window.matchMedia(REDUCED_MOTION_QUERY).matches

const prefersLargeCards = (): boolean =>
  loadPlayerPreferences().cardSize === "large"

const onServer = (): boolean => false

export const useReducedMotionPreference = (): boolean =>
  useSyncExternalStore(subscribeToMotion, prefersReducedMotion, onServer)

export const useLargeCardsPreference = (): boolean =>
  useSyncExternalStore(subscribeToPreferences, prefersLargeCards, onServer)
