"use client";

import { useEffect } from "react";

export function PrintReadySignal() {
  useEffect(() => {
    async function signalReady() {
      await document.fonts.ready;
      await Promise.allSettled(Array.from(document.images).map((image) => image.decode()));
      window.__CATALOG_READY__ = true;
    }

    void signalReady();
  }, []);

  return null;
}
