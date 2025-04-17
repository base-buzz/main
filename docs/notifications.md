# Mobile View Specification: Notifications View

This document outlines the detailed layout and components for the Notifications view on mobile devices, based on the provided screenshots (specifically 6).

## Reference Screenshots

- Screenshot 6: Shows the main notifications list with tabs.

## Overall Layout Structure

The Notifications screen displays a list of user notifications, filterable by type:

1.  **Top Header Bar:** Contains the user's avatar, view title, and settings icon.
2.  **Tab Navigation Bar:** Allows switching between notification types (All, Mentions, Verified).
3.  **Main Content Area:** Displays the scrollable list of notifications corresponding to the selected tab.
4.  **Bottom Navigation Bar:** Fixed at the bottom (appears identical to Home Feed).
5.  **Floating Action Button (FAB):** Overlays the content area (appears identical to Home Feed).

---

## Detailed Component Breakdown

### 1. Top Header Bar (Visible in Screenshot 6)

- **Container:** Full width, standard height, likely solid background with bottom border.
- **Left Element:** User's avatar (small, circular).
- **Center Element:** "Notifications" title (bold text).
- **Right Element:** Settings icon (gear shape).

### 2. Tab Navigation Bar (Visible in Screenshot 6)

- **Container:** Full width, positioned directly below the Top Header Bar. Has a bottom border.
- **Layout:** Fixed tabs (not scrollable horizontally like profile/feed tabs). Three tabs equally spaced.
- **Tabs:**
  - Text labels: "All", "Mentions", "Verified".
  - Active tab ("All") has a visual indicator (underline bar).

### 3. Main Content Area (Visible in Screenshot 6)

- **Container:** Occupies the space between the Tab Navigation Bar and the Bottom Navigation Bar. Vertically scrollable.
- **Notification List:** A vertical list of individual notification items.
  - **Notification Item Structure (Example: "New post notifications for RT..."):**
    - **Left Icon:** Type indicator icon (e.g., Bell icon for general post notifications).
    - **Avatars (Right of Icon):** Stacked small avatars of users involved (e.g., avatars for RT and 5 others).
    - **Text Content (Below Avatars):** Descriptive text (e.g., "New post notifications for RT and 5 others").
  - **Notification Item Structure (Example: "Mario Nawfal is hosting..."):**
    - **Left Icon:** Type indicator icon (e.g., Purple microphone/broadcast icon).
    - **Author Avatar (Right of Icon):** Single avatar of the primary user (Mario Nawfal).
    - **Text Content (Right of Avatar):** Name + Action ("Mario Nawfal is hosting the Space").
    - **Embedded Content (Below Text):** A visually distinct card showing details of the Space (Title, Hashtags, Host tag, Time/Viewers). Includes an ellipsis (More options) icon within the card.
  - **Notification Item Structure (Example: "Grok replying to..."):**
    - **Left Icon:** Type indicator icon (e.g., Grok logo).
    - **Text Content (Right of Icon):** Name + Action + Recipient ("Grok replying to @cosydell and @hisscobra").
    - **Replied Post Snippet (Below Text):** Text snippet of the reply.
    - **Action Button (Optional):** E.g., "Download Grok" button at the bottom of the Grok notification.
  - **Separators:** Clear visual separator (e.g., border/line) between notification items.

### 4. Bottom Navigation Bar (Visible in Screenshot 6)

- **Appears identical** in structure, icons, and state (Notifications icon has badge) to the one described in `home-feed.md`.

### 5. Floating Action Button (FAB) (Visible in Screenshot 6)

- **Appears identical** in structure, icon, and position to the one described in `home-feed.md`.

---

## Responsiveness Notes / Implementation Details

- The structure of notification items varies significantly based on the notification type. Need distinct components or conditional rendering logic for each type (Mentions, Follows, Likes, RTs, Spaces, etc.).
- Ensure proper alignment and spacing within complex notification items (like the Space card).
- Use appropriate icons to represent different notification types.
- Text truncation might be necessary for long usernames or content snippets.
