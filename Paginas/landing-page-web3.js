document.addEventListener('DOMContentLoaded', async () => {
    const btnConnect = document.getElementById('btn-connect-wallet');

    if (!btnConnect) {
        console.error('btn-connect-wallet not found');
        return;
    }

    btnConnect.addEventListener('click', async () => {
        try {
            if (typeof window.ethereum === 'undefined') {
                alert('MetaMask não detectado. Por favor, instale a extensão MetaMask.');
                return;
            }

            btnConnect.disabled = true;
            btnConnect.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando...';

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (!accounts || accounts.length === 0) {
                alert('Conexão recusada. Por favor, tente novamente.');
                btnConnect.disabled = false;
                btnConnect.innerHTML = '<i class="fa-solid fa-wallet"></i> Conectar Carteira Digital';
                return;
            }

            const chainId = await window.ethereum.request({
                method: 'eth_chainId'
            });

            if (chainId !== '0xaa36a7') {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }]
                    });
                } catch (switchError) {
                    alert('Por favor, mude para a rede Sepolia no MetaMask.');
                    btnConnect.disabled = false;
                    btnConnect.innerHTML = '<i class="fa-solid fa-wallet"></i> Conectar Carteira Digital';
                    return;
                }
            }

            const walletAddress = accounts[0];
            sessionStorage.setItem('ss_wallet', walletAddress);

            btnConnect.innerHTML = '<i class="fa-solid fa-check"></i> Conectado!';
            setTimeout(() => {
                window.location.href = 'SafeService_index.html';
            }, 500);

        } catch (error) {
            console.error('Erro na conexão:', error);
            alert('Erro ao conectar: ' + (error.message || 'Desconhecido'));
            btnConnect.disabled = false;
            btnConnect.innerHTML = '<i class="fa-solid fa-wallet"></i> Conectar Carteira Digital';
        }
    });
});
