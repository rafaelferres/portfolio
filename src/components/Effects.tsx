"use client";

import { useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – plain JS module shared with the artifact preview
import { initEffects } from "@/lib/effects";

export default function Effects() {
  useEffect(() => {
    initEffects(document);
  }, []);
  return null;
}
