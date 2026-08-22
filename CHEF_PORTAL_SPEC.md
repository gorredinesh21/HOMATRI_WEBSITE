# 👩‍🍳 Homemaker / Chef Dashboard Specification (`/chef`)

This document is the authoritative product and UX specification for the **Homaatri Homemaker / Chef Dashboard** (`/chef`).

---

## 1. Core Vision & Identity

The Homemaker Dashboard operates under Homaatri's entrepreneurship promise: **"Your Kitchen, Your Business."**
- **Zero Operational Friction**: Homaatri manages customer acquisition, order aggregation, payment processing, packaging standards, and doorstep delivery.
- **Homemaker Autonomy**: Homemakers manage their personal brand identity, recipes, menus, cooking checklists, and cooking vlogs.

---

## 2. Dashboard UI Layout (Left Sidebar Navigation)

The UI features a clean, responsive SaaS dashboard with a **Left Side Navigation Sidebar** (collapsible into a mobile drawer):

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│                           HOMEMAKER DASHBOARD (/chef)                          │
├──────────────────────┬─────────────────────────────────────────────────────────┤
│ LEFT SIDEBAR NAV     │ MAIN CONTENT DISPLAY AREA                               │
│                      │                                                         │
│ 👩‍🍳 Kitchen Brand     │ 📊 TODAY'S OVERVIEW & CUTOFF COOKING CHECKLIST           │
│                      │ • Active Meal Window: LUNCH (11:30 AM Cutoff)            │
│ 📊 Overview          │ • Total Meals to Prepare: 14 Tiffins                    │
│ 📋 Cooking Checklist │                                                         │
│ 📦 Live Orders       │ 🥘 CONSOLIDATED COOK SUMMARY:                           │
│ 🍲 Menu Manager      │   - 8x Paneer Tikka Tiffins                             │
│ 🎥 Content Studio    │   - 6x Dal Tadka & Jeera Rice                           │
│ 💬 Dietary Requests  │                                                         │
│ 💰 Earnings          │ [ 🟢 MARK BATCH PACKED & READY FOR DRIVER PICKUP ]       │
│ ⚙️ Kitchen Settings  │                                                         │
└──────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 3. Sidebar Navigation Sections & Features

### A. 📊 Overview (`/chef`)
- **Active Window Status**: Real-time indicator for active meal window (**LUNCH 11:30 AM Cutoff** / **DINNER 6:30 PM Cutoff**).
- **Kitchen Toggle**: `Accepting Orders` / `Kitchen Closed` master switch.
- **Quick Action**: `Mark Batch Packed & Ready` one-tap button.

### B. 📋 Cooking Checklist (`/chef/checklist`)
- **Consolidated Cook Summary**: Aggregated items to prepare (e.g. *"8 Paneer Tikka, 6 Dal Tadka"*).
- **Order-by-Order Cards**: Per-order detail listing customer name, item breakdown, and special notes.

### C. 📦 Live Orders & Handoff (`/chef/orders`)
- **Order Pipeline Tracking**: `COOKING` ➔ `PACKED_READY` ➔ `PICKED_UP_BY_DRIVER`.
- **Rider Info Card**: Assigned delivery driver details (*Rider Ramesh - Vehicle: MH-43-AZ-1234*).

### D. 🍲 Menu Manager (`/chef/menu`)
- **Item Catalog**: Add/edit dish name, unit price (₹), meal window (`LUNCH`/`DINNER`), and availability toggle (`In Stock` / `Sold Out`).

### E. 🎥 Content Studio (`/chef/studio`)
- **Reel Uploader**: Select cooking videos from phone gallery, attach signature dish link, and publish.
- **Social Engagement View**: Track video likes, views, and customer comment replies.

### F. 💬 Dietary Requests (`/chef/requests`)
- **Special Customization Notes**: Action cards for customer requests (*"less oil, no garlic"*).
- **Action Buttons**: `Accept`, `Reject`, or `Send Counter-Offer` (max 2 turns protocol).

### G. 💰 Earnings & Payouts (`/chef/earnings`)
- **Financial Analytics**: Daily income, weekly payouts, completed order volume, and repeat customer retention.

### H. ⚙️ Kitchen Settings (`/chef/settings`)
- **Kitchen Config**: Kitchen name, chef photo, address, hometown region (e.g. *Telangana, Konkan, Punjab*), daily capacity limit, YouTube/Instagram links.
