"use client";

import React, { useState } from "react";
import RecipeList from "../components/RecipeList";
import RecipeDetails from "../components/RecipeDetails";
import SettingsPanel from "../components/SettingsPanel";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-shrink-0 w-64 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
        <RecipeList selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <main className="flex-1 overflow-y-auto">
        <RecipeDetails recipeId={selectedId} />
      </main>

      <div className="flex-shrink-0 w-64 border-l border-gray-300 dark:border-gray-700 overflow-y-auto">
        <SettingsPanel />
      </div>
    </div>
  );
}
