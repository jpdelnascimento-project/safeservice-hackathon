// ============================================================================
// Safe|Service App — Complete Web3 Integration
// ============================================================================

const CONTRACT_ADDRESS = '0xe512Bbacd2B2af97D91FAB0319Fd79Da90b66788'; // SET AFTER DEPLOYMENT
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const USDC_DECIMALS = 6;

const SAFESERVICE_ABI = [
  {
    "type": "function",
    "name": "criarOrdem",
    "inputs": [
      { "name": "prestador", "type": "address" },
      { "name": "fiscal", "type": "address" },
      { "name": "valor", "type": "uint256" },
      { "name": "descricao", "type": "string" },
      { "name": "tipoServico", "type": "string" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "finalizarServico",
    "inputs": [{ "name": "osId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "aprovarOrdem",
    "inputs": [{ "name": "osId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "recusarOrdem",
    "inputs": [{ "name": "osId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getOrdem",
    "inputs": [{ "name": "osId", "type": "uint256" }],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "contratante", "type": "address" },
          { "name": "prestador", "type": "address" },
          { "name": "fiscal", "type": "address" },
          { "name": "valor", "type": "uint256" },
          { "name": "descricao", "type": "string" },
          { "name": "tipoServico", "type": "string" },
          { "name": "status", "type": "uint8" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getOrdensByPrestador",
    "inputs": [{ "name": "prestador", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getOrdensByFiscal",
    "inputs": [{ "name": "fiscal", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "solicitarRevisao",
    "inputs": [{ "name": "osId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "OrdemCriada",
    "inputs": [
      { "name": "osId", "type": "uint256", "indexed": true },
      { "name": "contratante", "type": "address", "indexed": true },
      { "name": "prestador", "type": "address", "indexed": true },
      { "name": "fiscal", "type": "address", "indexed": false },
      { "name": "valor", "type": "uint256", "indexed": false },
      { "name": "tipoServico", "type": "string", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "ServicoFinalizado",
    "inputs": [
      { "name": "osId", "type": "uint256", "indexed": true },
      { "name": "prestador", "type": "address", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "OrdemAprovada",
    "inputs": [
      { "name": "osId", "type": "uint256", "indexed": true },
      { "name": "fiscal", "type": "address", "indexed": true },
      { "name": "valor", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "OrdemRecusada",
    "inputs": [
      { "name": "osId", "type": "uint256", "indexed": true },
      { "name": "fiscal", "type": "address", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "OrdemEmRevisao",
    "inputs": [
      { "name": "osId", "type": "uint256", "indexed": true },
      { "name": "fiscal", "type": "address", "indexed": true }
    ]
  }
];

const USDC_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

// Global state
let provider, signer, contract, usdcContract;
let connectedWallet = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Session guard — must run first
    connectedWallet = sessionStorage.getItem('ss_wallet');
    if (!connectedWallet) {
      console.log('No session, redirecting to landing page');
      window.location.href = 'landing-page-rev3.html';
      throw new Error('No session');
    }

    // Initialize ethers.js
    await initEthers();

    // Update wallet display in all headers
    updateWalletDisplay();

    // Inject disconnect buttons
    injectDisconnectButtons();

    // Initialize Screen 1 (Contratante)
    initScreen1();

    // Setup nav item listeners for Screen 2 and 3
    setupNavListeners();

  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// ============================================================================
// ETHERS.JS INITIALIZATION
// ============================================================================

async function initEthers() {
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, SAFESERVICE_ABI, signer);
  usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
  console.log('ethers.js initialized');
}

// ============================================================================
// WALLET DISPLAY AND DISCONNECT
// ============================================================================

function updateWalletDisplay() {
  const truncatedWallet = `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)} (Sepolia)`;
  document.querySelectorAll('.wallet-status').forEach(el => {
    const dot = el.querySelector('.status-dot');
    el.textContent = '';
    el.appendChild(dot);
    el.appendChild(document.createTextNode(truncatedWallet));
  });
}

function injectDisconnectButtons() {
  document.querySelectorAll('.dashboard-header').forEach(header => {
    const existingBtn = header.querySelector('.btn-disconnect');
    if (existingBtn) return; // Already injected

    const btn = document.createElement('button');
    btn.className = 'btn-disconnect';
    btn.textContent = 'Desconectar';
    btn.style.cssText = `
      margin-left: 12px;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      padding: 8px 16px;
      border-radius: 100px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: all 0.2s;
    `;
    btn.addEventListener('mouseenter', () => (btn.style.background = '#fca5a5'));
    btn.addEventListener('mouseleave', () => (btn.style.background = '#fee2e2'));
    btn.addEventListener('click', () => {
      sessionStorage.removeItem('ss_wallet');
      window.location.href = 'landing-page-rev3.html';
    });

    header.appendChild(btn);
  });
}

// ============================================================================
// SCREEN 1 — EMPRESA CONTRATANTE
// ============================================================================

function initScreen1() {
  // Hide success card by default (already done in CSS, but ensure it)
  const alertCard = document.querySelector('.os-alert-card');
  if (alertCard) alertCard.style.display = 'none';

  // Fill contratante display field
  const displayField = document.getElementById('display-contratante');
  if (displayField) {
    displayField.value = connectedWallet;
  }

  // Setup form submission
  const btnSubmit = document.querySelector('.btn-submit');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', handleCreateOrder);
  }
}

async function handleCreateOrder() {
  try {
    const btnSubmit = document.querySelector('.btn-submit');
    const originalHTML = btnSubmit.innerHTML;

    // Read form values
    const prestador = document.getElementById('input-prestador').value.trim();
    const tipoServico = document.getElementById('select-tipo-servico').value;
    const valorRaw = document.getElementById('input-valor').value.trim();
    const descricao = document.getElementById('textarea-descricao').value.trim();
    const fiscal = document.getElementById('input-fiscal').value.trim();

    // Validation
    if (!ethers.isAddress(prestador)) {
      alert('Endereço do prestador inválido');
      return;
    }
    if (!ethers.isAddress(fiscal)) {
      alert('Endereço do fiscal inválido');
      return;
    }
    if (!valorRaw || isNaN(parseFloat(valorRaw)) || parseFloat(valorRaw) <= 0) {
      alert('Valor deve ser maior que zero');
      return;
    }
    if (!descricao) {
      alert('Descrição é obrigatória');
      return;
    }

    const valor = ethers.parseUnits(valorRaw, USDC_DECIMALS);

    // Disable button, show loading
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Aprovando USDC...';

    // Step 1: Approve USDC
    console.log('Approving USDC...');
    const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, valor);
    await approveTx.wait();
    console.log('Approval confirmed');

    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando O.S...';

    // Step 2: Create order
    console.log('Creating order...');
    const createTx = await contract.criarOrdem(prestador, fiscal, valor, descricao, tipoServico);
    const receipt = await createTx.wait();
    console.log('Order created, receipt:', receipt);

    // Step 3: Parse event to get osId
    const iface = contract.interface;
    let osId = null;
    if (receipt && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === 'OrdemCriada') {
            osId = parsed.args.osId.toString();
            break;
          }
        } catch (e) {
          // Log parsing failed, continue
        }
      }
    }

    // Step 4: Show success
    const formCard = document.querySelector('.form-card');
    const alertCard = document.querySelector('.os-alert-card');
    if (formCard) formCard.style.display = 'none';
    if (alertCard) {
      alertCard.style.display = 'flex';
      const tag = alertCard.querySelector('.os-tag');
      if (tag) tag.textContent = `O.S. GERADA: #${osId || '?'}`;
    }

    btnSubmit.innerHTML = originalHTML;

  } catch (error) {
    console.error('Error creating order:', error);
    const btnSubmit = document.querySelector('.btn-submit');
    const originalHTML = btnSubmit.innerHTML;
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fa-solid fa-file-signature"></i> Registrar e Emitir O.S.';
    alert('Transação falhou: ' + (error.reason || error.message || error.toString()));
  }
}

// ============================================================================
// NAV LISTENERS FOR SCREENS 2 & 3
// ============================================================================

function setupNavListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', async () => {
      const target = item.getAttribute('data-target');
      if (target === 'page-prestador') {
        await loadPrestadorScreen();
      } else if (target === 'page-inspecao') {
        await loadInspecaoScreen();
      }
    });
  });
}

// ============================================================================
// SCREEN 2 — PRESTADOR
// ============================================================================

async function loadPrestadorScreen() {
  try {
    const list = document.querySelector('#page-prestador .os-scroll-list');
    if (!list) return;

    list.innerHTML = '<p style="color:#64748b;font-size:13px;padding:8px">Carregando...</p>';

    const ids = await contract.getOrdensByPrestador(connectedWallet);
    const ordens = await Promise.all(ids.map(id => contract.getOrdem(id)));

    const ordenadas = [...ordens].sort((a, b) => Number(b.id) - Number(a.id));

    window._prestadorOrdens = ordenadas;

    renderPrestadorList(ordenadas);

    // Setup search
    const searchInput = document.querySelector('#page-prestador .search-box input');
    if (searchInput) {
      searchInput.value = '';
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = (window._prestadorOrdens || []).filter(os =>
          os.id.toString().includes(term) ||
          os.tipoServico.toLowerCase().includes(term) ||
          os.descricao.toLowerCase().includes(term)
        );
        renderPrestadorList(filtered);
      });
    }

    // Select first OS by default
    const firstCard = document.querySelector('#page-prestador .os-list-card');
    if (firstCard && ordens.length > 0) {
      firstCard.classList.add('active');
      renderPrestadorDetail(ordens[0]);
    }

  } catch (error) {
    console.error('Error loading prestador screen:', error);
    const list = document.querySelector('#page-prestador .os-scroll-list');
    if (list) list.innerHTML = '<p style="color:#e74c3c;">Erro ao carregar. Tente novamente.</p>';
  }
}

function renderPrestadorList(ordens) {
  const list = document.querySelector('#page-prestador .os-scroll-list');
  if (!list) return;

  list.innerHTML = '';

  if (ordens.length === 0) {
    list.innerHTML = '<p style="color:#64748b;font-size:13px;padding:8px">Nenhuma O.S. encontrada.</p>';
    return;
  }

  ordens.forEach(os => {
    const card = document.createElement('div');
    card.className = 'os-list-card';
    card.dataset.osId = os.id.toString();

    const valorFormatted = ethers.formatUnits(os.valor, USDC_DECIMALS);
    const valorDisplay = parseFloat(valorFormatted).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    card.innerHTML = `
      <div class="os-list-header">
        <span class="id">O.S. #${os.id}</span>
        <span class="value">${valorDisplay} USDC</span>
      </div>
      <p>${os.tipoServico}</p>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('#page-prestador .os-list-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      renderPrestadorDetail(os);
    });

    list.appendChild(card);
  });
}

function renderPrestadorDetail(os) {
  const detail = document.querySelector('#page-prestador .service-detail-card');
  if (!detail) return;

  const statusText = Number(os.status) === 0 ? 'Retido em Escrow' : 'Aguardando Fiscal';
  const statusClass = Number(os.status) === 0 ? 'waiting' : 'ready';

  const valorFormatted = ethers.formatUnits(os.valor, USDC_DECIMALS);
  const valorDisplay = parseFloat(valorFormatted).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const contraianteDisplay = `${os.contratante.slice(0, 6)}...${os.contratante.slice(-4)}`;

  detail.querySelector('.os-badge').textContent = `O.S. SELECIONADA: #${os.id}`;
  detail.querySelector('.contract-title').textContent = os.tipoServico;

  const statusBadge = detail.querySelector('.status-badge');
  statusBadge.className = `status-badge ${statusClass}`;
  statusBadge.innerHTML = `<i class="fa-solid fa-${statusClass === 'waiting' ? 'hourglass-half' : 'clipboard-check'}"></i> ${statusText}`;

  detail.querySelector('.contractor-box .meta-text h4').textContent = contraianteDisplay;
  detail.querySelector('.value-display .meta-text h4.amount').textContent = `${valorDisplay} USDC`;
  detail.querySelector('.description-block p').textContent = os.descricao;

  const btnAction = detail.querySelector('.btn-action');
  if (btnAction) {
    const isCompleted = Number(os.status) !== 0;
    if (isCompleted) {
      btnAction.disabled = true;
      btnAction.textContent = 'Serviço já Finalizado';
    } else {
      btnAction.disabled = false;
      btnAction.innerHTML = '<i class="fa-solid fa-circle-check"></i> Declarar e Finalizar o Serviço';
      btnAction.onclick = () => handleFinalizarServico(os.id, btnAction);
    }
  }
}

async function handleFinalizarServico(osId, btn) {
  try {
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Finalizando...';

    const tx = await contract.finalizarServico(osId);
    await tx.wait();

    // Reload the screen
    await loadPrestadorScreen();

  } catch (error) {
    console.error('Error finalizing service:', error);
    alert('Erro: ' + (error.reason || error.message));
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Declarar e Finalizar o Serviço';
  }
}

// ============================================================================
// SCREEN 3 — FISCAL / INSPEÇÃO
// ============================================================================

async function loadInspecaoScreen() {
  try {
    const list = document.querySelector('#page-inspecao .os-scroll-list');
    if (!list) return;

    list.innerHTML = '<p style="color:#64748b;font-size:13px;padding:8px">Carregando...</p>';

    const ids = await contract.getOrdensByFiscal(connectedWallet);
    const ordens = await Promise.all(ids.map(id => contract.getOrdem(id)));

    // Filter: only show status === 1 (ConcluidaPeloPrestador)
    const inspecaoOrdens = ordens.filter(os => Number(os.status) === 1);

    window._inspecaoOrdens = inspecaoOrdens;

    renderInspecaoList(inspecaoOrdens);

    // Setup search
    const searchInput = document.querySelector('#page-inspecao .search-box input');
    if (searchInput) {
      searchInput.value = '';
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = (window._inspecaoOrdens || []).filter(os =>
          os.id.toString().includes(term) ||
          os.tipoServico.toLowerCase().includes(term) ||
          os.descricao.toLowerCase().includes(term)
        );
        renderInspecaoList(filtered);
      });
    }

    // Select first OS by default
    const firstCard = document.querySelector('#page-inspecao .os-list-card');
    if (firstCard && inspecaoOrdens.length > 0) {
      firstCard.classList.add('active');
      renderInspecaoDetail(inspecaoOrdens[0]);
    }

  } catch (error) {
    console.error('Error loading inspecao screen:', error);
    const list = document.querySelector('#page-inspecao .os-scroll-list');
    if (list) list.innerHTML = '<p style="color:#e74c3c;">Erro ao carregar. Tente novamente.</p>';
  }
}

function renderInspecaoList(ordens) {
  const list = document.querySelector('#page-inspecao .os-scroll-list');
  if (!list) return;

  list.innerHTML = '';

  if (ordens.length === 0) {
    list.innerHTML = '<p style="color:#64748b;font-size:13px;padding:8px">Nenhuma O.S. aguardando inspeção.</p>';
    return;
  }

  ordens.forEach(os => {
    const card = document.createElement('div');
    card.className = 'os-list-card';
    card.dataset.osId = os.id.toString();

    const valorFormatted = ethers.formatUnits(os.valor, USDC_DECIMALS);
    const valorDisplay = parseFloat(valorFormatted).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    card.innerHTML = `
      <div class="os-list-header">
        <span class="id">O.S. #${os.id}</span>
        <span class="value">${valorDisplay} USDC</span>
      </div>
      <p>${os.tipoServico}</p>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('#page-inspecao .os-list-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      renderInspecaoDetail(os);
    });

    list.appendChild(card);
  });
}

function renderInspecaoDetail(os) {
  const detail = document.querySelector('#page-inspecao .service-detail-card');
  if (!detail) return;

  const valorFormatted = ethers.formatUnits(os.valor, USDC_DECIMALS);
  const valorDisplay = parseFloat(valorFormatted).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const contraianteDisplay = `${os.contratante.slice(0, 6)}...${os.contratante.slice(-4)}`;
  const prestadorDisplay = `${os.prestador.slice(0, 6)}...${os.prestador.slice(-4)}`;

  detail.querySelector('.os-badge').textContent = `O.S. EM ANÁLISE: #${os.id}`;
  detail.querySelector('.contract-title').textContent = os.tipoServico;
  detail.querySelector('.description-block p').textContent = os.descricao;

  const metaBoxes = detail.querySelectorAll('.meta-box');
  if (metaBoxes.length >= 3) {
    metaBoxes[0].querySelector('h4').textContent = contraianteDisplay;
    metaBoxes[1].querySelector('h4').textContent = prestadorDisplay;
    metaBoxes[2].querySelector('h4.amount').textContent = `${valorDisplay} USDC`;
  }

  const btnApprove = detail.querySelector('.btn-approve');
  const btnRejectCancel = detail.querySelector('.btn-reject-cancel');
  const btnRejectReview = detail.querySelector('.btn-reject-review');

  if (btnApprove) {
    btnApprove.disabled = false;
    btnApprove.innerHTML = '<i class="fa-solid fa-unlock"></i> Aprovar e Liberar Pagamento';
    btnApprove.onclick = () => handleAprovarOrdem(os.id, btnApprove, btnRejectCancel, btnRejectReview);
  }

  if (btnRejectCancel) {
    btnRejectCancel.disabled = false;
    btnRejectCancel.innerHTML = '<i class="fa-solid fa-ban"></i> Recusar e Cancelar';
    btnRejectCancel.onclick = () => handleRecusarOrdem(os.id, btnApprove, btnRejectCancel, btnRejectReview);
  }

  if (btnRejectReview) {
    btnRejectReview.disabled = false;
    btnRejectReview.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Solicitar Revisão';
    btnRejectReview.onclick = () => handleSolicitarRevisao(os.id, btnApprove, btnRejectCancel, btnRejectReview);
  }
}

async function handleAprovarOrdem(osId, btnApprove, btnRejectCancel, btnRejectReview) {
  try {
    btnApprove.disabled = true;
    btnRejectCancel.disabled = true;
    btnRejectReview.disabled = true;
    btnApprove.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Aprovando...';

    const tx = await contract.aprovarOrdem(osId);
    await tx.wait();

    btnApprove.innerHTML = '<i class="fa-solid fa-check"></i> Aprovado!';
    alert('✅ Ordem aprovada! Pagamento liberado ao prestador de serviço.');

    await loadInspecaoScreen();

  } catch (error) {
    console.error('Error approving order:', error);
    alert('Erro: ' + (error.reason || error.message));
    btnApprove.disabled = false;
    btnRejectCancel.disabled = false;
    btnRejectReview.disabled = false;
    btnApprove.innerHTML = '<i class="fa-solid fa-unlock"></i> Aprovar e Liberar Pagamento';
  }
}

async function handleRecusarOrdem(osId, btnApprove, btnRejectCancel, btnRejectReview) {
  try {
    btnApprove.disabled = true;
    btnRejectCancel.disabled = true;
    btnRejectReview.disabled = true;
    btnRejectCancel.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Recusando...';

    const tx = await contract.recusarOrdem(osId);
    await tx.wait();

    btnRejectCancel.innerHTML = '<i class="fa-solid fa-ban"></i> Recusado!';
    alert('🚫 Ordem recusada! USDC devolvido ao contratante.');

    await loadInspecaoScreen();

  } catch (error) {
    console.error('Error rejecting order:', error);
    alert('Erro: ' + (error.reason || error.message));
    btnApprove.disabled = false;
    btnRejectCancel.disabled = false;
    btnRejectReview.disabled = false;
    btnRejectCancel.innerHTML = '<i class="fa-solid fa-ban"></i> Recusar e Cancelar';
  }
}

async function handleSolicitarRevisao(osId, btnApprove, btnRejectCancel, btnRejectReview) {
  try {
    btnApprove.disabled = true;
    btnRejectCancel.disabled = true;
    btnRejectReview.disabled = true;
    btnRejectReview.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

    const tx = await contract.solicitarRevisao(osId);
    await tx.wait();

    btnRejectReview.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Revisão Solicitada!';
    alert('🔄 Revisão solicitada! A O.S. foi reaberta para o prestador.');

    await loadInspecaoScreen();

  } catch (error) {
    console.error('Error requesting review:', error);
    alert('Erro: ' + (error.reason || error.message));
    btnApprove.disabled = false;
    btnRejectCancel.disabled = false;
    btnRejectReview.disabled = false;
    btnRejectReview.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Solicitar Revisão';
  }
}
