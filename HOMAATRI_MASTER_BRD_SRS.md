# 📘 HOMAATRI PLATFORM — MASTER BUSINESS REQUIREMENTS DOCUMENT (BRD) & SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

**Version:** 2.0 (Enterprise Specification)  
**Status:** Approved Architectural Source of Truth  
**Target Platform:** Unified Multi-Portal Web Platform & API Engine  
**Authoritative Repositories:**  
- **Frontend Platform**: [`https://github.com/gorredinesh21/HOMATRI_WEBSITE`](https://github.com/gorredinesh21/HOMATRI_WEBSITE)  
- **Backend API Engine**: [`https://github.com/gorredinesh21/homatri`](https://github.com/gorredinesh21/homatri)

---

# 1. EXECUTIVE SUMMARY & BRAND IDENTITY

Homaatri is a **managed tiffin and home-food platform built around trusted homemakers**. 

The platform operates on two core pillars:
1. **Customer Proposition (*Achha Khao. Ghar Ka Khao.*)**: Delivering authentic, healthy, hygienic home-cooked meals prepared with maternal love by verified homemakers in neighborhood clusters.
2. **Homemaker Proposition (*Your Kitchen, Your Business.*)**: A micro-SaaS operating platform empowering housewives to turn their culinary craft and hometown heritage into recognized, sustainable local food businesses without operational overhead.

---

# 2. SYSTEM ARCHITECTURE & TECH STACK

```text
                              ┌───────────────────────────────────┐
                              │    PYTHON FASTAPI BACKEND ENGINE  │
                              │  (GCP Cloud Run - CPU Always On)  │
                              └─────────────────┬─────────────────┘
                                                │
         ┌───────────────────┬──────────────────┼───────────────────┬──────────────────┐
         ▼                   ▼                  ▼                   ▼                  ▼
┌──────────────────┐┌────────────────┐┌──────────────────┐┌──────────────────┐┌──────────────────┐
│  POSTGRESQL DB   ││ SOCIAL / REELS ││   REDIS CACHE    ││ GCP CLOUD STORAGE││ NEXT.JS UNIFIED  │
│ (GCP Cloud SQL)  ││ DATABASE DB    ││(GCP Memorystore) ││    + CLOUD CDN   ││ FRONTEND APP     │
│ • Transactional  ││ • Video Reels  ││ • Fast Card Deck ││ • Short Reel     ││ (Public, Order,  │
│   ACID Tables    ││ • Comments     ││ • Atomic Likes   ││   Video Files    ││  Chef, Rider,    │
│ • Orders/Payments││ • User Follows ││ • Cart Sessions  ││ • Chef Vlogs     ││  Admin Portals)  │
└──────────────────┘└────────────────┘└──────────────────┘└──────────────────┘└──────────────────┘
```

### Stack Breakdown:
- **Frontend Framework**: Next.js 14 (React) + Tailwind CSS + Lucide Icons (Unified multi-portal routing).
- **Typography & Theme**: Google Fonts (`Outfit` headlines + `Plus Jakarta Sans` body copy) with Homaatri Terracotta Orange (`#E53A00`).
- **Backend Engine**: Python 3.10+, FastAPI, AsyncPG, SQLAlchemy, Gemini AI engine.
- **Infrastructure**: GCP Cloud Run (`homatri-backend`, `--no-cpu-throttling`), GCP Cloud SQL (`homatri_prod` PostgreSQL), GCP Cloud Storage, Cloud CDN, Redis (`GCP Memorystore`).

---

# 3. USER ROLES & SYSTEM MATRIX

| Role | Primary Interface | Auth Method | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **Guest Customer** | Public Site (`/`) & Portal (`/order`) | None (Unauthenticated) | Browse landing page, swipe kitchen cards, watch reels, read stories. |
| **Customer** | Ordering Portal (`/order`) & Tracking (`/tracking`) | Phone OTP (JWT) | Place orders, subscribe to tiffins, like/comment, track deliveries, pay via Razorpay. |
| **Homemaker / Chef** | Chef Dashboard (`/chef`) | Phone OTP (JWT) | Manage kitchen profile, setup menus, view cutoff cook lists, negotiate dietary notes, upload vlogs. |
| **Delivery Rider** | Rider Portal (`/rider`) | Phone OTP (JWT) | Shift status, leg-by-leg navigation, confirm chef pickup, gate delivery drop-offs. |
| **Admin Operations** | Admin Dashboard (`/admin`) | Admin Bearer Token | Pipeline monitoring, chat audit stream, cutoff batch triggers, HITL escalations, DB tools. |

---

# 4. MODULE SPECIFICATIONS & FUNCTIONAL REQUIREMENTS

## Module 1: Public Brand Website (`/`)
- **Hero Section**: Headline *Achha Khao. Ghar Ka Khao.*, subheadline, delivery area search bar with active Ghansoli cluster chips (*Ghansoli, Vashi, Airoli*), and value badges.
- **"Home Away From Home" Story**: Regional nostalgia storytelling showcasing authentic hometown recipes (Telangana, Konkan, Punjab, Kerala).
- **Homemaker Movement Story**: *Your Kitchen, Your Business.* narrative highlighting homemaker empowerment.
- **How It Works**: Simple 3-step routine (Discover Homemakers ➔ Pick Meal Window ➔ Enjoy Delivery).
- **Kitchen Spotlight**: Showcasing the 4 Ghansoli home kitchens (*Indravati*, *Konkan*, *Punjabi*, *Dakshin*).
- **Trust & Quality Banner**: Kitchen inspection, sealed tiffin packaging, and managed delivery guarantee.

## Module 2: Customer Community & Ordering Portal (`/order`)
- **Dual-Tab Platform Header**: Toggle between `🎴 Kitchens (Swipe)` and `🎥 Community Stories (Reels Feed)`.
- **Inshorts / Tinder Swipe Card Deck**: Swipeable kitchen cards (Next/Previous controls + Touch Swipe gestures).
- **Hinge-Style Deep Profile Scroll**: Homemaker bio story, hygiene badges, YouTube/Instagram links, Chef Vlogs, and Tiffin Menu.
- **Homemaker Reels/Shorts Video Player**: Vertical video feed with direct overlay *"Order Dish"* button.
- **YouTube-Style Guest vs. Auth Boundary**: Free swiping & video watching; Phone OTP modal triggered ONLY on Cart / Like / Comment / Follow.
- **"Currently Serving Kitchens" Toggle & Filter Bar**: Filter by Lunch/Dinner, Veg/Non-Veg, Regional Cuisines.
- **Tiffin Cart & Checkout**: Single meal or recurring tiffin plans with custom dietary notes (*"less oil, no garlic"*), ₹30 delivery fee, and Razorpay payment link checkout.

## Module 3: Homemaker / Chef Dashboard (`/chef`)
- **Left Sidebar Navigation Layout**: Overview, Cooking Checklist, Live Orders, Menu Manager, Content Studio, Dietary Requests, Earnings, Settings.
- **Cutoff Cooking Checklist**: Consolidated cook lists generated at **11:30 AM (Lunch)** and **6:30 PM (Dinner)** (e.g. *"8 Paneer Tikka Tiffins, 6 Dal Tadka"*).
- **Dietary Request Negotiation**: Accept / Reject / Counter custom customer notes (max 2 turns protocol).
- **Content Studio**: Upload short cooking videos, dish photos, thumbnail selection, view video likes/comments.

## Module 4: Delivery Rider Portal (`/rider`)
- **Mobile-First Interface**: Shift status toggle, active trip banner.
- **Leg-by-Leg Navigation**: Surfaces ONLY the next immediate stop with a direct `Open Google Maps Navigation` link.
- **Multi-Order Gate Delivery Drop-Off**: One-tap bulk confirmation `Confirm All Deliveries at this Address` with individual exception tracking.

## Module 5: Admin Operations Dashboard (`/admin`)
- **Live Pipeline Monitor**: Real-time stage counters (`DRAFT` ➔ `PENDING_PAYMENT` ➔ `CONFIRMED` ➔ `BATCHED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
- **Live Chat Audit Stream**: Real-time WhatsApp/Web conversation stream across all customers (`GET /api/admin/chats`).
- **Cutoff Engine & Route Allocator**: Manual and automated trigger for 11:30 AM Lunch and 6:30 PM Dinner route batching.
- **Human-In-The-Loop Escalation Center (HITL)**: Resolve escalations and issue custom WhatsApp replies.
- **System & DevOps Control Panel**: One-click production database seed (`/api/admin/seed-chefs-and-riders`) and data wipe (`/api/admin/clear-all-data`).

---

# 5. TIME-POOL BRACKETS & CUTOFF CLOCK RULES

- **Lunch Cutoff**: **11:30 AM**
- **Dinner Cutoff**: **6:30 PM**
- **Time Brackets & Framing**:
  - `00:00 – 11:30` ➔ Today's LUNCH.
  - `11:30 – 18:30` ➔ Today's DINNER (*"Lunch is closed — order for tonight's dinner"*).
  - `18:30 – 24:00` ➔ Tomorrow's LUNCH (*"Today's orders are closed — order for tomorrow's lunch"*).
- **Route Allocation Engine**: At cutoff, Master Agent executes Google Maps API route optimization once and saves the stop sequence in PostgreSQL (**1 Chef : 1 Driver per meal window**).

---

# 6. DATABASE SCHEMA DICTIONARY

```sql
-- CUSTOMER PROFILES
CREATE TABLE customer_profiles (
    phone VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    delivery_address TEXT NOT NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    is_registered BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CHEF PROFILES
CREATE TABLE chef_profiles (
    chef_phone VARCHAR(20) PRIMARY KEY,
    kitchen_name VARCHAR(120) NOT NULL,
    chef_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    apartment_or_locality VARCHAR(100),
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    dietary_type VARCHAR(20) CHECK (dietary_type IN ('VEG', 'NON_VEG', 'BOTH')),
    active_status BOOLEAN DEFAULT TRUE,
    daily_capacity INT DEFAULT 15,
    hometown_region VARCHAR(80),
    youtube_url VARCHAR(255),
    instagram_url VARCHAR(255)
);

-- CHEF MENU ITEMS
CREATE TABLE chef_menu_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chef_phone VARCHAR(20) REFERENCES chef_profiles(chef_phone) ON DELETE CASCADE,
    dish_name VARCHAR(120) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    meal_type VARCHAR(10) CHECK (meal_type IN ('LUNCH', 'DINNER')),
    is_available BOOLEAN DEFAULT TRUE
);

-- CUSTOMER ORDERS
CREATE TABLE customer_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_phone VARCHAR(20) REFERENCES customer_profiles(phone),
    chef_phone VARCHAR(20) REFERENCES chef_profiles(chef_phone),
    service_date DATE NOT NULL,
    meal_window VARCHAR(10) CHECK (meal_window IN ('LUNCH', 'DINNER')),
    status VARCHAR(30) DEFAULT 'PENDING_PAYMENT',
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    subtotal NUMERIC(10,2) NOT NULL,
    delivery_fee NUMERIC(10,2) DEFAULT 30.00,
    total_amount NUMERIC(10,2) NOT NULL,
    custom_dietary_note TEXT
);

-- CHEF REELS / SHORTS
CREATE TABLE chef_reels (
    reel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chef_phone VARCHAR(20) REFERENCES chef_profiles(chef_phone) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    video_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255) NOT NULL,
    associated_item_id UUID REFERENCES chef_menu_items(item_id),
    likes_count INT DEFAULT 0,
    views_count INT DEFAULT 0
);
```

---

# 7. DEVELOPMENT & PROMOTION POLICY

- **Git Branch Strategy**:
  - `develop` (Dev environment: `homatri_dev`) ➔
  - `staging` (Staging/QA: `homatri_stage`) ➔
  - `main` (Production: `homatri_prod`).
- **Defensive AI Coding Rules**:
  1. `return_direct=True` or direct route to `END` on terminal actions.
  2. Hard pre-condition assertions in Python tools (*Guard-then-guide*).
  3. Strict Pydantic schemas for all API & tool inputs.
  4. Clean state schema hygiene.
- **Workflow Rule**: Always discuss logic ➔ present proposed code ➔ wait for explicit user approval ➔ write code.
