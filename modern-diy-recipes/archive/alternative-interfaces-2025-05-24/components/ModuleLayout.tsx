"use client";

import React, { ReactNode } from 'react';
import ModularLayout from './ModularLayout';
import ColumnLayout, { Column, ColumnHeader, ColumnContent, ColumnFooter } from './ColumnLayout';
import { useModules, Module } from '@/lib/modules';

interface ModuleLayoutProps {
  moduleId: string;
  listContent?: ReactNode;
  detailContent?: ReactNode;
  extraContent?: ReactNode;
  selectedId?: string | null;
  onSelectItem?: (id: string | null) => void;
}

/**
 * ModuleLayout - Layout specifically designed for module pages
 * 
 * This layout provides a standard three-column layout with navigation,
 * a list view, and a detail view. It automatically pulls module information
 * from the module registry.
 */
export default function ModuleLayout({
  moduleId,
  listContent,
  detailContent,
  extraContent,
  selectedId,
  onSelectItem
}: ModuleLayoutProps) {
  const { enabledModules } = useModules();
  
  // Find the requested module
  const module = enabledModules.find(m => m.id === moduleId);
  
  if (!module) {
    return (
      <ModularLayout>
        <div className="p-4">
          <h1 className="text-xl font-bold text-red-500">Module Not Found</h1>
          <p className="mt-2">
            The module "{moduleId}" was not found or is not enabled.
          </p>
        </div>
      </ModularLayout>
    );
  }
  
  return (
    <ModularLayout>
      <ColumnLayout>
        {/* List Column */}
        <Column width={300}>
          <ColumnHeader>
            <h2 className="text-lg font-semibold">{module.name}</h2>
          </ColumnHeader>
          <ColumnContent>
            {listContent ? (
              listContent
            ) : (
              <ModuleListFallback module={module} selectedId={selectedId} onSelectItem={onSelectItem} />
            )}
          </ColumnContent>
          <ColumnFooter>
            <div className="text-sm text-gray-500">
              {selectedId ? '1 item selected' : 'No selection'}
            </div>
          </ColumnFooter>
        </Column>
        
        {/* Detail Column */}
        <Column>
          <ColumnContent>
            {selectedId && detailContent ? (
              detailContent
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-4">
                  <div className="text-4xl mb-4">
                    {typeof module.icon === 'string' ? module.icon : '📄'}
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    Select a {module.name.toLowerCase().replace(/s$/, '')} to view
                  </h2>
                  <p className="text-gray-500">
                    Choose an item from the list on the left to view details
                  </p>
                </div>
              </div>
            )}
          </ColumnContent>
        </Column>
        
        {/* Extra Column (optional) */}
        {extraContent && (
          <Column width={250}>
            {extraContent}
          </Column>
        )}
      </ColumnLayout>
    </ModularLayout>
  );
}

interface ModuleListFallbackProps {
  module: Module;
  selectedId?: string | null;
  onSelectItem?: (id: string | null) => void;
}

/**
 * ModuleListFallback - Fallback component for module list view
 * 
 * This component is used when no custom list content is provided to ModuleLayout
 */
function ModuleListFallback({ module, selectedId, onSelectItem }: ModuleListFallbackProps) {
  // In a real implementation, this would fetch data from the module repository
  return (
    <div className="p-4">
      <p className="text-gray-500">
        No custom list view provided for module "{module.name}".
      </p>
      <p className="mt-2 text-gray-500">
        Please provide a listContent prop to ModuleLayout.
      </p>
    </div>
  );
}