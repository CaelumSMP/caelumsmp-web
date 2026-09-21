// Players online + Discord online. In "demo" mode the owner's numbers are shown as-is.
// In "live" mode: Minecraft from api.mcsrvstat.us, Discord from the public invite API. Both cached for 60s.
import { discordCode, type Settings } from "./content";

export type Status = { online: number | null; max: number; discord: number | null; live: boolean };

async function json(url: string) {
  try {
    const r = await fetch(url, { next: { revalidate: 60 }, signal: AbortSignal.timeout(4000), headers: { "User-Agent": "CaelumSMP website" } });
    return r.ok ? await r.json() : null;
  } catch {
    return null; // network down or slow: show "—" rather than failing the page
  }
}

export async function getStatus(s: Settings): Promise<Status> {
  if (s.status.source === "demo") return { online: s.status.online, max: s.maxPlayers, discord: s.status.discord, live: false };
  const [mc, dc] = await Promise.all([
    json(`https://api.mcsrvstat.us/3/${encodeURIComponent(s.ip)}`),
    json(`https://discord.com/api/v10/invites/${encodeURIComponent(discordCode(s.discordInvite))}?with_counts=true`),
  ]);
  return {
    online: mc?.online ? (mc.players?.online ?? 0) : mc ? 0 : null,
    max: mc?.players?.max ?? s.maxPlayers,
    discord: dc?.approximate_presence_count ?? null,
    live: true,
  };
}

export const fmt = (n: number | null) => (n === null ? "—" : new Intl.NumberFormat("en").format(n));
