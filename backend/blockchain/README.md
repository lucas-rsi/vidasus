# VidaSUSAudit — Deploy no Remix IDE

Instruções para compilar e testar o contrato `VidaSUSAudit.sol` no Remix IDE. Não há deploy automático: o teste é feito manualmente, em uma VM local no navegador.

## Passo a passo

1. Abra https://remix.ethereum.org no navegador.
2. No painel "File Explorers" (ícone de pasta), crie o arquivo `contracts/VidaSUSAudit.sol`.
3. Cole o conteúdo de `VidaSUSAudit.sol`.
4. Vá em "Solidity Compiler" (ícone S). Selecione a versão `0.8.20` ou superior. Clique em "Compile VidaSUSAudit.sol".
5. Vá em "Deploy & Run Transactions" (ícone ▶️). Em "Environment", selecione `JavaScript VM (London)`.
6. Clique em "Deploy". O contrato aparecerá na lista abaixo.
7. **Exemplo de uso** (na área "Deployed Contracts"):
   - Expanda o contrato deployed.
   - `bookAppointment` → preencha `1`, `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef` (hash do CPF fictício, 32 bytes em hex), `"Cardiologia"` → clique.
   - `bookAppointment` → `2`, `0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd`, `"Pediatria"` → clique.
   - `totalAppointments` → botão `call` → retorna `2`.
   - `cancelAppointment` → `1` → clique (emite evento, mas não remove o agendamento).

## Por que testnet e não mainnet

O protótipo roda apenas na VM local do Remix, sem custo e sem dados reais. A mainnet exige ETH real a cada transação, o que não faz sentido para um protótipo acadêmico. O deploy em testnet (Sepolia ou Polygon Mumbai) é uma evolução futura e requer obter moeda de teste em um faucet.
