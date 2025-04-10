import React from 'react';
import type { RecipeIteration } from '../types/models';

interface RecipeHistoryTimelineProps {
  iterations: RecipeIteration[];
}

export default function RecipeHistoryTimeline({
  iterations,
}: RecipeHistoryTimelineProps) {
  if (!iterations || iterations.length === 0) {
    return <div>No history available.</div>;
  }

  return (
    <div className="border p-2 rounded mt-4">
      <h3 className="font-semibold mb-2">Recipe History Timeline</h3>
      <ul className="relative border-l border-gray-300 dark:border-gray-700 pl-4">
        {iterations
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((iteration) => (
            <li key={iteration.id} className="mb-4 ml-2">
              <div className="absolute -left-1.5 w-3 h-3 bg-blue-500 rounded-full border border-white dark:border-gray-900"></div>
              <div className="text-sm font-semibold">
                v{iteration.version_number}: {iteration.title}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {new Date(iteration.created_at).toLocaleString()}
              </div>
              {iteration.notes && (
                <div className="mt-1 text-sm">{iteration.notes}</div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}