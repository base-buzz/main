# Mobile View Specification: Direct Messages List View

This document outlines the detailed layout and components for the Direct Messages (DM) list view on mobile devices, based on the provided screenshots (specifically 1).

## Reference Screenshots

- Screenshot 1: Shows the main list of direct message conversations.

## Overall Layout Structure

The Direct Messages list screen displays existing conversations and message requests:

1.  **Top Header Bar:** Contains the user's avatar, view title, and settings icon.
2.  **Search Bar:** Below the header, for filtering conversations.
3.  **Message Requests Row:** A distinct row linking to pending message requests.
4.  **Conversation List:** The main scrollable list of ongoing DM conversations.
5.  **Bottom Navigation Bar:** Fixed at the bottom (appears identical to Home Feed).
6.  **Floating Action Button (FAB):** Overlays the content area, likely for composing a new message.

---

## Detailed Component Breakdown

### 1. Top Header Bar (Visible in Screenshot 1)

- **Container:** Full width, standard height, likely solid background with bottom border.
- **Left Element:** User's avatar (small, circular).
- **Center Element:** "Messages" title (bold text).
- **Right Element:** Settings icon (gear shape).

### 2. Search Bar (Visible in Screenshot 1)

- **Container:** Full width, positioned below the header, with horizontal padding.
- **Input:** Standard search input field.
  - Icon: Magnifying glass icon on the left.
  - Placeholder Text: "Search Direct Messages".
  - Styling: Rounded corners.

### 3. Message Requests Row (Visible in Screenshot 1)

- **Container:** Full width row, positioned below the search bar. Separated by borders.
- **Layout:** Icon on the left, text block on the right, indicator dot on the far right.
- **Left Icon:** Envelope/Message Request icon.
- **Text Block:**
  - Title: "Message requests" (bold text).
  - Subtitle: "11 new people you may know" (standard text).
- **Right Indicator:** Small blue dot (indicates unread requests).

### 4. Conversation List (Visible in Screenshot 1)

- **Container:** Occupies the space between the Message Requests Row and the Bottom Navigation Bar. Vertically scrollable.
- **Layout:** A vertical list of individual conversation preview items.
- **Conversation Item Structure:**
  - **Avatar:** User/Group avatar (circular, left aligned).
  - **Text Content Block (Right of Avatar):**
    - **Top Row:**
      - Sender Name/Handle: Bold text (e.g., "Basejunkie.base.eth"). May include verified badge.
      - Username/Handle: Lighter text (e.g., "@BaseJunkie\_").
      - Timestamp: Right-aligned (e.g., "9h").
    - **Bottom Row:**
      - Message Preview: Snippet of the last message (e.g., "Message failed to send", "Hello Boss 👋", "Please check my X page"). Single line, truncates if long.
  - **Unread Indicator (Far Right):** Small blue dot for unread messages (visible for "SOLANA GIRL" and "Basejunkie").
  - **Separators:** Full-width lines separating conversation items.

### 5. Bottom Navigation Bar (Visible in Screenshot 1)

- **Appears identical** in structure, icons, and state (Messages icon has badge) to the one described in `home-feed.md`.

### 6. Floating Action Button (FAB) (Visible in Screenshot 1)

- **Container:** Circular button, blue background.
- **Position:** Overlays the content area, fixed in the bottom-right corner (standard FAB position).
- **Icon:** New message/Compose icon (envelope with plus sign).
- **Action:** Likely triggers a view to search users and start a new conversation.

---

## Responsiveness Notes / Implementation Details

- Ensure sufficient touch target size for each conversation row.
- Text truncation (`text-ellipsis`, `overflow-hidden`, `whitespace-nowrap`) is crucial for names, handles, and message previews.
- The list should support efficient rendering (virtualization if lists can become very long).
- Conditional rendering for the unread indicator dot.
- The Search Bar requires state management and filtering logic.
