import type { Metadata } from "next";

import { ProvedorSessao } from "@/components/sistema/provedor-sessao";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS Salao",
  description: "Workspace operacional para gestao de salao de beleza"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="text-stone-900 antialiased">
        <ProvedorSessao>{children}</ProvedorSessao>
      </body>
    </html>
  );
}
