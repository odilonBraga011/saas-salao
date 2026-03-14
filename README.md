# SaaS Salão

Base inicial de um **SaaS para salão de beleza** com foco em:

- Arquitetura limpa (camadas `core` e `infrastructure`)
- Código limpo e domínio explícito
- Modelagem de dados normalizada
- RBAC (controle de acesso por papel)
- Código escrito em português do Brasil

## Funcionalidades implementadas (MVP produção)

- Agendamento para clientes com prevenção de conflito
- Histórico de serviços por cliente
- Painel gerencial (faturamento, comparecimento, top serviços/profissionais)
- Notificações sociais com log de envios
- Controle de usuários internos
- Inicialização do sistema (tenant + proprietário)
- Login com token de acesso assinado

## Stack

- Next.js
- Prisma
- PostgreSQL
- Tailwind CSS
- shadcn/ui

## Estrutura

```txt
src/
  app/                 # Interface e rotas HTTP
  core/                # Regras de negócio e contratos
  infrastructure/      # Implementações externas (Prisma/Auth)
prisma/
  schema.prisma        # Banco normalizado e RBAC
```

## Preparação do ambiente

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Suba o PostgreSQL local (docker):

```bash
docker compose up -d postgres
```

3. Instale dependências:

```bash
npm install
```

4. Gere client Prisma e aplique migrações:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Rode em desenvolvimento:

```bash
npm run dev
```

## Inicialização obrigatória do sistema

Antes do primeiro login, execute:

`POST /api/setup/inicial`

```json
{
  "nomeSalao": "Salão Exemplo",
  "slugSalao": "salao-exemplo",
  "nomeProprietario": "Ana Souza",
  "emailProprietario": "ana@salao.com",
  "senhaProprietario": "SenhaForte123"
}
```

## Login

`POST /api/auth/login`

```json
{
  "slugSalao": "salao-exemplo",
  "email": "ana@salao.com",
  "senha": "SenhaForte123"
}
```

## Endpoints principais

- `GET /api/health`
- `POST /api/setup/inicial`
- `POST /api/auth/login`
- `GET /api/agendamentos?idSalao=...&idProfissional=...&status=...`
- `POST /api/agendamentos`
- `POST /api/agendamentos/:idAgendamento/notificar`
- `GET /api/clientes/:idCliente/historico?idSalao=...`
- `GET /api/painel/resumo?idSalao=...&inicioDe=...&inicioAte=...`
- `GET /api/usuarios?idSalao=...` (requer `x-papel-usuario` com permissão)
- `POST /api/usuarios` (requer `x-papel-usuario` com permissão)

## Subida em produção (mínimo)

1. Defina variáveis reais em `.env` (`DATABASE_URL`, `AUTH_SECRET`).
2. Rode migrações de produção:

```bash
npm run prisma:deploy
```

3. Build e start:

```bash
npm run build
npm run prod:start
```
