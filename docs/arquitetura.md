# Arquitetura proposta

## Princípios adotados

1. **Clean Architecture**
   - Regras de negócio isoladas em `src/core`
   - Dependências externas em `src/infrastructure`
2. **Clean Code**
   - Casos de uso pequenos e coesos
   - Contratos de repositório explícitos
3. **Normalização de dados**
   - Relações N:N para RBAC (`UserRole`, `RolePermission`)
   - Itens de agendamento separados (`AppointmentItem`)

## Módulos de domínio

- **Agenda**: agendamentos, conflitos de horário, status.
- **Catálogo**: serviços, duração e preços.
- **Pessoas**: clientes, profissionais e usuários internos.
- **Acesso**: papéis e permissões (RBAC), login e token.
- **Comunicação**: configurações de canais e logs de notificação.
- **Inicialização**: setup inicial do tenant e proprietário.

## Fluxo de ativação do sistema

1. Operador executa `POST /api/setup/inicial`.
2. Sistema cria tenant, papéis, permissões e usuário proprietário.
3. Proprietário realiza `POST /api/auth/login`.
4. APIs passam a ser utilizadas com RBAC por papel.

## Casos de uso implementados

- `CasoDeUsoInicializarSistema`
- `CasoDeUsoAutenticarUsuario`
- `CasoDeUsoCriarAgendamento`
- `CasoDeUsoListarAgendamentos`
- `CasoDeUsoObterHistoricoCliente`
- `CasoDeUsoObterResumoPainelGerencial`
- `CasoDeUsoEnviarNotificacaoAgendamento`
- `CasoDeUsoListarUsuariosSalao`
- `CasoDeUsoCriarUsuarioSalao`
