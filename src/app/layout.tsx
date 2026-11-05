import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brújula Curricular CC2020 — Descubre qué aprenderás en tu carrera",
  description:
    "Plataforma de orientación universitaria que analiza planes de estudio de carreras de computación con base en el reporte oficial Computing Curricula 2020 (ACM / IEEE).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}

