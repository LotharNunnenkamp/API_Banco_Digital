const {Router} = require('express');
const {validarSenha} = require('./middleware');
const {
    criarContaBancaria,
    listarContasBancarias,
    atualizarDadosUsuario,
    excluirContaBancaria,
    depositar,
    sacar,
    transferir,
    consultarSaldo,
    emitirExtrato
} = require('./controladores/conta_bancaria')

const rotas = Router();

rotas.post('/contas', criarContaBancaria);
rotas.get('/contas', validarSenha, listarContasBancarias);
rotas.put('/contas/:numeroConta/usuario', atualizarDadosUsuario);
rotas.delete('/contas/:numeroConta', excluirContaBancaria);
rotas.post('/transacoes/depositar', depositar);
rotas.post('/transacoes/sacar', sacar);
rotas.post('/transacoes/transferir', transferir);
rotas.get('/contas/saldo', consultarSaldo);
rotas.get('/contas/extrato', emitirExtrato);

module.exports = {rotas};