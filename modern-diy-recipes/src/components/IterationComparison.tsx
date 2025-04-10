import React from 'react';
import type { RecipeIteration, IterationComparisonResult } from '../types/models';

interface IterationComparisonProps {
  baseIteration: RecipeIteration | null;
  compareIteration: RecipeIteration | null;
}

function diffIterations(
  base: RecipeIteration,
  compare: RecipeIteration
): IterationComparisonResult {
  const differences: Record<string, { from: any; to: any }> = {};

  if (base.title !== compare.title) {
    differences['title'] = { from: base.title, to: compare.title };
  }

  if (base.description !== compare.description) {
    differences['description'] = { from: base.description, to: compare.description };
  }

  const baseMetrics = base.metrics || {};
  const compareMetrics = compare.metrics || {};

  const metricKeys = new Set([
    ...Object.keys(baseMetrics),
    ...Object.keys(compareMetrics),
  ]);

  for (const key of metricKeys) {
    if (baseMetrics[key] !== compareMetrics[key]) {
      differences[`metric:${key}`] = {
        from: baseMetrics[key],
        to: compareMetrics[key],
      };
    }
  }

  return {
    baseIterationId: base.id,
    compareIterationId: compare.id,
    differences,
  };
}

export default function IterationComparison({
  baseIteration,
  compareIteration,
}: IterationComparisonProps) {
  if (!baseIteration || !compareIteration) {
    return <div>Select two versions to compare.</div>;
  }

  const comparison = diffIterations(baseIteration, compareIteration);

  return (
    <div className="border p-2 rounded mt-4">
      <h3 className="font-semibold mb-2">Iteration Comparison</h3>
      {Object.keys(comparison.differences).length === 0 ? (
        <div>No differences found.</div>
      ) : (
        <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border px-2 py-1">Field</th>
              <th className="border px-2 py-1">Base Version</th>
              <th className="border px-2 py-1">Compared Version</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(comparison.differences).map(([field, diff]) => (
              <tr key={field}>
                <td className="border px-2 py-1">{field}</td>
                <td className="border px-2 py-1">{String(diff.from ?? '')}</td>
                <td className="border px-2 py-1">{String(diff.to ?? '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}