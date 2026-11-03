"use client";

import MenuManager from "../_components/MenuManager";
import { useChefDashboard } from "@/context/ChefDashboardContext";

export default function ChefMenuPage() {
  const {
    menuItems,
    categories,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    uploadDishImage,
    notice,
  } = useChefDashboard();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Menu manager</p>
        <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">My menu</h1>
        <p className="text-sm text-homatri-muted mt-2">
          Your dishes live inside categories — open a category to add, edit, photograph or remove its dishes.
        </p>
      </header>
      {notice ? <p className="text-sm text-homatri-green">{notice}</p> : null}
      <MenuManager
        items={menuItems}
        categories={categories}
        onCreate={createMenuItem}
        onUpdate={updateMenuItem}
        onDelete={deleteMenuItem}
        onToggleAvailability={toggleAvailability}
        onUploadImage={uploadDishImage}
      />
    </div>
  );
}
