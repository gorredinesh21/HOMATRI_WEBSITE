# 🗺️ Master Interactive Map: Public Brand Website (`/`)

This document is the authoritative interactive inventory for the Homaatri Public Landing Page (`/`). It tracks every button, search input, filter chip, card link, and footer redirect to ensure 100% unified state and routing across the Homaatri Platform.

---

## 1. Header Navigation Bar (`src/components/Navbar.jsx`)

| Element Name | Type | Target / Action | Unified Platform Behavior |
| :--- | :--- | :--- | :--- |
| **Homatri Logo & Name** | Link | `/` | Reloads / Smooth-scrolls to top of Landing Page |
| **"Explore Kitchens"** | Link | `#kitchens` | Smooth-scrolls to Featured Homemakers section |
| **"Our Story"** | Link | `#story` | Smooth-scrolls to "Home Away From Home" story |
| **"How It Works"** | Link | `#how-it-works` | Smooth-scrolls to 3-Step Tiffin Routine section |
| **"Hygiene & Trust"** | Link | `#trust` | Smooth-scrolls to Trust & Quality Banner section |
| **"Explore Menus" (Header CTA)** | Primary Button | `/order` | Redirects customer to Customer Ordering Portal (`/order`) |

---

## 2. Hero Banner (`src/components/Hero.jsx`)

| Element Name | Type | Target / Action | Unified Platform Behavior |
| :--- | :--- | :--- | :--- |
| **Locality Search Box** | Text Input | Captures area name (e.g. *"Ghansoli"*) | Saves area string into global `LocationContext` |
| **"Find Menus" (Hero CTA)** | Primary Button | `/order` | Redirects to `/order?location=...` with location pre-filtered |
| **Chip: "📍 Ghansoli"** | Filter Button | Sets search input to *"Ghansoli"* | Auto-populates search box with "Ghansoli" |
| **Chip: "📍 Vashi"** | Filter Button | Sets search input to *"Vashi"* | Auto-populates search box with "Vashi" |
| **Chip: "📍 Airoli"** | Filter Button | Sets search input to *"Airoli"* | Auto-populates search box with "Airoli" |

---

## 3. Featured Kitchens Spotlight (`src/components/KitchenSpotlight.jsx`)

| Element Name | Type | Target / Action | Unified Platform Behavior |
| :--- | :--- | :--- | :--- |
| **"View All Kitchens"** | Link | `/order` | Redirects to Customer Ordering Portal (`/order`) |
| **"View Menu & Order"** *(Indravati Pure Veg)* | Card Button | `/order?chef=9876543210` | Opens `/order` with **Chef Sunita Sharma's** menu pre-selected |
| **"View Menu & Order"** *(Konkan Coastal)* | Card Button | `/order?chef=9876543211` | Opens `/order` with **Chef Ananya Naik's** menu pre-selected |
| **"View Menu & Order"** *(Desi Punjabi Dhaba)* | Card Button | `/order?chef=9876543212` | Opens `/order` with **Chef Rajesh Grewal's** menu pre-selected |
| **"View Menu & Order"** *(Dakshin Annapoorna)* | Card Button | `/order?chef=9876543213` | Opens `/order` with **Chef Meenakshi Iyer's** menu pre-selected |

---

## 4. Quality & Trust Banner (`src/components/TrustBanner.jsx`)

| Element Name | Type | Target / Action | Unified Platform Behavior |
| :--- | :--- | :--- | :--- |
| **"Explore Today's Menu"** | Primary Button | `/order` | Redirects customer directly to `/order` |

---

## 5. Footer (`src/components/Footer.jsx`)

| Element Name | Type | Target / Action | Unified Platform Behavior |
| :--- | :--- | :--- | :--- |
| **Footer Logo** | Link | `/` | Navigates to Landing Page (`/`) |
| **"Explore Home Kitchens"** | Link | `#kitchens` | Smooth-scrolls to `#kitchens` |
| **"Our Regional Story"** | Link | `#story` | Smooth-scrolls to `#story` |
| **"How Tiffin Works"** | Link | `#how-it-works` | Smooth-scrolls to `#how-it-works` |
| **"Hygiene & Standards"** | Link | `#trust` | Smooth-scrolls to `#trust` |
| **"Customer Ordering"** | Portal Link | `/order` | Redirects to Customer Portal (`/order`) |
| **"Chef Portal"** | Portal Link | `/chef` | Redirects to Homemaker Dashboard (`/chef`) |
| **"Admin Portal"** | Portal Link | `/admin` | Redirects to Operations Dashboard (`/admin`) |
