# Mobile View Specification: Post Detail View

This document outlines the detailed layout and components for the Post Detail view on mobile devices, based on the provided screenshots (specifically 4).

## Reference Screenshots

- Screenshot 4: Shows a single post with replies below it.

## Overall Layout Structure

The Post Detail screen displays a single focused post followed by its replies:

1.  **Top Header Bar:** Contains navigation (back) and action icons.
2.  **Main Post Area:** Displays the detailed content and metadata of the parent post.
3.  **Reply List Area:** A scrollable section showing replies to the main post.
4.  **Reply Input Bar:** Fixed at the bottom, allowing the user to compose a reply.
5.  **Bottom Navigation Bar:** Fixed at the very bottom (appears identical to Home Feed/Profile).

---

## Detailed Component Breakdown

### 1. Top Header Bar (Visible in Screenshot 4)

- **Container:** Full width, standard height, likely solid background with a bottom border.
- **Left Element:** Back Arrow icon.
- **Center Element:** "Post" title (bold text).
- **Right Elements (Grouped):** Share/Upload icon and Ellipsis (More options) icon. Spacing between them.

### 2. Main Post Area (Visible in Screenshot 4)

- **Container:** Full width, positioned below the header.
- **Author Info:**
  - **Avatar:** Circular image (top-left).
  - **Name/Handle Block (Right of Avatar):**
    - Name: Bold text ("David Tso (dave.base.eth)").
    - Handle: Lighter text ("@davidtsocy") below the name.
  - **Verified Badge:** Blue checkmark icon next to the name.
- **Post Content (Below Author Info):**
  - Text content ("Build a mini app..."). Includes mentions (@username) styled differently (e.g., blue color).
  - Full width, with horizontal padding.
- **Timestamp/Views (Below Post Content):**
  - Text displaying time, date, and view count (e.g., "18:05 · 16/04/2025 · 1.2K Views").
  - Likely separated by a top border from the post content.
- **Action Buttons (Below Timestamp/Views):**
  - Horizontally arranged row of icon-count pairs.
  - Visible actions: Reply (Speech bubble icon + 16), Retweet (Recycle icon + 3), Like (Heart icon + 41), Bookmark (Bookmark icon + 2), Share/Upload (Upload icon).
  - Evenly spaced across the width.
  - Separated by a top and bottom border from surrounding elements.

### 3. Reply List Area (Visible in Screenshot 4)

- **Container:** Occupies the space between the Main Post Area's action buttons and the Reply Input Bar. Vertically scrollable.
- **Header/Filter:** Text label "Most relevant replies" with a dropdown arrow, suggesting sorting options.
- **Replies:** A vertical list of reply components.
  - **Reply Component Structure (Similar to Post, but potentially condensed):**
    - Avatar (Left)
    - Author Info (Name, Handle, Timestamp)
    - Reply Content (Text, Mentions)
    - Action Icons (Reply, Retweet, Like, Views, Share - may omit counts or be smaller).
    - Separators between replies.
  - **Special Items:** May include ads (e.g., "Ediciones Inconexas" ad).

### 4. Reply Input Bar (Visible in Screenshot 4)

- **Container:** Fixed to the bottom, just above the main Bottom Navigation Bar. Full width, likely with a top border and background color.
- **Layout:** Contains a text input field and potentially action icons.
- **Content:** Placeholder text like "Post your reply".

### 5. Bottom Navigation Bar (Visible in Screenshot 4)

- **Appears identical** in structure, icons, and state to the one described in previous specification files.

---

## Responsiveness Notes / Implementation Details

- The main post area requires careful padding and spacing management.
- Action buttons need sufficient touch target size.
- The reply list should be efficiently rendered (virtualization for long lists).
- The Reply Input Bar needs `position: sticky` or `position: fixed` relative to the scroll container and the main Bottom Navigation Bar, likely using `bottom-*` properties adjusted for the height of the main nav bar.
- Mentions within text require specific parsing and styling.
