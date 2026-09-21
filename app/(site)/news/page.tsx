import type { Metadata } from "next";
import Link from "next/link";
import { visiblePosts } from "@/app/_lib/content";
import { getContent } from "@/app/_lib/store";
import NewsList from "@/app/(site)/NewsList";
import s from "@/app/aurora.module.css";

export const metadata: Metadata = { title: "News" };

export default async function NewsIndex() {
  const { posts } = await getContent();
  return (
    <main className={s.article}>
      <Link href="/" className={s.back}>
        ← Home
      </Link>
      <h1 className={s.head}>
        <span>01</span>All news
      </h1>
      <NewsList posts={visiblePosts(posts)} />
    </main>
  );
}
