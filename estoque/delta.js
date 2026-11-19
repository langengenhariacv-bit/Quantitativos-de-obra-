/* Compartilhado com a API. Sintaxe ES5 para o Safari do iOS 9. */
var EstoqueDelta = (function () {
  var listas = ['materiais', 'obras', 'movs', 'pessoas'];
  var campos = ['empresa', 'seq', 'catalogo', 'ultimoResp'];
  var tem = function (obj, nome) { return Object.prototype.hasOwnProperty.call(obj, nome); };

  function porId(lista) {
    var indice = Object.create(null);
    lista.forEach(function (item) { indice[item.id] = item; });
    return indice;
  }

  function copiar(dados) {
    var copia = Object.create(null);
    Object.keys(dados).forEach(function (nome) { copia[nome] = dados[nome]; });
    listas.forEach(function (nome) { copia[nome] = dados[nome].slice(); });
    return copia;
  }

  // Os registros editados são substituídos no app. Registros iguais mantêm a referência.
  function comparar(antes, depois) {
    var alteracoes = {};
    campos.forEach(function (nome) {
      if (antes[nome] !== depois[nome]) alteracoes[nome] = depois[nome];
    });
    listas.forEach(function (nome) {
      var anteriores = porId(antes[nome]);
      var atuais = porId(depois[nome]);
      var salvar = depois[nome].filter(function (item) { return anteriores[item.id] !== item; });
      var remover = antes[nome].filter(function (item) { return !tem(atuais, item.id); })
        .map(function (item) { return item.id; });
      if (salvar.length || remover.length) alteracoes[nome] = { salvar: salvar, remover: remover };
    });
    return alteracoes;
  }

  function exigir(condicao) {
    if (!condicao) throw new Error('Alterações do estoque inválidas.');
  }

  function objeto(valor) {
    return valor && typeof valor === 'object' && !Array.isArray(valor);
  }

  function aplicar(dados, alteracoes) {
    exigir(objeto(alteracoes));
    var resultado = Object.create(null);
    Object.keys(dados).forEach(function (nome) { resultado[nome] = dados[nome]; });
    Object.keys(alteracoes).forEach(function (nome) {
      var valor = alteracoes[nome];
      if (campos.indexOf(nome) !== -1) {
        exigir(nome === 'seq' || nome === 'catalogo' ? typeof valor === 'number' : typeof valor === 'string');
        resultado[nome] = valor;
        return;
      }
      exigir(listas.indexOf(nome) !== -1 && objeto(valor) &&
        Array.isArray(valor.salvar) && Array.isArray(valor.remover));
      var existentes = porId(dados[nome]);
      var remover = Object.create(null);
      var salvar = Object.create(null);
      valor.remover.forEach(function (id) {
        exigir(typeof id === 'string' && tem(existentes, id) && !tem(remover, id));
        remover[id] = true;
      });
      valor.salvar.forEach(function (item) {
        exigir(objeto(item) && typeof item.id === 'string' && !tem(salvar, item.id) && !tem(remover, item.id));
        salvar[item.id] = item;
      });
      resultado[nome] = dados[nome].filter(function (item) { return !tem(remover, item.id); })
        .map(function (item) { return salvar[item.id] || item; });
      valor.salvar.forEach(function (item) {
        if (!tem(existentes, item.id)) resultado[nome].push(item);
      });
    });
    return resultado;
  }

  return { copiar: copiar, comparar: comparar, aplicar: aplicar };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = EstoqueDelta;
