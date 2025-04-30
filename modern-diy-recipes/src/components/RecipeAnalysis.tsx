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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mt-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Recipe Analysis</h3>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Metric
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(metrics).map(([key, value]) => (
              <tr key={key}>
                <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-gray-200">{key}</td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-gray-200">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {insights && insights.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-2 text-gray-800 dark:text-white">Insights</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
            {insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}