import type { CSSProperties } from "react";
import { formatDate, tints, type Post } from "@/app/_lib/content";
import { getContent } from "@/app/_lib/store";
import a from "@/app/aurora.module.css";
import Thumb from "@/app/(site)/Thumb";
import { href, profile, type Role } from "../data";
import { TeamForm, VoteForm } from "./ListForms";
import o from "./owner.module.css";
import PostEditor from "./PostEditor";
import SettingsForm from "./SettingsForm";

const today = () => new Date().toISOString().slice(0, 10);

// Owner tabs. Each loads the current content and hands it to a client form.
export async function OwnerTab({ tab, role, base, post }: { tab: "site" | "posts" | "team" | "vote"; role: Role; base: string; post: string }) {
  const content = await getContent();
  if (tab === "site") return <SettingsForm initial={content.settings} />;
  if (tab === "team") return <TeamForm initial={content.team} />;
  if (tab === "vote") return <VoteForm initial={content.voteSites} />;

  const list = href(base, role, "posts");
  const team = content.team.map((m) => ({ name: m.name, role: m.role }));
  // Default author is whoever is signed in; falls back to the first member if they're not on the team list.
  const onTeam = (name: string) => team.some((m) => m.name === name);
  const me = onTeam(profile[role].name) ? profile[role].name : (team[0]?.name ?? "");
  if (post) {
    const saved = content.posts.find((p) => p.slug === post);
    // An author removed from the team can't be picked in the dropdown, so hand the post to the signed-in user.
    const found = saved && (onTeam(saved.author) ? saved : { ...saved, author: me });
    const draft: Post = {
      slug: "",
      title: "",
      tag: "Update",
      date: today(),
      author: me,
      excerpt: "",
      cover: "",
      tint: "lime",
      points: [],
      published: false,
      doc: { type: "doc", content: [{ type: "paragraph" }] },
    };
    if (post !== "new" && !found) return <p className={o.hint}>That post doesn&apos;t exist anymore. <a href={list}>Back to all posts</a></p>;
    // No key on purpose: after a new post's first save the URL changes to its slug, and the editor must keep its state.
    // Switching to another post is a full page load (plain links), which starts fresh anyway.
    return <PostEditor initial={found ?? draft} isNew={!found} team={team} listHref={list} />;
  }

  const posts = [...content.posts].sort((x, y) => y.date.localeCompare(x.date));
  return (
    <div className={o.posts}>
      <div className={o.postsTop}>
        <p className={o.hint}>
          {posts.filter((p) => p.published).length} published · {posts.filter((p) => !p.published).length} drafts
        </p>
        <a href={`${list}&post=new`} className={a.btn}>
          + New post
        </a>
      </div>
      <ul className={o.postList}>
        {posts.map((p) => (
          <li key={p.slug} style={{ "--c": tints[p.tint] } as CSSProperties}>
            <Thumb post={p} className={o.postThumb} />
            <div>
              <span className={o.status} data-live={p.published || undefined}>
                {p.published ? "Published" : "Draft"}
              </span>
              <h3>{p.title}</h3>
              <small>
                {p.tag} · {formatDate(p.date)} · by {p.author}
              </small>
            </div>
            <div className={o.postActions}>
              <a href={`${list}&post=${p.slug}`} className={o.primary}>
                Edit
              </a>
              {p.published && (
                <a href={`/news/${p.slug}`} target="_blank" rel="noopener noreferrer" className={o.linkBtn}>
                  View ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
