"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { extensions, imageAligns, type ImageAlign } from "@/app/_lib/editor";
import { readMinutes, tints, type Post, type Tint } from "@/app/_lib/content";
import ArticleView from "@/app/(site)/ArticleView";
import NewsList from "@/app/(site)/NewsList";
import { deletePost, savePost } from "./actions";
import s from "@/app/aurora.module.css";
import x from "@/app/(site)/site.module.css";
import o from "./owner.module.css";
import { SaveBar, useSaver } from "./ui";

const TAGS = ["Update", "Event", "Patch", "Guide", "Community"];
const COLORS = [
  { name: "Lime", hex: "#c6ff3d" },
  { name: "Coral", hex: "#ff5a5f" },
  { name: "Cyan", hex: "#4de3ff" },
  { name: "Violet", hex: "#a77bff" },
  { name: "Gold", hex: "#ffd23f" },
  { name: "White", hex: "#ffffff" },
];
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

async function upload(file: File) {
  const body = new FormData();
  body.append("file", file);
  const r = await fetch("/api/upload", { method: "POST", body });
  const j = (await r.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!r.ok || !j.url) throw new Error(j.error ?? "Upload failed.");
  return j.url;
}

type Mode = "edit" | "split" | "preview";

// Full post editor: details, a rich-text body (TipTap) and a live preview of both the news-list card and the article.
export default function PostEditor({ initial, isNew, team, listHref }: { initial: Post; isNew: boolean; team: { name: string; role: string }[]; listHref: string }) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [original, setOriginal] = useState(isNew ? "" : initial.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [mode, setMode] = useState<Mode>("split");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const saver = useSaver();

  const patch = (p: Partial<Post>) => {
    setPost((cur) => ({ ...cur, ...p }));
    saver.touch();
  };

  const editor = useEditor({
    extensions,
    content: initial.doc,
    immediatelyRender: false, // server-rendered page: create the editor after hydration
    // same classes as the published article, so writing looks like the real page
    editorProps: { attributes: { class: `${s.prose} ${x.rich} ${o.prose}`, "aria-label": "Post body", spellcheck: "true" } },
    onUpdate: ({ editor }) => patch({ doc: editor.getJSON() }),
  });

  // Warn before leaving with unsaved work.
  useEffect(() => {
    if (!saver.dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [saver.dirty]);

  function save(publish?: boolean) {
    const next = publish === undefined ? post : { ...post, published: publish };
    if (publish !== undefined) setPost(next);
    saver.save(
      () => savePost(JSON.stringify(next), original),
      (r) => {
        if (r.ok && r.slug && r.slug !== original) {
          setOriginal(r.slug);
          router.replace(`${listHref}&post=${r.slug}`, { scroll: false });
        }
      },
    );
  }

  async function onCover(file: File | undefined) {
    if (!file) return;
    setUploadError("");
    try {
      patch({ cover: await upload(file) });
    } catch (e) {
      setUploadError((e as Error).message);
    }
  }

  const words = editor?.getText().trim().split(/\s+/).filter(Boolean).length ?? 0;
  const role = team.find((m) => m.name === post.author)?.role;

  return (
    <form
      className={o.editor}
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault();
          save();
        }
      }}
    >
      <div className={o.editorTop}>
        <a href={listHref} className={o.linkBtn}>
          ← All posts
        </a>
        <span className={o.status} data-live={post.published || undefined}>
          {post.published ? "Published" : "Draft"}
        </span>
        <div className={o.modes} role="radiogroup" aria-label="Layout">
          {(["edit", "split", "preview"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>
              {m === "edit" ? "Write" : m === "split" ? "Split" : "Preview"}
            </button>
          ))}
        </div>
      </div>

      <input className={o.titleInput} value={post.title} placeholder="Post title" aria-label="Title" maxLength={120} required onChange={(e) => patch({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} />

      <details className={o.details} open={isNew}>
        <summary>Post details: URL, tag, author, cover, summary</summary>
        <div className={o.grid}>
          <label>
            URL
            <span className={o.prefix}>
              /news/
              <input
                value={post.slug}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                title="Lowercase letters, numbers and dashes"
                onChange={(e) => {
                  setSlugTouched(true);
                  patch({ slug: slugify(e.target.value) });
                }}
              />
            </span>
          </label>
          <label>
            Tag
            <select value={post.tag} onChange={(e) => patch({ tag: e.target.value })}>
              {TAGS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" value={post.date} required onChange={(e) => patch({ date: e.target.value })} />
          </label>
          <label>
            Author
            <select value={post.author} onChange={(e) => patch({ author: e.target.value })}>
              {team.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </label>
          <fieldset className={o.swatches}>
            <legend>Color</legend>
            {(Object.keys(tints) as Tint[]).map((t) => (
              <label key={t} style={{ "--c": tints[t] } as CSSProperties} title={t}>
                <input type="radio" name="tint" checked={post.tint === t} onChange={() => patch({ tint: t })} />
                <span className={o.sr}>{t}</span>
              </label>
            ))}
          </fieldset>
          <div className={o.cover}>
            <span>Cover image</span>
            <div className={o.coverRow}>
              <label className={o.linkBtn}>
                Upload…
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => onCover(e.target.files?.[0])} />
              </label>
              <input type="url" value={post.cover.startsWith("/") ? "" : post.cover} placeholder="or paste an https:// image link" aria-label="Cover image URL" onChange={(e) => patch({ cover: e.target.value })} />
              {post.cover && (
                <button type="button" className={o.linkBtn} onClick={() => patch({ cover: "" })}>
                  Use block art
                </button>
              )}
            </div>
            {uploadError && <p className={o.error}>{uploadError}</p>}
            {post.cover.startsWith("/") && <p className={o.hint}>Uploaded image in use.</p>}
          </div>
          <label className={o.wide}>
            Summary (shown in the news list and under the title)
            <textarea rows={2} value={post.excerpt} maxLength={300} required onChange={(e) => patch({ excerpt: e.target.value })} />
          </label>
          <label className={o.wide}>
            &ldquo;At a glance&rdquo; points, one per line (optional)
            <textarea
              rows={4}
              value={post.points.join("\n")}
              onChange={(e) => patch({ points: e.target.value.split("\n").slice(0, 10) })}
              onBlur={() => patch({ points: post.points.map((p) => p.trim()).filter(Boolean) })}
            />
          </label>
        </div>
      </details>

      <div className={o.panes} data-mode={mode}>
        {mode !== "preview" && (
          <div className={o.writePane}>
            {editor && <Toolbar editor={editor} onError={setUploadError} />}
            {uploadError && <p className={o.error}>{uploadError}</p>}
            <EditorContent editor={editor} className={o.editArea} />
            <p className={o.hint}>
              {words} words · {readMinutes(post.doc)} min read · Ctrl+S saves
            </p>
          </div>
        )}
        {mode !== "edit" && (
          <div className={o.previewPane}>
            <p className={o.paneLabel}>In the news list</p>
            <NewsList posts={[post]} />
            <p className={o.paneLabel}>Article</p>
            <div className={o.previewArticle}>
              <ArticleView post={post} authorRole={role} />
            </div>
          </div>
        )}
      </div>

      <div className={o.editorBottom}>
        {!isNew &&
          (confirmDelete ? (
            <span className={o.confirm}>
              Delete for good?
              <button
                type="button"
                className={o.danger}
                onClick={() =>
                  saver.save(
                    () => deletePost(original),
                    (r) => r.ok && router.replace(listHref),
                  )
                }
              >
                Yes, delete
              </button>
              <button type="button" className={o.linkBtn} onClick={() => setConfirmDelete(false)}>
                Keep it
              </button>
            </span>
          ) : (
            <button type="button" className={o.danger} onClick={() => setConfirmDelete(true)}>
              Delete post
            </button>
          ))}
        <button type="button" className={o.linkBtn} onClick={() => save(!post.published)} disabled={saver.pending}>
          {post.published ? "Unpublish" : "Save & publish"}
        </button>
        <SaveBar {...saver} label={post.published ? "Save" : "Save draft"} view={post.published && original ? `/news/${original}` : undefined} />
      </div>
    </form>
  );
}

// ---------- toolbar ----------
function Toolbar({ editor, onError }: { editor: Editor; onError: (msg: string) => void }) {
  const st = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: e.isActive("heading", { level: 2 }) ? "h2" : e.isActive("heading", { level: 3 }) ? "h3" : "p",
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      highlight: e.isActive("highlight"),
      color: (e.getAttributes("textStyle").color as string | undefined) ?? "",
      align: (["left", "center", "right"] as const).find((a) => e.isActive({ textAlign: a })) ?? "left",
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      href: (e.getAttributes("link").href as string | undefined) ?? "",
      image: e.isActive("image"),
      imageAlign: (e.getAttributes("image").align as ImageAlign | undefined) ?? "center",
      imageAlt: (e.getAttributes("image").alt as string | undefined) ?? "",
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const c = () => editor.chain().focus();

  async function onImage(file: File | undefined) {
    if (!file) return;
    onError("");
    try {
      const src = await upload(file);
      c().setImage({ src, alt: file.name.replace(/\.[a-z]+$/i, "") }).run();
    } catch (e) {
      onError((e as Error).message);
    }
  }

  return (
    <div className={o.toolbar} role="toolbar" aria-label="Formatting">
      <div className={o.group}>
        <select
          aria-label="Text style"
          value={st.block}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") c().setParagraph().run();
            else c().toggleHeading({ level: v === "h2" ? 2 : 3 }).run();
          }}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Subheading</option>
        </select>
      </div>

      <div className={o.group}>
        <B on={st.bold} label="Bold" run={() => c().toggleBold().run()}>
          <b>B</b>
        </B>
        <B on={st.italic} label="Italic" run={() => c().toggleItalic().run()}>
          <i>I</i>
        </B>
        <B on={st.underline} label="Underline" run={() => c().toggleUnderline().run()}>
          <u>U</u>
        </B>
        <B on={st.strike} label="Strikethrough" run={() => c().toggleStrike().run()}>
          <s>S</s>
        </B>
        <B on={st.highlight} label="Highlight" run={() => c().toggleHighlight().run()}>
          <mark>H</mark>
        </B>
      </div>

      <div className={o.group} aria-label="Text color">
        <B on={!st.color} label="Default color" run={() => c().unsetColor().run()}>
          <span className={o.swatch} style={{ background: "linear-gradient(135deg, #f4f7ff 50%, #a9b8cf 50%)" }} />
        </B>
        {COLORS.map((col) => (
          <B key={col.hex} on={st.color.toLowerCase() === col.hex} label={`${col.name} text`} run={() => c().setColor(col.hex).run()}>
            <span className={o.swatch} style={{ background: col.hex }} />
          </B>
        ))}
        <label className={o.customColor} title="Custom color">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(st.color) ? st.color : "#ffffff"} onChange={(e) => c().setColor(e.target.value).run()} aria-label="Custom text color" />
        </label>
      </div>

      <div className={o.group}>
        {(["left", "center", "right"] as const).map((a) => (
          <B key={a} on={st.align === a} label={`Align ${a}`} run={() => c().setTextAlign(a).run()}>
            <AlignIcon align={a} />
          </B>
        ))}
      </div>

      <div className={o.group}>
        <B on={st.bullet} label="Bullet list" run={() => c().toggleBulletList().run()}>
          • —
        </B>
        <B on={st.ordered} label="Numbered list" run={() => c().toggleOrderedList().run()}>
          1.
        </B>
        <B on={st.quote} label="Quote" run={() => c().toggleBlockquote().run()}>
          “ ”
        </B>
        <B label="Divider" run={() => c().setHorizontalRule().run()}>
          ―
        </B>
      </div>

      <div className={o.group}>
        <B
          on={st.link}
          label="Link"
          run={() => {
            setHref(st.href);
            setLinkOpen((v) => !v);
          }}
        >
          Link
        </B>
        <B label="Insert image" run={() => fileRef.current?.click()}>
          Image
        </B>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => (onImage(e.target.files?.[0]), (e.target.value = ""))} />
      </div>

      <div className={o.group}>
        <B label="Undo" run={() => c().undo().run()} disabled={!st.canUndo}>
          ↶
        </B>
        <B label="Redo" run={() => c().redo().run()} disabled={!st.canRedo}>
          ↷
        </B>
      </div>

      {linkOpen && (
        <div className={o.subbar}>
          <input type="url" value={href} placeholder="https://" aria-label="Link address" onChange={(e) => setHref(e.target.value)} />
          <button
            type="button"
            onClick={() => {
              if (/^(https?:\/\/|mailto:|\/)/i.test(href)) c().extendMarkRange("link").setLink({ href }).run();
              setLinkOpen(false);
            }}
          >
            Apply
          </button>
          {st.link && (
            <button
              type="button"
              onClick={() => {
                c().extendMarkRange("link").unsetLink().run();
                setLinkOpen(false);
              }}
            >
              Remove link
            </button>
          )}
          <input type="url" value={imgUrl} placeholder="…or insert an image from an https:// link" aria-label="Image URL" onChange={(e) => setImgUrl(e.target.value)} />
          <button
            type="button"
            onClick={() => {
              if (/^https:\/\//i.test(imgUrl)) c().setImage({ src: imgUrl, alt: "" }).run();
              setImgUrl("");
            }}
          >
            Insert image
          </button>
        </div>
      )}

      {st.image && (
        <div className={o.subbar}>
          <span>Image position:</span>
          {imageAligns.map((a) => (
            <button key={a} type="button" aria-pressed={st.imageAlign === a} onClick={() => c().updateAttributes("image", { align: a }).run()}>
              {a === "wide" ? "Full width" : a[0].toUpperCase() + a.slice(1)}
            </button>
          ))}
          <input value={st.imageAlt} placeholder="Describe the image (alt text)" aria-label="Image description" onChange={(e) => editor.chain().updateAttributes("image", { alt: e.target.value }).run()} />
          <button type="button" className={o.danger} onClick={() => c().deleteSelection().run()}>
            Remove image
          </button>
        </div>
      )}
    </div>
  );
}

// Toolbar button. mousedown is cancelled so clicking doesn't steal the editor's selection.
function B({ on, label, run, children, disabled }: { on?: boolean; label: string; run: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button type="button" aria-pressed={on} aria-label={label} title={label} onMouseDown={(e) => e.preventDefault()} onClick={run} disabled={disabled}>
      {children}
    </button>
  );
}

function AlignIcon({ align }: { align: "left" | "center" | "right" }) {
  const x = (w: number) => (align === "left" ? 1 : align === "right" ? 15 - w : (16 - w) / 2);
  return (
    <svg viewBox="0 0 16 12" width="16" height="12" aria-hidden>
      {[14, 9, 12, 7].map((w, i) => (
        <rect key={i} x={x(w)} y={i * 3} width={w} height="2" fill="currentColor" />
      ))}
    </svg>
  );
}
