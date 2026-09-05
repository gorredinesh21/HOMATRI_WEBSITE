// Shared visual helpers for public pages: real photos from kitchens/reels.

export const isPhotoUrl = (url) => /\.(jpe?g|png|webp|gif)(\?|$)/i.test(String(url || ""));

// Chef profile photo first, then published photo-reels (menu photos live here).
export function kitchenPhotos(kitchen) {
  const urls = [kitchen?.photoUrl || kitchen?.profileImageUrl];
  for (const reel of kitchen?.reels || []) {
    const url = reel.videoUrl || reel.thumbnailUrl;
    if (url && isPhotoUrl(url)) urls.push(url);
  }
  return [...new Set(urls.filter(Boolean))];
}

// "Aagri Cuisine, Maharashtra" -> "Aagri Cuisine"
export const regionLabel = (region) => String(region || "").split(",")[0].trim();

export const WHATSAPP_ORDER_URL =
  "https://wa.me/918369384157?text=Hi%20Homatri,%20I%20would%20like%20to%20place%20a%20tiffin%20order!";
