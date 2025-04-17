# Mobile View Specification: Home Feed

This document outlines the detailed layout and components for the Home Feed view on mobile devices, based on the provided screenshots (specifically 8 and 9).

## Reference Screenshots

- Screenshot 8: Shows the main feed structure with the "For you" tab active.
- Screenshot 9: Shows the feed scrolled down slightly.

## Overall Layout Structure

The Home Feed screen consists of three main vertical sections:

1.  **Top Header Bar:** Contains the main logo/icon and potentially action buttons.
2.  **Tab Navigation Bar:** Sits below the header, allowing users to switch between feed types.
3.  **Main Content Area:** Displays the scrollable list of posts.
4.  **Bottom Navigation Bar:** Fixed at the bottom of the screen for primary app navigation.
5.  **Floating Action Button (FAB):** Overlays the content area, typically in the bottom-right.

---

## Detailed Component Breakdown

### 1. Top Header Bar (Visible in Screenshot 8 & 9)

- **Container:** Full width, likely with some vertical padding. A bottom border seems present, separating it from the tabs.
- **Left Element:** Empty space / No element visible on the left side in these screenshots.
- **Center Element:** The main app logo (e.g., the "X" logo). Positioned horizontally centered.
- **Right Element:** An "Upgrade" button. Appears to be a standard button with text. Positioned towards the top-right corner.

### 2. Tab Navigation Bar (Visible in Screenshot 8 & 9)

- **Container:** Full width, positioned directly below the Top Header Bar. Has a bottom border.
- **Layout:** Horizontally scrollable list of tabs. Padding on the left and right.
- **Tabs:**
  - Each tab contains text (e.g., "For you", "Following", "BuildinPublic", "Canto", "Base C...").
  - The active tab ("For you" in screenshot 8) has a visual indicator (e.g., a colored underline bar).
  - Sufficient horizontal spacing between tabs.

### 3. Main Content Area (Visible in Screenshot 8 & 9)

- **Container:** Occupies the space between the Tab Navigation Bar and the Bottom Navigation Bar. Vertically scrollable.
- **Post List:** A vertical list of individual post components.
  - **Post Component Structure (Brief - More detail in `post-detail.md` or similar):**
    - Avatar (Left)
    - Author Info (Username, Handle, Timestamp - Top Right of Avatar)
    - Post Content (Text below Author Info)
    - Embedded Content (e.g., Images, Links - Below Post Text)
    - Action Icons (Reply, Retweet, Like, Views, Bookmark/Share - Bottom of Post)
    - Clear visual separator (e.g., border/line) between posts.
  - **Special Items:** May include ads or other non-post elements (e.g., "Last War" ad in screenshot 8). These have their own distinct layout.

### 4. Bottom Navigation Bar (Visible in Screenshot 8 & 9)

- **Container:** Fixed to the bottom of the screen, full width. Appears to have a top border. Likely has some background color.
- **Layout:** Contains 5 icons, evenly spaced horizontally.
- **Icons (Left to Right):**
  - Home (Filled/Active state shown)
  - Search (Outline state shown)
  - Grok / Center Icon (Custom icon, Outline state shown)
  - Notifications (Bell icon, Outline state shown, includes a blue badge indicating "1" notification)
  - Messages (Envelope icon, Outline state shown, includes a blue badge indicating "1" message)
- **State:** The active icon (Home) is visually distinct (e.g., filled vs. outline).

### 5. Floating Action Button (FAB) (Visible in Screenshot 8 & 9)

- **Container:** Circular button with an icon.
- **Position:** Overlays the Main Content Area and potentially the Bottom Navigation Bar, fixed in the bottom-right corner. Has margins from the screen edges.
- **Icon:** A "plus" or "compose" icon.
- **Action:** Triggers the compose view/modal.

---

## Responsiveness Notes / Implementation Details

- Use Tailwind's `fixed`, `bottom-0`, `left-0`, `right-0`, `z-*` classes for the Bottom Navigation Bar.
- Use Tailwind's `fixed`, `bottom-*`, `right-*`, `z-*` classes for the FAB.
- The Top Header and Tab Navigation should likely stick to the top during scroll (`sticky`, `top-0`, `z-*`).
- The Main Content Area needs appropriate padding top/bottom to avoid being obscured by the fixed/sticky elements. Use `overflow-y-auto` for scrolling.
- Tab implementation might use Radix UI Tabs or a similar headless component library, styled with Tailwind. Apply responsive classes (`hidden`, `sm:block`, etc.) as needed if this layout changes drastically on larger screens (though this doc focuses on mobile).
- Bottom Navigation state change (active icon) can be handled via React state and conditional class application. Badges on icons are small overlays positioned relative to the icon.
