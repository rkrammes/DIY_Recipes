import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DIY Recipes - Minimal",
  description: "Minimal version for stability testing",
};

export default function MinimalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-white text-black p-8">
        <h1 className="text-3xl font-bold mb-8">DIY Recipes - Minimal Mode</h1>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}