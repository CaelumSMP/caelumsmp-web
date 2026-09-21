import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getContent } from "@/app/_lib/store";
import { Icon } from "@/app/_ui/art";
import TeamGrid from "@/app/(site)/TeamGrid";
import s from "@/app/aurora.module.css";
import x from "@/app/(site)/site.module.css";

export const metadata: Metadata = { title: "Team" };

export default async function Team() {
  const { team, settings } = await getContent();
  return (
    <main className={x.pageWrap}>
      <header className={x.pageHead}>
        <Icon name="heart" size={64} />
        <div>
          <h1>The crew</h1>
          <p>The people who keep CaelumSMP running. Click anyone to see what they look after.</p>
        </div>
      </header>
      <TeamGrid team={team} />
      <aside className={`${s.neon} ${x.cta}`} style={{ "--c": "#a77bff" } as CSSProperties}>
        <h2>Want to help out?</h2>
        <p>Helper applications open at the start of every season. Ask in the #apply channel on Discord.</p>
        <a href={settings.discordInvite} className={s.btn} target="_blank" rel="noopener noreferrer">
          Open Discord
        </a>
      </aside>
    </main>
  );
}
