import { LayoutOperacao } from "@/components/sistema/layout-operacao";

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  return <LayoutOperacao>{children}</LayoutOperacao>;
}
