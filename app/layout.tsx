import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PHAROS — Le phare des opportunites",
  description: "Plateforme d'analyse d'opportunites business digitales. PHAROS scanne le web, identifie les projets porteurs et genere des protocoles complets pour Claude Code.",
  keywords: "micro-SaaS, opportunites, business digital, Claude Code, indie hacker, PHAROS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
