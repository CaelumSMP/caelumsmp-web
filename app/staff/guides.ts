// Staff guides as structured blocks, so a future admin editor can map each block type to a form
// and store guides as JSON rows (one row per guide, `blocks` as a JSON column).
import type { Role } from "./data";

// A screenshot. `src` is a real image (e.g. /guides/claim-ticket.png in public/). Until one exists,
// `mock` draws a stand-in: lines of text in a Minecraft chat box or a dirt-background error screen.
export type Shot = { src?: string; alt: string; caption?: string; mock?: { kind: "chat" | "screen" | "console"; lines: string[] } };

export type Step = { text: string; cmd?: string; shot?: Shot };

// "If you see X": what it looks like, why it happens, what to do, and when to hand it up.
export type Issue = { id: string; symptom: string; looks?: Shot; cause: string; fix: string[]; escalate?: string };

export type Block =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "steps"; items: Step[] }
  | { type: "shot"; shot: Shot }
  | { type: "callout"; tone: "tip" | "warn" | "danger"; text: string }
  | { type: "issues"; items: Issue[] };

export const categories = ["Onboarding", "Tickets", "Moderation", "Troubleshooting"] as const;
export type Category = (typeof categories)[number];

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  category: Category;
  // ponytail: rank-based access (this role and up). Per-guide role lists come with the admin editor if rank isn't enough.
  min: Role;
  updated: string;
  author: string;
  blocks: Block[];
};

export const guides: Guide[] = [
  {
    slug: "first-shift",
    title: "Your first shift",
    summary: "Link your account, go on duty and handle your first ticket without breaking anything.",
    category: "Onboarding",
    min: "helper",
    updated: "Sep 15, 2026",
    author: "jeb_",
    blocks: [
      { type: "text", text: "Everything you need for day one. Takes about ten minutes. Ask in #staff-chat if anything here doesn't match what you see." },
      { type: "heading", text: "Before you log in" },
      {
        type: "steps",
        items: [
          { text: "Make sure your Discord account is linked. Run the command in-game and click the link it gives you.", cmd: "/discord link", shot: { alt: "Chat showing the Discord link code", mock: { kind: "chat", lines: ["[Caelum] Your link code is 4F7-K2Q", "[Caelum] Click here or DM the bot: !link 4F7-K2Q"] } } },
          { text: "Check that you have the Helper role on Discord. The dashboard reads it live, so no role means no access." },
          { text: "Turn on 2FA on your Discord account. Staff without 2FA get the role removed automatically." },
        ],
      },
      { type: "heading", text: "Going on duty" },
      {
        type: "steps",
        items: [
          { text: "Join the server and go on duty. Only on-duty minutes count toward your daily task.", cmd: "/duty", shot: { alt: "Duty on message in chat", mock: { kind: "chat", lines: ["[Staff] You are now ON duty. Minutes are being counted.", "[Staff] 2 open tickets. /ticket list"] } } },
          { text: "Open the ticket queue and pick the oldest open ticket.", cmd: "/ticket list" },
          { text: "Claim it before you reply, so nobody doubles up.", cmd: "/ticket claim 1047" },
          { text: "When you're done, close it with a tag. Untagged tickets don't earn points.", cmd: "/ticket close 1047 grief" },
          { text: "Go off duty before you log off.", cmd: "/duty" },
        ],
      },
      { type: "callout", tone: "tip", text: "Forgot to go off duty? Minutes stop counting after 15 minutes AFK anyway, so you won't farm points by accident." },
    ],
  },
  {
    slug: "grief-report",
    title: "Handling a grief report",
    summary: "Confirm grief with CoreProtect, collect evidence and hand it to a Mod for the rollback.",
    category: "Tickets",
    min: "helper",
    updated: "Sep 12, 2026",
    author: "Alex",
    blocks: [
      { type: "callout", tone: "danger", text: "Helpers never roll back. You gather evidence; a Moderator does the rollback. A bad rollback can delete someone else's build." },
      {
        type: "steps",
        items: [
          { text: "Claim the ticket and ask the player for coordinates or to meet you at the spot.", cmd: "/ticket claim <id>" },
          { text: "Teleport to the player (helpers can /tpa, not /tp).", cmd: "/tpa <player>" },
          { text: "Turn on the block inspector, then left-click the damaged blocks and right-click emptied chests.", cmd: "/co inspect", shot: { alt: "CoreProtect inspector output", mock: { kind: "chat", lines: ["----- CoreProtect ----- (x120/y64/z-340)", "0.42/h ago - Pebble placed chest.", "0.08/h ago - xX_Grief_Xx removed 12 diamond.", "0.08/h ago - xX_Grief_Xx broke oak_planks."] } } },
          { text: "Screenshot the inspector output (F2) and paste it into the ticket." },
          { text: "If it's grief, escalate. Include the griefer's name, the time and the radius you think is affected.", cmd: "/ticket escalate <id> grief by xX_Grief_Xx, ~10 blocks" },
          { text: "Tell the player it's been escalated and a Mod will roll it back, usually within the hour." },
        ],
      },
      {
        type: "issues",
        items: [
          { id: "co-no-data", symptom: "Inspector says \"No block data found at this location\"", cause: "The block was never changed by a player, or it happened before logs were kept (logs are kept for 30 days).", fix: ["Check the blocks next to it; griefers rarely break just one.", "Try /co lookup r:10 t:3d to search the area instead of single blocks.", "If still nothing, it probably isn't grief. Close as \"no-evidence\" and explain to the player."] },
          { id: "co-trusted", symptom: "The \"griefer\" is on the claim's trust list", cause: "Trusted players are allowed to build and take items. That's a falling-out between friends, not grief.", fix: ["Show the player /trustlist on their claim.", "Suggest /untrust <name>.", "Close the ticket as \"trusted\". Nothing gets rolled back."] },
        ],
      },
    ],
  },
  {
    slug: "chat-ladder",
    title: "Chat moderation ladder",
    summary: "Warn, mute, escalate: which step to use and how long each punishment lasts.",
    category: "Moderation",
    min: "helper",
    updated: "Sep 17, 2026",
    author: "Notch",
    blocks: [
      { type: "text", text: "Count offences from the player's history, not your memory. /history shows everything from the last 90 days." },
      {
        type: "steps",
        items: [
          { text: "1st offence: formal warning with the rule name in the reason.", cmd: "/warn <player> Spam (rule 3)" },
          { text: "2nd offence: 10 minute mute.", cmd: "/mute <player> 10m Spam (rule 3)" },
          { text: "3rd offence: 1 hour mute, plus a staff note about the pattern.", cmd: "/mute <player> 1h Spam (rule 3)" },
          { text: "Anything past that: escalate to a Moderator in #staff-chat with the history attached." },
        ],
      },
      { type: "callout", tone: "danger", text: "Slurs, threats or doxxing skip the ladder. Mute for 1 hour right away and escalate. Since Sep 17, slurs on shop signs are a 3-day ban." },
      { type: "callout", tone: "warn", text: "Don't argue in public chat. Mute first, then explain in DMs." },
    ],
  },
  {
    slug: "player-issues",
    title: "Common player problems",
    summary: "The errors players send screenshots of, what they mean and what to tell them.",
    category: "Troubleshooting",
    min: "helper",
    updated: "Sep 18, 2026",
    author: "Alex",
    blocks: [
      { type: "text", text: "Find the message the player sees, then work through the fix in order. Most of these can be answered with a copy-paste." },
      {
        type: "issues",
        items: [
          {
            id: "outdated-client",
            symptom: "\"Outdated client! Please use 1.21.x\"",
            looks: { alt: "Outdated client disconnect screen", mock: { kind: "screen", lines: ["Failed to connect to the server", "Outdated client! Please use 1.21.4"] } },
            cause: "The player's Minecraft version is older than the server's.",
            fix: ["In the launcher, pick \"Latest release\" (or 1.21.4+) and hit Play.", "Using a modpack or Lunar/Badlion? Switch that profile to 1.21.4."],
          },
          {
            id: "timed-out",
            symptom: "\"Connection timed out: no further information\"",
            looks: { alt: "Connection timed out screen", mock: { kind: "screen", lines: ["Failed to connect to the server", "Connection timed out: no further information"] } },
            cause: "The player can't reach the server at all. Usually a typo in the IP, their network, or the server is restarting.",
            fix: ["Check the IP is exactly play.caelumsmp.net (no https://, no port).", "Check #status on Discord for a restart or outage.", "Ask them to try a phone hotspot. If that works, it's their network or firewall.", "School and work networks often block Minecraft. Nothing we can do there."],
            escalate: "More than 3 players reporting it at once: ping an Admin, the server may be down.",
          },
          {
            id: "failed-verify",
            symptom: "\"Failed to verify username!\"",
            looks: { alt: "Failed to verify username screen", mock: { kind: "screen", lines: ["Disconnected", "Failed to verify username!"] } },
            cause: "Mojang's login servers couldn't confirm the account. Usually a stale launcher session.",
            fix: ["Fully restart the launcher (log out and back in if that doesn't help).", "Check status.mojang.com. If Mojang is down, everyone has to wait it out.", "Cracked or offline-mode accounts can't join. We're a premium-only server."],
          },
          {
            id: "cant-build",
            symptom: "\"You don't have Pebble's permission to build here.\"",
            looks: { alt: "Claim permission message in chat", mock: { kind: "chat", lines: ["You don't have Pebble's permission to build here."] } },
            cause: "They're inside someone else's claim. Claims are working as intended.",
            fix: ["Show them the claim edges: hold a golden shovel or run /claim show.", "If it's their friend's claim, the owner runs /trust <player>.", "If they say the claim is theirs, check /claim info. Alts and name changes sometimes cause this."],
          },
          {
            id: "lost-items",
            symptom: "\"My items disappeared after a lag spike\"",
            cause: "A rollback or crash lost their last few seconds, or they died and didn't notice.",
            fix: ["Run /co lookup u:<player> a:inventory t:1h to see what they had.", "Check /deaths <player> for a recent death.", "If the log shows the items, escalate to a Mod for a restore. Helpers can't give items."],
            escalate: "Item restores are Mod-only. Paste the lookup output in the ticket.",
          },
        ],
      },
    ],
  },
  {
    slug: "staff-tools",
    title: "When staff tools break",
    summary: "Dashboard, tickets and duty problems you might run into on shift.",
    category: "Troubleshooting",
    min: "helper",
    updated: "Sep 18, 2026",
    author: "Alex",
    blocks: [
      {
        type: "issues",
        items: [
          {
            id: "no-access",
            symptom: "Dashboard shows \"No access\"",
            cause: "Your Discord role is missing or was just changed. The dashboard checks it on every page.",
            fix: ["Check your roles in the Discord server.", "Log out of the dashboard and back in to refresh the session.", "If you were recently promoted, give Discord a minute and reload."],
            escalate: "Role looks right but still locked out: DM an Admin.",
          },
          {
            id: "duty-not-counting",
            symptom: "Duty minutes aren't going up",
            looks: { alt: "Duty status in chat", mock: { kind: "chat", lines: ["[Staff] You are OFF duty."] } },
            cause: "You're off duty, or you've been AFK for 15+ minutes.",
            fix: ["Run /duty and check it says ON.", "Move around. AFK time pauses the counter.", "Minutes sync to the dashboard every 5 minutes, so expect a small delay."],
          },
          {
            id: "ticket-stuck",
            symptom: "Ticket stuck as \"claimed\" by someone offline",
            cause: "They claimed it and logged off without closing or unclaiming.",
            fix: ["Wait 30 minutes; claims expire on their own.", "Urgent? Ask a Mod to run /ticket unclaim <id>."],
          },
          {
            id: "console-error",
            symptom: "Red \"An internal error occurred\" after a command",
            looks: { alt: "Internal error message in chat", mock: { kind: "chat", lines: ["An internal error occurred while attempting to perform this command"] } },
            cause: "A plugin threw an error. Not something you did.",
            fix: ["Try the command once more. Don't spam it.", "Report it via Report a bug with the exact command you ran and the time."],
            escalate: "Anything to do with money or items: tell an Admin right away.",
          },
        ],
      },
    ],
  },
  {
    slug: "bans-appeals",
    title: "Bans and appeals",
    summary: "When to temp-ban or perm-ban, what evidence to attach, and how appeals are reviewed.",
    category: "Moderation",
    min: "mod",
    updated: "Sep 10, 2026",
    author: "Notch",
    blocks: [
      {
        type: "steps",
        items: [
          { text: "Collect evidence first: CoreProtect output, screenshots or a clip. No evidence, no ban." },
          { text: "Temp-ban for proven grief or a first cheating offence.", cmd: "/tempban <player> 3d Grief at /warp market (ticket #1047)" },
          { text: "Perm-ban for hacked clients, repeat offences or real-world threats.", cmd: "/ban <player> Hacked client: fly + killaura (clip in ticket)" },
          { text: "Post the ban in #staff-chat and tag an Admin for perm-bans." },
        ],
      },
      { type: "callout", tone: "warn", text: "Appeals are reviewed by a different Mod than the one who banned. Don't review your own." },
    ],
  },
  {
    slug: "rollbacks",
    title: "Rollbacks",
    summary: "Undo grief with CoreProtect safely: preview, apply, log.",
    category: "Tickets",
    min: "mod",
    updated: "Sep 08, 2026",
    author: "Alex",
    blocks: [
      {
        type: "steps",
        items: [
          { text: "Stand at the grief. Use the smallest radius and time that covers it.", cmd: "/co rollback u:xX_Grief_Xx t:2h r:15 #preview", shot: { alt: "Rollback preview output", mock: { kind: "chat", lines: ["CoreProtect - Rollback preview started.", "Preview: 214 block changes, 3 containers.", "Type /co apply to confirm or /co cancel."] } } },
          { text: "Fly around and check the preview. Only the griefer's changes should revert.", cmd: "/co cancel" },
          { text: "Run it for real.", cmd: "/co rollback u:xX_Grief_Xx t:2h r:15" },
          { text: "Paste the command and result into the ticket, then close it.", cmd: "/ticket close <id> grief" },
        ],
      },
      {
        type: "issues",
        items: [
          { id: "rollback-wrong", symptom: "Rollback undid someone else's build", cause: "The rollback was run without u:<player>, or with too big a radius.", fix: ["Undo it right away.", "Re-run with u: and a smaller r:."], looks: { alt: "Restore command", mock: { kind: "chat", lines: ["/co restore t:5m r:15", "CoreProtect - Restore completed. 1,902 blocks changed."] } }, escalate: "Tell an Admin even if the restore worked, so it's on record." },
        ],
      },
    ],
  },
];

// Every troubleshooting entry across the guides the role can see, for the Known issues list.
export const knownIssues = (list: Guide[]) =>
  list.flatMap((g) => g.blocks.flatMap((b) => (b.type === "issues" ? b.items.map((issue) => ({ issue, guide: g })) : [])));
