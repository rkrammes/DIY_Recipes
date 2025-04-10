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
    <div className="border p-2 rounded mt-4">
      <h3 className="font-semibold mb-2">Recipe Analysis</h3>

      <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm mb-4">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="border px-2 py-1">Metric</th>
            <th className="border px-2 py-1">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(metrics).map(([key, value]) => (
            <tr key={key}>
              <td className="border px-2 py-1">{key}</td>
              <td className="border px-2 py-1">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {insights && insights.length > 0 && (
        <div>
          <h4 className="font-semibold mb-1">Insights</h4>
          <ul className="list-disc pl-5">
            {insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}