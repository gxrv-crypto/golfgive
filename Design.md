# Design System — Digital Heroes Platform

> A "Warm Impact" design system for the subscription-driven golf · charity · draw platform.
> Built on **shadcn/ui** + **Tailwind CSS**. Emotion-driven, charity-first, mobile-first.

---

## 01 · Design Principles

| Principle | Meaning |
|---|---|
| **Charity-first** | Lead with human impact and warmth, not sport. No fairways, plaid, or club imagery as primary language. |
| **Emotionally engaging** | Warm tones, real imagery, generous whitespace — feels human and caring. |
| **Clarity in the app** | Marketing pages emote; logged-in dashboards stay clean, structured, and readable. |
| **Mobile-first** | Every component designed for narrow screens first, then scaled up. |
| **Subtle motion** | Micro-interactions and transitions — never flashy or distracting. |

---

## 02 · Color Palette

The "Warm Impact" palette: hopeful warm tones, deep neutral base, a single vibrant CTA accent. Defined as HSL tokens for shadcn's theming convention.

### Light Mode (`:root`)

```css
:root {
  --background: 30 40% 98%;        /* warm cream */
  --foreground: 24 10% 12%;        /* warm charcoal */

  --card: 0 0% 100%;
  --card-foreground: 24 10% 12%;

  --popover: 0 0% 100%;
  --popover-foreground: 24 10% 12%;

  --primary: 14 90% 56%;           /* coral — main brand */
  --primary-foreground: 0 0% 100%;

  --secondary: 33 90% 55%;         /* warm amber */
  --secondary-foreground: 24 10% 12%;

  --accent: 174 62% 47%;           /* teal — CTA pop */
  --accent-foreground: 0 0% 100%;

  --muted: 30 20% 94%;
  --muted-foreground: 24 6% 42%;

  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;

  --success: 142 60% 42%;          /* paid / approved states */
  --warning: 38 92% 50%;           /* pending states */

  --border: 30 16% 88%;
  --input: 30 16% 88%;
  --ring: 14 90% 56%;

  --radius: 0.75rem;
}
```

### Dark Mode (`.dark`)

```css
.dark {
  --background: 24 12% 8%;         /* warm off-black */
  --foreground: 30 30% 96%;

  --card: 24 10% 11%;
  --card-foreground: 30 30% 96%;

  --popover: 24 10% 11%;
  --popover-foreground: 30 30% 96%;

  --primary: 14 90% 60%;
  --primary-foreground: 24 12% 8%;

  --secondary: 33 85% 58%;
  --secondary-foreground: 24 12% 8%;

  --accent: 174 60% 52%;
  --accent-foreground: 24 12% 8%;

  --muted: 24 8% 18%;
  --muted-foreground: 30 12% 65%;

  --destructive: 0 65% 55%;
  --destructive-foreground: 0 0% 100%;

  --success: 142 55% 50%;
  --warning: 38 90% 56%;

  --border: 24 8% 20%;
  --input: 24 8% 20%;
  --ring: 14 90% 60%;
}
```

### Usage Guide

| Token | Use For |
|---|---|
| `primary` (coral) | Brand identity, primary buttons, active nav |
| `accent` (teal) | The **Subscribe** CTA — must pop against everything |
| `secondary` (amber) | Highlights, badges, prize/jackpot emphasis |
| `success` / `warning` | Payment states (Paid → success, Pending → warning) |
| `muted` | Dashboard card backgrounds, secondary text |

---

## 03 · Typography

A characterful display font for emotional headlines; a clean sans for body and data.

```css
/* Add to layout via next/font or <link> */
--font-display: "Clash Display", "Cabinet Grotesk", serif; /* warm, characterful */
--font-sans: "Inter", "Manrope", system-ui, sans-serif;    /* clean, legible */
```

### Tailwind config

```js
// tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      display: ["var(--font-display)"],
      sans: ["var(--font-sans)"],
    },
  },
}
```

### Type Scale

| Element | Class | Notes |
|---|---|---|
| Hero headline | `font-display text-4xl md:text-6xl font-bold tracking-tight` | Emotional, marketing pages |
| Section title | `font-display text-2xl md:text-3xl font-semibold` | |
| Card title | `font-sans text-lg font-semibold` | Dashboards |
| Body | `font-sans text-base leading-relaxed` | |
| Data / scores | `font-sans text-sm tabular-nums` | Use `tabular-nums` for aligned numbers |
| Caption / meta | `font-sans text-xs text-muted-foreground` | |

---

## 04 · Spacing, Radius & Elevation

| Token | Value | Use |
|---|---|---|
| Base radius | `0.75rem` (`--radius`) | Cards, inputs, buttons — soft, friendly |
| Pill radius | `9999px` | Badges, plan toggles, CTA buttons |
| Section padding | `py-16 md:py-24` | Marketing sections |
| Card padding | `p-6` | Dashboard cards |
| Soft shadow | `shadow-sm` default, `shadow-md` on hover | Warm, subtle elevation — never harsh |

Generous whitespace is intentional: let the interface breathe to feel premium.

---

## 05 · shadcn/ui Components Required

Install the base components used across the platform:

```bash
npx shadcn@latest add button card input label badge avatar \
  dialog sheet dropdown-menu tabs table form select \
  toast sonner skeleton progress separator alert \
  switch slider tooltip accordion navigation-menu \
  radio-group checkbox calendar popover pagination
```

### Component Mapping by Feature

| PRD Feature | shadcn Components |
|---|---|
| **Subscription / plans** | `card`, `tabs` (monthly/yearly toggle), `switch`, `badge`, `button` |
| **Razorpay checkout flow** | `dialog`, `button`, `toast` / `sonner`, `skeleton` (loading) |
| **Score entry (last 5)** | `form`, `input`, `calendar` + `popover` (date), `table`, `button` |
| **Draw & reward** | `card`, `tabs`, `badge`, `progress` (jackpot bar), `alert` |
| **Charity directory** | `card`, `input` (search), `select` (filter), `avatar`, `badge` |
| **Charity contribution %** | `slider`, `label`, `tooltip` |
| **Winner verification** | `dialog`, `button`, `badge` (Pending/Paid), file upload (custom) |
| **User dashboard** | `card`, `tabs`, `table`, `progress`, `separator`, `badge` |
| **Admin dashboard** | `table`, `pagination`, `dialog`, `dropdown-menu`, `tabs`, `form` |
| **Navigation** | `navigation-menu`, `sheet` (mobile drawer), `avatar`, `dropdown-menu` |
| **Notifications / feedback** | `sonner`, `toast`, `alert` |

---

## 06 · Key Component Patterns

### Primary CTA (Subscribe)

The Subscribe button uses the teal `accent` to stand apart from the coral brand.

```tsx
<Button
  size="lg"
  className="rounded-full bg-accent text-accent-foreground
             hover:bg-accent/90 shadow-md hover:shadow-lg
             transition-all duration-200 font-semibold"
>
  Subscribe & Make Impact
</Button>
```

### Plan Toggle (Monthly / Yearly)

```tsx
<Tabs defaultValue="yearly" className="w-full">
  <TabsList className="rounded-full">
    <TabsTrigger value="monthly" className="rounded-full">Monthly</TabsTrigger>
    <TabsTrigger value="yearly" className="rounded-full">
      Yearly <Badge className="ml-2 bg-secondary">Save 20%</Badge>
    </TabsTrigger>
  </TabsList>
</Tabs>
```

### Score Card (rolling last 5)

```tsx
<Card className="p-6">
  <CardHeader className="px-0 pt-0">
    <CardTitle className="font-sans text-lg">Your Last 5 Scores</CardTitle>
  </CardHeader>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead className="text-right">Score</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    {/* tabular-nums on score cells, reverse chronological */}
  </Table>
</Card>
```

### Jackpot / Prize Pool Progress

```tsx
<Card className="p-6 bg-gradient-to-br from-secondary/10 to-primary/10">
  <p className="font-display text-3xl font-bold">₹2,40,000</p>
  <p className="text-sm text-muted-foreground">5-Match Jackpot · rolls over</p>
  <Progress value={68} className="mt-4" />
</Card>
```

### Payment State Badges

```tsx
<Badge className="bg-warning/15 text-warning border-warning/30">Pending</Badge>
<Badge className="bg-success/15 text-success border-success/30">Paid</Badge>
```

### Charity Contribution Slider (min 10%)

```tsx
<div className="space-y-3">
  <Label>Charity Contribution: {value}%</Label>
  <Slider min={10} max={100} step={5} defaultValue={[10]} />
  <p className="text-xs text-muted-foreground">Minimum 10% of your subscription.</p>
</div>
```

---

## 07 · Layout Structure

### Marketing / Public (emotional)

- Full-bleed hero with warm gradient + real human imagery, large display headline, accent CTA.
- Sections: *What you do → How you win → Charity impact → Spotlight charity → CTA.*
- Generous vertical rhythm (`py-24`), soft cards, motion on scroll.

### App / Dashboard (structured)

- Sidebar (`sheet` on mobile) + top bar with `avatar` dropdown.
- Card-based grid; clear data hierarchy; `tabs` to separate modules.
- Tables with `tabular-nums`, pagination for admin lists.

---

## 08 · Motion & Micro-interactions

Keep it subtle — the PRD asks for micro-interactions, not flashy animation.

| Interaction | Treatment |
|---|---|
| Button hover | `transition-all duration-200`, slight shadow lift |
| Card hover | `hover:-translate-y-0.5 hover:shadow-md transition` |
| Page / section reveal | Fade + slide-up on scroll (Framer Motion, ~300ms) |
| Draw result reveal | Staggered number reveal for excitement |
| Toasts | Slide in via `sonner`, auto-dismiss |
| Loading | `skeleton` placeholders, never blank screens |

**Recommended lib:** [Framer Motion](https://www.framer.com/motion/) for entrance animations, paired with Tailwind transitions for hover/focus states.

---

## 09 · Accessibility & Responsiveness

- Mobile-first: design at ~375px, scale up with `md:` / `lg:` breakpoints.
- Maintain WCAG AA contrast — verify coral/teal on cream and dark backgrounds.
- All interactive elements keyboard-navigable (shadcn handles focus rings via `--ring`).
- Respect `prefers-reduced-motion` — disable non-essential animation.
- Touch targets ≥ 44px; bottom-sheet (`sheet`) navigation on mobile.

---

## 10 · Quick Setup Checklist

- [ ] Initialise shadcn: `npx shadcn@latest init` (choose CSS variables, base color: neutral)
- [ ] Paste the color tokens above into `globals.css`
- [ ] Add display + sans fonts via `next/font`
- [ ] Extend `tailwind.config.js` with font families, `success`/`warning` colors
- [ ] Install components listed in Section 05
- [ ] Add Framer Motion for entrance animations
- [ ] Verify contrast + reduced-motion support
- [ ] Test full flow on a 375px viewport before desktop
