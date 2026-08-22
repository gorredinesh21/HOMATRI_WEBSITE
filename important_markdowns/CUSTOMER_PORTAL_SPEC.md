# 📱 Customer Ordering & Community Portal Specification (`/order`)

This document is the authoritative product and UX specification for the **Homaatri Customer Ordering & Community Experience** (`/order`).

---

## 1. Core Vision & Identity

Homaatri merges **community social discovery** with **recurring tiffin ordering**:
- **Social Discovery**: Customers build emotional trust by watching short cooking vlogs/reels, reading hometown stories, and following local homemakers.
- **Tiffin Commerce**: Customers easily order single meals or subscribe to recurring **Lunch (11:30 AM Cutoff)** or **Dinner (6:30 PM Cutoff)** plans.

---

## 2. Platform Navigation & Dual-Level Video Architecture

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

### Top Navigation Tabs (`/order`)
1. **`🎴 Kitchens`**: Tinder/Inshorts-style swipeable card deck of nearby verified home kitchens.
2. **`🎥 Community Stories`**: A global vertical video feed of daily cooking reels from all local homemakers.

---

## 3. Homemaker Discovery & Card Interaction Mechanics

### A. Inshorts / Tinder-Style Swiping Card Deck
- Homemaker profiles are presented as visual cards.
- **Card Swiping**: Swipe left/right (or use Next/Previous controls on desktop) to discover nearby homemakers.
- **Card Highlights**: Homemaker Photo, Kitchen Name, Regional Cuisine (e.g. *Telangana & Andhra*, *Konkan Coastal*, *Punjabi*), Rating, and Today's Special Dish.

### B. Hinge / Bumble-Style Deep Profile Scroll
- Tapping or scrolling down on a Kitchen Card expands her full personal profile:
  1. **Homemaker Story**: Her native hometown background, family recipe heritage, and cooking philosophy.
  2. **Hygiene & Verification Badges**: Verified kitchen inspection badge and packaging standards.
  3. **Social Media Links**: Verified YouTube, Instagram, and social handles (building authentic trust).
  4. **Chef's Video Gallery**: A dedicated video feed displaying **only this chef's cooking vlogs and reels**.
  5. **Tiffin Menu**: Interactive Lunch & Dinner items with quantity selectors and custom dietary notes (*"no garlic / medium spice"*).

---

## 4. Guest vs. Authentication Boundary (The YouTube Model)

| Platform Feature | Guest User (Not Logged In) | Authenticated User (Phone OTP) |
| :--- | :--- | :--- |
| **Swipe Kitchen Cards** | ✅ Allowed freely | ✅ Allowed |
| **Watch Cooking Reels & Vlogs** | ✅ Allowed freely | ✅ Allowed |
| **View Full Menus & Prices** | ✅ Allowed freely | ✅ Allowed |
| **Read Homemaker Stories** | ✅ Allowed freely | ✅ Allowed |
| **Add to Cart / Subscribe / Order** | 🔒 Requires Login | ✅ Allowed |
| **Like a Video / Reel** | 🔒 Requires Login | ✅ Allowed |
| **Comment / Post Review** | 🔒 Requires Login | ✅ Allowed |
| **Follow a Homemaker** | 🔒 Requires Login | ✅ Allowed |

---

## 5. Time-Pool & Kitchen Filtering Mechanics

- **No separate "Lunch Kitchens" vs "Dinner Kitchens" sections**: Homemakers cook across meal windows.
- **Primary Action Control**: **"Currently Serving Kitchens"** button/toggle that filters for kitchens currently active and accepting orders.
- **Filter Controls**:
  - **Meal Window**: `Lunch` / `Dinner`
  - **Dietary Preference**: `100% Veg`, `Non-Veg`, `Jain`
  - **Regional Cuisine**: `Telangana & Andhra`, `Konkan Coastal`, `Punjabi`, `South Indian`, `Gujarati`
