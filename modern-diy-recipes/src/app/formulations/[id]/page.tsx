"use client";

import React from "react";
import { useParams } from "next/navigation";
import FormulationDetails from "@/components/FormulationDetails";
import { useFormulation } from '@/hooks/useFormulation';

/**
 * Formulation Details Page - Shows details for a specific formulation
 * This page uses the formulation terminology components instead of recipe components
 */
export default function FormulationDetailsPage() {
  const params = useParams();
  const formulationId = params.id as string;

  // Fetch the specific formulation data using the formulation hook
  const { formulation, loading, error } = useFormulation(formulationId);

  if (loading) {
    return <div className="p-4">Loading formulation...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading formulation: {error}</div>;
  }

  if (!formulation) {
    return <div className="p-4">Formulation not found.</div>;
  }

  // Pass the fetched formulation data to FormulationDetails
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <FormulationDetails 
        formulationId={formulationId} 
        initialFormulationData={formulation} 
      />
    </div>
  );
}