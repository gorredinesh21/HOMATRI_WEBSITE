# 📋 HOMAATRI — ONBOARDING & USER PROFILE SCHEMA SPECIFICATION

**Document Version:** 1.0  
**Target Roles:** Customer (`CUSTOMER`), Homemaker (`CHEF`), Delivery Rider (`RIDER`).  
**Primary Integration:** Signup Modals, Onboarding Wizards, PostgreSQL Database Schema.

---

## 1. Multi-Role Onboarding Data Matrix

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   ONBOARDING DATA REQUIREMENTS MATRIX                  │
├───────────────────────┬────────────┬────────────┬──────────────────────┤
│ FIELD NAME            │ CUSTOMER   │ CHEF       │ RIDER                │
├───────────────────────┼────────────┼────────────┼──────────────────────┤
│ Mobile Number         │ Mandatory  │ Mandatory  │ Mandatory            │
│ Full Name             │ Mandatory  │ Mandatory  │ Mandatory            │
│ Profile Avatar        │ Optional   │ Optional   │ Optional (Photo)     │
│ Cartoon Avatar Picker │ Enabled    │ Enabled    │ -                    │
│ Address & GPS Lat/Lng │ Mandatory  │ Mandatory  │ Cluster Area         │
│ Dietary Preferences   │ Optional   │ -          │ -                    │
│ Kitchen Name          │ -          │ Mandatory  │ -                    │
│ Description / Bio     │ -          │ Mandatory  │ -                    │
│ Hometown Region       │ -          │ Mandatory  │ -                    │
│ FSSAI License Number  │ -          │ Mandatory  │ -                    │
│ Daily Meal Capacity   │ -          │ Mandatory  │ -                    │
│ Driving License No.   │ -          │ -          │ Mandatory            │
│ Vehicle Reg. Number   │ -          │ -          │ Mandatory (MH-43...) │
│ Bank UPI / Payout ID  │ -          │ Mandatory  │ Mandatory            │
└───────────────────────┴────────────┴────────────┴──────────────────────┘
```

---

## 2. Role-by-Role Field Breakdown

### A. 🍛 CUSTOMER ONBOARDING (`customer_profiles`)
Designed to be **ultra-frictionless** (takes < 30 seconds):
1. **Phone Number**: 10-digit mobile number (+91).
2. **Full Name**: Customer's display name.
3. **Delivery Address**: Street line, landmark, city, pin code.
4. **GPS Coordinates**: `latitude` and `longitude` fetched via browser Geolocation API for precise driver pin.
5. **Dietary Preferences**: Multi-select tags (`PURE_VEG`, `JAIN`, `NON_VEG`, `LOW_SPICE`, `NO_GARLIC_ONION`, `GLUTEN_FREE`).
6. **Avatar**: Custom photo URL OR one of 6 **Pre-built Cartoonish Avatars**:
   - `avatar_chef_cartoon_1.png` (Cute Indian Mom / Chef avatar)
   - `avatar_gourmet_cartoon_2.png` (Happy Foodie avatar)
   - `avatar_tiffin_cartoon_3.png` (Tiffin Box avatar)
   - `avatar_spices_cartoon_4.png` (Spices avatar)

---

### B. 👩‍🍳 HOMEMAKER / CHEF ONBOARDING (`chef_profiles`)
Ensures food quality, hygiene standards, and Indian FSSAI regulatory compliance:
1. **Phone Number**: Registered 10-digit mobile number.
2. **Chef Full Name**: Homemaker's legal name.
3. **Kitchen Name**: Public brand name (*e.g., Indravati Pure Veg, Konkan Coastal*).
4. **Hometown Region & Bio**: Homemaker's story & native region (*e.g. "Authentic Telangana recipes passed down 3 generations"*).
5. **Kitchen Address & GPS Coordinates**: Physical cooking premises for driver pickup.
6. **FSSAI License Number**: 14-digit FSSAI food safety registration number (*Mandatory for Indian home cooks*).
7. **Daily Meal Capacity**: Maximum tiffin limit per meal window (*e.g. 15 meals/day*).
8. **Bank UPI / Payout ID**: UPI ID (*homemaker@upi*) or Bank Account + IFSC for weekly earnings payouts.
9. **Avatar / Kitchen Banner**: Kitchen photo OR pre-built cartoonish chef avatar.

---

### C. 🛵 DELIVERY RIDER ONBOARDING (`driver_profiles`)
Ensures leg-by-leg delivery logistics reliability:
1. **Phone Number**: Driver's registered mobile number.
2. **Driver Full Name**: Driver's legal name.
3. **Driving License Number**: Indian RTO driving license number.
4. **Vehicle Type & Reg. Number**: Scooter / Bike / Electric Vehicle (*e.g., MH-43-AZ-1234*).
5. **Assigned Cluster Area**: Service cluster (*Ghansoli, Vashi, Airoli*).
6. **Bank UPI / Payout ID**: UPI ID or Bank Account + IFSC for daily/weekly delivery payouts.
7. **Driver Photo**: Mandatory profile photo for customer trust.

---

## 3. Updated PostgreSQL Database Schema

```sql
-- 1. CUSTOMER PROFILES TABLE
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    google_sub VARCHAR(255) UNIQUE,
    avatar_url TEXT DEFAULT 'avatar_tiffin_cartoon_1.png',
    is_cartoon_avatar BOOLEAN DEFAULT TRUE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100) DEFAULT 'Navi Mumbai',
    postal_code VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    dietary_preferences JSONB DEFAULT '["PURE_VEG"]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CHEF PROFILES TABLE
CREATE TABLE IF NOT EXISTS chef_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chef_phone VARCHAR(20) UNIQUE NOT NULL,
    chef_name VARCHAR(100) NOT NULL,
    kitchen_name VARCHAR(100) NOT NULL,
    bio TEXT,
    hometown_region VARCHAR(100),
    fssai_license_number VARCHAR(20) NOT NULL,
    daily_capacity INT DEFAULT 15,
    accepting_orders BOOLEAN DEFAULT TRUE,
    avatar_url TEXT DEFAULT 'avatar_chef_cartoon_1.png',
    address_line1 VARCHAR(255) NOT NULL,
    city VARCHAR(100) DEFAULT 'Navi Mumbai',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    payout_upi_id VARCHAR(100),
    rating_average NUMERIC(3,2) DEFAULT 4.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. DRIVER PROFILES TABLE
CREATE TABLE IF NOT EXISTS driver_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_phone VARCHAR(20) UNIQUE NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    driving_license_number VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(30) DEFAULT 'SCOOTER',
    vehicle_reg_number VARCHAR(30) NOT NULL,
    assigned_cluster VARCHAR(100) DEFAULT 'Ghansoli',
    payout_upi_id VARCHAR(100),
    driver_photo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    on_shift BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
