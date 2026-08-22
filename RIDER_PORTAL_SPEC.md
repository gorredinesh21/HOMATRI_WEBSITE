# 🛵 Delivery Rider Portal Specification (`/rider`)

This document is the authoritative product and UX specification for the **Homaatri Delivery Rider Portal** (`/rider`).

---

## 1. Core Vision & Operational Flow

The Rider Portal is a mobile-first web app designed for delivery drivers operating on smartphones:
- **1 Chef : 1 Driver Allocation**: Drivers are assigned to a specific kitchen per meal window (**LUNCH 11:30 AM Cutoff** / **DINNER 6:30 PM Cutoff**).
- **Stored Route Navigation**: Routes are pre-computed via Google Maps API at cutoff and stored in PostgreSQL.
- **Leg-by-Leg Focus**: To prevent driver cognitive overload, the portal surfaces **only the immediate next stop**.

---

## 2. Rider Mobile Interface Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        RIDER MOBILE PORTAL (/rider)                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌────────────────────────┐┌────────────────────────┐┌────────────────────────┐
│ 1. SHIFT LOGIN & BATCH ││ 2. LEG-BY-LEG          ││ 3. CHEF PICKUP         │
│    ROUTE ASSIGNMENT    ││    NAVIGATION          ││    CONFIRMATION        │
│ • Shift On/Off Switch  ││ • Shows ONLY Next Stop ││ • Tap "Picked Up Food" │
│ • Today's Meal Window  ││ • Direct Google Maps   ││ • Reveals Leg 1        │
│   (Lunch / Dinner)     ││   Navigation Link      ││   Delivery Address     │
└────────────────────────┘└────────────────────────┘└────────────────────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌────────────────────────┐┌────────────────────────┐┌────────────────────────┐
│ 4. MULTI-ORDER GATE    ││ 5. INDIVIDUAL EXCEPTION││ 6. MASTER HELP RELAY   │
│    DELIVERY DROP-OFF   ││    HANDLING            ││ • "Chef Not Ready"     │
│ • Bulk "Mark Delivered ││ • Mark individual      ││ • "Address Not Found"  │
│   Here" Button         ││   customer undelivered ││ • Master notifies user │
└────────────────────────┘└────────────────────────┘└────────────────────────┘
```

---

## 3. Detailed Operational Modules

### A. Shift Status & Trip Assignment
- **Shift Toggle**: `On Shift` / `Off Shift` status switch.
- **Trip Banner**: Displays active meal window, kitchen name (*Indravati Pure Veg*), total stop count, and total tiffins to deliver.

### B. Kitchen Pickup Handoff
- Rider arrives at kitchen location.
- One-Tap Action: `Confirm Kitchen Pickup` ➔ Flips order statuses to `PICKED_UP_BY_DRIVER` and reveals **Leg 1 Navigation**.

### C. Leg-by-Leg Navigation
- Display Card surfaces **ONLY the immediate next stop**:
  - Stop Number & Customer Name (e.g. *Stop #1: Dinesh Chandan*).
  - Address: *Flat 103, A-Wing, Ashirwad CHS, Sector 6, Ghansoli*.
  - `Open Google Maps Navigation` (Direct turn-by-turn map link).
  - `Call Customer` action link.

### D. Multi-Order Gate Delivery Drop-Off
- For residential gates or apartment complexes with multiple orders:
  - Primary Action: `Confirm All Deliveries at this Address` (Flips all orders at that gate to `DELIVERED`).

### E. Individual Exception Handling
- If a customer is unavailable at a multi-order gate:
  - Exception Checkbox: `Mark Order #102 Undelivered (Customer Not Available)`.
  - Remaining orders at the same gate are still marked `DELIVERED` cleanly without failing the batch.

### F. Master Agent Communication Relays
- **Assistance Buttons**:
  - `Report Kitchen Delay` (Notifies Master Agent ➔ Master handles customer WhatsApp updates).
  - `Report Address Issue` (Notifies Master Agent ➔ Master requests updated location pin from customer).
