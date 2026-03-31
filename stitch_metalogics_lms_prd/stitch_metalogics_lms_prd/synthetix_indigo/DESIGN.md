# Design System Document

## 1. Overview & Creative North Star: "The Digital Architect"

This design system moves beyond the standard enterprise LMS utility to create an environment of **The Digital Architect**. It is designed for high-stakes learning—where precision meets progress. We reject the "boxy" nature of traditional corporate portals in favor of a sophisticated, editorial layout that feels both authoritative and breathable.

The "Digital Architect" aesthetic is defined by:
*   **Intentional Asymmetry:** Breaking the grid with oversized typography and offset content blocks to guide the eye dynamically.
*   **Layered Precision:** Using tonal shifts rather than structural lines to define workspace boundaries.
*   **Atmospheric Depth:** A heavy reliance on glassmorphism and ambient shadows to create a UI that feels like a physical, illuminated workspace.

---

## 2. Colors: Tonal Architecture

Our palette is anchored in Indigo and Zinc, but its luxury comes from how these tones are layered, not just applied.

### Primary & Brand
*   **Primary (`#3525CD`):** Our core brand intelligence. Used for high-level interaction.
*   **Primary Container (`#4F46E5`):** The functional indigo. Used for active states and significant UI highlights.
*   **Signature Textures:** For Hero sections and primary CTAs, use a linear gradient from `primary` to `primary_container` at a 135° angle. This adds a "soul" to the interface that flat hex codes cannot replicate.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To separate a sidebar from a main content area, or a header from a body, use background color shifts. 
*   Place a `surface_container_low` section directly against a `surface` background.
*   The transition of color is the boundary. This creates a seamless, high-end editorial feel.

### Surface Hierarchy & Glassmorphism
Treat the UI as a stack of fine materials.
*   **Surface Lowest:** The base floor of the application.
*   **Surface High/Highest:** For elevated cards or floating panels.
*   **The Glass Rule:** For floating menus or navigation overlays, use `surface_container` with a 70% opacity and a `24px` backdrop-blur. This ensures the brand colors "bleed" through the UI, maintaining a cohesive atmosphere.

---

## 3. Typography: Editorial Authority

We use **Inter** not as a default, but as a precision tool. The hierarchy is designed to feel like a modern technical journal.

*   **Display (Large/Medium):** Reserved for achievement milestones and dashboard greetings. Use `tight` letter-spacing (-0.02em) to create a "custom-type" feel.
*   **Headlines:** The backbone of the LMS. These should always have ample leading to ensure the content feels premium and unhurried.
*   **Title (LG/MD/SM):** Used for course titles and module headers.
*   **Body & Labels:** All instructional text uses `body-md` for maximum legibility. 

**Typographic Identity:** High-contrast scale is key. Pair a `display-md` headline with a `label-md` uppercase sub-header to create a sophisticated, "designed" look.

---

## 4. Elevation & Depth: Tonal Layering

We avoid the "pasted-on" look of standard shadows. Depth in this system is organic.

*   **The Layering Principle:** To create a card, place a `surface_container_lowest` container on top of a `surface_container_low` background. The subtle 2-3% shift in luminosity is enough to define the shape.
*   **Ambient Shadows:** If an element must float (e.g., a Modal or a Dropdown), use a shadow with a blur radius of at least `32px` at `6%` opacity. The shadow color must be a tinted version of the background (e.g., a deep Indigo-Zinc mix), never pure black.
*   **The Ghost Border Fallback:** If accessibility requirements demand a border, use `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Precision Primitives

All components must adhere to the **rounded-lg (1rem)** corner radius to maintain the "Modern Enterprise" softness.

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`) with white text. No border.
*   **Secondary:** `surface_container_high` background with `on_surface` text.
*   **Tertiary:** Ghost style. No background; text-only using `primary` color.

### Input Fields
*   **Default State:** `surface_container_low` background with a 1px "Ghost Border".
*   **Focus State:** Border opacity increases to 100% using `primary`, with a soft `4px` outer glow.
*   **Forbid:** Never use white backgrounds for inputs on a white surface. Use depth to define the field.

### Cards & Learning Modules
*   **No Dividers:** Separate "Lesson 1" from "Lesson 2" using `1.5rem` (spacing scale 6) of vertical white space or a subtle background shift.
*   **Progress Indicators:** Use the `primary` indigo for progress bars, housed within a `surface_variant` track.

### State Indicators
*   **Success:** Using the Green spectrum for completion.
*   **Danger:** Using `error` (`#BA1A1A`) for failed assessments or destructive actions.
*   **Warning:** Using `tertiary` (`#7E3000`) for "In Progress" or "Expiring Soon" alerts.

---

## 6. Do’s and Don'ts

### Do
*   **Do** use intentional white space. If a layout feels "crowded," double the spacing between sections using the `12` or `16` spacing tokens.
*   **Do** use asymmetrical layouts for dashboards—e.g., a wide 2/3 column for main content and a narrow 1/3 column for progress stats.
*   **Do** ensure all interactive elements have a minimum target of 44px for accessibility.

### Don’t
*   **Don’t** use 1px solid black or dark grey borders. They "cheapen" the interface.
*   **Don’t** use standard drop-shadow presets. Always customize for high-blur, low-opacity.
*   **Don’t** use "Information Density" as an excuse for clutter. In a premium LMS, focus is the most valuable commodity.
*   **Don’t** mix corner radii. If a card is `lg`, the button inside it must be `lg` or `full`. Never mix `sm` and `xl`.