"use client";

import { useState } from "react";
import type { Member, VoteSite } from "@/app/_lib/content";
import { saveTeam, saveVoteSites } from "./actions";
import o from "./owner.module.css";
import { Rows, SaveBar, useSaver } from "./ui";

const today = () => new Date().toISOString().slice(0, 10);

export function TeamForm({ initial }: { initial: Member[] }) {
  const [team, setTeam] = useState(initial);
  const saver = useSaver();
  return (
    <form
      className={o.form}
      onSubmit={(e) => {
        e.preventDefault();
        saver.save(() => saveTeam(JSON.stringify(team)));
      }}
    >
      <p className={o.hint}>Order here is the order on the site. The name must be the Minecraft username, since it&apos;s used for the skin render and the player profile link.</p>
      <Rows<Member>
        items={team}
        blank={{ name: "", role: "Helper", bio: "", joined: today(), discord: "", focus: "", quote: "" }}
        itemLabel={(m, i) => (m.name ? `${m.name} · ${m.role}` : `Member ${i + 1}`)}
        fields={[
          { key: "name", label: "Minecraft name" },
          { key: "role", label: "Role shown on site" },
          { key: "joined", label: "On the team since", type: "date" },
          { key: "discord", label: "Discord handle", placeholder: "without @" },
          { key: "focus", label: "Looks after", wide: true },
          { key: "bio", label: "Short bio", type: "textarea" },
          { key: "quote", label: "Quote (optional)", wide: true },
        ]}
        onChange={(next) => {
          setTeam(next);
          saver.touch();
        }}
      />
      <SaveBar {...saver} view="/team" />
    </form>
  );
}

export function VoteForm({ initial }: { initial: VoteSite[] }) {
  const [sites, setSites] = useState(initial);
  const saver = useSaver();
  return (
    <form
      className={o.form}
      onSubmit={(e) => {
        e.preventDefault();
        saver.save(() => saveVoteSites(JSON.stringify(sites)));
      }}
    >
      <p className={o.hint}>Use your server&apos;s own vote page on each site, so votes count for CaelumSMP. The Store link lives in Site settings.</p>
      <Rows<VoteSite>
        items={sites}
        blank={{ name: "", url: "https://", reward: "1 vote key" }}
        itemLabel={(x, i) => x.name || `Site ${i + 1}`}
        fields={[
          { key: "name", label: "Site name" },
          { key: "url", label: "Vote page URL", type: "url" },
          { key: "reward", label: "Reward", wide: true },
        ]}
        onChange={(next) => {
          setSites(next);
          saver.touch();
        }}
      />
      <SaveBar {...saver} view="/vote" />
    </form>
  );
}
