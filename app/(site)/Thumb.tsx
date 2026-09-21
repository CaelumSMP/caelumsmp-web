import type { CSSProperties } from "react";
import { tints, type Post } from "@/app/_lib/content";
import { Cube, Icon, type IconName } from "@/app/_ui/art";
import x from "./site.module.css";

const tagIcon: Record<string, IconName> = { Update: "star", Event: "sword", Patch: "pickaxe", Guide: "book", Community: "heart" };

// A post's picture: the uploaded cover, or generated block art in the post's color so every post is still recognisable.
export default function Thumb({ post, className = "" }: { post: Pick<Post, "cover" | "tint" | "tag" | "title">; className?: string }) {
  return (
    <div className={`${x.thumb} ${className}`} style={{ "--c": tints[post.tint] } as CSSProperties}>
      {post.cover ? (
        <img src={post.cover} alt="" loading="lazy" />
      ) : (
        <>
          <Icon name={tagIcon[post.tag] ?? "book"} size={96} className={x.thumbIcon} />
          <Cube size={54} top="#ffffff" left="#c9cfe6" right="#9aa2c4" trim={null} className={x.thumbCube} />
        </>
      )}
    </div>
  );
}
