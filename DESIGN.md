# CaelumSMP — D4 "Aurora Fest" design spec

Extracted from the approved countdown page (now its own project, `../caelum-web-countdown`). Use this when prompting changes:
"Follow `DESIGN.md`" keeps new work on-brand.

Source of truth in code:
- Tokens: `app/aurora.module.css` → `.page`
- Fonts: `app/layout.tsx`
- Timer cells: `app/staff/Timer.tsx` + `app/staff/panels.module.css` (`.cells`, `.cell`, `.digits`)
- Block art: `app/_ui/art.tsx` → `Cube`, `PixelArt`

## 1. Mood

Loud event poster at night: an aurora sky, chunky Minecraft blocks floating in it, and neon
arcade-style counters. It should feel blocky and premium, not cartoony and not cluttered. Every
edge is square or pixel-notched, with no rounded corners anywhere.

## 2. Color

| Token      | Hex       | Role |
|------------|-----------|------|
| `--bg`     | `#061722` | Page background (deep night teal) |
| `--card`   | `#0b2030` | Card / cell fill |
| `--lime`   | `#c6ff3d` | **Primary brand accent**: Days, highlights, focus ring, CTA |
| `--coral`  | `#ff5a5f` | Accent 2: Hours |
| `--cyan`   | `#4de3ff` | Accent 3: Minutes |
| `--violet` | `#a77bff` | Accent 4: Seconds |
| `--text`   | `#f4f7ff` | Main text |
| `--dim`    | `#a9b8cf` | Labels, secondary text |
| ink        | `#04131c` | Text on lime/bright fills; hard shadows |
| soft text  | `#dfe6ff` | Small notes under the timer |

The four accents always appear in this order: **lime → coral → cyan → violet**.

**Aurora background** (the hero/stage), layered top to bottom:
1. Lime glow at top: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(198,255,61,.22), transparent 70%)`
2. Coral glow at bottom: `radial-gradient(ellipse 70% 60% at 50% 110%, rgba(255,90,95,.22), transparent 70%)`
3. Sky: `linear-gradient(125deg, #0b3b4a 0%, #142a78 40%, #5b2bd6 75%, #a12bd6 100%)` (teal → navy → indigo → magenta-violet)
4. Aurora curtains (`::before`): `repeating-linear-gradient(100deg, transparent 0 60px, rgba(77,227,255,.07) 60px 120px, transparent 120px 200px, rgba(198,255,61,.06) 200px 240px)`, which scrolls sideways 480px every 16s.

**Block colors** (isometric cubes, as top / left / right faces; the light comes from the top-left):
| Block  | Top       | Left      | Right     |
|--------|-----------|-----------|-----------|
| Lime   | `#c6ff3d` | `#8fc41f` | `#6a9612` |
| Coral  | `#ff5a5f` | `#c93b40` | `#9c2b30` |
| Cyan   | `#4de3ff` | `#22a9c9` | `#167f99` |
| Violet | `#a77bff` | `#7448d6` | `#5631ab` |
| Snow   | `#ffffff` | `#c9cfe6` | `#9aa2c4` |
| Grass  | `#7bd35a` | `#8b5a2b` | `#6b4423` (trim `#5fa844`) |

## 3. Typography

- **Display: Rubik Mono One** (400 only). Used for headlines, the brand name, timer digits, dates and buttons. Always UPPERCASE.
- **Body: Space Grotesk.** Used for paragraphs and labels. Unit labels are 700 weight, uppercase, with `letter-spacing: 2.5px`.
- Scale (fluid `clamp`):
  - Hero title: `clamp(36px, 7vw, 96px)`, line-height 0.95, text-shadow `6px 6px 0 rgba(4,19,28,.55)` (a hard shadow with no blur)
  - Timer digits: `clamp(44px, 9vw, 120px)`, tabular. Each digit sits in a fixed `0.9em` box so the row never jitters.
  - Brand name: `clamp(18px, 2.4vw, 26px)`
  - Date line: `clamp(14px, 1.9vw, 22px)` in display font
  - Unit labels: `clamp(11px, 1.2vw, 14px)`
  - Body: 17px / 1.55
- Emphasis inside headlines: `<em>` shows as **lime**, never italic.

## 4. Shape language

- **Pixel notch**: the signature corner. The top-left and bottom-right corners are cut as a 10px *stepped square*, not a diagonal:
  `clip-path: polygon(0 10px, 10px 10px, 10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)`
  It applies to cards, timer cells, buttons and the "live" banner.
- **Timer cell**: `--card` fill, an 8px top bar in the unit's accent color, and an inner bottom shadow `inset 0 -8px 0 rgba(0,0,0,.25)` that makes it read as a block.
- **Neon card**: a 3px accent-colored outline done as two nested notched layers.
- **Badge**: solid accent fill, ink text, 12px/700 uppercase, `letter-spacing 1.5px`, `skewX(-8deg)`.
- **Shadows** are always hard offsets with zero blur (`6px 6px 0`, `drop-shadow(0 12px 0 …)`).
- **No** border-radius, blur-glass, soft drop shadows or thin hairline UI.

## 5. Motion

- **Floating cubes**: 6 isometric cubes scattered around the edges. Each one bobs and rotates (`translateY(-10px) rotate(-8deg)`, 7s, alternating) with staggered delays of `n × -1.1s`.
- **Parallax**: the pointer position maps to `--mx/--my` (-1..1), and each cube shifts by its own depth `--d` (±18–48px) with a 0.3s ease-out.
- **Digit drop-in**: a changed digit drops in from -40% with a springy `cubic-bezier(.3,1.5,.5,1)` over 0.35s.
- **Aurora drift**: 16s linear loop.
- All pointer motion is off under `prefers-reduced-motion`.

## 6. Layout (countdown)

A single full-height screen with everything centered, `max-width: 1040px`:
brand (cube + "CaelumSMP") → 2-line title ("The website / *goes live in*") → 4 timer cells
(4 columns, 2×2 below 640px) → UTC date → "That's … where you are" local time.
Padding is `72px clamp(16px,5vw,80px) 96px`. On mobile the floaters fade to 45% opacity.

## 7. Brand mark

A lime isometric cube (`#c6ff3d / #8fc41f / #6a9612`) followed by **CAELUMSMP** in Rubik Mono One.
The logo files are in `../brand/`.

## Prompting tips

- "Keep the D4 countdown look: aurora gradient, pixel-notched cards, Rubik Mono One uppercase, hard shadows, lime/coral/cyan/violet in that order."
- Adding a section? Say which accent it should use and that it's a notched `--card` block with an 8px accent top bar.
