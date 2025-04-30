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
    <div className="container mx-auto px-4 py-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Recipe History Timeline</h3>
      <ul className="relative border-l border-gray-200 dark:border-gray-700 space-y-8">
        {iterations
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((iteration) => (
            <li key={iteration.id} className="ml-6">
              <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                <svg className="w-2.5 h-2.5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1H9V1a1 1 0 0 0-2 0v1H4a2 2 0 0 0-2 2v2h16V4ZM2 8h16v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Zm7 7H5a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2Zm5 0h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2Z"/>
                </svg>
              </span>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                v{iteration.version_number}: {iteration.title}
              </h4>
              <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                {new Date(iteration.created_at).toLocaleString()}
              </time>
              {iteration.notes && (
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">{iteration.notes}</p>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}