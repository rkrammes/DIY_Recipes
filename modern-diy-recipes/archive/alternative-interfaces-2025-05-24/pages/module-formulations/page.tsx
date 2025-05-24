"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '@/components/layouts/ModuleLayout';
import { ModuleFormulationList } from '@/modules/formulations/components';
import { ModuleFormulationDetails } from '@/modules/formulations/components';

/**
 * ModuleFormulations Page - Example of using the modular architecture
 * 
 * This page demonstrates the use of the Module Registry System
 * with the formulations module.
 */
export default function ModuleFormulationsPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Handle selection of a formulation
  const handleSelect = (id: string | null) => {
    setSelectedId(id);
  };

  return (
    <ModuleLayout
      moduleId="formulations"
      selectedId={selectedId}
      onSelectItem={handleSelect}
      listContent={
        <ModuleFormulationList
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      }
      detailContent={
        selectedId ? (
          <ModuleFormulationDetails
            formulationId={selectedId}
          />
        ) : null
      }
    />
  );
}