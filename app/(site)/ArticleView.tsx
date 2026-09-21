import type { CSSProperties } from "react";
import { formatDate, readMinutes, tints, type Post } from "@/app/_lib/content";
import Rich from "@/app/_lib/Rich";
import { Cube, Icon, type IconName } from "@/app/_ui/art";
import { bodyRender, headRender } from "@/app/_ui/data";
import s from "@/app/aurora.module.css";
import x from "./site.module.css";

const tagIcon: Record<string, IconName> = { Update: "star", Event: "sword", Patch: "pickaxe", Guide: "book", Community: "heart" };

// A post as readers see it. Used by /news/[slug] and by the editor's live preview, so the preview can't drift.
export default function ArticleView({ post, authorRole }: { post: Post; authorRole?: string }) {
  return (
    <div style={{ "--c": tints[post.tint] } as CSSProperties}>
      <header className={s.articleHead}>
        <span className={s.badge}>{post.tag}</span>
        <h1>{post.title || "Untitled post"}</h1>
        <p className={s.standfirst}>{post.excerpt}</p>
        <p className={s.byline}>
          <img src={headRender(post.author, 64)} alt="" width={40} height={40} />
          <span>
            <b>{post.author}</b>
            {authorRole}
          </span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>{readMinutes(post.doc)} min read</span>
        </p>
      </header>

      {post.cover ? (
        <figure className={x.coverImg}>
          <img src={post.cover} alt="" />
        </figure>
      ) : (
        <figure className={s.cover}>
          <Icon name={tagIcon[post.tag] ?? "book"} size={200} className={s.coverIcon} />
          <Cube size={120} top="#ffffff" left="#c9cfe6" right="#9aa2c4" trim={null} className={s.coverCube} />
          <Cube size={70} className={s.coverCube} />
          <img src={bodyRender(post.author, 384)} alt="" width={220} height={357} />
        </figure>
      )}

      <div className={s.articleGrid}>
        <Rich doc={post.doc} className={`${s.prose} ${x.rich}`} />
        {post.points.length > 0 && (
          <aside className={s.neon}>
            <h2>At a glance</h2>
            <ul>
              {post.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}
