export const metadata = {
  title: "Fineris Quiz7",
  description: "Bot pour aider les entreprises à obtenir des subventions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
