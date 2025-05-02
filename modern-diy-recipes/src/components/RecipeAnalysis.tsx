import React from 'react';
import type { RecipeAnalysisData } from '../types/models';

interface RecipeAnalysisProps {
  analysisData: RecipeAnalysisData | null;
}

export default function RecipeAnalysis({ analysisData }: RecipeAnalysisProps) {
  if (!analysisData) {
    return <div>No analysis data available.</div>;
  }

  const { metrics, insights } = analysisData;

  return (
    <div className="bg-[var(--surface-0)] text-[var(--text-primary)] p-4 rounded-lg shadow-md mt-4 border border-[var(--border-subtle)]">
      <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Recipe Analysis</h3>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-[var(--border-subtle)] text-sm">
          <thead className="bg-[var(--surface-1)]">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Metric
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--surface-0)] divide-y divide-[var(--border-subtle)]">
            {Object.entries(metrics).map(([key, value]) => (
              <tr key={key}>
                <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)]">{key}</td>
                <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)]">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {insights && insights.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-2 text-[var(--text-primary)]">Insights</h4>
          <ul className="list-disc pl-6 space-y-1 text-[var(--text-secondary)]">
            {insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}