const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);

    console.log("Carteira:", deployer.address);
    console.log("Saldo ETH Sepolia:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        console.error("\nERRO: Saldo zero. Obtenha ETH Sepolia em https://sepoliafaucet.com");
        process.exit(1);
    }

    const SafeService = await ethers.getContractFactory("SafeService");
    console.log("\nFazendo deploy do contrato...");
    const contract = await SafeService.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("Contrato deployado em:", address);

    // Auto-injetar o endereço no safeservice-app.js
    const appJsPath = path.resolve(__dirname, "../../Paginas/safeservice-app.js");

    if (!fs.existsSync(appJsPath)) {
        console.error("ERRO: Nao encontrou safeservice-app.js em:", appJsPath);
        process.exit(1);
    }

    let content = fs.readFileSync(appJsPath, "utf8");
    const before = content;
    content = content.replace(
        /const CONTRACT_ADDRESS = '[^']*';/,
        `const CONTRACT_ADDRESS = '${address}';`
    );

    if (content === before) {
        console.error("ERRO: Nao encontrou CONTRACT_ADDRESS em safeservice-app.js");
        process.exit(1);
    }

    fs.writeFileSync(appJsPath, content, "utf8");
    console.log("safeservice-app.js atualizado automaticamente");

    // Guardar endereço num ficheiro de referência
    const infoPath = path.resolve(__dirname, "../contrato-deployado.txt");
    fs.writeFileSync(infoPath, `Endereco: ${address}\nData: ${new Date().toISOString()}\n`);
    console.log("\nEndereço guardado em Contratos/contrato-deployado.txt");
    console.log("\nDeploy concluido. O browser vai abrir em breve...");
}

main().catch(e => {
    console.error("\nFalha no deploy:", e.message || e);
    process.exit(1);
});
