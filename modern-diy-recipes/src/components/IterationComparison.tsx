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
  const differences: Record<string, { from: unknown; to: unknown }> = {};

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
    <div className="bg-[var(--surface-0)] text-[var(--text-primary)] shadow-md rounded-lg p-4 mt-4 border border-[var(--border-subtle)]">
      <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Iteration Comparison</h3>
      {Object.keys(comparison.differences).length === 0 ? (
        <div className="text-[var(--text-secondary)]">No differences found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border-subtle)] text-sm">
            <thead className="bg-[var(--surface-1)]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Field
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Base Version
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Compared Version
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--surface-0)] divide-y divide-[var(--border-subtle)]">
              {Object.entries(comparison.differences).map(([field, diff]) => (
                <tr key={field}>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--text-primary)]">{field}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)]">{String(diff.from ?? '')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)]">{String(diff.to ?? '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}