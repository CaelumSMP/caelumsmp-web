import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { visiblePosts } from "@/app/_lib/content";
import { getContent } from "@/app/_lib/store";
import ArticleView from "@/app/(site)/ArticleView";
import NewsList from "@/app/(site)/NewsList";
import s from "@/app/aurora.module.css";

export async function generateStaticParams() {
  const { posts } = await getContent();
  return visiblePosts(posts).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getContent()).posts.find((p) => p.slug === slug && p.published);
  return { title: post?.title, description: post?.excerpt };
}

export default async function Article({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const { posts, team } = await getContent();
  const post = posts.find((p) => p.slug === slug && p.published);
  if (!post) notFound();
  const more = visiblePosts(posts).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main className={s.article}>
      <Link href="/news" className={s.back}>
        ← All news
      </Link>
      <ArticleView post={post} authorRole={team.find((m) => m.name === post.author)?.role} />
      {more.length > 0 && (
        <section className={s.moreNews}>
          <h2 className={s.head}>
            <span>+</span>Keep reading
          </h2>
          <NewsList posts={more} />
        </section>
      )}
    </main>
  );
}
