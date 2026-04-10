# Design System Specification: High-End Service Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Concierge"**

This design system moves away from the cluttered, "utility-first" look of traditional marketplaces. Instead, it adopts an **Architectural Editorial** approach. We treat the local service marketplace not as a directory, but as a premium gallery of expertise. 

The system breaks the standard "box-on-box" template by utilizing **intentional asymmetry**, high-contrast typography scales, and a "No-Line" philosophy. By focusing on breathing room and tonal depth, we establish an atmosphere of calm authority—reassuring users that the professionals they hire are as meticulous as the interface they are using.

---

## 2. Colors & Surface Philosophy
Our palette moves beyond simple hex codes to a functional layering system.

### Color Tokens
*   **Primary (#004ac6):** Our "Reliable Anchor." Used for high-level brand moments and key interactive states.
*   **Secondary (#855300):** The "Human Touch." Used sparingly for high-conversion CTAs (like "Book Now") to provide warmth against the professional blue.
*   **Tertiary (#006058):** The "Expertise Teal." Used for specialized service highlights or secondary success states.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Sectional boundaries must be achieved through:
1.  **Background Shifts:** Transitioning from `surface` to `surface-container-low`.
2.  **Negative Space:** Using the `20` (5rem) or `24` (6rem) spacing tokens to create mental groupings.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine material.
*   **Base:** `surface` (#f8f9ff)
*   **Structural Sections:** `surface-container-low` (#eff4ff)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff)
*   **Elevated Modals:** `surface-container-highest` (#d5e3fd)

### The "Glass & Gradient" Rule
To add "soul" to the professional blue, use **Signature Textures**. 
*   **Hero Sections:** Use a subtle linear gradient from `primary` (#004ac6) to `primary_container` (#2563eb) at a 135-degree angle.
*   **Glassmorphism:** For floating navigation or overlay headers, use `surface` at 80% opacity with a `20px` backdrop-blur. This ensures the service imagery bleeds through, softening the interface.

---

## 3. Typography: The Editorial Voice
We utilize a dual-font strategy to balance character with utility.

*   **The Hero (Manrope):** Our Display and Headline levels use **Manrope**. Its geometric yet open nature feels modern and architectural. 
    *   *Usage:* Use `display-lg` for value propositions. Force tight letter-spacing (-0.02em) for a high-end look.
*   **The Workhorse (Inter):** All Title, Body, and Label levels use **Inter**. It provides maximum legibility for service descriptions and pricing.
    *   *Hierarchy:* Use `body-lg` for service descriptions to ensure a premium, readable feel. Reserve `label-sm` for metadata (e.g., "5.0 Rating"), set in All Caps with +0.05em tracking.

---

## 4. Elevation & Depth
We eschew traditional drop shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** A card should feel "lifted" because it is a `surface-container-lowest` white block sitting on a `surface-container-low` blue-grey background.
*   **Ambient Shadows:** If a floating action button (FAB) or modal requires a shadow, it must use the "Ambient" style:
    *   *Blur:* 32px to 64px.
    *   *Color:* `on_surface` (#0d1c2f) at 4% to 6% opacity. 
    *   *Logic:* It should feel like a soft glow of light, not a hard shadow.
*   **The "Ghost Border":** For input fields where a boundary is required for accessibility, use `outline_variant` (#c3c6d7) at **20% opacity**. It should be felt, not seen.

---

## 5. Components & Interaction

### Buttons (The "Tactile" Scale)
*   **Primary:** `primary` background with `on_primary` text. Apply `rounded-md` (0.75rem). On hover, transition to a subtle gradient.
*   **Secondary:** `secondary_container` background. This is your "Book" button. High contrast, high warmth.
*   **Tertiary:** No background. Use `primary` text weight 600.

### Service Cards & Lists
*   **Constraint:** **Forbid dividers.** To separate service providers in a list, use a `surface-container-low` background on every second item, or simply use `12` (3rem) of vertical spacing.
*   **Asymmetry:** In service galleries, offset images slightly from their text containers to break the "grid-lock" and feel more editorial.

### Status Badges (The "Tonal" Badge)
Avoid neon "Stop/Go" colors. Use the container tokens for a sophisticated look:
*   **Pending:** `secondary_fixed` background / `on_secondary_fixed` text.
*   **Accepted:** `primary_fixed` background / `on_primary_fixed` text.
*   **Completed:** `tertiary_fixed` background / `on_tertiary_fixed` text.
*   **Cancelled:** `error_container` background / `on_error_container` text.

### High-Context Inputs
*   **Text Fields:** Use `surface_container_lowest` for the fill. Place the label in `label-md` using `on_surface_variant` (#434655) and float it above the field—never inside as a placeholder.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use overlapping elements (e.g., a service category icon slightly overlapping its container edge) to create depth.
*   **Do** prioritize whitespace over content density. If a screen feels "efficient," it’s likely not "premium" enough.
*   **Do** use `rounded-lg` (1rem) for large containers and `rounded-md` (0.75rem) for smaller buttons.

### Don't:
*   **Don't** use 100% black text. Always use `on_surface` (#0d1c2f) to maintain the soft, professional slate tone.
*   **Don't** use standard 1px grey dividers. If you feel the need for a line, use a 4px height block of `surface-variant` with 50% width to create a "stylized" break.
*   **Don't** use "pure" icons. Always pair service icons with a soft circular background in `surface-container-high` to give them weight and presence.