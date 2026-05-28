# Safe|Service

**Plataforma descentralizada de escrow para serviços industriais** — Hackathon Web3

Contrato deployado na **Sepolia Testnet**: `0xe512Bbacd2B2af97D91FAB0319Fd79Da90b66788`

---

## Testar agora (sem instalar nada)

Acede diretamente pelo browser:

**https://jpdelnascimento-project.github.io/safeservice-hackathon/Paginas/landing-page-rev3.html**

Precisas apenas de:
- **MetaMask** instalado no browser ([instalar](https://metamask.io/download/))
- **3 contas MetaMask** na rede Sepolia (ou pede a 2 colegas)
- **Sepolia ETH** (para gas) — obtém grátis em [sepoliafaucet.com](https://sepoliafaucet.com)
- **USDC Sepolia** (para criar a Ordem de Serviço) — obtém grátis em [app.aave.com/faucet](https://app.aave.com/faucet) → procura "USDC"

> Todos os fundos são de teste (sem valor real). A rede é Sepolia Testnet.

---

## Fluxo de teste — 3 carteiras

| Passo | Carteira | Ação |
|---|---|---|
| 1 | **A — Contratante** | Conecta → Screen 1 → Preenche formulário → Cria O.S. (2 transações: approve USDC + criarOrdem) |
| 2 | **B — Prestador** | Desconecta → Conecta como B → Screen 2 → Clica na O.S. → "Finalizar Serviço" |
| 3 | **C — Fiscal** | Desconecta → Conecta como C → Screen 3 → Clica na O.S. → "Aprovar Pagamento" |

Após o Passo 3, os USDC são transferidos automaticamente para a Carteira B (Prestador).

---

## Como adicionar a rede Sepolia ao MetaMask

1. MetaMask → clica na rede atual (topo) → "Adicionar rede"
2. Procura "Sepolia" → Adicionar
3. Ou configura manualmente:
   - **Nome**: Sepolia Testnet
   - **RPC**: `https://rpc.sepolia.org`
   - **Chain ID**: `11155111`
   - **Símbolo**: ETH
   - **Explorer**: `https://sepolia.etherscan.io`

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

## Para redesployar o contrato (opcional)

<details>
<summary>Expandir instruções de deploy</summary>

Precisas de Node.js instalado e de uma conta Alchemy.

1. Clona o repositório
2. Copia `Contratos/.env.example` para `Contratos/.env` e preenche com a tua Alchemy URL e chave privada MetaMask
3. Corre `.\DEPLOY.ps1` no PowerShell

</details>
