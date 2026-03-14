import { CalendarCheck2, ChartNoAxesCombined, ShieldCheck, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";

const funcionalidades = [
  "Agendamento online para clientes",
  "Histórico completo de serviços e atendimentos",
  "Notificações por redes sociais (WhatsApp/Instagram)",
  "Cadastro de serviços e catálogo de preços",
  "Gestão de profissionais e agendas",
  "Painel gerencial com indicadores financeiros",
  "Controle de usuários com RBAC"
];

const destaques = [
  {
    titulo: "Agenda inteligente",
    descricao: "Evite conflitos de horário e acompanhe confirmações em tempo real.",
    icone: CalendarCheck2
  },
  {
    titulo: "Visão gerencial",
    descricao: "Monitore faturamento, faltas e serviços mais vendidos por período.",
    icone: ChartNoAxesCombined
  },
  {
    titulo: "Equipe organizada",
    descricao: "Gerencie recepção, gerentes e profissionais com níveis de acesso.",
    icone: UsersRound
  },
  {
    titulo: "Segurança e RBAC",
    descricao: "Permissões por papel para manter governança e rastreabilidade.",
    icone: ShieldCheck
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <header className="space-y-4 rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">SaaS Salão</p>
        <h1 className="text-3xl font-bold">Plataforma completa para gestão de salões de beleza</h1>
        <p className="max-w-3xl text-slate-600">
          Projeto com arquitetura limpa, banco normalizado e APIs de agendamento/histórico para acelerar
          implantação de operações digitais no salão.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button>Começar agora</Button>
          <Button variant="outline">Ver documentação</Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {destaques.map(({ titulo, descricao, icone: Icone }) => (
          <article key={titulo} className="rounded-xl bg-white p-5 shadow-sm">
            <Icone className="mb-3 h-5 w-5 text-brand-700" />
            <h2 className="mb-2 text-base font-semibold">{titulo}</h2>
            <p className="text-sm text-slate-600">{descricao}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Funcionalidades principais</h2>
        <ul className="grid gap-3 text-slate-700 md:grid-cols-2">
          {funcionalidades.map((item) => (
            <li key={item} className="rounded-lg border border-slate-200 p-3">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
