// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SafeService is ReentrancyGuard {
    address public constant USDC_SEPOLIA = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;
    IERC20 public immutable usdc;

    enum Status { Criada, ConcluidaPeloPrestador, Aprovada, Recusada, EmRevisao }

    struct OrdemServico {
        uint256 id;
        address contratante;
        address prestador;
        address fiscal;
        uint256 valor;
        string descricao;
        string tipoServico;
        Status status;
    }

    uint256 public nextOrderId;
    mapping(uint256 => OrdemServico) public ordens;
    mapping(address => uint256[]) public ordemPorPrestador;
    mapping(address => uint256[]) public ordemPorFiscal;

    event OrdemCriada(
        uint256 indexed osId,
        address indexed contratante,
        address indexed prestador,
        address fiscal,
        uint256 valor,
        string tipoServico
    );
    event ServicoFinalizado(uint256 indexed osId, address indexed prestador);
    event OrdemAprovada(uint256 indexed osId, address indexed fiscal, uint256 valor);
    event OrdemRecusada(uint256 indexed osId, address indexed fiscal);
    event OrdemEmRevisao(uint256 indexed osId, address indexed fiscal);

    constructor() {
        usdc = IERC20(USDC_SEPOLIA);
        nextOrderId = 1;
    }

    function criarOrdem(
        address prestador,
        address fiscal,
        uint256 valor,
        string calldata descricao,
        string calldata tipoServico
    ) external nonReentrant returns (uint256) {
        require(valor > 0, "Valor deve ser maior que zero");
        require(prestador != address(0), "Prestador invalido");
        require(fiscal != address(0), "Fiscal invalido");
        require(prestador != msg.sender, "Prestador nao pode ser contratante");

        uint256 osId = nextOrderId;
        nextOrderId++;

        require(usdc.transferFrom(msg.sender, address(this), valor), "Falha na transferencia de USDC");

        ordens[osId] = OrdemServico({
            id: osId,
            contratante: msg.sender,
            prestador: prestador,
            fiscal: fiscal,
            valor: valor,
            descricao: descricao,
            tipoServico: tipoServico,
            status: Status.Criada
        });

        ordemPorPrestador[prestador].push(osId);
        ordemPorFiscal[fiscal].push(osId);

        emit OrdemCriada(osId, msg.sender, prestador, fiscal, valor, tipoServico);

        return osId;
    }

    function finalizarServico(uint256 osId) external {
        require(osId < nextOrderId, "OS invalida");
        OrdemServico storage os = ordens[osId];
        require(msg.sender == os.prestador, "Apenas prestador pode finalizar");
        require(os.status == Status.Criada, "OS nao esta em status Criada");

        os.status = Status.ConcluidaPeloPrestador;
        emit ServicoFinalizado(osId, msg.sender);
    }

    function aprovarOrdem(uint256 osId) external nonReentrant {
        require(osId < nextOrderId, "OS invalida");
        OrdemServico storage os = ordens[osId];
        require(msg.sender == os.fiscal, "Apenas fiscal pode aprovar");
        require(os.status == Status.ConcluidaPeloPrestador, "OS nao esta pronta para aprovacao");

        os.status = Status.Aprovada;
        require(usdc.transfer(os.prestador, os.valor), "Falha ao transferir USDC para prestador");

        emit OrdemAprovada(osId, msg.sender, os.valor);
    }

    function recusarOrdem(uint256 osId) external nonReentrant {
        require(osId < nextOrderId, "OS invalida");
        OrdemServico storage os = ordens[osId];
        require(msg.sender == os.fiscal, "Apenas fiscal pode recusar");
        require(os.status == Status.ConcluidaPeloPrestador, "OS nao esta pronta para recusa");

        os.status = Status.Recusada;
        require(usdc.transfer(os.contratante, os.valor), "Falha ao transferir USDC para contratante");

        emit OrdemRecusada(osId, msg.sender);
    }

    function solicitarRevisao(uint256 osId) external nonReentrant {
        require(osId < nextOrderId, "OS invalida");
        OrdemServico storage os = ordens[osId];
        require(msg.sender == os.fiscal, "Apenas fiscal pode solicitar revisao");
        require(os.status == Status.ConcluidaPeloPrestador, "OS nao esta pronta para revisao");

        os.status = Status.Criada;

        emit OrdemEmRevisao(osId, msg.sender);
    }

    function getOrdem(uint256 osId) external view returns (OrdemServico memory) {
        require(osId < nextOrderId, "OS invalida");
        return ordens[osId];
    }

    function getOrdensByPrestador(address prestador) external view returns (uint256[] memory) {
        return ordemPorPrestador[prestador];
    }

    function getOrdensByFiscal(address fiscal) external view returns (uint256[] memory) {
        return ordemPorFiscal[fiscal];
    }
}
