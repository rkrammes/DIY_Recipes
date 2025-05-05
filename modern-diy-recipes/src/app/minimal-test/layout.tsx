import './styles.css';

export const metadata = {
  title: 'Minimal Test - DIY Recipes',
  description: 'A minimal test environment for isolating theme and animation issues',
};

export default function MinimalTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}