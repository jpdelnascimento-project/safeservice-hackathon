# Safe|Service — Script de Deploy Automatico
# Execute no PowerShell a partir da pasta E:\Claude\Hackthon

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$contratosDir = Join-Path $rootDir "Contratos"
$paginasDir   = Join-Path $rootDir "Paginas"
$envFile      = Join-Path $contratosDir ".env"
$envExample   = Join-Path $contratosDir ".env.example"

Write-Host ""
Write-Host "============================================"
Write-Host "  Safe|Service — Deploy Automatico"
Write-Host "============================================"
Write-Host ""

# ---------------------------------------------------------
# 1. Verificar ficheiro .env
# ---------------------------------------------------------
if (-not (Test-Path $envFile)) {
    Write-Host "ERRO: Ficheiro .env nao encontrado!"
    Write-Host ""
    Write-Host "Faca o seguinte:"
    Write-Host "  1. Abra a pasta:  $contratosDir"
    Write-Host "  2. Copie o ficheiro  .env.example  para  .env"
    Write-Host "  3. Abra o .env e preencha com a sua URL da Alchemy e chave privada"
    Write-Host "  4. Execute este script novamente"
    Write-Host ""
    Read-Host "Pressione ENTER para fechar"
    exit 1
}

$envContent = Get-Content $envFile -Raw
if ($envContent -match "SUA_KEY_AQUI" -or $envContent -match "SUA_CHAVE_PRIVADA_AQUI") {
    Write-Host "ERRO: O ficheiro Contratos\.env ainda tem os valores de exemplo!"
    Write-Host ""
    Write-Host "Abra o ficheiro  $envFile"
    Write-Host "e substitua:"
    Write-Host "  - SUA_KEY_AQUI         pela sua URL da Alchemy"
    Write-Host "  - SUA_CHAVE_PRIVADA_AQUI   pela sua chave privada do MetaMask"
    Write-Host ""
    Read-Host "Pressione ENTER para fechar"
    exit 1
}

Write-Host "[OK] Ficheiro .env encontrado"

# ---------------------------------------------------------
# 2. Instalar dependencias npm
# ---------------------------------------------------------
Write-Host ""
Write-Host "Instalando dependencias (pode demorar 1-2 minutos)..."
Set-Location $contratosDir
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao instalar dependencias. Verifique se tem Node.js instalado."
    Read-Host "Pressione ENTER para fechar"
    exit 1
}
Write-Host "[OK] Dependencias instaladas"

# ---------------------------------------------------------
# 3. Compilar o contrato
# ---------------------------------------------------------
Write-Host ""
Write-Host "Compilando contrato SafeService..."
npx hardhat compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao compilar o contrato."
    Read-Host "Pressione ENTER para fechar"
    exit 1
}
Write-Host "[OK] Contrato compilado"

# ---------------------------------------------------------
# 4. Deploy na Sepolia
# ---------------------------------------------------------
Write-Host ""
Write-Host "Fazendo deploy na rede Sepolia (aguarde 30-60 segundos)..."
npx hardhat run scripts/deploy.js --network sepolia
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERRO no deploy. Verificas:"
    Write-Host "  - A sua carteira tem ETH Sepolia? (https://sepoliafaucet.com)"
    Write-Host "  - A URL da Alchemy esta correta no .env?"
    Write-Host "  - A chave privada esta correta no .env?"
    Read-Host "Pressione ENTER para fechar"
    exit 1
}
Write-Host "[OK] Deploy concluido"

# ---------------------------------------------------------
# 5. Iniciar servidor e abrir browser
# ---------------------------------------------------------
Write-Host ""
Write-Host "Iniciando servidor local..."
Set-Location $paginasDir

# Abrir browser apos 3 segundos (esperar o servidor iniciar)
Start-Job -ScriptBlock {
    Start-Sleep 4
    Start-Process "http://localhost:3000/landing%20page%20-%20rev3.html"
} | Out-Null

Write-Host ""
Write-Host "============================================"
Write-Host "  DEPLOY CONCLUIDO COM SUCESSO!"
Write-Host ""
Write-Host "  O browser vai abrir em instantes."
Write-Host "  Conecte o MetaMask e teste o fluxo:"
Write-Host ""
Write-Host "  Carteira A (Contratante) -> Screen 1 -> Cria O.S."
Write-Host "  Carteira B (Prestador)   -> Screen 2 -> Finaliza"
Write-Host "  Carteira C (Fiscal)      -> Screen 3 -> Aprova"
Write-Host "============================================"
Write-Host ""
Write-Host "Servidor a correr em http://localhost:3000"
Write-Host "(Feche esta janela para parar o servidor)"
Write-Host ""

npx serve .
