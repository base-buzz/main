# Mobile View Specification: Compose/Reply View

This document outlines the detailed layout and components for the Compose/Reply view on mobile devices, based on the provided screenshots (specifically 2).

## Reference Screenshots

- Screenshot 2: Shows the interface for replying to a post.

## Overall Layout Structure

This view appears as a modal or a distinct screen focused on text input:

1.  **Top Header Bar:** Contains actions (Cancel, Post).
2.  **Parent Post Context:** Shows a snippet of the post being replied to.
3.  **Reply Input Area:** Main text area for composing the reply.
4.  **Action Toolbar:** Below the text area, contains icons for adding media, polls, location, etc.
5.  **Keyboard Area:** The OS keyboard occupies the lower portion of the screen.

---

## Detailed Component Breakdown

### 1. Top Header Bar (Visible in Screenshot 2)

- **Container:** Full width, standard height, likely solid background with bottom border.
- **Left Element:** "Cancel" button (text-based).
- **Center Element:** Empty / No title visible.
- **Right Element:** "Post" button (text-based, blue background, white text - indicating active/primary action).

### 2. Parent Post Context (Visible in Screenshot 2)

- **Container:** Positioned below the header.
- **Layout:**
  - **Avatar:** Small circular avatar of the parent post's author (top-left).
  - **Thread Line:** A vertical grey line extends down from below the avatar, visually connecting to the reply input area.
  - **Parent Post Snippet (Right of Avatar/Thread Line):**
    - Author Info: Name, Handle, Timestamp (e.g., "David Tso (dave.base.eth) @davi... · 30m").
    - Post Text: Snippet of the parent post content ("Build a mini app..."). Mentions are styled.
  - **Replying To Info (Below Parent Snippet):**
    - Text: "Replying to @davidtsocy @farcaster_xyz and @CoinbaseWallet". Mentions styled.

### 3. Reply Input Area (Visible in Screenshot 2)

- **Container:** Positioned below the Parent Post Context.
- **Layout:**
  - **Avatar:** User's own avatar (small, circular) aligned left, vertically aligned with the start of the input area.
  - **Text Input Area (Right of Avatar):**
    - Multi-line text input field.
    - Placeholder text is likely shown when empty.
    - Shows the composed text ("Fantastic let's go!") with the cursor.
    - Takes up significant vertical space.

### 4. Action Toolbar (Visible in Screenshot 2)

- **Container:** Full width, positioned directly above the keyboard area. Likely has a top border.
- **Layout:** Row of icons, horizontally arranged.
- **Icons (Left to Right):**
  - Text Format (?) (e.g., "AA")
  - Image/Media Picker
  - GIF Picker
  - Poll
  - Location
- **Right Side:** A circular indicator, possibly for character count (partially obscured).

### 5. Keyboard Area (Visible in Screenshot 2)

- Standard iOS keyboard is displayed, occupying the bottom portion of the screen.

---

## Responsiveness Notes / Implementation Details

- This view might be implemented as a modal that slides up or a separate route.
- The main text input should auto-expand vertically as the user types (using `react-textarea-autosize` or similar).
- The parent post context might be truncated if too long.
- The action toolbar icons trigger corresponding pickers or UI elements.
- The layout needs to adapt dynamically to the keyboard appearing/disappearing.
- The character count indicator needs to update as the user types.
