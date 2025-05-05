import { AuthProvider } from "../../providers/AuthProvider";
import { ThemeProvider } from "../../providers/ConsolidatedThemeProvider";
import { AudioProvider } from "../../providers/AudioProvider";
import { ClientFonts } from "../../components/ClientFonts";
import ThemeScript from "../../components/ThemeScript";

export default function TestFixedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Test Fixed Layout</title>
        <ThemeScript />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <AudioProvider>
              <ClientFonts />
              {children}
            </AudioProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}