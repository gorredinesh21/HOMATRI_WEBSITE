"use client";

import MenuManager from "../_components/MenuManager";
import { useChefDashboard } from "@/context/ChefDashboardContext";

export default function ChefMenuPage() {
  const { menuItems, createMenuItem, updateMenuItem, toggleAvailability } = useChefDashboard();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Menu manager</p>
        <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">Today’s dishes</h1>
      </header>
      <MenuManager
        items={menuItems}
        onCreate={createMenuItem}
        onUpdate={updateMenuItem}
        onToggleAvailability={toggleAvailability}
      />
    </div>
  );
}
