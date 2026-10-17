"use client";

import { useEffect } from "react";

import { captureAttribution } from "@/lib/attribution";

/** Saves the landing URL's query params (utm_*, placement, fbclid…) for checkout. Renders nothing. */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
