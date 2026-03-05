import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar Opportunités — Détectez votre prochain projet",
  description: "Tableau de bord intelligent qui scanne le web, détecte les opportunités business digitales en temps réel, et génère des protocoles de développement complets pour Claude Code.",
  keywords: "micro-SaaS, opportunités, business digital, Claude Code, indie hacker",
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
