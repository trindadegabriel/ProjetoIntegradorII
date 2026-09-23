ProjetoIntegradorII
Sistema de Atendimentos de Pronto Socorro

Este projeto é uma aplicação Node.js + Express + PostgreSQL desenvolvida para o componente curricular de Projeto Integrador 2 (PUC-Campinas). O sistema tem como objetivo controlar os atendimentos realizados em um Pronto Socorro, desde a chegada do paciente na recepção até sua saída após a alta médica.

Sobre o projeto

O sistema contempla todo o processo de atendimento de um Pronto Socorro, dividido em três etapas principais:

Recepção — Cadastro do paciente com seus dados pessoais (nome completo, endereço, RG, CPF, nome do pai, nome da mãe, data de nascimento, etc.) e geração de um número de atendimento (ex: AT0001). A recepção também pode alterar, consultar e cancelar um atendimento ainda não confirmado pelo médico.
Triagem (Enfermagem) — Registro dos dados do atendimento: pressão arterial, temperatura corporal, batimentos cardíacos e principais queixas do paciente (dor de cabeça, náusea, dor muscular, etc.), além da classificação do atendimento seguindo o Protocolo de Manchester.
Atendimento Médico — O médico acessa o atendimento, registra as medicações e confirma o atendimento. Também possui acesso a um Painel de Atendimento, que exibe a fila de pacientes ordenada pela classificação de Manchester, facilitando a visualização de quem deve ser chamado primeiro.
Funcionalidades (Front-End)
Interface da Recepção: inclusão, alteração, consulta e cancelamento de atendimentos.
Interface da Triagem (Enfermagem): inclusão dos dados de triagem e classificação de Manchester.
Interface do Médico: Painel de Atendimentos (fila por prioridade) e tela para lançar medicações e confirmar a consulta.
Back-End

Responsável por conectar todas as interfaces (Recepção, Triagem e Médico), processando e armazenando os dados no banco de dados e garantindo o funcionamento do fluxo de atendimento.

Banco de dados

Banco de dados relacional contendo as tabelas necessárias para armazenar os dados dos pacientes, dos atendimentos e de todas as informações do processo (recepção, triagem e atendimento médico).

Tecnologias utilizadas
Node.js
Express
PostgreSQL
PgAdmin
Pré-requisitos

Antes de começar, você precisa ter instalado:

Node.js (versão 16 ou superior)
Git (para clonar o repositório)
PostgreSQL
PgAdmin
Passos para rodar o projeto localmente

Instalar as dependências:

npm install

Rodar o servidor:

npm start

Acessar a aplicação:

http://localhost:3000
