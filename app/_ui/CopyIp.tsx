"use client";

import { useState, type ReactNode } from "react";

// Copies the server IP. Each design passes its own className and label.
export default function CopyIp({ ip, className, children }: { ip: string; className?: string; children?: ReactNode }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <button type="button" className={className} onClick={copy} aria-live="polite" title="Click to copy">
      {copied ? "Copied!" : children ?? ip}
    </button>
  );
}
