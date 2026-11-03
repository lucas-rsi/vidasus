# Parte 4 — Blockchain e Smart Contracts

## Por que blockchain aqui

O valor da blockchain no VidaSUS está na **imutabilidade da auditoria de agendamentos**. Hoje os agendamentos ficam em um banco SQLite, onde quem tem acesso administrativo pode alterar ou apagar registros sem deixar rastro. Se cada agendamento também for registrado em uma blockchain, um gestor não consegue alterar ou excluir silenciosamente um agendamento já confirmado: qualquer tentativa de divergência fica evidente ao comparar o banco com o registro on-chain.

## O protótipo

O contrato `VidaSUSAudit` (`backend/blockchain/VidaSUSAudit.sol`, em Solidity) é pequeno de propósito. Tem uma `struct` (`Appointment`), um `mapping` que guarda os agendamentos por id, duas funções (`bookAppointment` e `cancelAppointment`), dois eventos (`AppointmentBooked` e `AppointmentCancelled`) e uma função de leitura (`totalAppointments`). Ao agendar, o contrato registra o id, o hash do CPF, a especialidade, o horário do bloco e o endereço de quem registrou. Ao cancelar, apenas emite um evento: o agendamento **não é removido**, e o histórico permanece como trilha de auditoria.

## LGPD e o hash do CPF

O contrato recebe somente um `bytes32` (o hash do CPF), nunca o CPF em texto. Como dados gravados em blockchain pública não podem ser apagados e ficam visíveis a qualquer pessoa, gravar o CPF puro exporia dados pessoais de forma permanente. Com o hash, a verificação ainda é possível: quem conhece o CPF calcula o hash e compara com o registro, sem que o CPF apareça on-chain.

## Como usar

As instruções passo a passo para compilar e testar o contrato no Remix IDE estão em `backend/blockchain/README.md`. O deploy não é automático.

## O que NÃO fazer com blockchain

Dados clínicos (anamnese, exames, prontuário) **não devem** ir para a blockchain. O custo por escrita, a lentidão e, principalmente, a impossibilidade de apagar dados (que conflita com a LGPD) contraindicam esse uso. A blockchain vale para **auditoria**, não para **dado primário**: o dado continua no banco, e a blockchain guarda apenas a prova de que o registro existiu e quando.

## Próximos passos

Integrar o backend Node para chamar o contrato ao criar e cancelar agendamentos, e fazer o deploy em uma testnet (como Sepolia).

## Autoria

- Desenvolvimento backend/full-stack: Rafael Bueno + Lucas Richard
- Camada de apresentação / UX: Jeferson Farias
