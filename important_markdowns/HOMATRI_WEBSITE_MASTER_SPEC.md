# 🌐 HOMAATRI UNIFIED WEBSITE PLATFORM — MASTER SPECIFICATION & REQUIREMENTS

This document consolidates all product features, UI component breakdowns, interactive maps, guest/auth rules, and operational requirements for the **Homaatri Unified Frontend Website Platform** (`homatri_website`).

---

# SECTION 1: PUBLIC BRAND WEBSITE (`/`) INTERACTIVE MAP

## 1. Header Navigation Bar (`src/components/Navbar.jsx`)

| Element Name | Type | Target / Action | Behavior |
| :--- | :--- | :--- | :--- |
| **Homatri Logo & Name** | Link | `/` | Reloads / Smooth-scrolls to top of Landing Page |
| **"Explore Kitchens"** | Link | `#kitchens` | Smooth-scrolls to Featured Homemakers section |
| **"Our Story"** | Link | `#story` | Smooth-scrolls to "Home Away From Home" story |
| **"How It Works"** | Link | `#how-it-works` | Smooth-scrolls to 3-Step Tiffin Routine section |
| **"Hygiene & Trust"** | Link | `#trust` | Smooth-scrolls to Trust & Quality Banner section |
| **"Explore Menus" (Header CTA)** | Primary Button | `/order` | Redirects customer to Customer Ordering Portal (`/order`) |

---

## 2. Hero Banner (`src/components/Hero.jsx`)

| Element Name | Type | Target / Action | Behavior |
| :--- | :--- | :--- | :--- |
| **Locality Search Box** | Text Input | Captures area name (e.g. *"Ghansoli"*) | Saves area string into global location state |
| **"Find Menus" (Hero CTA)** | Primary Button | `/order` | Redirects to `/order?location=...` with location pre-filtered |
| **Chip: "📍 Ghansoli"** | Filter Button | Sets search input to *"Ghansoli"* | Auto-populates search box with "Ghansoli" |
| **Chip: "📍 Vashi"** | Filter Button | Sets search input to *"Vashi"* | Auto-populates search box with "Vashi" |
| **Chip: "📍 Airoli"** | Filter Button | Sets search input to *"Airoli"* | Auto-populates search box with "Airoli" |

---

## 3. Featured Kitchens Spotlight (`src/components/KitchenSpotlight.jsx`)

| Element Name | Type | Target / Action | Behavior |
| :--- | :--- | :--- | :--- |
| **"View All Kitchens"** | Link | `/order` | Redirects to Customer Ordering Portal (`/order`) |
| **"View Menu & Order"** *(Indravati Pure Veg)* | Card Button | `/order?chef=9876543210` | Opens `/order` with **Chef Sunita Sharma's** menu pre-selected |
| **"View Menu & Order"** *(Konkan Coastal)* | Card Button | `/order?chef=9876543211` | Opens `/order` with **Chef Ananya Naik's** menu pre-selected |
| **"View Menu & Order"** *(Desi Punjabi Dhaba)* | Card Button | `/order?chef=9876543212` | Opens `/order` with **Chef Rajesh Grewal's** menu pre-selected |
| **"View Menu & Order"** *(Dakshin Annapoorna)* | Card Button | `/order?chef=9876543213` | Opens `/order` with **Chef Meenakshi Iyer's** menu pre-selected |

---

## 4. Quality & Trust Banner (`src/components/TrustBanner.jsx`)

| Element Name | Type | Target / Action | Behavior |
| :--- | :--- | :--- | :--- |
| **"Explore Today's Menu"** | Primary Button | `/order` | Redirects customer directly to `/order` |

---

## 5. Footer (`src/components/Footer.jsx`)

| Element Name | Type | Target / Action | Behavior |
| :--- | :--- | :--- | :--- |
| **Footer Logo** | Link | `/` | Navigates to Landing Page (`/`) |
| **"Explore Home Kitchens"** | Link | `#kitchens` | Smooth-scrolls to `#kitchens` |
| **"Our Regional Story"** | Link | `#story` | Smooth-scrolls to `#story` |
| **"How Tiffin Works"** | Link | `#how-it-works` | Smooth-scrolls to `#how-it-works` |
| **"Hygiene & Standards"** | Link | `#trust` | Smooth-scrolls to `#trust` |
| **"Customer Ordering"** | Portal Link | `/order` | Redirects to Customer Portal (`/order`) |
| **"Chef Portal"** | Portal Link | `/chef` | Redirects to Homemaker Dashboard (`/chef`) |
| **"Admin Portal"** | Portal Link | `/admin` | Redirects to Operations Dashboard (`/admin`) |

---

# SECTION 2: CUSTOMER COMMUNITY & ORDERING PORTAL (`/order`)

## 1. Dual-Level Video & Kitchen Architecture

```text
                                  PLATFORM HEADER (/order)
                               ┌─────────────────────────────────┐
                               │  [🎴 Kitchens]   [🎥 Stories]   │
                               └────────────────┬────────────────┘
                                                │
         ┌──────────────────────────────────────┴──────────────────────────────────────┐
         ▼                                                                             ▼
┌─────────────────────────────────────────────────┐                       ┌─────────────────────────┐
│ TAB 1: KITCHEN CARDS DECK (Inshorts/Tinder Style)│                       │ TAB 2: COMMUNITY REELS  │
│ • Swipe nearby Homemakers (Left/Right)          │                       │ • Global Reel Feed of   │
│ • Tap/Scroll down ➔ Chef Profile                │                       │   ALL local homemakers  │
│   │                                             │                       │ • Direct "Order Dish"   │
│   └─► Chef Profile includes:                    │                       │   button on every video │
│       • Story, Hygiene Badges, Menu             │                       └─────────────────────────┘
│       • 🎥 CHEF'S DEDICATED REELS GALLERY       │
│         (Shows ONLY this chef's cooking vlogs)  │
└─────────────────────────────────────────────────┘
```

## 2. Inshorts/Tinder Kitchen Swiping & Hinge Profile Scroll
- **Swipeable Card Deck**: Swipe left/right (or use Next/Previous arrows on desktop) to discover nearby homemakers.
- **Card Highlights**: Photo, Kitchen Name, Hometown Region (*Telangana*, *Konkan*, *Punjab*), Rating (*4.9 ★*), Signature Dish, Price preview.
- **Hinge-Style Deep Profile Scroll**:
  - Homemaker bio story & native hometown heritage.
  - Kitchen inspection & hygiene verification badges.
  - Verified YouTube & Instagram links.
  - **Chef's Video Gallery** (Shows ONLY this chef's cooking vlogs).
  - **Interactive Tiffin Menu** (Lunch vs Dinner tabs, item quantity selectors, custom dietary note input).

## 3. Global Community Reels Feed (`/order?tab=stories`)
- Full-screen vertical video reels feed showcasing daily cooking vlogs from all local homemakers.
- Direct overlay button: `Order [Dish Name] - ₹X` adds item directly to cart.

## 4. Guest vs. Auth Boundary (The YouTube Model)

| Feature | Guest User (Not Logged In) | Authenticated User (Phone OTP) |
| :--- | :--- | :--- |
| **Swipe Kitchen Cards** | ✅ Allowed freely | ✅ Allowed |
| **Watch Cooking Reels & Vlogs** | ✅ Allowed freely | ✅ Allowed |
| **View Full Menus & Prices** | ✅ Allowed freely | ✅ Allowed |
| **Read Homemaker Stories** | ✅ Allowed freely | ✅ Allowed |
| **Add to Cart / Subscribe / Order** | 🔒 Requires Login | ✅ Allowed |
| **Like a Video / Reel** | 🔒 Requires Login | ✅ Allowed |
| **Comment / Post Review** | 🔒 Requires Login | ✅ Allowed |
| **Follow a Homemaker** | 🔒 Requires Login | ✅ Allowed |

## 5. Serving Controls & Filter Bar
- **"Currently Serving Kitchens" Toggle**: Filter for kitchens active and accepting orders right now.
- **Filters**: Meal Window (`Lunch` / `Dinner`), Dietary (`Veg`, `Non-Veg`, `Jain`), Regional Cuisine (`Telangana & Andhra`, `Konkan Coastal`, `Punjabi`, `South Indian`).

---

# SECTION 3: HOMEMAKER / CHEF DASHBOARD (`/chef`)

## 1. Left Sidebar Navigation Layout

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

## 2. Key Modules
1. **📊 Overview**: Active window indicator (Lunch 11:30 AM / Dinner 6:30 PM), master kitchen toggle (`Accepting Orders` / `Closed`).
2. **📋 Cooking Checklist**: Consolidated cook summary (e.g. *"8 Paneer Tikka, 6 Dal Tadka"*) + order-by-order breakdown.
3. **📦 Live Orders**: Order pipeline (`COOKING` ➔ `PACKED_READY` ➔ `PICKED_UP_BY_DRIVER`), assigned driver info.
4. **🍲 Menu Manager**: Add/edit dishes, prices (₹), meal window (`LUNCH`/`DINNER`), availability toggle (`In Stock` / `Sold Out`).
5. **🎥 Content Studio**: Video uploader for short cooking vlogs, attach signature dish link, monitor likes & comments.
6. **💬 Dietary Requests**: Accept/Reject/Counter custom customer notes (*"less oil, no garlic"* - max 2 turns protocol).
7. **💰 Earnings & Payouts**: Daily income, weekly payouts, completed orders, repeat customer retention.
8. **⚙️ Kitchen Settings**: Profile config, kitchen photo, address, hometown region, daily meal capacity limit.

---

# SECTION 4: DELIVERY RIDER PORTAL (`/rider`)

## 1. Mobile-First Architecture
- **1 Chef : 1 Driver Allocation**: Assigned to a specific kitchen per meal window (**LUNCH 11:30 AM** / **DINNER 6:30 PM**).
- **Leg-by-Leg Navigation**: Displays **ONLY the next immediate stop** with direct `Open Google Maps Navigation` link.

## 2. Key Modules
1. **Shift Status**: `On Shift` / `Off Shift` toggle, trip summary banner.
2. **Chef Pickup Confirmation**: One-tap `Confirm Kitchen Pickup` flips order statuses to `PICKED_UP_BY_DRIVER`.
3. **Leg-by-Leg Navigation**: Stop details, customer name, delivery address, `Open Google Maps` link, `Call Customer` link.
4. **Multi-Order Gate Delivery Drop-Off**: Bulk `Confirm All Deliveries at this Address` button.
5. **Individual Exception Handling**: Checkbox `Mark Order #102 Undelivered (Customer Not Available)` without failing the batch.
6. **Communication Relays**: `Report Kitchen Delay`, `Report Address Issue`.

---

# SECTION 5: ADMIN OPERATIONS DASHBOARD (`/admin`)

## 1. Left Sidebar Navigation Layout

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│                       ADMIN OPERATIONS DASHBOARD (/admin)                      │
├──────────────────────┬─────────────────────────────────────────────────────────┤
│ LEFT SIDEBAR NAV     │ MAIN OPERATIONAL DISPLAY AREA                           │
│                      │                                                         │
│ 🛡️ Homaatri Control   │ 📊 LIVE PIPELINE STAGES (Service Date: 2026-08-23)     │
│                      │ • DRAFT: 12  | PENDING_PAYMENT: 4 | CONFIRMED: 28     │
│ 📊 Order Pipeline    │ • BATCHED: 28| OUT_FOR_DELIVERY: 0| DELIVERED: 0       │
│ 💬 Live Chat Stream  │                                                         │
│ ⏰ Cutoff Engine     │ 👩‍🍳 ACTIVE KITCHENS CAPACITY:                           │
│ ⚠️ Escalation HITL   │ • Indravati Pure Veg (8/15) | Konkan Coastal (12/15)   │
│ 👩‍🍳 Chefs & Menus    │                                                         │
│ 🛵 Riders & Routes   │ [ ⚡ MANUAL RUN 11:30 AM CUTOFF & ROUTE BATCHING ]      │
│ 🛠️ System Tools      │                                                         │
└──────────────────────┴─────────────────────────────────────────────────────────┘
```

## 2. Key Modules
1. **📊 Live Order Pipeline**: Real-time stage counters (`DRAFT` ➔ `PENDING_PAYMENT` ➔ `CONFIRMED` ➔ `BATCHED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`), kitchen capacity meters.
2. **💬 Live Chat Audit Stream**: Real-time WhatsApp/Web customer message audit feed.
3. **⏰ Cutoff Engine**: Cutoff clock status (Lunch 11:30 AM / Dinner 6:30 PM), manual `Run Cutoff Batch & Route Allocation Now` trigger.
4. **⚠️ Escalation HITL**: Active customer support escalation queue, resolution panel with custom WhatsApp reply sender.
5. **👩‍🍳 Chef & Menu Management**: Master roster of home chefs, addresses, daily capacities, menus, and reels.
6. **🛵 Rider & Route Management**: Active delivery drivers, shift statuses, assigned trip routes, stop delivery logs.
7. **🛠️ System Tools**: One-click data seeding (`/api/admin/seed-chefs-and-riders`) & data wipe (`/api/admin/clear-all-data`).
