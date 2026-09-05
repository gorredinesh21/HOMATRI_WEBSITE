// Live kitchen regions on the platform (must match chef_profiles.hometown_region).
export const REGIONAL_CUISINES = [
  "Aagri Cuisine, Maharashtra",
  "Aagri Food, Maharashtra",
  "Maharashtrian Home Food",
  "Malvani Coastal, Maharashtra",
];

export const DIETARY_FILTERS = ["All", "100% Veg", "Non-Veg", "Jain"];

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
