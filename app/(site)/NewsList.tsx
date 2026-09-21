import type { CSSProperties } from "react";
import Link from "next/link";
import { formatDate, tints, type Post } from "@/app/_lib/content";
import s from "@/app/aurora.module.css";
import Thumb from "./Thumb";
import x from "./site.module.css";

// Posts stacked one below another, each with its thumbnail, so they're easy to tell apart at a glance.
export default function NewsList({ posts }: { posts: Post[] }) {
  if (!posts.length) return <p className={x.muted}>No posts yet.</p>;
  return (
    <ol className={x.newsList}>
      {posts.map((p) => (
        <li key={p.slug}>
          <Link href={`/news/${p.slug}`} className={x.newsRow} style={{ "--c": tints[p.tint] } as CSSProperties}>
            <Thumb post={p} />
            <div className={x.newsText}>
              <span className={x.newsMeta}>
                <span className={s.badge}>{p.tag}</span>
                <time dateTime={p.date}>{formatDate(p.date)}</time>
                <span>by {p.author}</span>
              </span>
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
              <b className={x.read}>Read →</b>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
