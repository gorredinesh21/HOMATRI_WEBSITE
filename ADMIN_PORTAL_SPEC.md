# 🛡️ Admin Operations Dashboard Specification (`/admin`)

This document is the authoritative product and UX specification for the **Homaatri Admin Operations Dashboard** (`/admin`).

---

## 1. Core Vision & Operational Purpose

The Admin Operations Dashboard is the central control tower used by founder and operations managers to:
- Monitor live order pipeline stages and kitchen capacity limits.
- Audit real-time customer WhatsApp and Web message streams.
- Trigger automated or manual cutoff batching and Google Maps route optimization.
- Resolve human-in-the-loop (HITL) customer escalations.
- Execute production data seeding and environment maintenance operations.

---

## 2. Dashboard UI Layout (Left Sidebar Navigation)

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

---

## 3. Sidebar Navigation Sections & Features

### A. 📊 Live Order Pipeline (`/admin/pipeline`)
- **Stage Counters**: Real-time order metrics across stages: `DRAFT`, `PENDING_PAYMENT`, `CONFIRMED`, `BATCHED`, `OUT_FOR_DELIVERY`, `DELIVERED`.
- **Kitchen Capacity Bars**: Visual capacity utilization meters for all active kitchens (e.g. *Indravati: 8/15 meals*).

### B. 💬 Live Chat & Audit Stream (`/admin/chats`)
- **Real-Time Audit Stream**: Connects to `GET /api/admin/chats` displaying inbound and outbound WhatsApp/Web customer messages.

### C. ⏰ Cutoff Engine & Route Allocator (`/admin/cutoff`)
- **Cutoff Clock Monitor**: Real-time status for Lunch (11:30 AM) and Dinner (6:30 PM) windows.
- **Manual Trigger Action**: `Run Cutoff Batch & Route Allocation Now` (Invokes Google Maps API route optimization and driver assignment).

### D. ⚠️ Human-In-The-Loop Escalation Center (`/admin/escalations`)
- **Escalation Queue**: View escalated customer issues, order IDs, and failure reasons.
- **Resolution Panel**: Send custom reply message to customer phone and mark escalation `RESOLVED`.

### E. 👩‍🍳 Chef & Menu Management (`/admin/chefs`)
- **Kitchen Roster**: View home chef profiles, kitchen addresses, active statuses, daily capacities, menu items, and video reels.

### F. 🛵 Rider & Route Management (`/admin/drivers`)
- **Rider Roster**: View active delivery drivers, shift statuses, vehicle numbers, assigned trip routes, and stop delivery logs.

### G. 🛠️ System & DevOps Tools (`/admin/tools`)
- **Production API Trigger Control Panel**:
  - 🟢 `Seed 4 Ghansoli Kitchens & Riders` (Calls `POST /api/admin/seed-chefs-and-riders`)
  - 🔴 `Wipe Production Customer Data` (Calls `POST /api/admin/clear-all-data`)
