"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { MapPin, Navigation, Home, Briefcase, Building, Check, Phone } from "lucide-react";

export default function DeliveryAddressModal({ isOpen, onClose, onSaveAddress }) {
  const { user, customerPhone } = useAuth();
  const { locationLabel, activeCluster, setCluster } = useLocation();

  const [addressType, setAddressType] = useState("HOME");
  const [flatNo, setFlatNo] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState(customerPhone || user?.phone || "");
  const [gpsLocation, setGpsLocation] = useState({ lat: 19.1234, lng: 73.0123 });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [error, setError] = useState("");

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
        setError("Could not get GPS location. Defaulting to Ghansoli cluster pin.");
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!flatNo.trim() || !streetAddress.trim()) {
      setError("Please enter your Flat/House No and Street address.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number for delivery updates.");
      return;
    }

    const fullAddressString = `${flatNo.trim()}, ${streetAddress.trim()}${landmark ? `, Near ${landmark.trim()}` : ""}, ${activeCluster || "Ghansoli"}`;

    onSaveAddress({
      addressType,
      fullAddress: fullAddressString,
      flatNo,
      streetAddress,
      landmark,
      phone: cleanPhone,
      latitude: gpsLocation.lat,
      longitude: gpsLocation.lng,
      cluster: activeCluster || "Ghansoli",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-homatri-dark/50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-homatri-border p-6 animate-in fade-in zoom-in duration-200">
        
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
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
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-homatri-orange text-white border-homatri-orange shadow-xs"
                        : "bg-homatri-cream text-homatri-dark border-homatri-border hover:border-homatri-orange"
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
              className="mt-1.5 w-full rounded-xl border border-homatri-border px-3 py-2.5 text-xs font-medium text-homatri-dark focus:outline-none focus:ring-2 focus:ring-homatri-orange/40"
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
              className="mt-1.5 w-full rounded-xl border border-homatri-border px-3 py-2.5 text-xs font-medium text-homatri-dark focus:outline-none focus:ring-2 focus:ring-homatri-orange/40"
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
                className="mt-1.5 w-full rounded-xl border border-homatri-border px-3 py-2.5 text-xs font-medium text-homatri-dark focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-homatri-dark">Service Cluster</label>
              <select
                value={activeCluster || "Ghansoli"}
                onChange={(e) => setCluster(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-homatri-border px-3 py-2.5 text-xs font-bold text-homatri-dark bg-homatri-cream"
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
            <div className="mt-1.5 flex rounded-xl border border-homatri-border overflow-hidden">
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

      </div>
    </div>
  );
}
