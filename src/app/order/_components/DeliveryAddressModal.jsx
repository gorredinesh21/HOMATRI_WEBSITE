"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { fetchSavedAddresses, saveCustomerAddress } from "@/lib/api";
import { MapPin, Navigation, Home, Briefcase, Building, Check, Phone, Plus, Trash2 } from "lucide-react";

export default function DeliveryAddressModal({ isOpen, onClose, onSaveAddress }) {
  const { token, user, customerPhone } = useAuth();
  const { activeCluster, setCluster } = useLocation();

  const [savedList, setSavedList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [addressType, setAddressType] = useState("HOME");
  const [flatNo, setFlatNo] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState(customerPhone || user?.phone || "7416767453");
  const [gpsLocation, setGpsLocation] = useState({ lat: 19.1234, lng: 73.0123 });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [error, setError] = useState("");

  // Load saved addresses on open
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    // Load from localStorage first
    try {
      const local = window.localStorage.getItem("homatri_saved_addresses");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length) {
          setSavedList(parsed);
          setSelectedId(parsed[0].id);
        }
      }
    } catch (e) {}

    // Fetch from backend
    (async () => {
      try {
        const remote = await fetchSavedAddresses(token);
        if (!cancelled && Array.isArray(remote) && remote.length) {
          setSavedList(remote);
          setSelectedId(remote[0].id);
          window.localStorage.setItem("homatri_saved_addresses", JSON.stringify(remote));
        }
      } catch (e) {
        console.warn("Could not fetch remote addresses, using local list:", e.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, token]);

  if (!isOpen) return null;

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingGps(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        setError("Could not get GPS location. Defaulting to cluster pin.");
      }
    );
  };

  const handleSelectAddress = (addr) => {
    setSelectedId(addr.id);
    window.localStorage.setItem("homatri_selected_address", JSON.stringify(addr));
    onSaveAddress(addr);
    onClose();
  };

  const handleCreateNewAddress = async (e) => {
    e.preventDefault();
    if (!flatNo.trim() || !streetAddress.trim()) {
      setError("Please enter your Flat/House No and Street address.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const fullAddressString = `${flatNo.trim()}, ${streetAddress.trim()}${landmark ? `, Near ${landmark.trim()}` : ""}, ${activeCluster || "Ghansoli"}`;

    const newAddrObj = {
      id: `addr_${Date.now()}`,
      addressType,
      fullAddress: fullAddressString,
      flatNo,
      streetAddress,
      landmark,
      phone: cleanPhone,
      latitude: gpsLocation.lat,
      longitude: gpsLocation.lng,
      cluster: activeCluster || "Ghansoli",
    };

    // Save to state & localStorage
    const nextList = [newAddrObj, ...savedList];
    setSavedList(nextList);
    window.localStorage.setItem("homatri_saved_addresses", JSON.stringify(nextList));
    window.localStorage.setItem("homatri_selected_address", JSON.stringify(newAddrObj));

    // Async push to backend
    try {
      await saveCustomerAddress(
        {
          address_type: addressType,
          flat_no: flatNo,
          street_address: streetAddress,
          landmark,
          phone: cleanPhone,
          cluster: activeCluster || "Ghansoli",
          latitude: gpsLocation.lat,
          longitude: gpsLocation.lng,
        },
        token
      );
    } catch (e) {}

    onSaveAddress(newAddrObj);
    setShowAddForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-homatri-dark/50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-homatri-border p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-homatri-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-homatri-orange" />
            <h2 className="font-display font-medium text-xl text-homatri-dark">
              Select Delivery Address
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-xs font-bold text-homatri-muted hover:text-homatri-dark">
            Cancel
          </button>
        </div>

        {/* Section 1: Zomato/Swiggy Saved Addresses List */}
        {!showAddForm && (
          <div className="mt-4 space-y-4">
            {savedList.length > 0 ? (
              <div className="space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-homatri-muted">Your Saved Addresses</p>
                {savedList.map((addr) => {
                  const isSelected = selectedId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                        isSelected
                          ? "border-homatri-orange bg-homatri-orange-light/50 shadow-sm"
                          : "border-homatri-border hover:border-homatri-orange/50 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white border border-homatri-border text-homatri-orange shadow-2xs">
                          {addr.addressType === "WORK" ? (
                            <Briefcase className="w-4 h-4" />
                          ) : addr.addressType === "OTHER" ? (
                            <Building className="w-4 h-4" />
                          ) : (
                            <Home className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="bg-homatri-orange text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                            {addr.addressType || "HOME"}
                          </span>
                          <p className="text-xs font-bold text-homatri-dark mt-1">
                            {addr.fullAddress || `${addr.flatNo}, ${addr.streetAddress}`}
                          </p>
                          <p className="text-[10px] text-homatri-muted mt-0.5">
                            Phone: +91 {addr.phone || "7416767453"}
                          </p>
                        </div>
                      </div>
                      {isSelected ? (
                        <Check className="w-5 h-5 text-homatri-orange shrink-0 mt-1" />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Add New Address Button */}
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full p-3.5 border border-dashed border-homatri-orange text-homatri-orange font-bold text-xs rounded-2xl bg-homatri-orange-light/30 hover:bg-homatri-orange/10 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Delivery Address</span>
            </button>
          </div>
        )}

        {/* Section 2: Add New Address Form */}
        {showAddForm && (
          <form onSubmit={handleCreateNewAddress} className="mt-4 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-homatri-dark">New Address Details</span>
              {savedList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-bold text-homatri-orange"
                >
                  &larr; Back to Saved
                </button>
              )}
            </div>

            {/* GPS Auto-Detect Button */}
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetectingGps}
              className="w-full flex items-center justify-center gap-2 bg-homatri-orange-light border border-homatri-orange/30 text-homatri-orange font-bold text-xs py-3 rounded-2xl hover:bg-homatri-orange/10 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>{isDetectingGps ? "Detecting GPS Pin…" : "📍 Detect Current GPS Location"}</span>
            </button>

            {/* Address Tag Selector */}
            <div>
              <label className="block text-xs font-bold text-homatri-dark mb-2">Save address as</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "HOME", label: "Home", icon: Home },
                  { id: "WORK", label: "Work", icon: Briefcase },
                  { id: "OTHER", label: "Other", icon: Building },
                ].map((tag) => {
                  const IconComponent = tag.icon;
                  const isSelected = addressType === tag.id;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setAddressType(tag.id)}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? "bg-homatri-orange text-white border-homatri-orange shadow-xs"
                          : "bg-homatri-cream text-homatri-dark border-homatri-border"
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      <span>{tag.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flat / House No */}
            <div>
              <label className="block text-xs font-bold text-homatri-dark">Flat / House No / Building Name *</label>
              <input
                required
                value={flatNo}
                onChange={(e) => setFlatNo(e.target.value)}
                placeholder="e.g. Flat 402, Shiv Shakti Heights"
                className="mt-1 w-full rounded-xl border border-homatri-border px-3 py-2.5 text-xs font-medium text-homatri-dark focus:outline-none focus:ring-2 focus:ring-homatri-orange/40"
              />
            </div>

            {/* Street / Area */}
            <div>
              <label className="block text-xs font-bold text-homatri-dark">Street / Area / Sector *</label>
              <input
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="e.g. Sector 8, Near D-Mart"
                className="mt-1 w-full rounded-xl border border-homatri-border px-3 py-2.5 text-xs font-medium text-homatri-dark focus:outline-none focus:ring-2 focus:ring-homatri-orange/40"
              />
            </div>

            {/* Landmark & Cluster */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-homatri-dark">Landmark (Optional)</label>
                <input
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Water Tank"
                  className="mt-1 w-full rounded-xl border border-homatri-border px-3 py-2.5 text-xs font-medium text-homatri-dark focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-homatri-dark">Service Cluster</label>
                <select
                  value={activeCluster || "Ghansoli"}
                  onChange={(e) => setCluster(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-homatri-border px-3 py-2.5 text-xs font-bold text-homatri-dark bg-homatri-cream"
                >
                  <option value="Ghansoli">Ghansoli</option>
                  <option value="Vashi">Vashi</option>
                  <option value="Airoli">Airoli</option>
                </select>
              </div>
            </div>

            {/* Receiver Phone Number */}
            <div>
              <label className="block text-xs font-bold text-homatri-dark">Receiver Phone Number *</label>
              <div className="mt-1 flex rounded-xl border border-homatri-border overflow-hidden">
                <span className="px-3 py-2.5 bg-homatri-cream text-xs font-bold text-homatri-muted">+91</span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="flex-1 px-3 py-2.5 text-xs font-medium text-homatri-dark focus:outline-none"
                />
              </div>
            </div>

            {error ? (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center font-medium">
                {error}
              </p>
            ) : null}

            {/* Save & Deliver Here Button */}
            <button
              type="submit"
              className="w-full bg-homatri-orange hover:bg-homatri-orange-dark text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Address & Deliver Here</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
