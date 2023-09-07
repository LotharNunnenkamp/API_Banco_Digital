let { banco, contas, saques, depositos, transferencias } = require('../banco de dados/bancodedados');

const { format } = require('date-fns');

const { validarConta, validarCpf, validarEmail } = require('../validacoes')

const criarContaBancaria = (req, res) => {
    try {
        const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

        if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
            return res.status(400).json({ mensagem: "Favor, preencher todos os campos (Nome, CPF, Data de Nascimento, Telefone, Email e Senha)." })
        }

        const existeCpf = validarCpf(cpf);
        const existeEmail = validarEmail(email);

        if (existeCpf || existeEmail) {
            return res.status(409).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" })
        }

        let numeroConta = 1;
        if (contas.length >= 1) {
            numeroConta = contas[contas.length - 1].numero + 1;
        }

        const novaConta = {
            numero: numeroConta,
            saldo: 0,
            usuario: {
                ...req.body
            }
        }

        contas.push(novaConta);

        return res.status(204).send();
    }
    catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro interno do servidor." })
    }
}

const listarContasBancarias = (req, res) => {
    try {
        return res.status(200).json(contas);
    }
    catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro interno do servidor." })
    }
}

const atualizarDadosUsuario = (req, res) => {
    try {
        const { numeroConta } = req.params;

        const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

        if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
            return res.status(400).json({ mensagem: "Favor, preencher todos os campos (Nome, CPF, Data de Nascimento, Telefone, Email e Senha)." })
        }

        let contaUsuario = validarConta(numeroConta);

        if (!contaUsuario) {
            return res.status(404).json({ mensagem: "O número da conta não é válido." })
        }

        const existeCpf = validarCpf(cpf);
        const existeEmail = validarEmail(email);

        if (contaUsuario.numero !== existeCpf.numero || contaUsuario.numero !== existeEmail.numero) {
            if (existeCpf || existeEmail) {
                return res.status(409).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" })
            }
        }

        contaUsuario.usuario = {
            ...req.body
        }

        return res.status(204).send();
    }
    catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro interno do servidor." })
    }
}

const excluirContaBancaria = (req, res) => {
    try {
        const { numeroConta } = req.params;

        let contaUsuario = validarConta(numeroConta);

        if (!contaUsuario) {
            return res.status(404).json({ mensagem: "O número da conta não é válido." })
        }

        if (contaUsuario.saldo !== 0) {
            return res.status().json({ mensagem: "A conta só pode ser removida se o saldo for zero!" })
        }

        const contasAtualizadas = contas.filter((conta) => {
            return conta.numero !== Number(numeroConta);
        })

        contas = contasAtualizadas;

        return res.status(204).send();
    }
    catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro interno do servidor." })
    }
}

const depositar = (req, res) => {
    try {
        const { numero_conta, valor } = req.body;

        if (!numero_conta || !valor) {
            return res.status(400).json({ mensagem: "O número da conta e o valor são obrigatórios!" });
        }

        let contaUsuario = validarConta(numero_conta);

        if (!contaUsuario) {
            return res.status(404).json({ mensagem: "O número da conta não é válido." })
        }

        if (Number(valor) <= 0) {
            return res.status(400).json({ mensagem: "O valor de depósito deve ser maior que zero." })
        }

        contaUsuario.saldo += Number(valor);

        const data = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

        depositos.push({
            data,
            numero_conta: contaUsuario.numero,
            valor
        })

        return res.status(204).send();
    }
    catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro interno do servidor." })
    }
}


const sacar = (req, res) => {
    try {
        const { numero_conta, valor, senha } = req.body;

        if (!numero_conta || !valor || !senha) {
            return res.status(400).json({ mensagem: "O número da conta, valor e senha são obrigatórios." })
        }

        let contaUsuario = validarConta(numero_conta);

        if (!contaUsuario) {
            return res.status(404).json({ mensagem: "O número da conta não é válido." })
        }

        if (senha !== contaUsuario.usuario.senha) {
            return res.status(400).json({ mensagem: "Senha incorreta." })
        }

        if (contaUsuario.saldo < Number(valor)) {
            return res.status(400).json({ mensagem: "Saldo insuficiente." })
        }

        contaUsuario.saldo -= Number(valor);

        const data = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

        saques.push({
            data,
            numero_conta: contaUsuario.numero,
            valor
        })

        return res.status(204).send();
    }
    catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro interno do servidor." })
    }
}

const transferir = (req, res) => {
    try {
        const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

        if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
            return res.status(400).json({ mensagem: "Os números das contas de origem e de destino, valor e senha são obrigatórios." })
        }

        let contaUsuarioOrigem = validarConta(numero_conta_origem);
        let contaUsuarioDestino = validarConta(numero_conta_destino);

        if (!contaUsuarioOrigem) {
            return res.status(404).json({ mensagem: "O número da conta de origem não é válido." })
        }

        if (!contaUsuarioDestino) {
            return res.status(404).json({ mensagem: "O número da conta de destino não é válido." })
        }

        if (contaUsuarioOrigem.usuario.senha !== senha) {
            return res.status(400).json({ mensagem: "Senha inválida." })
        }

        if (contaUsuarioOrigem.saldo < Number(valor)) {
            return res.status(400).json({ mensagem: "Saldo insuficiente!" })
        }

        contaUsuarioOrigem.saldo -= Number(valor);
        contaUsuarioDestino.saldo += Number(valor);

        const data = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

        transferencias.push({
            data,
            numero_conta_origem,
            numero_conta_destino,
            valor
        })

        return res.status(204).send();
    }
    catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro interno do servidor." })
    }
}

const consultarSaldo = (req, res) => {
    try {
        const { numero_conta, senha } = req.query;

        if (!numero_conta || !senha) {
            return res.status(400).json({ mensagem: "O número da conta e a senha são obrigatórios." })
        }

        let contaUsuario = validarConta(numero_conta);

        if (!contaUsuario) {
            return res.status(404).json({ mensagem: "Conta bancária não encontrada!" })
        }

        if (contaUsuario.usuario.senha !== senha) {
            return res.status(400).json({ mensagem: "Senha inválida." })
        }

        const saldo = {
            saldo: contaUsuario.saldo
        }

        return res.status(200).json(saldo);
    }
    catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro interno do servidor." })
    }
}

const emitirExtrato = (req, res) => {
    try {
        const { numero_conta, senha } = req.query;

        if (!numero_conta || !senha) {
            return res.status(400).json({ mensagem: "O número da conta e a senha são obrigatórios." })
        }

        let contaUsuario = validarConta(numero_conta);

        if (!contaUsuario) {
            return res.status(404).json({ mensagem: "Conta bancária não encontrada!" })
        }

        if (contaUsuario.usuario.senha !== senha) {
            return res.status(400).json({ mensagem: "Senha inválida." })
        }

        const depositosConta = depositos.filter((deposito) => {
            return deposito.numero_conta === Number(numero_conta);
        })

        const saquesConta = saques.filter((saque) => {
            return saque.numero_conta === Number(numero_conta);
        })

        const transferenciasEnviadasConta = transferencias.filter((transferencia) => {
            return transferencia.numero_conta_origem === numero_conta;
        })

        const transferenciasRecebidasConta = transferencias.filter((transferencia) => {
            return transferencia.numero_conta_destino === numero_conta;
        })

        const extrato = {
            depositos: depositosConta,
            saques: saquesConta,
            transferenciasEnviadas: transferenciasEnviadasConta,
            transferenciasRecebidas: transferenciasRecebidasConta
        }

        return res.status(200).json(extrato);
    }
    catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: "Erro interno do servidor." })
    }
}

module.exports = {
    criarContaBancaria,
    listarContasBancarias,
    atualizarDadosUsuario,
    excluirContaBancaria,
    depositar,
    sacar,
    transferir,
    consultarSaldo,
    emitirExtrato
}