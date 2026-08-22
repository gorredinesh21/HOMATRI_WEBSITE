export const CHEF_KITCHEN = {
  chefId: "chef-indravati",
  kitchenName: "Indravati Pure Veg Tiffins",
  chefName: "Sunita Sharma",
  kitchenPhotoUrl:
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=400&q=80",
  hometownRegion: "Ahmedabad, Gujarat",
  cuisineSummary: "North Indian & Jain Special",
  address: "Sector 6, Ghansoli, Navi Mumbai",
  instagramUrl: "https://instagram.com/indravati.tiffins",
  youtubeUrl: "https://youtube.com/@indravatihomekitchen",
  dailyCapacity: 15,
};

export const INITIAL_MENU = [
  {
    menuItemId: "indravati-lunch-paneer",
    itemName: "Jain Paneer Tikka Tiffin",
    description: "No onion, no garlic paneer tikka with roti and salad.",
    unitPrice: 180,
    mealWindow: "LUNCH",
    availability: "IN_STOCK",
    isSignatureDish: true,
    supportsCustomization: true,
  },
  {
    menuItemId: "indravati-lunch-dal",
    itemName: "Gujarati Dal + Roti Thali",
    description: "Sweet-sour dal, two rotis, seasonal sabzi.",
    unitPrice: 150,
    mealWindow: "LUNCH",
    availability: "IN_STOCK",
    isSignatureDish: false,
    supportsCustomization: true,
  },
  {
    menuItemId: "indravati-dinner-khichdi",
    itemName: "Moong Dal Khichdi Tiffin",
    description: "Light khichdi with ghee and pickle.",
    unitPrice: 140,
    mealWindow: "DINNER",
    availability: "IN_STOCK",
    isSignatureDish: false,
    supportsCustomization: true,
  },
  {
    menuItemId: "indravati-dinner-sabzi",
    itemName: "Seasonal Jain Sabzi + Roti",
    description: "Home sabzi, roti, salad.",
    unitPrice: 140,
    mealWindow: "DINNER",
    availability: "SOLD_OUT",
    isSignatureDish: false,
    supportsCustomization: true,
  },
];

export const INITIAL_ORDERS = [
  {
    orderId: "ord-1042",
    customerName: "Asha Menon",
    status: "COOKING",
    mealWindow: "LUNCH",
    items: [
      { label: "Jain Paneer Tikka Tiffin", quantity: 2 },
    ],
    notes: "no garlic, medium spice",
  },
  {
    orderId: "ord-1043",
    customerName: "Rahul Deshpande",
    status: "COOKING",
    mealWindow: "LUNCH",
    items: [
      { label: "Jain Paneer Tikka Tiffin", quantity: 1 },
      { label: "Gujarati Dal + Roti Thali", quantity: 1 },
    ],
    notes: "less oil",
  },
  {
    orderId: "ord-1044",
    customerName: "Priya Shah",
    status: "COOKING",
    mealWindow: "LUNCH",
    items: [
      { label: "Jain Paneer Tikka Tiffin", quantity: 3 },
    ],
  },
  {
    orderId: "ord-1045",
    customerName: "Vikram Iyer",
    status: "COOKING",
    mealWindow: "LUNCH",
    items: [
      { label: "Gujarati Dal + Roti Thali", quantity: 5 },
    ],
    notes: "no onion",
  },
  {
    orderId: "ord-1046",
    customerName: "Neha Kulkarni",
    status: "PACKED_READY",
    mealWindow: "LUNCH",
    items: [
      { label: "Jain Paneer Tikka Tiffin", quantity: 2 },
    ],
  },
  {
    orderId: "ord-2081",
    customerName: "Meera Joshi",
    status: "COOKING",
    mealWindow: "DINNER",
    items: [
      { label: "Moong Dal Khichdi Tiffin", quantity: 4 },
    ],
    notes: "less ghee",
  },
  {
    orderId: "ord-2082",
    customerName: "Arjun Patel",
    status: "COOKING",
    mealWindow: "DINNER",
    items: [
      { label: "Seasonal Jain Sabzi + Roti", quantity: 3 },
    ],
  },
];

export const ASSIGNED_RIDER = {
  riderName: "Ramesh Kumar",
  vehicleNumber: "MH-43-AZ-1234",
  phone: "9876543210",
};

export const INITIAL_DIETARY_REQUESTS = [
  {
    requestId: "diet-01",
    orderId: "ord-1042",
    customerName: "Asha Menon",
    note: "no garlic, medium spice",
    status: "NOTE_SUBMITTED",
    counterTurnCount: 0,
    maxCounterTurns: 2,
    history: [],
  },
  {
    requestId: "diet-02",
    orderId: "ord-1043",
    customerName: "Rahul Deshpande",
    note: "less oil",
    status: "CHEF_COUNTERED_1",
    counterTurnCount: 1,
    maxCounterTurns: 2,
    history: [{ from: "chef", message: "I can do less oil, but the tadka needs a teaspoon of ghee." }],
  },
  {
    requestId: "diet-03",
    orderId: "ord-1045",
    customerName: "Vikram Iyer",
    note: "Jain — no onion, no garlic, extra roti",
    status: "NOTE_SUBMITTED",
    counterTurnCount: 0,
    maxCounterTurns: 2,
    history: [],
  },
];

export const INITIAL_REELS = [
  {
    reelId: "reel-indravati-1",
    caption: "Jain paneer tikka — no onion, no garlic, still full of flavour.",
    featuredMenuItemId: "indravati-lunch-paneer",
    likeCount: 42,
    viewCount: 1280,
    commentCount: 6,
    published: true,
  },
];

export const INITIAL_EARNINGS = {
  todayIncome: 2480,
  weeklyPayout: 16420,
  completedOrders: 86,
  repeatRetentionPct: 64,
};

export function buildCookSummary(orders, mealWindow) {
  const counts = {};
  let totalMeals = 0;
  const windowOrders = (orders || []).filter((order) => order.mealWindow === mealWindow);
  for (const order of windowOrders) {
    for (const item of order.items || []) {
      counts[item.label] = (counts[item.label] || 0) + item.quantity;
      totalMeals += item.quantity;
    }
  }
  const summary = Object.entries(counts).map(([label, quantity]) => ({ label, quantity }));
  return { summary, totalMeals, orders: windowOrders };
}
