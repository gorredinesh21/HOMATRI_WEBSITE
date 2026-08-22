const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const REGIONAL_CUISINES = [
  "Telangana & Andhra",
  "Konkan Coastal",
  "Punjabi",
  "South Indian",
  "Gujarati",
];

export const DIETARY_FILTERS = ["All", "100% Veg", "Non-Veg", "Jain"];

export const KITCHENS = [
  {
    chefId: "chef-indravati",
    kitchenName: "Indravati Pure Veg Tiffins",
    chefName: "Sunita Sharma",
    photoUrl:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80",
    profileImageUrl:
      "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=900&q=80",
    regionalIdentity: "Gujarati",
    hometownRegion: "Ahmedabad, Gujarat",
    cuisineSummary: "North Indian & Jain Special",
    rating: 4.9,
    ratingCount: 128,
    signatureDish: "Jain Paneer Tikka Tiffin",
    pricePreview: 180,
    isCurrentlyServing: true,
    isVerified: true,
    dietaryTags: ["100% Veg", "Jain"],
    locality: "Sector 6, Ghansoli",
    serviceArea: "Ghansoli",
    acceptingOrders: true,
    bio: "Sunita grew up in an Ahmedabad kitchen where Sunday meant slow-cooked gravies and no-onion, no-garlic meals for the family. She now cooks the same Jain-friendly tiffins in Ghansoli — light oil, whole spices, and a set menu you can trust every weekday.",
    hygieneBadges: [
      "Kitchen inspection verified",
      "FSSAI registered",
      "Sealed tiffin packaging",
      "Daily utensil sanitisation",
    ],
    instagramUrl: "https://instagram.com/indravati.tiffins",
    youtubeUrl: "https://youtube.com/@indravatihomekitchen",
    lunchMenu: [
      {
        menuItemId: "indravati-lunch-paneer",
        itemName: "Jain Paneer Tikka Tiffin",
        price: 180,
        availability: "IN_STOCK",
        supportsCustomization: true,
        imageUrl:
          "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80",
      },
      {
        menuItemId: "indravati-lunch-dal",
        itemName: "Gujarati Dal + Roti Thali",
        price: 150,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
    ],
    dinnerMenu: [
      {
        menuItemId: "indravati-dinner-khichdi",
        itemName: "Moong Dal Khichdi Tiffin",
        price: 140,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
      {
        menuItemId: "indravati-dinner-sabzi",
        itemName: "Seasonal Jain Sabzi + Roti",
        price: 140,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
    ],
    reels: [
      {
        reelId: "reel-indravati-1",
        videoUrl: SAMPLE_VIDEO,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80",
        caption: "Jain paneer tikka — no onion, no garlic, still full of flavour.",
        dishName: "Jain Paneer Tikka Tiffin",
        dishPrice: 180,
        featuredMenuItemId: "indravati-lunch-paneer",
      },
    ],
  },
  {
    chefId: "chef-konkan",
    kitchenName: "Konkan Coastal Flavors",
    chefName: "Ananya Naik",
    photoUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    profileImageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80",
    regionalIdentity: "Konkan Coastal",
    hometownRegion: "Malvan, Maharashtra",
    cuisineSummary: "Malvani & Konkani Coastal",
    rating: 4.8,
    ratingCount: 94,
    signatureDish: "Surmai Fish Curry Tiffin",
    pricePreview: 280,
    isCurrentlyServing: true,
    isVerified: true,
    dietaryTags: ["Non-Veg"],
    locality: "Sector 5, Ghansoli",
    serviceArea: "Ghansoli",
    acceptingOrders: true,
    bio: "Ananya's recipes travel from Malvan — coconut, kokum, and fresh catch when the market allows. Each tiffin is cooked in small batches so the masala stays bright, never reheated from the morning.",
    hygieneBadges: [
      "Kitchen inspection verified",
      "Separate veg prep board",
      "Cold-chain fish handling",
      "Sealed tiffin packaging",
    ],
    instagramUrl: "https://instagram.com/konkan.coastal",
    youtubeUrl: "https://youtube.com/@konkancoastalkitchen",
    lunchMenu: [
      {
        menuItemId: "konkan-lunch-surmai",
        itemName: "Surmai Fish Curry Tiffin",
        price: 280,
        availability: "IN_STOCK",
        supportsCustomization: true,
        imageUrl:
          "https://images.unsplash.com/photo-1534604973900-02833de04d49?auto=format&fit=crop&w=600&q=80",
      },
      {
        menuItemId: "konkan-lunch-solkadhi",
        itemName: "Rice + Solkadhi Veg Combo",
        price: 190,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
    ],
    dinnerMenu: [
      {
        menuItemId: "konkan-dinner-prawn",
        itemName: "Prawn Masala Tiffin",
        price: 240,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
    ],
    reels: [
      {
        reelId: "reel-konkan-1",
        videoUrl: SAMPLE_VIDEO,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1534604973900-02833de04d49?auto=format&fit=crop&w=600&q=80",
        caption: "Morning kokum tempering for today's Surmai curry.",
        dishName: "Surmai Fish Curry Tiffin",
        dishPrice: 280,
        featuredMenuItemId: "konkan-lunch-surmai",
      },
    ],
  },
  {
    chefId: "chef-punjabi",
    kitchenName: "Desi Punjabi Dhaba Tiffins",
    chefName: "Rajesh Grewal",
    photoUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
    profileImageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
    regionalIdentity: "Punjabi",
    hometownRegion: "Amritsar, Punjab",
    cuisineSummary: "Authentic Punjabi Home Style",
    rating: 4.9,
    ratingCount: 156,
    signatureDish: "Amritsari Chole Bhature Tiffin",
    pricePreview: 170,
    isCurrentlyServing: true,
    isVerified: true,
    dietaryTags: ["Non-Veg"],
    locality: "Sector 4, Ghansoli",
    serviceArea: "Ghansoli",
    acceptingOrders: true,
    bio: "Rajesh cooks like a neighbourhood dhaba — slow chole, ghee tadka, and a chicken gravy that tastes of home, not hotel. The kitchen in Sector 4 keeps portions honest and spice levels adjustable.",
    hygieneBadges: [
      "Kitchen inspection verified",
      "FSSAI registered",
      "Sealed tiffin packaging",
    ],
    instagramUrl: "https://instagram.com/desipunjabidhaba",
    youtubeUrl: "https://youtube.com/@desipunjabihome",
    lunchMenu: [
      {
        menuItemId: "punjabi-lunch-chole",
        itemName: "Amritsari Chole Bhature Tiffin",
        price: 170,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
      {
        menuItemId: "punjabi-lunch-chicken",
        itemName: "Home-style Chicken Curry Tiffin",
        price: 220,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
    ],
    dinnerMenu: [
      {
        menuItemId: "punjabi-dinner-saag",
        itemName: "Sarson da Saag + Makki Roti",
        price: 260,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
    ],
    reels: [
      {
        reelId: "reel-punjabi-1",
        videoUrl: SAMPLE_VIDEO,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
        caption: "Overnight soaked chole — the Amritsar way.",
        dishName: "Amritsari Chole Bhature Tiffin",
        dishPrice: 170,
        featuredMenuItemId: "punjabi-lunch-chole",
      },
    ],
  },
  {
    chefId: "chef-dakshin",
    kitchenName: "Dakshin Annapoorna Tiffins",
    chefName: "Meenakshi Iyer",
    photoUrl:
      "https://images.unsplash.com/photo-1606491956689-2ea8668802fc?auto=format&fit=crop&w=900&q=80",
    profileImageUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    regionalIdentity: "South Indian",
    hometownRegion: "Chettinad, Tamil Nadu",
    cuisineSummary: "South Indian & Chettinad",
    rating: 4.9,
    ratingCount: 112,
    signatureDish: "Special Chettinad Veg Meals",
    pricePreview: 190,
    isCurrentlyServing: false,
    isVerified: true,
    dietaryTags: ["100% Veg"],
    locality: "Sector 7, Ghansoli",
    serviceArea: "Ghansoli",
    acceptingOrders: false,
    bio: "Meenakshi's Chettinad meals are built around freshly ground masala and a banana-leaf logic — sambar, poriyal, rasam, and a sweet. She pauses orders when the day's batch is complete so quality never slips.",
    hygieneBadges: [
      "Kitchen inspection verified",
      "100% vegetarian kitchen",
      "Sealed tiffin packaging",
    ],
    instagramUrl: "https://instagram.com/dakshin.annapoorna",
    youtubeUrl: "https://youtube.com/@dakshinannapoorna",
    lunchMenu: [
      {
        menuItemId: "dakshin-lunch-chettinad",
        itemName: "Special Chettinad Veg Meals",
        price: 190,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
      {
        menuItemId: "dakshin-lunch-sambar",
        itemName: "Sambar Rice + Poriyal",
        price: 150,
        availability: "SOLD_OUT",
        supportsCustomization: false,
      },
    ],
    dinnerMenu: [
      {
        menuItemId: "dakshin-dinner-idli",
        itemName: "Soft Idli + Chutney Tiffin",
        price: 140,
        availability: "IN_STOCK",
        supportsCustomization: true,
      },
    ],
    reels: [
      {
        reelId: "reel-dakshin-1",
        videoUrl: SAMPLE_VIDEO,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1606491956689-2ea8668802fc?auto=format&fit=crop&w=900&q=80",
        caption: "Stone-ground Chettinad masala for today's veg meals.",
        dishName: "Special Chettinad Veg Meals",
        dishPrice: 190,
        featuredMenuItemId: "dakshin-lunch-chettinad",
      },
    ],
  },
];

export function getKitchenById(chefId) {
  return KITCHENS.find((kitchen) => kitchen.chefId === chefId) || null;
}

export function getCommunityReels() {
  return KITCHENS.flatMap((kitchen) =>
    (kitchen.reels || []).map((reel) => ({
      ...reel,
      chefId: kitchen.chefId,
      chefName: kitchen.chefName,
      kitchenName: kitchen.kitchenName,
      likeCount: 42,
      viewCount: 1280,
      isLiked: false,
      isFollowed: false,
    }))
  );
}

export function findMenuItem(menuItemId) {
  for (const kitchen of KITCHENS) {
    const menus = [...(kitchen.lunchMenu || []), ...(kitchen.dinnerMenu || [])];
    const item = menus.find((entry) => entry.menuItemId === menuItemId);
    if (item) {
      return { kitchen, item };
    }
  }
  return null;
}

export function filterKitchens(kitchens, { currentlyServing, mealWindow, dietary, cuisine }) {
  return (kitchens || []).filter((kitchen) => {
    if (currentlyServing && !kitchen.isCurrentlyServing) return false;
    if (cuisine && kitchen.regionalIdentity !== cuisine) return false;
    if (dietary && dietary !== "All" && !(kitchen.dietaryTags || []).includes(dietary)) {
      return false;
    }
    if (mealWindow === "LUNCH" && !(kitchen.lunchMenu || []).length) return false;
    if (mealWindow === "DINNER" && !(kitchen.dinnerMenu || []).length) return false;
    return true;
  });
}
