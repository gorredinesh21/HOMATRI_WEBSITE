// India-wide region → cuisine discovery tree for the landing page.
// `liveValues` map a cuisine to real chef_profiles.hometown_region values on
// the platform — cuisines without live kitchens render as "coming soon" and
// route to a WhatsApp request instead of a dead filter.

export const CUISINE_TREE = [
  {
    region: "Maharashtra",
    cuisines: [
      { label: "Aagri", liveValues: ["Aagri Cuisine, Maharashtra", "Aagri Food, Maharashtra"] },
      { label: "Malvani & Konkan", liveValues: ["Malvani Coastal, Maharashtra"] },
      { label: "Maharashtrian", liveValues: ["Maharashtrian Home Food"] },
      { label: "Puneri", liveValues: [] },
      { label: "Kolhapuri", liveValues: [] },
      { label: "Vidarbhi", liveValues: [] },
    ],
  },
  {
    region: "North India",
    cuisines: [
      { label: "Punjabi", liveValues: [] },
      { label: "UP — Awadhi & Banarasi", liveValues: [] },
      { label: "Bihari", liveValues: [] },
      { label: "Jharkhandi", liveValues: [] },
      { label: "Rajasthani", liveValues: [] },
      { label: "Haryanvi", liveValues: [] },
      { label: "Kashmiri", liveValues: [] },
      { label: "Delhi — Mughlai", liveValues: [] },
    ],
  },
  {
    region: "South India",
    cuisines: [
      { label: "Tamil", liveValues: [] },
      { label: "Kerala", liveValues: [] },
      { label: "Andhra & Telangana", liveValues: [] },
      { label: "Kannada — Udupi", liveValues: [] },
      { label: "Mangalorean", liveValues: [] },
    ],
  },
  {
    region: "East & Northeast",
    cuisines: [
      { label: "Bengali", liveValues: [] },
      { label: "Odia", liveValues: [] },
      { label: "Assamese", liveValues: [] },
      { label: "Naga & Manipuri", liveValues: [] },
    ],
  },
  {
    region: "West & Central",
    cuisines: [
      { label: "Gujarati", liveValues: [] },
      { label: "Goan", liveValues: [] },
      { label: "Sindhi", liveValues: [] },
      { label: "Malvi — MP", liveValues: [] },
      { label: "Chhattisgarhi", liveValues: [] },
    ],
  },
];

export const ALL_REGIONS = CUISINE_TREE.map((entry) => entry.region);

export function cuisinesForRegion(region) {
  return CUISINE_TREE.find((entry) => entry.region === region)?.cuisines || [];
}

// First region that actually has live kitchens (fallback: first region).
export function defaultRegion(liveRegions = []) {
  const live = new Set(liveRegions);
  for (const entry of CUISINE_TREE) {
    if (entry.cuisines.some((cuisine) => cuisine.liveValues.some((value) => live.has(value)))) {
      return entry.region;
    }
  }
  return ALL_REGIONS[0];
}

export const cuisineRequestUrl = (label) =>
  `https://wa.me/918369384157?text=${encodeURIComponent(
    `Hi Homatri! Please bring ${label} home kitchens to the platform — I'm waiting!`
  )}`;
