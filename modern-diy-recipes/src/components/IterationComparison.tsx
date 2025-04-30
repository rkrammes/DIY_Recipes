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
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Iteration Comparison</h3>
      {Object.keys(comparison.differences).length === 0 ? (
        <div className="text-gray-600 dark:text-gray-400">No differences found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Field
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Base Version
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Compared Version
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {Object.entries(comparison.differences).map(([field, diff]) => (
                <tr key={field}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{field}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{String(diff.from ?? '')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{String(diff.to ?? '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}