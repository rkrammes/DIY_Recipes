/**
 * Fix imports in TypeScript/React files
 * This script ensures all component imports point to the correct paths
 */

const fs = require('fs');
const path = require('path');

const SETTINGS_DIR = path.join(__dirname, 'src/Settings');
const UI_COMPONENTS_DIR = path.join(__dirname, 'src/components/ui');

// Helper function to ensure a directory exists
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Helper function to fix imports in a file
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const origContent = content;
    
    // Fix all imports from '@/components/ui/*'
    const importMatches = content.match(/from\s+['"]@\/components\/ui\/[^'"]+['"]/g) || [];
    
    if (importMatches.length === 0) {
      return false; // No imports to fix
    }
    
    let fixedSomething = false;
    
    importMatches.forEach(importMatch => {
      const componentPath = importMatch.match(/from\s+['"](@\/components\/ui\/[^'"]+)['"]/)[1];
      const componentName = componentPath.split('/').pop();
      
      // Check if the component file exists
      const componentFile = path.join(__dirname, 'src', 'components', 'ui', `${componentName}.tsx`);
      const componentFileJsx = path.join(__dirname, 'src', 'components', 'ui', `${componentName}.jsx`);
      
      if (!fs.existsSync(componentFile) && !fs.existsSync(componentFileJsx)) {
        console.log(`Component file not found: ${componentFile}`);
        // Create a simple version of the missing component
        createSimpleComponent(componentName);
        fixedSomething = true;
      }
    });
    
    // Fix import paths for sub-components
    const importedComponents = content.match(/import\s+{([^}]+)}\s+from\s+['"]@\/components\/ui\/[^'"]+['"]/g) || [];
    
    importedComponents.forEach(importStmt => {
      const components = importStmt.match(/import\s+{([^}]+)}\s+from/)[1];
      const path = importStmt.match(/from\s+['"]([^'"]+)['"]/)[1];
      
      if (components.includes(',') && !path.includes('/card') && path.includes('card')) {
        const newImport = importStmt.replace(/card/, 'card/card');
        content = content.replace(importStmt, newImport);
        fixedSomething = true;
      }
    });
    
    // Write changes if any were made
    if (content !== origContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed imports in: ${filePath}`);
      return true;
    }
    
    return fixedSomething;
  } catch (error) {
    console.error(`Error fixing imports in ${filePath}:`, error);
    return false;
  }
}

// Create a simple component if it's missing
function createSimpleComponent(componentName) {
  const componentFile = path.join(UI_COMPONENTS_DIR, `${componentName}.tsx`);
  
  // Don't overwrite existing components
  if (fs.existsSync(componentFile)) {
    return;
  }
  
  let componentContent;
  
  // Different templates based on component type
  switch(componentName) {
    case 'progress':
      componentContent = `import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
    return (
      <div
        ref={ref}
        className={\`h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800 \${className || ""}\`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        {...props}
      >
        <div
          className={\`h-full bg-green-600 transition-all \${indicatorClassName || ""}\`}
          style={{ width: \`\${percentage}%\` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };`;
      break;
      
    case 'radio-group':
      componentContent = `import * as React from "react";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={\`grid gap-2 \${className || ""}\`}
        role="radiogroup"
        {...props}
      />
    );
  }
);

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, id, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="radio"
        className={\`h-4 w-4 rounded-full border border-neutral-300 text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 \${className || ""}\`}
        id={id}
        {...props}
      />
    );
  }
);

RadioGroup.displayName = "RadioGroup";
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };`;
      break;
      
    case 'select':
      componentContent = `import * as React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={\`h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 \${className || ""}\`}
        {...props}
      >
        {children}
      </select>
    );
  }
);

const SelectTrigger = React.forwardRef<HTMLButtonElement>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={\`flex h-10 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 \${className || ""}\`}
      {...props}
    />
  )
);

const SelectValue = React.forwardRef<HTMLSpanElement>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={\`block truncate \${className || ""}\`}
      {...props}
    />
  )
);

const SelectContent = React.forwardRef<HTMLDivElement>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={\`relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-neutral-300 bg-white text-neutral-900 shadow-md animate-in fade-in-80 \${className || ""}\`}
      {...props}
    />
  )
);

const SelectItem = React.forwardRef<HTMLDivElement>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={\`relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-base outline-none focus:bg-neutral-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 \${className || ""}\`}
      {...props}
    />
  )
);

Select.displayName = "Select";
SelectTrigger.displayName = "SelectTrigger";
SelectValue.displayName = "SelectValue";
SelectContent.displayName = "SelectContent";
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };`;
      break;
      
    case 'tabs':
      componentContent = `import * as React from "react";

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={\`\${className || ""}\`}
      {...props}
    />
  )
);

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={\`inline-flex h-10 items-center justify-center rounded-md bg-neutral-100 p-1 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 \${className || ""}\`}
      role="tablist"
      {...props}
    />
  )
);

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={\`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-800 dark:data-[state=active]:bg-neutral-950 dark:data-[state=active]:text-neutral-50 \${className || ""}\`}
      role="tab"
      {...props}
    />
  )
);

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={\`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-800 \${className || ""}\`}
      role="tabpanel"
      {...props}
    />
  )
);

Tabs.displayName = "Tabs";
TabsList.displayName = "TabsList";
TabsTrigger.displayName = "TabsTrigger";
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };`;
      break;
      
    case 'switch':
      componentContent = `import * as React from "react";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <span className={\`relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-green-500 dark:bg-neutral-700 dark:data-[checked]:bg-green-500 \${className || ""}\`}>
      <input
        ref={ref}
        type="checkbox"
        className="peer absolute h-0 w-0 opacity-0"
        {...props}
      />
      <span className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-checked:translate-x-5 data-unchecked:translate-x-0 dark:bg-neutral-200" />
    </span>
  )
);

Switch.displayName = "Switch";

export { Switch };`;
      break;
      
    case 'slider':
      componentContent = `import * as React from "react";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      className={\`h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 dark:bg-neutral-800 \${className || ""}\`}
      {...props}
    />
  )
);

Slider.displayName = "Slider";

export { Slider };`;
      break;
      
    // Add more case statements for other missing components
    
    default:
      componentContent = `import * as React from "react";

// Simple implementation of ${componentName} component
const ${componentName} = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div 
        ref={ref as React.RefObject<HTMLDivElement>}
        className={\`\${className || ""}\`}
        {...props}
      />
    );
  }
);

${componentName}.displayName = "${componentName}";

export { ${componentName} };`;
  }
  
  ensureDirExists(path.dirname(componentFile));
  fs.writeFileSync(componentFile, componentContent, 'utf8');
  console.log(`Created component: ${componentName}`);
}

// Process all files in a directory recursively
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  let fixedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      fixedCount += processDirectory(filePath);
      return;
    }
    
    if (!file.endsWith('.tsx') && !file.endsWith('.jsx')) {
      return;
    }
    
    if (fixImportsInFile(filePath)) {
      fixedCount++;
    }
  });
  
  return fixedCount;
}

// Main function
function main() {
  console.log('=== Fix Imports ===');
  
  // Ensure UI components directory exists
  ensureDirExists(UI_COMPONENTS_DIR);
  
  // Process Settings directory
  console.log('Processing Settings files...');
  const fixedCount = processDirectory(SETTINGS_DIR);
  
  console.log(`\nSummary: Fixed imports in ${fixedCount} files.`);
  console.log('Done!');
}

// Run the script
main();