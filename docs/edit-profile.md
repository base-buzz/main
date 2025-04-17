# Mobile View Specification: Edit Profile View

This document outlines the detailed layout and components for the Edit Profile view on mobile devices, based on the provided screenshots (specifically 3).

## Reference Screenshots

- Screenshot 3: Shows the form for editing user profile details.

## Overall Layout Structure

The Edit Profile screen is primarily a form, structured vertically:

1.  **Top Header Bar:** Contains action buttons (Cancel, Save).
2.  **Banner Image Area:** Displays the profile banner with an edit overlay.
3.  **Avatar Area:** Shows the profile avatar overlapping the banner, with an edit overlay.
4.  **Form Fields Section:** A scrollable list of labeled input fields and links.

---

## Detailed Component Breakdown

### 1. Top Header Bar (Visible in Screenshot 3)

- **Container:** Full width, standard height, likely with a solid background color and a bottom border.
- **Left Element:** "Cancel" button (text-based).
- **Center Element:** "Edit profile" title (bold text).
- **Right Element:** "Save" button (text-based, likely bold or visually distinct from "Cancel").

### 2. Banner Image Area (Visible in Screenshot 3)

- **Container:** Full width, fixed height below the header.
- **Content:** Displays the user's current banner image.
- **Overlay:** Appears to have a camera icon or similar overlay, likely centered, indicating clicking it allows changing the banner.
- **Visual Effect:** A subtle gradient overlay (darker at the top) might be present over the banner image.

### 3. Avatar Area (Visible in Screenshot 3)

- **Container:** Positioned overlapping the bottom-left of the banner area (similar positioning to the Profile View).
- **Avatar:** Circular image, displaying the user's current avatar, with a border.
- **Overlay:** A prominent camera icon overlay is centered on the avatar, indicating it can be edited.

### 4. Form Fields Section (Visible in Screenshot 3)

- **Container:** Occupies the remaining vertical space below the banner/avatar section. Vertically scrollable.
- **Layout:** A list of labeled fields/rows.
- **Fields/Rows (Top to Bottom):**
  - **Name:**
    - Label: "Name"
    - Value: "dave 😎.base.eth" (appears editable)
    - Layout: Label above the value field.
  - **Bio:**
    - Label: "Bio"
    - Value: "biulding on base.eth with next.js, supabase, hardhat 🚀" (multi-line text area, likely editable).
    - Layout: Label above the value field.
  - **Location:**
    - Label: "Location"
    - Value: "onBase" (appears editable)
    - Layout: Label above the value field.
    - Indicator: Disclosure arrow ('>') on the far right, suggesting it might open a selection list or map.
  - **Website:**
    - Label: "Website"
    - Value: "Add your website" (placeholder text, appears editable).
    - Layout: Label above the value field.
  - **Birth date:**
    - Label: "Birth date"
    - Value: "6 May 1972" (likely opens a date picker).
    - Layout: Label above the value field.
    - Indicator: Disclosure arrow ('>') on the far right.
  - **Switch to Professional:**
    - Label: "Switch to Professional"
    - Indicator: Disclosure arrow ('>') on the far right. Navigates to another screen.
    - Layout: Label only, full row acts as a link.
  - **Edit expanded bio:**
    - Label: "Edit expanded bio"
    - Indicator: Disclosure arrow ('>') on the far right. Navigates to another screen.
    - Layout: Label only, full row acts as a link.
  - **Tips:**
    - Label: "Tips"
    - Value: "Off" (toggle switch or selection).
    - Indicator: Disclosure arrow ('>') on the far right.
    - Layout: Label on the left, value ("Off") aligned mid-right, arrow on the far right.
- **Separators:** Each field/row is likely separated by a full-width border/line.
- **Padding:** Consistent horizontal padding for all content within this section.

---

## Responsiveness Notes / Implementation Details

- This view is primarily a form, so standard mobile form styling is key (sufficient touch targets, clear labels, appropriate input types).
- Use appropriate HTML input types (`text`, `textarea`, `url`, `date`) styled with Tailwind.
- Disclosure arrows indicate navigation or opening modals/pickers.
- The scrollable container needs appropriate padding-bottom.
- Consider using a library like Radix UI for robust form components (like Switch for "Tips") if needed.
