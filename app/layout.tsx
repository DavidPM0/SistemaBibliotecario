import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taller Villanueva - Sistema de Gestión",
  description: "Sistema de gestión de obras y proyectos"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

