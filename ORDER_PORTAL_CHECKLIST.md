# 📋 Granular Checklist & Audit: Customer Ordering & Community Portal (`/order`)

This document tracks every granular UI component, interaction layer, guest/auth boundary, cart drawer, and live tracking component required to build **Module 2: Customer Ordering & Community Portal (`/order`)**.

---

## 🧩 Component-by-Component Checklist

### Phase 1: Header & Dual-Tab Switcher
- [ ] **Dual-Tab Switcher**: Toggle between `🎴 Kitchens (Swipe)` and `🎥 Community Stories (Reels Feed)`.
- [ ] **Location Context Indicator**: Displays current delivery area (*"Ghansoli, Sector 6"*) with edit popup.
- [ ] **Cart Icon & Counter Badge**: Floating/Header cart icon showing total items added.
- [ ] **Auth / Profile Button**: Displays `Sign In` button (or user avatar when logged in).

---

### Phase 2: Tab 1 — Kitchen Swipe Cards & Hinge-Style Profile Scroll
- [ ] **Swipeable Card Deck Container**: Card deck supporting swipe gestures (mobile) & Next/Previous arrows (desktop).
- [ ] **Card Summary View**: Homemaker photo, kitchen name, hometown badge (*Telangana, Konkan, Punjab*), rating (*4.9 ★*), signature dish, and price preview.
- [ ] **Hinge-Style Deep Profile Scroll**:
  - [ ] Homemaker bio story & native hometown background.
  - [ ] Kitchen inspection & hygiene verification badges.
  - [ ] Verified YouTube & Instagram links.
  - [ ] **Chef’s Dedicated Video Gallery** (Shows ONLY this chef's cooking vlogs).
  - [ ] **Interactive Tiffin Menu** (Lunch vs Dinner tabs, item quantity selectors, custom dietary note input).

---

### Phase 3: Tab 2 — Global Community Reels Feed
- [ ] **Full-Screen Vertical Reel Player**: Auto-play vertical video player with sound toggle & progress bar.
- [ ] **Chef & Dish Overlay**: Chef avatar, kitchen name, dish description, unit price.
- [ ] **Direct "Order Dish" Button**: Overlay button `Order [Dish Name] - ₹X` that adds the dish straight to the cart.
- [ ] **Social Action Buttons**:
  - [ ] ❤️ Like Button (Triggers auth check if guest)
  - [ ] 💬 Comment Button & Slide-up Modal (Triggers auth check if guest)
  - [ ] ➕ Follow Chef Button (Triggers auth check if guest)

---

### Phase 4: Serving Controls & Filter Bar
- [ ] **"Currently Serving Kitchens" Toggle**: Filter for kitchens active and accepting orders right now.
- [ ] **Meal Window Filter**: `All`, `Lunch (11:30 AM Cutoff)`, `Dinner (6:30 PM Cutoff)`.
- [ ] **Dietary Chips**: `All`, `100% Veg`, `Non-Veg`, `Jain`.
- [ ] **Regional Cuisine Dropdown**: `Telangana & Andhra`, `Konkan Coastal`, `Punjabi`, `South Indian`, `Gujarati`.

---

### Phase 5: Guest vs. Auth Boundary (YouTube Model)
- [ ] **Phone Number OTP Login Modal**: Triggered ONLY when a guest attempts an action (*Add to Cart / Like / Comment / Follow*).
- [ ] **Auth Context (`AuthContext`)**: Manages JWT tokens, user phone session, and OTP verification state.

---

### Phase 6: Cart Drawer, Checkout & Payment
- [ ] **Slide-Over Cart Drawer**: Displays items, meal window (`LUNCH`/`DINNER`), quantity controls, and custom dietary note input (*"less oil, no garlic"*).
- [ ] **Subtotal & Delivery Fee Calculation**: Subtotal + ₹30 Delivery Fee.
- [ ] **Razorpay Payment Trigger**: Connects to backend `/api/v1/orders/checkout` to mint Razorpay payment link.

---

### Phase 7: Live Order Tracking (`/tracking`)
- [ ] **Visual Status Pipeline**: `PENDING_PAYMENT` ➔ `CONFIRMED` ➔ `BATCHED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.
- [ ] **Order Summary & Delivery Address Card**.
- [ ] **Support / HITL Escalation Button**: Direct link to request help from admin support.

---

## 📊 CURRENT STATUS AUDIT FOR `/order`

| Layer | What We HAVE Ready ✅ | What We DON'T HAVE YET ⏳ |
| :--- | :--- | :--- |
| **Specification** | `CUSTOMER_PORTAL_SPEC.md` locked & pushed to GitHub. | None (Spec is 100% complete). |
| **Backend Data** | 4 Ghansoli Home Kitchens & Menus live in PostgreSQL (`homatri_prod`). | Social schemas (`chef_reels`, `reel_comments`, `reel_likes`). |
| **Frontend UI** | Next.js route `/order` configured in Unified Platform. | The 7 React UI phases listed in the checklist above. |
