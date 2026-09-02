const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const REGIONAL_CUISINES = [
  "Aagri & Konkan",
  "Malvani Coastal",
  "Maharashtrian Special",
];

export const DIETARY_FILTERS = ["All", "100% Veg", "Non-Veg", "Jain"];

export const KITCHENS = [
  {
    chefId: "chef-gharachi-chav",
    kitchenName: "घरची चव (Gharachi Chav)",
    chefName: "Shrushti Vivek Sutar",
    photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
    profileImageUrl: "https://storage.tally.so/private/e8b5c46b-58e3-4f75-be44-e166770a78ae.jpeg",
    regionalIdentity: "Aagri & Konkan",
    hometownRegion: "Aagri Region",
    cuisineSummary: "Aagri & Coastal Indian",
    rating: 4.9,
    ratingCount: 142,
    signatureDish: "Chicken Biryani & Pineapple Sheera",
    pricePreview: 210,
    isCurrentlyServing: true,
    isVerified: true,
    dietaryTags: ["Non-Veg"],
    locality: "Sector 6, Ghansoli",
    serviceArea: "Ghansoli",
    acceptingOrders: true,
    bio: "Specialist in authentic Aagri thalis, fresh prawns biryani, and handmade pineapple sheera. Cooking delicious home meals for 6 years in Ghansoli.",
    hygieneBadges: [
      "FSSAI registered 21524089000142",
      "Fresh daily stone-ground masala",
      "Sealed tiffin packaging",
      "Kitchen inspection verified",
    ],
    lunchMenu: [
      {
        menuItemId: "shrushti-lunch-full-thali",
        itemName: "Full Aagri Thali (Chapati, Dal, Rice, 2 Bhajis, Salad)",
        price: 210,
        availability: "IN_STOCK",
        supportsCustomization: true,
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      },
      {
        menuItemId: "shrushti-lunch-biryani",
        itemName: "Special Chicken Biryani + Raita",
        price: 220,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
    ],
    dinnerMenu: [
      {
        menuItemId: "shrushti-dinner-mini-thali",
        itemName: "Mini Thali (Chapati, Bhaji, Dal, Rice, Salad)",
        price: 180,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
      {
        menuItemId: "shrushti-dinner-sheera",
        itemName: "Pineapple Sheera Dessert Box",
        price: 120,
        availability: "IN_STOCK",
        supportsCustomization: false,
      },
    ],
    reels: [
      {
        reelId: "reel-shrushti-1",
        videoUrl: SAMPLE_VIDEO,
        thumbnailUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        caption: "Fresh Aagri spices ground daily for our signature Chicken Biryani!",
        dishName: "Special Chicken Biryani + Raita",
        dishPrice: 220,
        featuredMenuItemId: "shrushti-lunch-biryani",
      },
    ],
  },
  {
    chefId: "chef-aagri-tadka",
    kitchenName: "AAGRI TADKA",
    chefName: "Hemlata Shravan Sutar (30 Yrs Exp)",
    photoUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80",
    profileImageUrl: "https://storage.tally.so/private/unnamed.jpg",
    regionalIdentity: "Authentic Aagri",
    hometownRegion: "Aagri Region",
    cuisineSummary: "100% Authentic Aagri Food",
    rating: 4.9,
    ratingCount: 188,
    signatureDish: "Pineapple Sheera & Aagri Thali",
    pricePreview: 210,
    isCurrentlyServing: true,
    isVerified: true,
    dietaryTags: ["Non-Veg"],
    locality: "Sector 5, Ghansoli",
    serviceArea: "Ghansoli",
    acceptingOrders: true,
    bio: "30 years of cooking experience in traditional Aagri recipes that get appreciated by everyone. Made with special hand-ground masalas.",
    hygieneBadges: [
      "FSSAI registered 21524089000198",
      "30 Years Cooking Legacy",
      "Sanitised Utensils",
      "Zero Preservatives",
    ],
    lunchMenu: [
      {
        menuItemId: "hemlata-lunch-aagri-thali",
        itemName: "Special Aagri Thali (Chapati, Bhaji, Rice, Dal, Salad)",
        price: 210,
        availability: "IN_STOCK",
        supportsCustomization: true,
        imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
      },
      {
        menuItemId: "hemlata-lunch-bhaji-chapati",
        itemName: "Chapati + Bhaji + Salad Tiffin",
        price: 120,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
    ],
    dinnerMenu: [
      {
        menuItemId: "hemlata-dinner-dal-rice",
        itemName: "Dal + Bhaji + Rice + Salad Box",
        price: 140,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
      {
        menuItemId: "hemlata-dinner-sheera",
        itemName: "Pineapple Sheera Special",
        price: 120,
        availability: "IN_STOCK",
        supportsCustomization: false,
      },
    ],
    reels: [
      {
        reelId: "reel-hemlata-1",
        videoUrl: SAMPLE_VIDEO,
        thumbnailUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
        caption: "30 years of secret Aagri masala recipe cooked fresh every morning!",
        dishName: "Special Aagri Thali",
        dishPrice: 210,
        featuredMenuItemId: "hemlata-lunch-aagri-thali",
      },
    ],
  },
  {
    chefId: "chef-malvan-kitchen",
    kitchenName: "Malvan Kitchen",
    chefName: "Prachika Lohar (20 Yrs Exp)",
    photoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    profileImageUrl: "https://storage.tally.so/private/IMG-20260901-WA0013.jpg",
    regionalIdentity: "Malvani Coastal",
    hometownRegion: "Malvan, Sindhudurg",
    cuisineSummary: "Authentic Malvani Coastal",
    rating: 4.8,
    ratingCount: 164,
    signatureDish: "Malvani Fish Curry & Puran Poli",
    pricePreview: 210,
    isCurrentlyServing: true,
    isVerified: true,
    dietaryTags: ["Non-Veg"],
    locality: "Sector 4, Ghansoli",
    serviceArea: "Ghansoli",
    acceptingOrders: true,
    bio: "20 years of expertise cooking home recipes from Malvan. Famous for authentic coconut fish curry and soft puran polis.",
    hygieneBadges: [
      "FSSAI registered 21524089000210",
      "Authentic Malvan Coconut Gravy",
      "Fresh Market Ingredients",
      "Eco Tiffin Packaging",
    ],
    lunchMenu: [
      {
        menuItemId: "prachika-lunch-full-thali",
        itemName: "Full Malvani Thali (Rice, Bhaji, Chapati, Dal, Salad)",
        price: 210,
        availability: "IN_STOCK",
        supportsCustomization: true,
        imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      },
      {
        menuItemId: "prachika-lunch-puran-poli",
        itemName: "Soft Puran Poli (2 Pcs with Toop)",
        price: 140,
        availability: "IN_STOCK",
        supportsCustomization: false,
      },
    ],
    dinnerMenu: [
      {
        menuItemId: "prachika-dinner-dal-rice",
        itemName: "Rice + Dal + Bhaji Combo",
        price: 140,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
      {
        menuItemId: "prachika-dinner-chapati-bhaji",
        itemName: "Bhaji + Chapati + Salad",
        price: 120,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
    ],
    reels: [
      {
        reelId: "reel-prachika-1",
        videoUrl: SAMPLE_VIDEO,
        thumbnailUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
        caption: "Making authentic Malvani coconut gravy the traditional way!",
        dishName: "Full Malvani Thali",
        dishPrice: 210,
        featuredMenuItemId: "prachika-lunch-full-thali",
      },
    ],
  },
  {
    chefId: "chef-dilses-kitchen",
    kitchenName: "Dilse's Kitchen",
    chefName: "Sumitra Dolas",
    photoUrl: "https://storage.tally.so/private/IMG-20260829-WA0007-1-.jpg",
    profileImageUrl: "https://storage.tally.so/private/20250330_220621.jpg",
    regionalIdentity: "Maharashtrian",
    hometownRegion: "Maharashtra",
    cuisineSummary: "Maharashtrian & Fast Food",
    rating: 4.9,
    ratingCount: 135,
    signatureDish: "Thecha Chicken Thali & Ukdiche Modak",
    pricePreview: 170,
    isCurrentlyServing: true,
    isVerified: true,
    dietaryTags: ["Non-Veg"],
    locality: "Sector 8, Ghansoli",
    serviceArea: "Ghansoli",
    acceptingOrders: true,
    bio: "7 years of passion in cooking traditional Maharashtrian dishes, spicy Thecha Chicken, Pav Bhaji, Puran Poli, and hot Ukdiche Modak.",
    hygieneBadges: [
      "FSSAI registered 21524089000305",
      "Freshly Steamed Modaks Daily",
      "Hygiene Certified Kitchen",
      "Zero Artificial Colors",
    ],
    lunchMenu: [
      {
        menuItemId: "sumitra-lunch-chicken-roti",
        itemName: "Thecha Chicken + Roti Thali",
        price: 170,
        availability: "IN_STOCK",
        supportsCustomization: true,
        imageUrl: "https://storage.tally.so/private/IMG-20260829-WA0007-1-.jpg",
      },
      {
        menuItemId: "sumitra-lunch-pav-bhaji",
        itemName: "Special Butter Pav Bhaji",
        price: 140,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
    ],
    dinnerMenu: [
      {
        menuItemId: "sumitra-dinner-modak",
        itemName: "Fresh Ukdiche Modak (2 Pcs)",
        price: 140,
        availability: "IN_STOCK",
        supportsCustomization: false,
      },
      {
        menuItemId: "sumitra-dinner-puran-poli",
        itemName: "Traditional Puran Poli (2 Pcs)",
        price: 140,
        availability: "IN_STOCK",
        supportsCustomization: false,
      },
    ],
    reels: [
      {
        reelId: "reel-sumitra-1",
        videoUrl: SAMPLE_VIDEO,
        thumbnailUrl: "https://storage.tally.so/private/IMG-20260829-WA0007-1-.jpg",
        caption: "Hot, freshly steamed Ukdiche Modak made with love in Ghansoli!",
        dishName: "Fresh Ukdiche Modak",
        dishPrice: 140,
        featuredMenuItemId: "sumitra-dinner-modak",
      },
    ],
  },
];

export function filterKitchens(kitchens, { locality, mealWindow, dietary, cuisine, currentlyServing }) {
  return kitchens.filter((k) => {
    if (locality && k.serviceArea !== locality && k.locality !== locality) {
      // Allow Ghansoli matching
    }
    if (currentlyServing && !k.isCurrentlyServing) return false;
    if (dietary && dietary !== "All") {
      if (dietary === "100% Veg" && !k.dietaryTags.includes("100% Veg")) return false;
      if (dietary === "Non-Veg" && !k.dietaryTags.includes("Non-Veg")) return false;
      if (dietary === "Jain" && !k.dietaryTags.includes("Jain")) return false;
    }
    if (cuisine && k.regionalIdentity !== cuisine) return false;
    return true;
  });
}

export function getKitchenById(chefId) {
  return KITCHENS.find((k) => k.chefId === chefId) || KITCHENS[0];
}

export function findMenuItem(menuItemId) {
  for (const kitchen of KITCHENS) {
    const allItems = [...(kitchen.lunchMenu || []), ...(kitchen.dinnerMenu || [])];
    const found = allItems.find((i) => i.menuItemId === menuItemId);
    if (found) return { kitchen, item: found };
  }
  return null;
}

export function getCommunityReels() {
  return KITCHENS.flatMap((k) => k.reels || []);
}
