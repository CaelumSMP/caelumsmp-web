"use client";

import type { PointerEvent, ReactNode } from "react";

// Signature interaction: exposes the pointer position as --mx / --my (-1..1) so CSS can tilt and shift children.
export default function Tilt({ className, children }: { className?: string; children: ReactNode }) {
  function move(e: PointerEvent<HTMLDivElement>) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  }
  return (
    <div className={className} onPointerMove={move}>
      {children}
    </div>
  );
}
