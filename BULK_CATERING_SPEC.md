# 🎉 HOMAATRI — BULK & EVENT CATERING PORTAL SPECIFICATION (`/bulk`)

**Document Version:** 1.0  
**Target Surface:** Dedicated Bulk Catering Portal (`/bulk`), Homemaker Catering Studio (`/chef/bulk-menu`), Admin Bulk Pipeline (`/admin/pipeline`).  
**Primary Engine:** Dynamic Plate Price Recalculation & Tiered Catering Templates.

---

## 1. Core Vision & Identity

Bulk Ordering is a **dedicated, high-volume catering surface (`/bulk`)** operating separately from daily tiffin routines:
- **Tiered Catering Templates**: Homemakers offer pre-structured Thali Templates (e.g. Standard ₹149, Deluxe ₹199, Grand Feast ₹299).
- **Dynamic Itemized Price Recalculation**: Customers can remove or swap items from a template, and the per-plate price automatically recalculates based on itemized unit prices!
- **Hometown Customization**: Customers can request specific regional recipes (e.g. *Telangana-style Pappu*, *Konkani Surmai Curry*, *Punjabi Dal Makhani*).

---

## 2. Platform Navigation & Portal Surfaces

```text
                                  MAIN HEADER NAV
                               ┌──────────────────┐
                               │ 🎉 Bulk Catering │
                               └────────┬─────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌──────────────────────────────┐┌──────────────────────────────┐┌──────────────────────────────┐
│ 1. CUSTOMER PORTAL (/bulk)   ││ 2. CHEF PORTAL               ││ 3. ADMIN PORTAL              │
│                              ││    (/chef/bulk-menu)         ││    (/admin/pipeline)        │
│ • Select Guest Count (10-50+)││ • Configure Thali Templates  ││ • Monitor Bulk Order Queue   │
│ • Choose Base Template       ││ • Set Unit Item Prices (₹)   ││ • Flag Large Event Routes    │
│ • Customize Plate & Price    ││ • Select Available Sabzis    ││ • Assign Multiple Delivery   │
│ • Select Homemaker & Date    ││ • Accept / Counter Quotes    ││   Bags / Riders              │
└──────────────────────────────┘└──────────────────────────────┘└──────────────────────────────┘
```

---

## 3. Tiered Catering Templates & Dynamic Plate Calculator

### A. Deluxe Thali Template Example (Default Base: ₹199 / plate)

| Item Name | Category | Default Quantity | Unit Deduction Value (If Removed) |
| :--- | :--- | :--- | :--- |
| **Roti / Phulka** | Bread | 4 pcs | -₹30 |
| **Jeera Rice** | Rice | 1 portion | -₹30 |
| **Dry Sabzi** (Chef's Choice) | Vegetable | 1 portion | -₹35 |
| **Dal** (Tadka / Fry) | Dal | 1 portion | -₹30 |
| **Protein Sabzi** (Paneer/Soya) | Special | 1 portion | -₹45 |
| **Sweet** (Gulab Jamun / Kheer) | Dessert | 1 pc | -₹29 |

### B. Dynamic Price Recalculation Formula:

$$\text{Final Plate Price} = \text{Base Template Price} - \sum (\text{Removed Item Unit Values})$$

**Example**: Customer starts with Deluxe Thali (₹199), unchecks **Sweet (-₹29)** and unchecks **Dry Sabzi (-₹35)**:
$$\text{Final Plate Price} = 199 - 29 - 35 = \mathbf{₹135 \text{ / plate}}$$
$$\text{Total Catering Cost for 30 Guests} = 30 \times 135 = \mathbf{₹4,050}$$

---

## 4. Database Schemas for Bulk Catering

```sql
-- 1. CHEF CATERING TEMPLATES
CREATE TABLE chef_catering_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chef_phone VARCHAR(20) REFERENCES chef_profiles(chef_phone) ON DELETE CASCADE,
    template_name VARCHAR(100) NOT NULL, -- e.g. 'Deluxe Feast Thali'
    base_plate_price NUMERIC(10,2) NOT NULL, -- e.g. 199.00
    min_guests INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TEMPLATE ITEM COMPONENTS
CREATE TABLE catering_template_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES chef_catering_templates(template_id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL, -- e.g. 'Gulab Jamun'
    category VARCHAR(30) NOT NULL,  -- BREAD, RICE, SABZI, DAL, PROTEIN, DESSERT
    deduction_value NUMERIC(10,2) NOT NULL, -- e.g. 29.00
    is_removable BOOLEAN DEFAULT TRUE
);

-- 3. BULK CATERING ORDERS
CREATE TABLE bulk_catering_orders (
    bulk_order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_phone VARCHAR(20) REFERENCES customer_profiles(phone),
    chef_phone VARCHAR(20) REFERENCES chef_profiles(chef_phone),
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    guest_count INT NOT NULL, -- e.g. 30
    per_plate_price NUMERIC(10,2) NOT NULL, -- e.g. 135.00
    total_amount NUMERIC(10,2) NOT NULL, -- e.g. 4050.00
    advance_amount_paid NUMERIC(10,2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'PENDING_CHEF_ACCEPTANCE',
    special_event_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. API Endpoint Contracts for Bulk Catering

```http
GET /api/v1/bulk/templates?chef_phone=9876543210
Response: [
  {
    "template_id": "t101-...",
    "template_name": "Deluxe Feast Thali",
    "base_plate_price": 199.00,
    "min_guests": 10,
    "items": [
      { "item_name": "Phulka (4 pcs)", "deduction_value": 30.00, "is_removable": false },
      { "item_name": "Gulab Jamun", "deduction_value": 29.00, "is_removable": true }
    ]
  }
]

POST /api/v1/bulk/checkout
Payload: {
  "chef_phone": "9876543210",
  "event_date": "2026-08-30",
  "event_time": "13:00:00",
  "guest_count": 30,
  "template_id": "t101-...",
  "removed_item_ids": ["item_sweet_29"],
  "special_event_note": "Office lunch - please make Telaggana style Pappu"
}
```
