const {contas} = require('./banco de dados/bancodedados')

const validarConta = (numeroDaConta) => {
    const resultado = contas.find((conta) => {
        return conta.numero === Number(numeroDaConta);
    })
    return resultado;
}

const validarCpf = (numeroCPF) => {
    const resultado = contas.find((conta) => {
        return conta.usuario.cpf === numeroCPF;
    })
    return resultado;
}

const validarEmail = (email) => {
    const resultado = contas.find((conta) => {
        return conta.usuario.email === email;
    })
    return resultado;
}

module.exports = {validarConta, validarCpf, validarEmail}