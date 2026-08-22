export const RIDER_PROFILE = {
  riderId: "rdr_88291039",
  fullName: "Ramesh Kumar",
  phoneNumber: "9876543210",
  vehicleNumber: "MH-43-AZ-1234",
};

export const ASSIGNED_KITCHEN = {
  chefId: "chef-indravati",
  kitchenName: "Indravati Pure Veg Tiffins",
  chefName: "Sunita Sharma",
  address: "Sector 6, Ghansoli, Navi Mumbai",
  latitude: 19.1254,
  longitude: 73.0078,
};

export const INITIAL_STOPS = [
  {
    stopNumber: 1,
    gateId: "gate-ashirwad",
    orderId: "ord-101",
    customerName: "Dinesh Chandan",
    customerPhone: "9988776655",
    address: "Flat 103, A-Wing, Ashirwad CHS, Sector 6, Ghansoli",
    latitude: 19.1239,
    longitude: 73.0051,
    tiffinCount: 2,
    status: "PENDING",
  },
  {
    stopNumber: 1,
    gateId: "gate-ashirwad",
    orderId: "ord-102",
    customerName: "Priya Nair",
    customerPhone: "9876501234",
    address: "Flat 104, A-Wing, Ashirwad CHS, Sector 6, Ghansoli",
    latitude: 19.1239,
    longitude: 73.0051,
    tiffinCount: 1,
    status: "PENDING",
  },
  {
    stopNumber: 2,
    gateId: "gate-sector5",
    orderId: "ord-103",
    customerName: "Asha Menon",
    customerPhone: "9811122233",
    address: "B-12, Shivdarshan CHS, Sector 5, Ghansoli",
    latitude: 19.1211,
    longitude: 73.0092,
    tiffinCount: 2,
    status: "PENDING",
  },
  {
    stopNumber: 3,
    gateId: "gate-sector4",
    orderId: "ord-104",
    customerName: "Rahul Deshpande",
    customerPhone: "9765432100",
    address: "Shop 2, Sector 4 Market, Ghansoli",
    latitude: 19.1184,
    longitude: 73.011,
    tiffinCount: 1,
    status: "PENDING",
  },
];

export function groupPendingStops(stops) {
  const pending = (stops || []).filter((stop) => stop.status === "PENDING");
  if (!pending.length) return [];
  const firstGate = pending[0].gateId;
  return pending.filter((stop) => stop.gateId === firstGate);
}

export function mapsUrl(stop) {
  if (stop?.latitude != null && stop?.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop?.address || "")}`;
}
