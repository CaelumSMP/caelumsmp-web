import type { Metadata } from "next";
import { getContent } from "@/app/_lib/store";
import { Icon } from "@/app/_ui/art";
import Rules from "@/app/(site)/Rules";
import s from "@/app/aurora.module.css";
import x from "@/app/(site)/site.module.css";

export const metadata: Metadata = { title: "Rules" };

export default async function RulesPage() {
  const { settings } = await getContent();
  return (
    <main className={x.pageWrap}>
      <header className={x.pageHead}>
        <Icon name="book" size={64} />
        <div>
          <h1>House rules</h1>
          <p>Short version: be decent, don&apos;t cheat, don&apos;t take what isn&apos;t yours. The details are below.</p>
        </div>
      </header>
      <Rules rules={settings.rules} />
      <p className={x.after}>
        <span className={x.muted}>Punished and think it was a mistake? Appeals go through a ticket on Discord.</span>
        <a href={settings.discordInvite} className={s.textLink} target="_blank" rel="noopener noreferrer">
          Open a ticket →
        </a>
      </p>
    </main>
  );
}
