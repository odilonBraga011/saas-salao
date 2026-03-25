# SaaS Salao

Base inicial de um **SaaS para salao de beleza** com foco em:

- Arquitetura limpa (camadas `core` e `infrastructure`)
- Codigo limpo e dominio explicito
- Modelagem de dados normalizada
- RBAC (controle de acesso por papel)
- Codigo escrito em portugues do Brasil

## Funcionalidades implementadas (MVP producao)

- Agendamento para clientes com prevencao de conflito
- Historico de servicos por cliente
- Painel gerencial (faturamento, comparecimento, top servicos/profissionais)
- Notificacoes sociais com log de envios
- Controle de usuarios internos
- Cadastros de clientes, profissionais e servicos
- Inicializacao do sistema (tenant + proprietario)
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
  core/                # Regras de negocio e contratos
  infrastructure/      # Implementacoes externas (Prisma/Auth)
prisma/
  schema.prisma        # Banco normalizado e RBAC
```

## Preparacao do ambiente

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Suba o PostgreSQL local (docker):

```bash
docker compose up -d postgres
```

3. Instale dependencias:

```bash
npm install
```

4. Gere client Prisma, aplique migracoes e rode o seed inicial:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Rode em desenvolvimento:

```bash
npm run dev
```

## Inicializacao obrigatoria do sistema

O caminho recomendado e reproduzivel e o seed do Prisma:

```bash
npm run prisma:seed
```

Por padrao ele cria os dados abaixo e aceita override via `.env` com:
`SEED_NOME_SALAO`, `SEED_SLUG_SALAO`, `SEED_NOME_PROPRIETARIO`, `SEED_EMAIL_PROPRIETARIO`, `SEED_SENHA_PROPRIETARIO`.

Dados padrao do seed:

```json
{
  "nomeSalao": "Salao Exemplo",
  "slugSalao": "salao-exemplo",
  "nomeProprietario": "Ana Souza",
  "emailProprietario": "ana@salao.com",
  "senhaProprietario": "SenhaForte123"
}
```

O endpoint HTTP continua disponivel como alternativa:

`POST /api/setup/inicial`

```json
{
  "nomeSalao": "Salao Exemplo",
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
- `PATCH /api/agendamentos/:idAgendamento`
- `GET /api/clientes?idSalao=...`
- `POST /api/clientes`
- `GET /api/profissionais?idSalao=...`
- `POST /api/profissionais`
- `GET /api/servicos?idSalao=...`
- `POST /api/servicos`
- `GET /api/clientes/:idCliente/historico?idSalao=...`
- `GET /api/painel/resumo?idSalao=...&inicioDe=...&inicioAte=...`
- `GET /api/usuarios?idSalao=...` (requer `x-papel-usuario` com permissao)
- `POST /api/usuarios` (requer `x-papel-usuario` com permissao)

Exemplo de criacao de usuario interno:

```json
{
  "idSalao": "id-do-salao",
  "nomeCompleto": "Julia Lima",
  "email": "julia@salao.com",
  "senha": "SenhaForte123",
  "papel": "RECEPCAO"
}
```

## Subida em producao (minimo)

1. Defina variaveis reais em `.env` (`DATABASE_URL`, `AUTH_SECRET`).
2. Rode migracoes de producao:

```bash
npm run prisma:deploy
```

3. Rode o seed inicial, se necessario:

```bash
npm run prisma:seed
```

4. Build e start:

```bash
npm run build
npm run prod:start
```
