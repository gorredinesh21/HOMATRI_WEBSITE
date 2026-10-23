"use client";

import MenuManager from "../_components/MenuManager";
import { useChefDashboard } from "@/context/ChefDashboardContext";

export default function ChefMenuPage() {
  const { menuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability, notice } =
    useChefDashboard();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Menu manager</p>
        <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">Today’s dishes</h1>
        <p className="text-sm text-homatri-muted mt-2">
          Add, edit, remove dishes and mark them sold out — changes reach customers immediately.
        </p>
      </header>
      {notice ? <p className="text-sm text-homatri-green">{notice}</p> : null}
      <MenuManager
        items={menuItems}
        onCreate={createMenuItem}
        onUpdate={updateMenuItem}
        onDelete={deleteMenuItem}
        onToggleAvailability={toggleAvailability}
      />
    </div>
  );
}
