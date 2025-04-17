# Mobile View Specification: Profile View

This document outlines the detailed layout and components for the User Profile view on mobile devices, based on the provided screenshots (specifically 5).

## Reference Screenshots

- Screenshot 5: Shows the main profile structure for the user "dave 😎.base.eth".

## Overall Layout Structure

The Profile screen consists of several stacked vertical sections:

1.  **Top Header Bar:** Contains navigation/action icons.
2.  **Banner Image Area:** Displays a large header image.
3.  **Profile Header Section:** Overlays the bottom part of the banner, contains avatar, action button, name, handle, bio, metadata (location, dob, joined), and follower stats.
4.  **Tab Navigation Bar:** Allows switching between content sections (Posts, Replies, etc.).
5.  **Main Content Area:** Displays the selected tab's content (e.g., list of posts).
6.  **Bottom Navigation Bar:** Fixed at the bottom (appears identical to Home Feed).
7.  **Floating Action Button (FAB):** Overlays the content area (appears identical to Home Feed).

---

## Detailed Component Breakdown

### 1. Top Header Bar (Visible in Screenshot 5)

- **Container:** Full width, likely with some vertical padding. Appears transparent or blended with the banner initially, potentially gaining a background on scroll.
- **Left Element:** Back Arrow icon (for navigation).
- **Center Element:** Empty / Not visible.
- **Right Elements (Grouped):** Search icon (magnifying glass) and Upload/More icon (potentially an ellipsis or share-like icon, partially obscured). Spacing between these two icons.

### 2. Banner Image Area (Visible in Screenshot 5)

- **Container:** Full width, extending from the Top Header Bar down to the Profile Header Section. Height is fixed.
- **Content:** Displays a background image (shows "BASE" logo in the example).

### 3. Profile Header Section (Visible in Screenshot 5)

- **Container:** Full width, positioned below the banner image, but the Avatar overlaps the bottom of the banner.
- **Avatar:** Circular image, positioned overlapping the bottom-left of the banner area, with a distinct border. Significant size.
- **Action Button ("Edit profile"):** Positioned on the right side, vertically aligned roughly with the bottom of the Avatar. Standard button styling.
- **User Info Block (Below Avatar/Action Button):**
  - **Name:** Larger font size, bold. Includes emoji. (e.g., "dave 😎.base.eth")
  - **Handle:** Smaller font size, lighter color (e.g., "@cosydell"). Positioned directly below the Name.
  - **Bio:** Standard text size. Can wrap multiple lines. Includes emoji. (e.g., "biulding on base.eth...") Positioned below the Handle.
- **Metadata Row (Below Bio):**
  - Horizontally arranged list of icon-text pairs.
  - Items visible: Location icon + "onBase", Calendar icon + "Born 6 May 1972", Calendar icon + "Joined July 2008".
  - Spacing between items.
- **Follower Stats (Below Metadata Row):**
  - Horizontally arranged.
  - Format: **[Number]** [Label]
  - Items visible: **"2.4K"** "Following", **"5.7K"** "Followers".
  - Numbers are bold. Labels are standard weight.
  - Spacing between the two stats.
- **Highlights/Analytics Block (Below Follower Stats):**
  - Visually distinct block (e.g., rounded corners, border).
  - Contains text like "Private to you", an icon (upward arrow), impression stats ("2.5K impressions..."), and an "Unlock analytics" button.
  - Includes a close 'X' icon in the top-right corner of this block.

### 4. Tab Navigation Bar (Visible in Screenshot 5)

- **Container:** Full width, positioned below the Profile Header Section. Has a bottom border.
- **Layout:** Horizontally scrollable list of tabs (similar to Home Feed tabs).
- **Tabs:**
  - Text labels (e.g., "Posts", "Replies", "Highlights", "Videos", "Photos", "Artic...").
  - Active tab ("Posts") has a visual indicator (underline bar).
  - Spacing between tabs.

### 5. Main Content Area (Visible in Screenshot 5)

- **Container:** Occupies the space below the Tab Navigation Bar, extending towards the Bottom Navigation Bar. Vertically scrollable.
- **Content:** Displays a list of posts authored by the user (when the "Posts" tab is active). The structure of each post appears similar to those in the Home Feed.

### 6. Bottom Navigation Bar (Visible in Screenshot 5)

- **Appears identical** in structure, icons, and state to the one described in `home-feed.md`.

### 7. Floating Action Button (FAB) (Visible in Screenshot 5)

- **Appears identical** in structure, icon, and position to the one described in `home-feed.md`.

---

## Responsiveness Notes / Implementation Details

- The overlapping Avatar requires careful positioning, possibly using negative margins or absolute positioning relative to the banner/header container.
- The Top Header Bar might transition background/opacity based on scroll position.
- Ensure sufficient vertical spacing between elements within the Profile Header Section.
- Tab implementation likely reuses the same component/logic as the Home Feed tabs.
- The content area needs padding to avoid the Bottom Navigation Bar and FAB.
