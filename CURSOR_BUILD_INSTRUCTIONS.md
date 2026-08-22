# 🤖 MASTER CURSOR AI BUILD PROMPT & INSTRUCTION MANUAL

> **INSTRUCTION FOR CURSOR / CLAUDE CODE / AI CODING AGENTS:**  
> This file is your **Master Source of Truth & Step-by-Step Implementation Guide** for building the entire full-stack Homaatri platform (`homatri_website`). You MUST read and strictly adhere to all rules, markdown references, execution sequences, state machines, sequence diagrams, and design rules documented below before writing or editing any code.

---

## 🎯 SYSTEM OVERVIEW & REPOSITORY CONTEXT

- **Project Name**: Homaatri Website & Platform (`homatri_website`)
- **GitHub Repository**: [`https://github.com/gorredinesh21/HOMATRI_WEBSITE`](https://github.com/gorredinesh21/HOMATRI_WEBSITE)
- **Tech Stack**: Next.js 14 (App Router) + React 18 + Tailwind CSS + Lucide Icons + Python FastAPI Backend
- **Live Backend API**: `https://homatri-backend-195132182954.us-central1.run.app`
- **Live Production Database**: GCP Cloud SQL PostgreSQL (`homatri_prod`)
- **Brand Colors**: Homaatri Terracotta Orange (`#E53A00`), Success Green (`#16A34A`), Warm Cream (`#FBF9F6`), Dark Slate (`#1E293B`)
- **Typography System**: Headlines: `font-display` (`Outfit` Google Font) | Body: `font-sans` (`Plus Jakarta Sans` Google Font)

---

## 📚 THE 14 MANDATORY MARKDOWN SPECIFICATION FILES

You MUST reference these 14 specification files located in the repository root and `important_markdowns/`. Each file defines authoritative logic generated for this platform:

### A. The 5 Core ChatGPT-Generated Technical Specs:
1. 📄 **`Homaatri_Core_State_Machines.md`**: Authoritative state transition diagrams & matrices for Order Lifecycle (`DRAFT` ➔ `DELIVERED`), Kitchen Capacity (`CLOSED` ➔ `SOLD_OUT`), Rider Shift/Batch (`OFF_SHIFT` ➔ `COMPLETED`), and Dietary Negotiation (2-turn cap).
2. 📄 **`Homaatri_Critical_Sequence_Diagrams.md`**: Authoritative system sequence control flows for Guest Discovery ➔ Checkout, Cutoff Clock (11:30 AM / 6:30 PM) ➔ Google Maps Route Allocation, and Community Reel Engagement.
3. 📄 **`Homaatri_Database_ERD_Data_Dictionary.md`**: Authoritative PostgreSQL schema dictionary (10 operational + 4 social tables), PK/FK definitions, spatial/B-Tree indexes, and Redis key structures.
4. 📄 **`Homaatri_Business_Logic_Edge_Case_Rules.md`**: Quantitative rules for 11:30 AM & 6:30 PM cutoff clock rollovers, kitchen capacity enforcement, flat ₹30 delivery fee, YouTube-style guest/auth permission matrix, and dietary negotiation rules.
5. 📄 **`Homaatri_Frontend_Component_Architecture_State_Contracts.md`**: TypeScript interfaces & JSDoc contracts for `LocationContext`, `CartContext`, `AuthContext`, and component props for all 5 portal surfaces.

### B. Master Baseline BRD/SRS Specifications:
6. 📄 **`Homaatri_Full_Stack_BRD_SRS_v1.md`**: Enterprise 1,552-line master software requirements baseline for the entire platform.
7. 📄 **`important_markdowns/Homaatri_Master_Brief.md`**: Original master brand, business, and user flows brief.
8. 📄 **`important_markdowns/HOMATRI_WEBSITE_MASTER_SPEC.md`**: Master consolidation of all portal specifications into one single overview.

### C. Real-Time & Media Pipeline Specs:
9. 📄 **`Homaatri_Realtime_WebSockets_SSE_Protocol.md`**: SSE streams for live order tracking (`/api/v1/orders/{id}/stream`), admin chat audit stream (`/api/admin/chats/stream`), and WebSocket rider GPS updates (`/ws/v1/rider/location`).
10. 📄 **`Homaatri_Video_Transcoding_HLS_Streaming_Pipeline.md`**: FFmpeg transcoding parameters (720p/1080p 9:16 vertical reels), HLS `.m3u8` playlist generation, GCP Storage bucket structure (`gs://homatri-media-prod/reels/...`), and Cloud CDN cache headers.

### D. Portal-Specific Checklists & Interactive Maps:
11. 📄 **`important_markdowns/PUBLIC_SITE_INTERACTIVE_MAP.md`**: Complete link, search input, filter chip, and button redirect map for `/`.
12. 📄 **`important_markdowns/CUSTOMER_PORTAL_SPEC.md`**: Specification for Inshorts swipe cards, Hinge profile scroll, YouTube guest/auth rules, and reels feed.
13. 📄 **`ORDER_PORTAL_CHECKLIST.md`**: 7-phase granular frontend implementation checklist for `/order`.
14. 📄 **`important_markdowns/CHEF_PORTAL_SPEC.md`**, 📄 **`important_markdowns/RIDER_PORTAL_SPEC.md`**, 📄 **`important_markdowns/ADMIN_PORTAL_SPEC.md`**: Specific UI specs for Chef Dashboard, Rider Portal, and Admin Dashboard.

---

## 🗺️ STEP-BY-STEP MODULE EXECUTION ROADMAP FOR CURSOR

When Cursor / Claude Code implements any portal or feature, execute in this **EXACT STEP-BY-STEP ORDER**:

```text
===================================================================================
STEP 0: GLOBAL INITIALIZATION (CONTEXT PROVIDERS & LAYOUT)
===================================================================================
• Files to Read:
  1. Homaatri_Frontend_Component_Architecture_State_Contracts.md (Section 2)
  2. Homaatri_Business_Logic_Edge_Case_Rules.md (Section 4)
• Implementation Target:
  - Verify `src/context/LocationContext.jsx` (active area, latitude/longitude, cluster).
  - Verify `src/context/CartContext.jsx` (items array, meal window, subtotal, delivery fee ₹30, dietary notes).
  - Verify `src/context/AuthContext.jsx` (JWT session, customer phone, Phone OTP login modal state).
  - Verify `src/app/layout.js` wraps root in AuthProvider -> LocationProvider -> CartProvider.

===================================================================================
STEP 1: MODULE 1 — PUBLIC BRAND WEBSITE (`/`) — [COMPLETED]
===================================================================================
• Files to Read:
  1. important_markdowns/PUBLIC_SITE_INTERACTIVE_MAP.md
  2. Homaatri_Frontend_Component_Architecture_State_Contracts.md (Section 3.1)
• Implementation Target: `src/app/(public)/page.js` & `src/app/(public)/_components/`
  - Components: Navbar, Hero, Story, Empowerment, HowItWorks, KitchenSpotlight, TrustBanner, Footer.
  - Design Rule: Apply Google Fonts (`Outfit` headlines + `Plus Jakarta Sans` body copy). All CTAs redirect to `/order`.

===================================================================================
STEP 2: MODULE 2 — CUSTOMER COMMUNITY & ORDERING PORTAL (`/order`)
===================================================================================
• Files to Read:
  1. ORDER_PORTAL_CHECKLIST.md (The 7 Implementation Phases)
  2. important_markdowns/CUSTOMER_PORTAL_SPEC.md
  3. Homaatri_Core_State_Machines.md (Section 1: Order Lifecycle State Machine)
  4. Homaatri_Critical_Sequence_Diagrams.md (Section 1: Guest Discovery to Checkout Sequence)
  5. Homaatri_Business_Logic_Edge_Case_Rules.md (Section 1: Time-Pool Rules & Section 4: Guest Auth Boundary)
  6. Homaatri_Frontend_Component_Architecture_State_Contracts.md (Section 3.2)
  7. Homaatri_Video_Transcoding_HLS_Streaming_Pipeline.md (Reels Video Player)
  8. Homaatri_Realtime_WebSockets_SSE_Protocol.md (Section 2.1: Live Order Tracking SSE)
• Implementation Target: `src/app/order/page.js`, `src/app/order/tracking/page.js`, `src/app/order/_components/`
  - Phase 1: Dual-Tab Header Switcher (`🎴 Kitchens (Swipe)` vs `🎥 Community Stories (Reels)`).
  - Phase 2: Inshorts / Tinder Swipe Card Deck (`SwipeCardDeck.jsx`) with Next/Previous arrows and touch swipe.
  - Phase 3: Hinge-Style Deep Profile Scroll (`ExpandedHingeProfile.jsx`) with Homemaker story, hygiene badges, social links (YouTube/Insta), Chef Video Gallery, and Tiffin Menu.
  - Phase 4: Global Vertical Reel Player (`VerticalReelPlayer.jsx`) with direct overlay `Order [Dish Name] - ₹X` button.
  - Phase 5: Guest Auth Boundary Modal (`PhoneOtpModal.jsx`). Enforce YouTube rule: Guest can browse/watch freely; Phone OTP triggered ONLY on Add to Cart, Like, Comment, Follow.
  - Phase 6: Slide-Over Cart Drawer (`CartDrawer.jsx`) with meal window indicator, custom dietary notes input, ₹30 delivery fee, and Razorpay checkout trigger (`POST /api/v1/orders/checkout`).
  - Phase 7: Live Order Tracking Page (`src/app/order/tracking/page.js`) with visual pipeline status bar connected to SSE stream (`GET /api/v1/orders/{order_id}/stream`).

===================================================================================
STEP 3: MODULE 3 — HOMEMAKER / CHEF DASHBOARD (`/chef`)
===================================================================================
• Files to Read:
  1. important_markdowns/CHEF_PORTAL_SPEC.md
  2. Homaatri_Core_State_Machines.md (Section 2: Kitchen Capacity State Machine & Section 4: Dietary Negotiation 2-Turn State)
  3. Homaatri_Business_Logic_Edge_Case_Rules.md (Section 2: Kitchen Capacity & Section 5: Dietary Negotiation Rules)
  4. Homaatri_Frontend_Component_Architecture_State_Contracts.md (Section 3.3)
  5. Homaatri_Video_Transcoding_HLS_Streaming_Pipeline.md (Reels Video Uploader)
• Implementation Target: `src/app/chef/page.js` & `src/app/chef/_components/`
  - Left Sidebar Navigation Layout: Overview, Cooking Checklist, Live Orders, Menu Manager, Content Studio, Dietary Requests, Earnings, Settings.
  - Cutoff Cooking Checklist (`CookChecklist.jsx`): Consolidated cook summary at 11:30 AM Lunch & 6:30 PM Dinner (e.g. *"8 Paneer Tikka, 6 Dal Tadka"*) + order-by-order detail.
  - Dietary Request Negotiation (`DietaryRequestCard.jsx`): Action cards for special notes (*"no garlic, medium spice"*) with `Accept`, `Reject`, or `Counter-Offer` buttons (max 2 turns protocol).
  - Content Studio (`ReelUploader.jsx`): Video uploader for cooking vlogs, attach signature dish link, monitor likes & comments.

===================================================================================
STEP 4: MODULE 4 — DELIVERY RIDER PORTAL (`/rider`)
===================================================================================
• Files to Read:
  1. important_markdowns/RIDER_PORTAL_SPEC.md
  2. Homaatri_Core_State_Machines.md (Section 3: Rider Shift & Batch State Machine)
  3. Homaatri_Critical_Sequence_Diagrams.md (Section 2: Route Batching Execution Flow)
  4. Homaatri_Frontend_Component_Architecture_State_Contracts.md (Section 3.4)
  5. Homaatri_Realtime_WebSockets_SSE_Protocol.md (Section 2.3: Rider GPS Location WebSocket)
• Implementation Target: `src/app/rider/page.js` & `src/app/rider/_components/`
  - Mobile-First Interface: Shift status toggle (`On Shift` / `Off Shift`), active trip banner (**1 Chef : 1 Driver Allocation** per meal window).
  - Chef Pickup Handoff (`PickupConfirmation.jsx`): One-tap `Confirm Kitchen Pickup` flips order statuses to `PICKED_UP_BY_DRIVER` and reveals Leg 1.
  - Leg-by-Leg Navigation (`LegNavigationCard.jsx`): Surfaces ONLY the immediate next stop with `Open Google Maps Navigation` link and `Call Customer` action.
  - Multi-Order Gate Delivery (`GateDeliveryCard.jsx`): Bulk `Confirm All Deliveries at this Address` button + individual exception checkbox (`Mark Order #102 Undelivered`).

===================================================================================
STEP 5: MODULE 5 — ADMIN OPERATIONS DASHBOARD (`/admin`)
===================================================================================
• Files to Read:
  1. important_markdowns/ADMIN_PORTAL_SPEC.md
  2. Homaatri_Critical_Sequence_Diagrams.md (Section 2: Cutoff Execution Flow)
  3. Homaatri_Frontend_Component_Architecture_State_Contracts.md (Section 3.5)
  4. Homaatri_Realtime_WebSockets_SSE_Protocol.md (Section 2.2: Admin Chat Stream SSE/WS)
• Implementation Target: `src/app/admin/page.js` & `src/app/admin/_components/`
  - Left Sidebar Navigation Layout: Order Pipeline, Live Chat Stream, Cutoff Engine, Escalation HITL, Chefs & Menus, Riders & Routes, System Tools.
  - Order Pipeline (`PipelineCounters.jsx`): Real-time stage counters (`DRAFT` ➔ `PENDING_PAYMENT` ➔ `CONFIRMED` ➔ `BATCHED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`) & kitchen capacity utilization bars.
  - Live Chat Audit Stream (`ChatAuditStream.jsx`): Real-time message audit feed connected to `GET /api/admin/chats`.
  - Cutoff Engine (`CutoffControlPanel.jsx`): Manual override button `Run Cutoff Batch & Route Allocation Now` (Triggers Google Maps route optimization & driver assignment).
  - Escalation HITL (`EscalationCenter.jsx`): View active escalation issues, send custom WhatsApp reply to customer phone, and mark issue `RESOLVED`.
  - System Tools (`DevOpsTools.jsx`): Action buttons connecting to live backend endpoints:
    - 🟢 `Seed 4 Ghansoli Kitchens & Riders` (`POST /api/admin/seed-chefs-and-riders`)
    - 🔴 `Wipe Production Customer Data` (`POST /api/admin/clear-all-data`)

===================================================================================
STEP 6: DATABASE & API SYNCHRONIZATION
===================================================================================
• Files to Read:
  1. Homaatri_Database_ERD_Data_Dictionary.md
  2. Homaatri_Full_Stack_BRD_SRS_v1.md (Section 16 & 17)
• Implementation Target:
  - Verify PostgreSQL table definitions (`customer_profiles`, `chef_profiles`, `chef_menu_items`, `customer_orders`, `customer_order_items`, `customer_payments`, `driver_profiles`, `driver_trips`, `chef_reels`, `reel_comments`, `reel_likes`).
  - Verify FastAPI API contracts and Razorpay webhook handlers.
```

---

## 🔒 DEFENSIVE AI CODING RULES

When implementing code, Cursor / Claude Code MUST follow these defensive rules:
1. **Never guess variable names or API routes**: Check `Homaatri_Database_ERD_Data_Dictionary.md` and `Homaatri_Frontend_Component_Architecture_State_Contracts.md` for exact field names and types.
2. **Never hardcode client-side totals**: Always let the backend server calculate cart subtotal, delivery fees, and Razorpay payable amounts.
3. **Strict Type Safety & Props Validation**: Ensure all React components handle empty states, loading skeletons, and non-null object checks (`layer?._path`, `stat?.owner`).
4. **Mandatory Build Check**: After completing any component or route, execute:
   ```bash
   npm run build
   ```
   Confirm that the production build exits with code 0 before marking the task complete.
