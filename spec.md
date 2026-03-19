# Game Topup Shop

## Current State
Admin Panel uses a horizontal Shadcn `<Tabs>` component with a CSS grid layout. All tabs (Products, Orders, Recharge, Members, Settings) are displayed as a row of tab triggers at the top. On mobile, small text (`text-[11px]`) is used to fit them.

## Requested Changes (Diff)

### Add
- Left sidebar navigation in the Admin Panel with grouped sections
- Active tab state variable to control which section is shown
- Group headers/labels in the sidebar

### Modify
- Replace horizontal `<TabsList>/<TabsTrigger>` nav with a vertical sidebar menu
- Layout changes from single-column to two-column (sidebar + content)
- Group sidebar items:
  - **কন্টেন্ট ম্যানেজমেন্ট**: Products, Offers (if exists)
  - **অর্ডার ও রিচার্জ**: Orders, Recharge
  - **ইউজার ম্যানেজমেন্ট**: Members (Super Admin only)
  - **সেটিংস**: Settings (Super Admin only)

### Remove
- Horizontal tab bar at the top of the admin panel

## Implementation Plan
1. Replace Shadcn `<Tabs>` with a manual `activeTab` state + conditional rendering
2. Add a sidebar `<nav>` on the left with grouped menu items
3. Each group has a label and items; clicking an item sets `activeTab`
4. Content area renders the corresponding section based on `activeTab`
5. Sidebar highlights the active item
6. On mobile: sidebar collapses or becomes a top scrollable nav
