import type { CSSProperties } from "react";

// Tiny pixel-art renderer: each string row is a line of pixels, each char a color key, "." is empty.
export type Sprite = { rows: string[]; colors: Record<string, string> };

export function PixelArt({ sprite, className, style }: { sprite: Sprite; className?: string; style?: CSSProperties }) {
  const w = Math.max(...sprite.rows.map((r) => r.length));
  return (
    <svg viewBox={`0 0 ${w} ${sprite.rows.length}`} shapeRendering="crispEdges" className={className} style={style} aria-hidden>
      {sprite.rows.flatMap((row, y) =>
        [...row].map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={sprite.colors[c]} />)),
      )}
    </svg>
  );
}

export const sprites = {
  heart: {
    rows: [".rr..rr.", "rwrrrrrr", "rrrrrrrr", "rrrrrrrr", ".rrrrrr.", "..rrrr..", "...rr..."],
    colors: { r: "#ff4d5e", w: "#ffd1d6" },
  },
  diamond: {
    rows: ["..cccc..", ".cwcccc.", "cwcccccc", "cccccccd", ".ccccdd.", "..cccd..", "...cd..."],
    colors: { c: "#5ce1e6", w: "#e8ffff", d: "#2aa7b0" },
  },
  pickaxe: {
    rows: [".cccccc.", "cc.bb.cc", "c..bb..c", "...bb...", "...bb...", "...bb...", "...bb..."],
    colors: { c: "#5ce1e6", b: "#8b5a2b" },
  },
  sword: {
    rows: ["......ss", ".....sws", "....sws.", ".b.sws..", "..bws...", "..bb....", ".b..b...", "b......."],
    colors: { s: "#c8d0d8", w: "#ffffff", b: "#8b5a2b" },
  },
  star: {
    rows: ["...yy...", "...yy...", "yyyyyyyy", ".yyyyyy.", "..yyyy..", ".yy..yy.", "yy....yy"],
    colors: { y: "#ffd23f" },
  },
  book: {
    rows: [".rrrrrr.", "rrrrrrrw", "rryyrrrw", "rrrrrrrw", "rrrrrrrw", "rrrrrrrw", ".rrrrrrw", "..wwwwww"],
    colors: { r: "#9b3b2b", y: "#ffcf4a", w: "#f1e7d3" },
  },
  map: {
    rows: ["pppppppp", "pggbbggp", "pgbbbggp", "pggbbrgp", "pgggbbgp", "pbbggggp", "pbggggbp", "pppppppp"],
    colors: { p: "#d9c28a", g: "#6cc349", b: "#4aa8f0", r: "#e0503c" },
  },
  emerald: {
    rows: ["...gg...", "..gwgg..", ".gwgggg.", ".gggggd.", ".ggggdd.", "..ggdd..", "...dd..."],
    colors: { g: "#3ce07a", w: "#c8ffd9", d: "#1a9c4e" },
  },
  clock: {
    rows: ["..yyyy..", ".ywwwwy.", "ywwrwwwy", "ywwrwwwy", "ywwrrrwy", "ywwwwwwy", ".ywwwwy.", "..yyyy.."],
    colors: { y: "#f2b632", w: "#fff6d8", r: "#c0392b" },
  },
  skull: {
    rows: [".wwwwww.", "wwwwwwww", "wkkwwkkw", "wkkwwkkw", "wwwkkwww", ".wwwwww.", ".wkwwkw.", "........"],
    colors: { w: "#e9edf2", k: "#1d2129" },
  },
  chest: {
    rows: ["bbbbbbbb", "boooooob", "boooooob", "bbbggbbb", "booggoob", "boooooob", "boooooob", "bbbbbbbb"],
    colors: { b: "#5c3a1a", o: "#b0762e", g: "#e8e8e8" },
  },
  discord: {
    rows: [".bbbbbb.", "bbbbbbbb", "bbwbbwbb", "bbwbbwbb", "bbbbbbbb", "bwbbbbwb", ".bwwwwb.", "..b..b.."],
    colors: { b: "#5865f2", w: "#ffffff" },
  },
  trophy: {
    rows: ["yyyyyyyy", "y.yyyy.y", "y.yyyy.y", ".yyyyyy.", "..yyyy..", "...yy...", "..dddd..", ".dddddd."],
    colors: { y: "#ffd23f", d: "#b8860b" },
  },
  ballot: {
    rows: ["wwwwwwww", "wwwwwwgw", "wwwwwggw", "wgwwggww", "wggggwww", "wwggwwww", "wwwwwwww", "kkkkkkkk"],
    colors: { w: "#f4f7ff", g: "#3ce07a", k: "#5b6479" },
  },
} satisfies Record<string, Sprite>;

export type IconName = keyof typeof sprites;

export function Icon({ name, size = 40, className }: { name: IconName; size?: number; className?: string }) {
  return <PixelArt sprite={sprites[name]} className={className} style={{ width: size, height: size }} />;
}


// Isometric block. Defaults to a grass block; pass trim={null} for a plain cube.
export function Cube({
  size = 80,
  top = "#7bd35a",
  left = "#8b5a2b",
  right = "#6b4423",
  trim = "#5fa844",
  className,
  style,
}: { size?: number; top?: string; left?: string; right?: string; trim?: string | null; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} style={style} aria-hidden>
      <polygon points="50,4 96,27 50,50 4,27" fill={top} />
      <polygon points="4,27 50,50 50,97 4,74" fill={left} />
      <polygon points="50,50 96,27 96,74 50,97" fill={right} />
      {trim && <polygon points="4,27 50,50 50,62 4,39" fill={trim} />}
      {trim && <polygon points="50,50 96,27 96,39 50,62" fill={trim} opacity=".8" />}
    </svg>
  );
}
