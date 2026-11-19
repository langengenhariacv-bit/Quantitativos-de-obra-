/* Transporte compatível com o Safari do iOS 9. A sessão fica na memória da aba. */
var EstoqueCompartilhado = (function () {
  var endpoint = 'https://br-curly-queen-bdjbpps0-estoque.compute.c-8.us-east-2.aws.neon.tech/';
  var token = '';

  function enviar(acao, dados) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('POST', endpoint);
      req.timeout = 35000;
      function indisponivel() {
        reject(new Error('Sem conexão com o estoque compartilhado. Tente novamente.'));
      }
      req.onerror = req.ontimeout = indisponivel;
      req.onload = function () {
        var resposta;
        try { resposta = JSON.parse(req.responseText); }
        catch (error) {
          if (req.status === 413) reject(new Error('O arquivo é grande demais para enviar de uma vez.'));
          else indisponivel();
          return;
        }
        if (req.status >= 200 && req.status < 300) {
          resolve(resposta);
          return;
        }
        var falha = new Error(resposta.erro || 'Não foi possível concluir a operação.');
        falha.status = req.status;
        reject(falha);
      };
      var corpo = dados || {};
      corpo.acao = acao;
      if (token) corpo.token = token;
      req.setRequestHeader('Content-Type', 'text/plain');
      req.send(JSON.stringify(corpo));
    });
  }

  return {
    enviar: enviar,
    sessao: function (valor) { token = valor; },
    sair: function () {
      if (!token) return;
      enviar('sair').catch(function () {});
      token = '';
    }
  };
})();
