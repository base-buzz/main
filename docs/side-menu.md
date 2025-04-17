# Mobile View Specification: Side Menu / Drawer View

This document outlines the detailed layout and components for the Side Menu (likely presented as a slide-out drawer) on mobile devices, based on the provided screenshots (specifically 7).

## Reference Screenshots

- Screenshot 7: Shows the menu accessible likely via the user avatar in some headers.

## Overall Layout Structure

This view typically slides in from the left, partially overlaying the previous screen:

1.  **User Information Header:** At the top, showing user avatar, name, handle, and follower counts.
2.  **Main Navigation List:** A vertical list of icon-label pairs for primary navigation items.
3.  **Secondary/Utility List:** Below the main navigation, contains other links like settings and downloads.

---

## Detailed Component Breakdown

### 1. User Information Header (Visible in Screenshot 7)

- **Container:** Top section of the drawer.
- **Avatar:** User's avatar (circular, medium size, top-left).
- **Add Account Icon:** A small "add user" icon positioned near the top-right corner.
- **User Name:** Bold text (e.g., "dave 😎.base.eth") below the avatar.
- **Handle:** Lighter text (e.g., "@cosydell") below the name.
- **Follower Stats (Below Handle):**
  - Horizontally arranged (similar to profile view, but maybe smaller text).
  - Items visible: **"2,433"** "Following", **"5,782"** "Followers".
  - Separated by some space.
- **Separator:** A horizontal line below the follower stats, separating the header from the navigation list.

### 2. Main Navigation List (Visible in Screenshot 7)

- **Container:** Occupies the main vertical space below the header separator.
- **Layout:** A vertical list of navigation items.
- **Navigation Item Structure:**
  - **Layout:** Icon on the left, Text Label to the right of the icon.
  - **Icon:** Standard icon representing the section (e.g., user silhouette for Profile, X logo for Premium, etc.).
  - **Label:** Text describing the section (e.g., "Profile", "Premium", "Communities", "Bookmarks", "Jobs", "Lists", "Spaces", "Monetization"). Text is likely bold or medium weight.
  - **Spacing:** Consistent vertical spacing between items. Consistent horizontal spacing between icon and label.
  - **Touch Target:** Each entire row should be a tappable link.

### 3. Secondary/Utility List (Visible in Screenshot 7)

- **Container:** Positioned below the main navigation list.
- **Separator:** A horizontal line likely separates this section from the main navigation.
- **Layout:** Vertical list, similar structure to the main navigation list (Icon + Label).
- **Items:**
  - "Download Grok"
  - "Settings and privacy"
  - "Help Center" (partially obscured/guessed based on common patterns)
- **Theme/Display Options (Below list):**
  - Icons for display settings (e.g., light bulb, palette - partially obscured).

---

## Responsiveness Notes / Implementation Details

- This view is typically implemented as a drawer component that slides in from the left (`translate-x` properties in Tailwind controlled by state).
- Requires an overlay element behind the drawer to dim the background content when open.
- Needs logic to open/close the drawer (e.g., triggered by avatar tap, swipe gesture).
- Ensure sufficient touch targets for all navigation items.
- The list content might need to be scrollable if the number of items exceeds the screen height.
- The background content (visible on the right side in the screenshot) should not be interactive while the drawer is open.
