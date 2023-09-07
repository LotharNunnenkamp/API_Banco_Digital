const {banco} = require('./banco de dados/bancodedados');

const validarSenha = (req, res, next) => {
    const {senha_banco} = req.query;
    
    if (senha_banco !== banco.senha) {
        return res.status(401).json({mensagem: "A senha do banco informada é inválida!"})
    }

    if (!senha_banco) {
        return res.status(401).json({mensagem: "Favor, informar a senha do banco."})
    }

    next();
}




module.exports = {validarSenha}