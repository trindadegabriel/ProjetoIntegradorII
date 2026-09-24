# ProjetoIntegradorII

# Sistema de Atendimentos de Pronto Socorro

Este projeto é uma aplicação **Node.js + Express + PostgreSQL** desenvolvida para o componente curricular de Projeto Integrador 2 (PUC-Campinas). O sistema tem como objetivo controlar os atendimentos realizados em um Pronto Socorro, desde a chegada do paciente na recepção até sua saída após a alta médica.

## Sobre o projeto

O sistema contempla todo o processo de atendimento de um Pronto Socorro, dividido em três etapas principais:

1. **Recepção** — Cadastro do paciente com seus dados pessoais (nome completo, endereço, RG, CPF, nome do pai, nome da mãe, data de nascimento, etc.) e geração de um número de atendimento (ex: `AT0001`). A recepção também pode alterar, consultar e cancelar um atendimento ainda não confirmado pelo médico.
2. **Triagem (Enfermagem)** — Registro dos dados do atendimento: pressão arterial, temperatura corporal, batimentos cardíacos e principais queixas do paciente (dor de cabeça, náusea, dor muscular, etc.), além da classificação do atendimento seguindo o **Protocolo de Manchester**.
3. **Atendimento Médico** — O médico acessa o atendimento, registra as medicações e confirma o atendimento. Também possui acesso a um **Painel de Atendimento**, que exibe a fila de pacientes ordenada pela classificação de Manchester, facilitando a visualização de quem deve ser chamado primeiro.

## Estrutura do projeto

```
ProjetoIntegradorII/
├── backend/
│   ├── config/
│   │   └── db.js                  # Conexão com o PostgreSQL
│   ├── controllers/
│   │   ├── atendimentoController.js   # Recepção
│   │   ├── triagemController.js       # Triagem
│   │   └── medicoController.js        # Médico / Painel
│   ├── routes/
│   │   ├── atendimentoRoutes.js
│   │   ├── triagemRoutes.js
│   │   └── medicoRoutes.js
│   ├── database/
│   │   └── schema.sql             # Script de criação das tabelas
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html                 # Interface da Recepção
│   ├── triagem.html               # Interface da Triagem
│   ├── medico.html                # Painel do Médico
│   ├── css/style.css
│   └── js/
│       ├── recepcao.js
│       ├── triagem.js
│       └── medico.js
└── README.md
```

## Tecnologias utilizadas

- Node.js
- Express
- PostgreSQL
- PgAdmin

## Pré-requisitos

Antes de começar, você precisa ter instalado:
- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- Git (para clonar o repositório)
- PostgreSQL
- PgAdmin

## Passos para rodar o projeto localmente

Clonar o repositório e entrar na pasta do backend:
```
cd backend
```

Instalar as dependências:
```
npm install
```

Configurar o banco de dados:
- Crie um banco PostgreSQL (ex: `pronto_socorro`) usando o PgAdmin.
- Rode o script `database/schema.sql` nesse banco para criar as tabelas.
- Copie `.env.example` para `.env` e ajuste as credenciais de acesso ao banco.

Rodar o servidor:
```
npm start
```

Acessar a aplicação:
```
http://localhost:3000
```

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/atendimentos` | Cria paciente e abre um novo atendimento (Recepção) |
| GET | `/api/atendimentos` | Lista atendimentos (filtros `?status=` e `?numero=`) |
| GET | `/api/atendimentos/:id` | Consulta um atendimento |
| PUT | `/api/atendimentos/:id` | Altera dados do paciente/atendimento |
| DELETE | `/api/atendimentos/:id` | Cancela um atendimento não confirmado |
| POST | `/api/atendimentos/:id/triagem` | Registra a triagem e a classificação de Manchester |
| GET | `/api/medico/painel` | Lista a fila de atendimentos ordenada por Manchester |
| GET | `/api/medico/:id` | Detalhes completos do atendimento |
| POST | `/api/medico/:id/medicacoes` | Registra as medicações |
| PUT | `/api/medico/:id/confirmar` | Confirma o atendimento médico |
