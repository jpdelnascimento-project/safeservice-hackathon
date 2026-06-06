# Safe|Service

**Objetivo**

A SafeService é uma plataforma de contratos inteligentes que resolve um problema clássico de mercado: 
A falta de confiança na prestação de serviços. Criamos uma arquitetura onde empresas e prestadores se conectam diretamente, garantindo de forma automatizada — via smart contracts — que o serviço seja entregue e o pagamento seja liberado com total segurança, sem a necessidade de intermediários centralizados.

**Plataforma descentralizada de escrow para serviços industriais** — Hackathon Web3

Contrato deployado na **Sepolia Testnet**: `0xe512Bbacd2B2af97D91FAB0319Fd79Da90b66788`

---

## Como Testar: 

Acesse diretamente pelo browser:

**https://jpdelnascimento-project.github.io/safeservice-hackathon/Paginas/landing-page-rev3.html**

Requisitos para teste:
- **MetaMask** instalado no browser ([instalar](https://metamask.io/download/)) ou outra carteira. 
- **3 contas MetaMask** na rede Sepolia
- **Sepolia ETH** (para gas) — obtenha faucet em [sepoliafaucet.com](https://sepoliafaucet.com)
- **USDC Sepolia** (para criar a Ordem de Serviço) — obtém faucet em [https://faucet.circle.com/)

> Todos os fundos são de teste (sem valor real). A rede é Sepolia Testnet.

---

## Fluxo de teste — 3 carteiras

| Passo | Carteira | Ação |
|---|---|---|
| 1 | **A — Contratante** | Conecta conta A → Preencha formulário em "Empresa Contratante" com os endereços do Prestador e do Fiscal →  Cria O.S. (2 transações: approve USDC + criarOrdem) |
| 2 | **B — Prestador** | Conecta conta B → Acesse "Painel do Prestador" → Clica na O.S. → "Finalizar Serviço" |
| 3 | **C — Fiscal** | Conecta conta C → Acesse "Inspeção" → Clica na O.S. → "Aprovar Pagamento" |

Após o Passo 3, os USDC são transferidos automaticamente para a Carteira B (Prestador).

---

## Estrutura do projeto

```
├── Contratos/
│   ├── contracts/SafeService.sol     ← Smart contract Solidity
│   ├── scripts/deploy.js             ← Script de deploy (Hardhat)
│   ├── hardhat.config.js
│   ├── package.json
│   └── contrato-deployado.txt        ← Endereço e data do deploy
└── Paginas/
    ├── landing-page-rev3.html        ← Página inicial (entrada)
    ├── landing-page-web3.js          ← Lógica da landing page
    ├── SafeService_index.html        ← App principal (3 screens)
    └── safeservice-app.js            ← Lógica completa do escrow
```

---

## Problemas comuns

| Problema | Solução |
|---|---|
| MetaMask não aparece | Instala a extensão em metamask.io/download |
| "Wrong network" | Muda para Sepolia Testnet no MetaMask |
| Saldo ETH zero | Obtém em sepoliafaucet.com (pode demorar 1-2 min) |
| Saldo USDC zero | Obtém em app.aave.com/faucet → "USDC" → Faucet |
| Lista de O.S. vazia | Confirma que estás conectado com a carteira certa (B ou C) |

---

## Equipe

- João Paulo do Nascimento - Dev
- Carlos Magno Souza - QA
- Alcides Mello Junior - Produto
- Julio - Tech Lead
