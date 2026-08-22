# 🤖 CURSOR & AI AGENT MASTER BUILD INSTRUCTIONS

**Target Repository:** [`https://github.com/gorredinesh21/HOMATRI_WEBSITE`](https://github.com/gorredinesh21/HOMATRI_WEBSITE)  
**Framework:** Next.js 14 (App Router) + React 18 + Tailwind CSS + Lucide Icons  
**Backend URL:** `https://homatri-backend-195132182954.us-central1.run.app`

---

## 🎯 MANDATORY INSTRUCTION FOR THE AI AGENT

When instructed to implement any phase or module of the Homaatri platform, **YOU MUST READ AND OBEY THE SPECIFIC MARKDOWN FILES LISTED BELOW BEFORE WRITING ANY CODE**.

Do NOT guess file locations, component props, database keys, color hex codes, or state machine transitions.

---

## 📚 MASTER MARKDOWN EXECUTION ORDER & REFERENCE LIBRARY

When building each portal module, read the corresponding markdown files in this exact sequence:

```text
EXECUTION ORDER & SPECIFICATION MAPPING:
│
├── 0. ARCHITECTURE & BRAND THEME (Read First for All Tasks)
│   └── Read: important_markdowns/Homaatri_Master_Brief.md
│   └── Read: Homaatri_Frontend_Component_Architecture_State_Contracts.md
│
├── 1. MODULE 1: PUBLIC BRAND WEBSITE (`/`) — [COMPLETED & STYLED]
│   └── Read: important_markdowns/PUBLIC_SITE_INTERACTIVE_MAP.md
│   └── Source: src/app/(public)/page.js & src/app/(public)/_components/
│
├── 2. MODULE 2: CUSTOMER COMMUNITY & ORDERING PORTAL (`/order`)
│   └── Step 1: Read important_markdowns/CUSTOMER_PORTAL_SPEC.md
│   └── Step 2: Read ORDER_PORTAL_CHECKLIST.md
│   └── Step 3: Read Homaatri_Core_State_Machines.md (Order Lifecycle)
│   └── Step 4: Read Homaatri_Critical_Sequence_Diagrams.md (Checkout & Reel Flow)
│   └── Target: src/app/order/page.js & src/app/order/_components/
│
├── 3. MODULE 3: HOMEMAKER / CHEF DASHBOARD (`/chef`)
│   └── Step 1: Read important_markdowns/CHEF_PORTAL_SPEC.md
│   └── Step 2: Read Homaatri_Core_State_Machines.md (Kitchen Capacity & Dietary 2-Turn Cap)
│   └── Target: src/app/chef/page.js & src/app/chef/_components/
│
├── 4. MODULE 4: DELIVERY RIDER PORTAL (`/rider`)
│   └── Step 1: Read important_markdowns/RIDER_PORTAL_SPEC.md
│   └── Step 2: Read Homaatri_Core_State_Machines.md (Rider Shift/Batch Lifecycle)
│   └── Target: src/app/rider/page.js & src/app/rider/_components/
│
└── 5. MODULE 5: ADMIN OPERATIONS DASHBOARD (`/admin`)
    └── Step 1: Read important_markdowns/ADMIN_PORTAL_SPEC.md
    └── Step 2: Read Homaatri_Realtime_WebSockets_SSE_Protocol.md (Admin Chat Stream)
    └── Target: src/app/admin/page.js & src/app/admin/_components/
```

---

## 🎨 BRAND DESIGN & COLOR SYSTEM RULES

Always enforce Homaatri's brand tokens defined in `tailwind.config.js`:
- **Headline Font**: `font-display` (`Outfit` Google Font).
- **Body Font**: `font-sans` (`Plus Jakarta Sans` Google Font).
- **Primary Brand Orange**: `bg-homatri-orange` (`#E53A00`) / Hover: `bg-homatri-orange-dark` (`#C43200`).
- **Orange Soft Background**: `bg-homatri-orange-light` (`#FFF1EC`).
- **Success Green**: `bg-homatri-green` (`#16A34A`) / Light: `bg-homatri-green-light` (`#F0FDF4`).
- **Warm Cream Background**: `bg-homatri-cream` (`#FBF9F6`).
- **Soft Slate Text**: `text-homatri-dark` (`#1E293B`) / Muted: `text-homatri-muted` (`#64748B`).

---

## 🔒 SYSTEM GUARD RULES FOR THE AI AGENT

1. **Guest vs. Auth Boundary (The YouTube Model)**:
   - Allow guests to swipe cards, watch reels, and browse menus freely.
   - Trigger `AuthContext` Phone OTP login modal ONLY when guest clicks: `Add to Cart / Subscribe / Order`, `Like`, `Comment`, `Follow`.
2. **Time-Pool Cutoff Rules**:
   - **Lunch Cutoff**: 11:30 AM.
   - **Dinner Cutoff**: 6:30 PM.
   - Orders placed after 11:30 AM automatically roll over to Dinner.
3. **Verification Command**:
   - After writing or modifying any component file, ALWAYS run:
     ```bash
     npm run build
     ```
   - Ensure the build exits with code 0 without lint or compilation errors.
