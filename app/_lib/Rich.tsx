import type { JSONContent } from "@tiptap/core";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { extensions, sanitizeDoc } from "./editor";

// Renders a saved post document as React elements (no raw HTML), through the same schema the editor uses.
export default function Rich({ doc, className }: { doc: JSONContent; className?: string }) {
  const clean = sanitizeDoc(doc) ?? { type: "doc", content: [] };
  return <div className={className}>{renderToReactElement({ content: clean, extensions })}</div>;
}
