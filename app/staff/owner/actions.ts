"use server";

import { revalidatePath } from "next/cache";
import { readContent, saveContent } from "@/app/_lib/store";
import { assertCanEdit } from "./guard";
import * as v from "./validate";

export type Result = { ok: true; slug?: string } | { ok: false; error: string };

// Validate → write → refresh every public page. Errors come back as a message for the form, not a crash.
async function run(apply: (c: Awaited<ReturnType<typeof readContent>>) => void | string): Promise<Result> {
  try {
    assertCanEdit();
    const content = await readContent();
    const slug = apply(content);
    await saveContent(content);
    revalidatePath("/", "layout");
    return { ok: true, slug: slug || undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

const parse = (json: string) => {
  try {
    return JSON.parse(json) as unknown;
  } catch {
    throw new Error("The form sent broken data. Reload and try again.");
  }
};

export async function saveSettings(json: string) {
  return run((c) => {
    c.settings = v.settings(parse(json));
  });
}

export async function saveTeam(json: string) {
  return run((c) => {
    c.team = v.team(parse(json));
  });
}

export async function saveVoteSites(json: string) {
  return run((c) => {
    c.voteSites = v.voteSites(parse(json));
  });
}

// `original` is the slug the post had when the editor opened ("" for a new post), so renaming a slug moves the post.
export async function savePost(json: string, original: string) {
  return run((c) => {
    const post = v.post(parse(json));
    const clash = c.posts.find((p) => p.slug === post.slug && p.slug !== original);
    if (clash) throw new Error(`Another post already uses the URL /news/${post.slug}.`);
    const i = c.posts.findIndex((p) => p.slug === original);
    if (i === -1) c.posts.unshift(post);
    else c.posts[i] = post;
    return post.slug;
  });
}

export async function deletePost(slug: string) {
  return run((c) => {
    const before = c.posts.length;
    c.posts = c.posts.filter((p) => p.slug !== slug);
    if (c.posts.length === before) throw new Error("That post doesn't exist anymore.");
  });
}
