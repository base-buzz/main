# Mobile View Specification: Global Layout Elements

This document describes common layout elements that appear consistently across multiple mobile views (Home Feed, Profile, Notifications, Messages, Post Detail), based on the provided screenshots.

## Reference Screenshots

- Screenshots 1, 4, 5, 6, 8, 9 all show variations of these global elements.

## Common Elements

### 1. Bottom Navigation Bar

- **Appearance:** Visible in screenshots 1, 4, 5, 6, 8, 9.
- **Container:**
  - Position: Fixed to the bottom edge of the screen.
  - Sizing: Full width.
  - Styling: Appears to have a solid background color and a top border separating it from the content above.
  - Implementation: Use Tailwind's `fixed`, `bottom-0`, `left-0`, `right-0`, `w-full`, `z-*` (high z-index like `z-50`), `border-t`, `bg-*`.
- **Layout:** Contains 5 icon-based navigation items, evenly spaced horizontally.
- **Icons (Left to Right - Based on Screenshot 8):**
  - Home (House shape)
  - Search (Magnifying glass)
  - Grok / Center Item (Custom logo/icon)
  - Notifications (Bell shape)
  - Messages (Envelope shape)
- **State:**
  - The currently active section's icon is visually distinct (e.g., filled style vs. outline style for inactive icons).
  - Notification/Message icons can display a small, circular badge (e.g., blue background with white number) in their top-right corner to indicate unread counts.
- **Action:** Tapping an icon navigates the user to the corresponding primary section of the app.

### 2. Floating Action Button (FAB)

- **Appearance:** Visible in screenshots 1, 5, 6, 8, 9.
- **Container:**
  - Shape: Circular button.
  - Styling: Prominent background color (e.g., blue).
  - Position: Fixed in the bottom-right corner of the screen, overlaying the main content area and potentially the Bottom Navigation Bar slightly.
  - Spacing: Has margins from the bottom and right screen edges.
  - Implementation: Use Tailwind's `fixed`, `bottom-*`, `right-*`, `z-*` (high z-index, but potentially lower than modals), `rounded-full`, `p-*`, `bg-*`, `shadow-*`.
- **Icon:** Contains a central icon indicating its action.
  - Compose Post/Tweet: Plus icon (+) (Visible in Home, Profile, Notifications).
  - Compose Message: Envelope with plus icon (Visible in Messages).
- **Action:** Triggers a primary action relevant to the current context (e.g., opening the compose view, starting a new message).

### 3. Common Header Patterns

While headers vary significantly, some patterns emerge:

- **Standard View Header (e.g., Notifications, Messages):**
  - Left: User Avatar (small, circular)
  - Center: View Title (bold text)
  - Right: Settings Icon (gear)
- **Navigational Header (e.g., Profile, Post Detail):**
  - Left: Back Arrow Icon
  - Center: View Title (bold text, e.g., "Post") or Empty
  - Right: Contextual Action Icons (e.g., Search, Share, More)
- **Action Header (e.g., Edit Profile, Compose):**
  - Left: "Cancel" button (text)
  - Center: View Title (bold text) or Empty
  - Right: Primary Action button (e.g., "Save", "Post" - often styled distinctly)
- **Home Feed Header:**
  - Left: Empty
  - Center: App Logo
  - Right: Action Button (e.g., "Upgrade")
- **Implementation:** Headers are typically full width, positioned at the top (`sticky` or `fixed`), with a bottom border and background color.

---

## Implementation Notes

- These global components should be defined once and reused across different page layouts.
- The Bottom Navigation Bar's state (active icon, badges) needs to be managed based on the current route and application state (e.g., unread counts).
- The FAB's icon and action might change depending on the current view.
- Consistent padding needs to be applied to the main scrollable content areas of each view to prevent content from being hidden underneath the fixed Bottom Navigation Bar and potentially the Reply Input Bar (in Post Detail).
