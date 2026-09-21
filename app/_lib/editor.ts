// The one TipTap schema used by both the post editor (client) and the article renderer (server),
// so whatever the editor can produce, the site can render, and nothing else.
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "@tiptap/core";

export const imageAligns = ["center", "wide", "left", "right"] as const;
export type ImageAlign = (typeof imageAligns)[number];

// Image with a position: center, wide (breaks out of the text column), or floated left/right with text wrapping.
const PositionedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") ?? "center",
        renderHTML: (attrs) => ({ "data-align": attrs.align }),
      },
    };
  },
});

export const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    codeBlock: false,
    code: false,
    link: { openOnClick: false, autolink: true, protocols: ["http", "https", "mailto"], HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } },
  }),
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  PositionedImage.configure({ HTMLAttributes: { loading: "lazy" } }),
];

// ---------- sanitising (runs on save and again on render) ----------
const HEX = /^#[0-9a-f]{3,8}$/i;
const safeHref = (u: unknown) => typeof u === "string" && /^(https?:\/\/|mailto:|\/)/i.test(u) && !/^\/\//.test(u);
const safeSrc = (u: unknown) => typeof u === "string" && (/^\/uploads\/[\w.-]+$/.test(u) || /^https:\/\//i.test(u));
const allowedNodes = new Set(["doc", "paragraph", "text", "heading", "blockquote", "bulletList", "orderedList", "listItem", "hardBreak", "horizontalRule", "image"]);
const allowedMarks = new Set(["bold", "italic", "underline", "strike", "link", "textStyle", "highlight"]);

// Drops unknown nodes and marks, unsafe links and image sources, and non-hex colors.
export function sanitizeDoc(node: JSONContent): JSONContent | null {
  if (!node || typeof node !== "object" || !allowedNodes.has(String(node.type))) return null;
  if (node.type === "image" && !safeSrc(node.attrs?.src)) return null;
  const out: JSONContent = { type: node.type };
  if (node.type === "text") out.text = typeof node.text === "string" ? node.text : "";
  if (node.attrs) {
    const a: Record<string, unknown> = {};
    if (node.type === "heading") a.level = node.attrs.level === 3 ? 3 : 2;
    if (["heading", "paragraph"].includes(String(node.type)) && ["left", "center", "right", "justify"].includes(node.attrs.textAlign)) a.textAlign = node.attrs.textAlign;
    if (node.type === "image") {
      a.src = node.attrs.src;
      a.alt = String(node.attrs.alt ?? "").slice(0, 300);
      a.align = imageAligns.includes(node.attrs.align) ? node.attrs.align : "center";
    }
    if (node.type === "orderedList" && Number.isInteger(node.attrs.start)) a.start = node.attrs.start;
    out.attrs = a;
  }
  if (Array.isArray(node.marks)) {
    out.marks = node.marks.flatMap((m) => {
      if (!allowedMarks.has(String(m.type))) return [];
      if (m.type === "link") return safeHref(m.attrs?.href) ? [{ type: "link", attrs: { href: m.attrs!.href } }] : [];
      if (m.type === "textStyle") return HEX.test(m.attrs?.color ?? "") ? [{ type: "textStyle", attrs: { color: m.attrs!.color } }] : [];
      if (m.type === "highlight") return [{ type: "highlight", attrs: HEX.test(m.attrs?.color ?? "") ? { color: m.attrs!.color } : {} }];
      return [{ type: m.type }];
    });
  }
  if (Array.isArray(node.content)) out.content = node.content.map(sanitizeDoc).filter((n): n is JSONContent => n !== null);
  return out;
}
