/* GERADO por tools/estoque-legacy/build.js a partir de estoque/app.js. Não edite à mão. */
/* Complementos para navegadores antigos (Safari do iOS 9). Só entra na versão app-legacy.js. */
(function(){
  if(!Object.entries)Object.entries=function(o){return Object.keys(o).map(function(k){return [k,o[k]]})};
  if(!Object.values)Object.values=function(o){return Object.keys(o).map(function(k){return o[k]})};
  if(!Object.fromEntries)Object.fromEntries=function(a){var o={};for(var i=0;i<a.length;i++)o[a[i][0]]=a[i][1];return o};
  if(!Array.prototype.includes)Object.defineProperty(Array.prototype,'includes',{value:function(x){return this.indexOf(x)>=0||(x!==x&&this.some(function(y){return y!==y}))}});
  if(!Array.prototype.flatMap)Object.defineProperty(Array.prototype,'flatMap',{value:function(f,t){var r=[];this.forEach(function(x,i,a){var v=f.call(t,x,i,a);if(Array.isArray(v))r.push.apply(r,v);else r.push(v)});return r}});
  if(window.NodeList&&!NodeList.prototype.forEach)NodeList.prototype.forEach=Array.prototype.forEach;
  var E=window.Element&&Element.prototype;
  if(E&&!E.matches)E.matches=E.webkitMatchesSelector||E.msMatchesSelector;
  if(E&&!E.closest)E.closest=function(s){var el=this;while(el&&el.nodeType===1){if(el.matches(s))return el;el=el.parentNode}return null};
})();

'use strict';
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? (c > 1 && (G.n = c < 3 ? -1 : u), d(c, u)) : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelperLoose(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (t) return (t = t.call(r)).next.bind(t); if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var o = 0; return function () { return o >= r.length ? { done: !0 } : { done: !1, value: r[o++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var KEY = 'lang-estoque-v1';
var CATS = [['Cimento e argamassa', '🪣'], ['Agregados', '⛰️'], ['Aço e ferragens', '🔩'], ['Alvenaria', '🧱'], ['Hidráulica', '🚰'], ['Elétrica', '⚡'], ['Madeira e fôrmas', '🪵'], ['Revestimento', '🔲'], ['Pintura', '🎨'], ['Ferramentas', '🧰'], ['EPI', '🦺'], ['Outros', '📦']];
var CAT_ICON = Object.fromEntries(CATS);
var ICONS = [['🪣', 'cimento argamassa rejunte cal balde graute'], ['🧱', 'bloco tijolo telha'], ['⛰️', 'areia'], ['🪨', 'brita pedra pedrisco seixo'], ['🔩', 'vergalhao ferro aco parafuso tela trelica prego'], ['➰', 'arame'], ['🪵', 'tabua madeira pinus caibro sarrafo compensado ripa pontalete'], ['🚰', 'tubo cano pvc conexao joelho registro'], ['🚿', 'chuveiro ducha'], ['🚽', 'vaso sanitario louca'], ['🔌', 'cabo fio tomada interruptor disjuntor eletroduto'], ['💡', 'lampada luminaria refletor'], ['🎨', 'tinta selador textura'], ['🖌️', 'pincel rolo trincha'], ['⛑️', 'capacete'], ['🧤', 'luva'], ['🦺', 'colete'], ['🥾', 'bota botina'], ['🥽', 'oculos'], ['🔨', 'martelo marreta'], ['🪚', 'serra serrote disco'], ['🪛', 'chave fenda broca'], ['🔧', 'chave inglesa'], ['🧰', 'ferramenta caixa'], ['📏', 'trena nivel regua prumo'], ['🪜', 'escada andaime'], ['🧪', 'aditivo impermeabilizante manta'], ['🛢️', 'tambor oleo desmoldante'], ['🔲', 'piso ceramica porcelanato azulejo revestimento'], ['🚪', 'porta'], ['🪟', 'janela vidro'], ['🔗', 'corrente'], ['🧵', 'fita lona'], ['🧹', 'vassoura'], ['🛒', 'carrinho'], ['💧', 'agua'], ['🧴', 'adesivo selante cola espuma'], ['😷', 'mascara'], ['🛞', 'pneu'], ['🔥', 'macarico botijao gas'], ['🌿', 'rocadeira mato'], ['✏️', 'lapis'], ['🔦', 'refletor'], ['🧽', 'escova desempenadeira'], ['🎛️', 'quadro disjuntor barramento'], ['🔘', 'botao interruptor'], ['📄', 'lixa'], ['🧷', 'abracadeira cinta'], ['📌', 'prego'], ['💿', 'disco'], ['⬜', 'placa'], ['📡', 'sensor fotocelula'], ['🌀', 'aspirador'], ['⚫', 'carvao'], ['⚙️', 'peca'], ['📦', '']];
var UNITS = ['un', 'saco', 'kg', 't', 'm', 'm²', 'm³', 'barra', 'pç', 'cx', 'lata', 'galão', 'L', 'rolo', 'milheiro', 'par', 'jogo', 'pct', 'folha'];
var COLORS = ['#ff5a00', '#2d6bd6', '#16855f', '#7a5bd1', '#d6336c', '#0f9aa8', '#c9890a', '#5b6470', '#8d5524', '#3d9b2f'];
var TIPOS = {
  entrada: {
    nome: 'Entrada',
    ic: '📥',
    cls: 'in'
  },
  saida: {
    nome: 'Saída',
    ic: '🚚',
    cls: 'out'
  },
  devolucao: {
    nome: 'Devolução',
    ic: '↩️',
    cls: 'back'
  },
  ajuste: {
    nome: 'Ajuste',
    ic: '⚖️',
    cls: 'adj'
  }
};
function blank() {
  return {
    empresa: 'LANG Engenharia',
    seq: 0,
    materiais: [],
    obras: [],
    movs: [],
    ultimoResp: '',
    pessoas: []
  };
}
function load() {
  try {
    var d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.materiais) && Array.isArray(d.obras) && Array.isArray(d.movs)) return Object.assign(blank(), d);
  } catch (e) {}
  return blank();
}
var db = load();
var calculos = null,
  movimentosOrdenados = null;
function invalidarCalculos() {
  calculos = null;
  movimentosOrdenados = null;
}
function save() {
  invalidarCalculos();
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    toast('⚠️ Não foi possível salvar no aparelho. Exporte um backup.');
    return false;
  }
}
var uid = function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
};
var aparelhoAntigo = document.documentElement.classList.contains('legacy');
var modo = 'consultando',
  versao = 0,
  confirmado = null,
  ocupada = false,
  ativando = false,
  perfis = [];
var nuvem = function nuvem() {
  return modo === 'online';
};
var senhaOk = function senhaOk(senha) {
  return senha.length >= 10 && senha.length <= 128;
};
function bloquearRede(bloquear) {
  ocupada = bloquear;
  var anterior = document.getElementById('redeOcupada');
  if (anterior) anterior.remove();
  if (!bloquear) return;
  var aviso = document.createElement('div');
  aviso.id = 'redeOcupada';
  aviso.setAttribute('role', 'status');
  aviso.textContent = 'Aguarde…';
  aviso.style.cssText = 'position:fixed;z-index:9999;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,.6);color:white;text-align:center;padding-top:25vh;font-size:22px';
  if (document.activeElement) document.activeElement.blur();
  document.body.appendChild(aviso);
}
document.addEventListener('keydown', function (e) {
  if (ocupada) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
}, true);
function usarEstoque(resposta) {
  if (resposta.token) EstoqueCompartilhado.sessao(resposta.token);
  db = resposta.dados ? Object.assign(blank(), resposta.dados) : resposta.alteracoes.reduce(EstoqueDelta.aplicar, confirmado);
  invalidarCalculos();
  versao = resposta.versao;
  confirmado = EstoqueDelta.copiar(db);
  U = resposta.pessoa;
}
function persistir(_x) {
  return _persistir.apply(this, arguments);
}
function _persistir() {
  _persistir = _asyncToGenerator(_regenerator().m(function _callee6(opcoes) {
    var anterior, dados, resultado, _t6;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          if (opcoes === void 0) {
            opcoes = {};
          }
          if (nuvem()) {
            _context6.n = 1;
            break;
          }
          return _context6.a(2, save());
        case 1:
          if (!(ocupada || !U)) {
            _context6.n = 2;
            break;
          }
          return _context6.a(2, false);
        case 2:
          invalidarCalculos();
          anterior = confirmado;
          bloquearRede(true);
          _context6.p = 3;
          dados = opcoes.restaurar ? {
            dados: db
          } : {
            alteracoes: EstoqueDelta.comparar(anterior, db)
          };
          _context6.n = 4;
          return EstoqueCompartilhado.enviar('salvar', _extends({}, dados, {
            versao: versao
          }, opcoes));
        case 4:
          resultado = _context6.v;
          versao = resultado.versao;
          U = resultado.pessoa;
          confirmado = EstoqueDelta.copiar(db);
          return _context6.a(2, true);
        case 5:
          _context6.p = 5;
          _t6 = _context6.v;
          if (!(confirmado !== anterior)) {
            _context6.n = 6;
            break;
          }
          return _context6.a(2, false);
        case 6:
          db = EstoqueDelta.copiar(anterior);
          invalidarCalculos();
          if (!(_t6.status === 401)) {
            _context6.n = 7;
            break;
          }
          logout(_t6.message);
          _context6.n = 9;
          break;
        case 7:
          if (!(_t6.status === 409)) {
            _context6.n = 8;
            break;
          }
          _context6.n = 8;
          return atualizarEstoque(true);
        case 8:
          toast(_t6.message);
        case 9:
          return _context6.a(2, false);
        case 10:
          _context6.p = 10;
          bloquearRede(false);
          return _context6.f(10);
        case 11:
          return _context6.a(2);
      }
    }, _callee6, null, [[3, 5, 10, 11]]);
  }));
  return _persistir.apply(this, arguments);
}
function atualizarEstoque(_x2) {
  return _atualizarEstoque.apply(this, arguments);
}
function _atualizarEstoque() {
  _atualizarEstoque = _asyncToGenerator(_regenerator().m(function _callee7(conflito) {
    var atual, revisao, resposta, _t7;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.p = _context7.n) {
        case 0:
          atual = U, revisao = versao;
          if (!(!nuvem() || !atual || !conflito && (ocupada || F || $('#sheetBg') || document.hidden))) {
            _context7.n = 1;
            break;
          }
          return _context7.a(2);
        case 1:
          _context7.p = 1;
          _context7.n = 2;
          return EstoqueCompartilhado.enviar('ler', {
            versao: revisao,
            incremental: true
          });
        case 2:
          resposta = _context7.v;
          if (!(!U || U.id !== atual.id || versao !== revisao || !conflito && (ocupada || F || $('#sheetBg')) || !resposta.dados && !resposta.alteracoes)) {
            _context7.n = 3;
            break;
          }
          return _context7.a(2);
        case 3:
          usarEstoque(resposta);
          if (conflito) {
            F = null;
            closeSheet();
            location.hash = '#inicio';
          }
          render();
          _context7.n = 5;
          break;
        case 4:
          _context7.p = 4;
          _t7 = _context7.v;
          if (_t7.status === 401 && U && U.id === atual.id && versao === revisao && (conflito || !ocupada)) logout(_t7.message);
        case 5:
          return _context7.a(2);
      }
    }, _callee7, null, [[1, 4]]);
  }));
  return _atualizarEstoque.apply(this, arguments);
}
function abrirEstoque() {
  return _abrirEstoque.apply(this, arguments);
}
function _abrirEstoque() {
  _abrirEstoque = _asyncToGenerator(_regenerator().m(function _callee8() {
    var resposta, _t8;
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.p = _context8.n) {
        case 0:
          _context8.p = 0;
          _context8.n = 1;
          return EstoqueCompartilhado.enviar('estado');
        case 1:
          resposta = _context8.v;
          modo = resposta.ativo ? 'online' : 'local';
          perfis = resposta.pessoas || [];
          db = nuvem() ? blank() : load();
          invalidarCalculos();
          if (!nuvem() && (db.catalogo || 0) < CATALOGO_VERSAO) {
            aplicaCatalogo();
            save();
          }
          _context8.n = 3;
          break;
        case 2:
          _context8.p = 2;
          _t8 = _context8.v;
          modo = 'indisponivel';
        case 3:
          render();
        case 4:
          return _context8.a(2);
      }
    }, _callee8, null, [[0, 2]]);
  }));
  return _abrirEstoque.apply(this, arguments);
}
function telaCompartilhada() {
  if (modo === 'consultando' || modo === 'indisponivel') {
    return '<div class="lock"><div class="lock-h"><span class="mk">📦</span><div><b>Lang Estoque</b><small>' + (modo === 'consultando' ? 'Conectando ao estoque…' : 'O estoque está indisponível. Confira sua conexão.') + '</small></div></div>' + (modo === 'indisponivel' ? '<button class="btn primary" onclick="abrirEstoque()">Tentar novamente</button>' : '') + '</div>';
  }
  var pessoa = perfis.find(function (p) {
    return p.id === lockSel;
  });
  if (pessoa) {
    var pin = pessoa.tipo === 'pin';
    return "<div class=\"lock\"><div class=\"pinbox\">\n      <button class=\"link\" style=\"color:#ff9a5f\" onclick=\"lockSel=null;renderLock()\">\u2039 Trocar pessoa</button>\n      <div class=\"mt2\">" + avatar(pessoa, 96) + "</div><h2 class=\"mt\">" + esc(pessoa.nome) + "</h2>\n      <form class=\"card mt2\" style=\"color:var(--ink);text-align:left\" onsubmit=\"return entrarCompartilhado(event)\">\n        <div class=\"f\"><label for=\"cSenha\">" + (pin ? 'PIN de 4 dígitos' : 'Senha') + "</label>\n        <input id=\"cSenha\" type=\"password\" autocomplete=\"current-password\" required " + (pin ? 'inputmode="numeric" pattern="[0-9]{4}" maxlength="4"' : 'maxlength="128"') + "></div>\n        <button class=\"btn primary lg full\" type=\"submit\">Entrar</button>\n      </form></div></div>";
  }
  return "<div class=\"lock\"><div class=\"lock-h\"><span class=\"mk\">\uD83D\uDCE6</span><div><b>Lang Estoque</b><small>Toque na sua foto para entrar.</small></div></div>\n    <div class=\"people\">" + perfis.map(function (p) {
    return "<button class=\"person\" data-id=\"" + esc(p.id) + "\" onclick=\"selecionarPerfil(this.dataset.id)\">" + avatar(p, 88) + "<span>" + esc(p.nome) + "</span>" + (p.admin ? '<small>Administrador</small>' : '') + "</button>";
  }).join('') + "</div>\n    <button class=\"link mt2\" style=\"color:#ff9a5f\" onclick=\"atualizarPerfis()\">Atualizar pessoas</button></div>";
}
function selecionarPerfil(id) {
  lockSel = id;
  renderLock();
  var input = $('#cSenha');
  if (input) input.focus();
}
function atualizarPerfis() {
  return _atualizarPerfis.apply(this, arguments);
}
function _atualizarPerfis() {
  _atualizarPerfis = _asyncToGenerator(_regenerator().m(function _callee9() {
    var resposta, _t9;
    return _regenerator().w(function (_context9) {
      while (1) switch (_context9.p = _context9.n) {
        case 0:
          _context9.p = 0;
          _context9.n = 1;
          return EstoqueCompartilhado.enviar('estado');
        case 1:
          resposta = _context9.v;
          if (!(!nuvem() || U)) {
            _context9.n = 2;
            break;
          }
          return _context9.a(2);
        case 2:
          perfis = resposta.pessoas || [];
          if (!lockSel || !perfis.some(function (p) {
            return p.id === lockSel;
          })) renderLock();
          _context9.n = 4;
          break;
        case 3:
          _context9.p = 3;
          _t9 = _context9.v;
          if (!U) toast(_t9.message);
        case 4:
          return _context9.a(2);
      }
    }, _callee9, null, [[0, 3]]);
  }));
  return _atualizarPerfis.apply(this, arguments);
}
function entrarCompartilhado(evento) {
  evento.preventDefault();
  if (ocupada) return false;
  var senha = $('#cSenha').value;
  iniciarSessao('entrar', {
    pessoa: lockSel,
    senha: senha
  });
  return false;
}
function iniciarSessao(_x3, _x4) {
  return _iniciarSessao.apply(this, arguments);
}
function _iniciarSessao() {
  _iniciarSessao = _asyncToGenerator(_regenerator().m(function _callee0(acao, payload) {
    var fotos, ids, resposta, _t0;
    return _regenerator().w(function (_context0) {
      while (1) switch (_context0.p = _context0.n) {
        case 0:
          if (!ocupada) {
            _context0.n = 1;
            break;
          }
          return _context0.a(2);
        case 1:
          bloquearRede(true);
          _context0.p = 2;
          if (!(acao === 'ativar')) {
            _context0.n = 4;
            break;
          }
          _context0.n = 3;
          return fotoTodas();
        case 3:
          fotos = _context0.v;
          ids = new Set(payload.dados.movs.filter(function (mov) {
            return mov.foto;
          }).map(function (mov) {
            return mov.id;
          }));
          payload.fotos = {};
          Object.keys(fotos).filter(function (id) {
            return ids.has(id);
          }).forEach(function (id) {
            payload.fotos[id] = fotos[id];
          });
        case 4:
          _context0.n = 5;
          return EstoqueCompartilhado.enviar(acao, payload);
        case 5:
          resposta = _context0.v;
          modo = 'online';
          ativando = false;
          usarEstoque(resposta);
          lockSel = null;
          pinBuf = '';
          lastAct = Date.now();
          if (!location.hash) location.hash = '#inicio';
          closeSheet();
          render();
          toast(acao === 'ativar' ? 'Estoque compartilhado ativado' : 'Olá, ' + U.nome.split(' ')[0] + '!');
          _context0.n = 8;
          break;
        case 6:
          _context0.p = 6;
          _t0 = _context0.v;
          if (!(acao === 'ativar' && _t0.status === 409)) {
            _context0.n = 7;
            break;
          }
          ativando = false;
          _context0.n = 7;
          return abrirEstoque();
        case 7:
          toast(_t0.message);
        case 8:
          _context0.p = 8;
          bloquearRede(false);
          return _context0.f(8);
        case 9:
          return _context0.a(2);
      }
    }, _callee0, null, [[2, 6, 8, 9]]);
  }));
  return _iniciarSessao.apply(this, arguments);
}
function telaAtivacao() {
  var admins = db.pessoas.filter(function (p) {
    return p.admin && p.ativo !== false;
  });
  var conta = admins.length ? '<div class="f"><label for="atAdm">Administrador neste aparelho</label><select id="atAdm">' + admins.map(function (p) {
    return '<option value="' + esc(p.id) + '">' + esc(p.nome) + '</option>';
  }).join('') + '</select></div>' + '<div class="f"><label for="atPin">PIN usado neste aparelho</label><input id="atPin" type="password" inputmode="numeric" maxlength="4" required></div>' : '<div class="f"><label for="atNome">Nome do administrador</label><input id="atNome" maxlength="120" required></div>';
  return '<div class="lock"><div class="lock-h"><span class="mk">📦</span><div><b>Ativar estoque compartilhado</b><small>Faça isso no aparelho onde estão os cadastros.</small></div></div>' + '<form class="card" style="max-width:460px;margin:0 auto;color:var(--ink)" onsubmit="return ativarCompartilhado(event)">' + '<p class="small muted">A ativação copia os dados deste aparelho para o estoque da equipe. Depois, ajuste as senhas dos demais usuários em Configurações → Pessoas.</p>' + conta + '<div class="f"><label for="atCodigo">Código de ativação</label><input id="atCodigo" type="password" autocomplete="off" required></div>' + '<div class="f"><label for="atSenha">Nova senha (mínimo de 10 caracteres)</label><input id="atSenha" type="password" autocomplete="new-password" required maxlength="128"></div>' + '<div class="f"><label for="atSenha2">Repita a senha</label><input id="atSenha2" type="password" autocomplete="new-password" required maxlength="128"></div>' + '<button class="btn primary full" type="submit">Ativar e entrar</button>' + '<button class="btn soft full mt" type="button" onclick="ativando=false;renderLock()">Voltar</button></form></div>';
}
function ativarCompartilhado(evento) {
  evento.preventDefault();
  if (ocupada) return false;
  var senha = $('#atSenha').value;
  if (!senhaOk(senha) || senha !== $('#atSenha2').value) {
    toast('Digite a mesma senha nos dois campos, com pelo menos 10 caracteres.');
    return false;
  }
  var dados = JSON.parse(JSON.stringify(db));
  var pessoa;
  if ($('#atAdm')) {
    pessoa = dados.pessoas.find(function (p) {
      return p.id === $('#atAdm').value && p.admin && p.ativo !== false;
    });
    if (!pessoa || hpin(pessoa.id, $('#atPin').value) !== pessoa.pin) {
      toast('PIN incorreto.');
      return false;
    }
  } else {
    var nome = $('#atNome').value.trim();
    if (!nome) {
      toast('Informe o nome do administrador.');
      return false;
    }
    pessoa = {
      id: uid(),
      nome: nome,
      admin: true,
      ativo: true,
      criado: Date.now()
    };
    dados.pessoas.push(pessoa);
  }
  dados.pessoas.forEach(function (p) {
    delete p.pin;
  });
  iniciarSessao('ativar', {
    codigo: $('#atCodigo').value.trim(),
    senha: senha,
    dados: dados,
    pessoa: pessoa.id
  });
  return false;
}
var $ = function $(s) {
  return document.querySelector(s);
};
var esc = function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c];
  });
};
function fmtBR(v, dec, fix) {
  var neg = v < 0;
  var x = Math.abs(+v || 0);
  var p = Math.pow(10, dec);
  x = Math.round(x * p) / p;
  var _x$toFixed$split = x.toFixed(dec).split('.'),
    i = _x$toFixed$split[0],
    f = _x$toFixed$split[1];
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (!fix && f) f = f.replace(/0+$/, '');
  return (neg ? '-' : '') + i + (f ? ',' + f : '');
}
var temIntl = typeof Intl !== 'undefined' && Intl.NumberFormat && function () {
  try {
    return new Intl.NumberFormat('pt-BR').format(1234.5) === '1.234,5';
  } catch (e) {
    return false;
  }
}();
var nf = temIntl ? new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2
}) : {
  format: function format(v) {
    return fmtBR(v, 2, false);
  }
};
var brl = temIntl ? new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}) : {
  format: function format(v) {
    return 'R$ ' + fmtBR(v, 2, true);
  }
};
var brl0 = temIntl ? new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0
}) : {
  format: function format(v) {
    return 'R$ ' + fmtBR(v, 0, true);
  }
};
var fq = function fq(v) {
  return nf.format(Math.round((+v || 0) * 100) / 100);
};
var money = function money(v) {
  return Math.abs(v) >= 10000 ? brl0.format(v) : brl.format(v);
};
var today = function today() {
  var d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
var fdate = function fdate(s) {
  return s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : '';
};
var fdateS = function fdateS(s) {
  return s ? s.slice(8, 10) + '/' + s.slice(5, 7) : '';
};
var daysAgo = function daysAgo(n) {
  var d = new Date();
  d.setDate(d.getDate() - n);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
var num = function num(v) {
  if (typeof v === 'number') return v;
  var s = String(v || '').trim().replace(/\s/g, '');
  if (!s) return 0;
  var n = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s;
  var x = parseFloat(n);
  return isFinite(x) ? x : 0;
};
var matById = function matById(id) {
  return db.materiais.find(function (m) {
    return m.id === id;
  });
};
var obraById = function obraById(id) {
  return db.obras.find(function (o) {
    return o.id === id;
  });
};
var catIcon = function catIcon(c) {
  return CAT_ICON[c] || '📦';
};
function guessIcon(nome, cat) {
  var n = norm(nome);
  for (var _iterator = _createForOfIteratorHelperLoose(ICONS), _step; !(_step = _iterator()).done;) {
    var _step$value = _step.value,
      e = _step$value[0],
      k = _step$value[1];
    if (k && k.split(' ').some(function (w) {
      return n.includes(w);
    })) return e;
  }
  return catIcon(cat);
}
function matIcon(m, mostrarFoto) {
  if (mostrarFoto === void 0) {
    mostrarFoto = true;
  }
  if (!m) return '📦';
  if (m.foto && mostrarFoto) return "<img class=\"mi\" src=\"" + esc(m.foto) + "\" alt=\"\">";
  return m.ic || guessIcon(m.nome, m.cat);
}
function toast(msg) {
  document.querySelectorAll('.toast').forEach(function (x) {
    return x.remove();
  });
  var t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function () {
    return t.remove();
  }, 2600);
}
function sortedMovs() {
  if (!movimentosOrdenados) movimentosOrdenados = db.movs.slice().sort(function (a, b) {
    return (b.data || '').localeCompare(a.data || '') || (b.criado || 0) - (a.criado || 0);
  });
  return movimentosOrdenados;
}
function calc() {
  if (calculos) return calculos;
  var saldo = {},
    custoTot = {},
    custoQtd = {},
    obraQ = {},
    obraV = {},
    ult = {},
    freq = {};
  db.materiais.forEach(function (m) {
    saldo[m.id] = 0;
  });
  var sorted = db.movs.slice().sort(function (a, b) {
    return (a.data || '').localeCompare(b.data || '') || (a.criado || 0) - (b.criado || 0);
  });
  for (var _iterator2 = _createForOfIteratorHelperLoose(sorted), _step2; !(_step2 = _iterator2()).done;) {
    var mv = _step2.value;
    for (var _iterator4 = _createForOfIteratorHelperLoose(mv.itens || []), _step4; !(_step4 = _iterator4()).done;) {
      var it = _step4.value;
      var q = +it.q || 0,
        m = it.m;
      freq[m] = (freq[m] || 0) + 1;
      if (mv.tipo === 'entrada') {
        if (!mv.obra) saldo[m] = (saldo[m] || 0) + q;
        if (+it.v > 0) {
          custoTot[m] = (custoTot[m] || 0) + q * it.v;
          custoQtd[m] = (custoQtd[m] || 0) + q;
        }
      } else if (mv.tipo === 'saida') saldo[m] = (saldo[m] || 0) - q;else if (mv.tipo === 'devolucao') saldo[m] = (saldo[m] || 0) + q;else if (mv.tipo === 'ajuste') saldo[m] = (saldo[m] || 0) + q;
      ult[m] = mv.data;
    }
  }
  var custo = {};
  db.materiais.forEach(function (m) {
    custo[m.id] = custoQtd[m.id] ? custoTot[m.id] / custoQtd[m.id] : +m.preco || 0;
  });
  for (var _iterator3 = _createForOfIteratorHelperLoose(db.movs), _step3; !(_step3 = _iterator3()).done;) {
    var _mv = _step3.value;
    if (!_mv.obra) continue;
    var sg = 0;
    if (_mv.tipo === 'saida' || _mv.tipo === 'entrada') sg = 1;else if (_mv.tipo === 'devolucao') sg = -1;else continue;
    var oq = obraQ[_mv.obra] || (obraQ[_mv.obra] = {});
    for (var _iterator5 = _createForOfIteratorHelperLoose(_mv.itens || []), _step5; !(_step5 = _iterator5()).done;) {
      var _it = _step5.value;
      var _q = sg * (+_it.q || 0);
      oq[_it.m] = (oq[_it.m] || 0) + _q;
      var v = _mv.tipo === 'entrada' && +_it.v > 0 ? +_it.v : custo[_it.m] || 0;
      obraV[_mv.obra] = (obraV[_mv.obra] || 0) + _q * v;
    }
  }
  calculos = {
    saldo: saldo,
    custo: custo,
    obraQ: obraQ,
    obraV: obraV,
    ult: ult,
    freq: freq
  };
  return calculos;
}
function status(m, s) {
  if (s <= 0) return +m.min > 0 ? {
    k: 'zero',
    t: 'Sem estoque',
    c: 'var(--danger)'
  } : {
    k: 'none',
    t: 'Sem saldo',
    c: '#b7b0aa'
  };
  if (+m.min > 0 && s <= +m.min) return {
    k: 'low',
    t: 'Estoque baixo',
    c: 'var(--warn)'
  };
  return {
    k: 'ok',
    t: 'Em estoque',
    c: 'var(--in)'
  };
}
var alerta = function alerta(k) {
  return k === 'zero' || k === 'low';
};
function movValor(mv, C) {
  return (mv.itens || []).reduce(function (a, it) {
    return a + (+it.q || 0) * (mv.tipo === 'entrada' && +it.v > 0 ? +it.v : C.custo[it.m] || 0);
  }, 0);
}
function aplicaCatalogo(forcar) {
  if (typeof CATALOGO === 'undefined') return 0;
  if (!forcar && (db.catalogo || 0) >= CATALOGO_VERSAO) return 0;
  var nomes = new Set(db.materiais.map(function (m) {
    return norm(m.nome);
  }));
  var n = 0;
  for (var _iterator6 = _createForOfIteratorHelperLoose(CATALOGO), _step6; !(_step6 = _iterator6()).done;) {
    var _step6$value = _step6.value,
      nome = _step6$value[0],
      cat = _step6$value[1],
      un = _step6$value[2],
      ic = _step6$value[3];
    if (nomes.has(norm(nome))) continue;
    nomes.add(norm(nome));
    db.materiais.push({
      id: uid(),
      nome: nome,
      cat: cat,
      un: un,
      min: 0,
      preco: 0,
      local: '',
      ic: ic,
      foto: '',
      criado: Date.now()
    });
    n++;
  }
  db.catalogo = CATALOGO_VERSAO;
  return n;
}
var U = null,
  lockSel = null,
  pinBuf = '',
  falhas = 0,
  bloqAte = 0,
  lastAct = Date.now(),
  camAtiva = false;
var INATIVO_MS = 3 * 60 * 1000;
var isAdmin = function isAdmin() {
  return !!(U && U.admin);
};
function hpin(id, pin) {
  var h = 2166136261;
  var s = 'lang-estoque|' + id + '|' + pin;
  for (var i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
var pessoaById = function pessoaById(id) {
  return (db.pessoas || []).find(function (p) {
    return p.id === id;
  });
};
var AVCOR = ['#ff5a00', '#2d6bd6', '#16855f', '#7a5bd1', '#d6336c', '#0f9aa8', '#c9890a', '#5b6470'];
function avatar(p, size) {
  size = size || 40;
  var st = "width:" + size + "px;height:" + size + "px;line-height:" + size + "px;font-size:" + Math.round(size * .4) + "px";
  if (p && p.foto) return "<img class=\"av\" src=\"" + esc(p.foto) + "\" style=\"" + st + "\" alt=\"\">";
  var nm = p && p.nome || '?',
    ini = nm.trim().split(/\s+/).slice(0, 2).map(function (w) {
      return w[0];
    }).join('').toUpperCase();
  var h = 0;
  for (var i = 0; i < nm.length; i++) h = h * 31 + nm.charCodeAt(i) >>> 0;
  return "<span class=\"av\" style=\"" + st + ";background:" + AVCOR[h % AVCOR.length] + "\">" + esc(ini) + "</span>";
}
function soAdmin() {
  if (isAdmin()) return true;
  toast('🔒 Só o administrador pode fazer isso');
  return false;
}
function logout(msg) {
  if (nuvem()) {
    EstoqueCompartilhado.sair();
    db = blank();
    confirmado = null;
    versao = 0;
    invalidarCalculos();
  }
  state.limiteMov = 30;
  state.resumo = false;
  U = null;
  lockSel = null;
  pinBuf = '';
  F = null;
  window._onClose = null;
  closeSheet();
  if (location.hash && location.hash !== '#inicio') location.hash = '#inicio';
  render();
  if (nuvem()) atualizarPerfis();
  if (msg) toast(msg);
}
['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
  return document.addEventListener(ev, function () {
    lastAct = Date.now();
  }, {
    passive: true
  });
});
setInterval(function () {
  if (U && !ocupada && !camAtiva && Date.now() - lastAct > INATIVO_MS) logout('Sessão encerrada por inatividade');
}, 15000);
function renderLock() {
  var el = $('#lock'),
    ps = (db.pessoas || []).filter(function (p) {
      return p.ativo !== false;
    });
  if (modo !== 'local') {
    el.innerHTML = telaCompartilhada();
    return;
  }
  if (ativando) {
    el.innerHTML = telaAtivacao();
    return;
  }
  var ativar = '<div style="text-align:center;margin:18px"><button class="btn soft" onclick="ativando=true;renderLock()">Ativar estoque compartilhado</button></div>';
  if (!ps.some(function (p) {
    return p.admin;
  })) {
    el.innerHTML = setupHTML(ativar);
    return;
  }
  if (lockSel && pessoaById(lockSel)) {
    var p = pessoaById(lockSel);
    el.innerHTML = "<div class=\"lock\"><div class=\"pinbox\">\n      <button class=\"link\" style=\"color:#ff9a5f\" onclick=\"lockSel=null;pinBuf='';renderLock()\">\u2039 Trocar pessoa</button>\n      <div style=\"margin-top:22px\">" + avatar(p, 96) + "</div><h2 style=\"margin-top:12px\">" + esc(p.nome) + "</h2>\n      <div class=\"pdots\" id=\"pdots\">" + [0, 1, 2, 3].map(function (i) {
      return "<i class=\"" + (i < pinBuf.length ? 'on' : '') + "\"></i>";
    }).join('') + "</div>\n      <div id=\"pmsg\" style=\"min-height:22px;color:#ffb38a;font-weight:700;font-size:14px\">" + (Date.now() < bloqAte ? 'Muitas tentativas. Aguarde 30 segundos.' : 'Digite seu PIN') + "</div>\n      <div class=\"kpad\" style=\"margin-top:14px\">" + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(function (k) {
      return k ? "<button onclick=\"pinKey('" + k + "')\">" + k + "</button>" : '<span></span>';
    }).join('') + "</div>\n    </div></div>";
    return;
  }
  el.innerHTML = "<div class=\"lock\"><div class=\"lock-h\"><span class=\"mk\">\uD83D\uDCE6</span><div><b>" + esc((db.empresa || 'Lang').split(' ')[0]) + " Estoque</b><small>Quem est\xE1 usando? Toque na sua foto.</small></div></div>\n    <div class=\"people\">" + ps.map(function (p) {
    return "<button class=\"person\" onclick=\"lockSel='" + p.id + "';pinBuf='';renderLock()\">" + avatar(p, 88) + "<span>" + esc(p.nome) + "</span>" + (p.admin ? '<small>Administrador</small>' : '') + "</button>";
  }).join('') + "</div></div>";
  el.querySelector('.lock-h').insertAdjacentHTML('afterend', ativar);
}
function pinKey(k) {
  if (Date.now() < bloqAte) return;
  if (k === '⌫') pinBuf = pinBuf.slice(0, -1);else if (pinBuf.length < 4) pinBuf += k;
  var d = $('#pdots');
  d.innerHTML = [0, 1, 2, 3].map(function (i) {
    return "<i class=\"" + (i < pinBuf.length ? 'on' : '') + "\"></i>";
  }).join('');
  if (pinBuf.length < 4) return;
  var p = pessoaById(lockSel);
  if (p && hpin(p.id, pinBuf) === p.pin) {
    falhas = 0;
    U = p;
    lockSel = null;
    pinBuf = '';
    lastAct = Date.now();
    if (!location.hash) location.hash = '#inicio';
    render();
    toast('Olá, ' + p.nome.split(' ')[0] + '!');
    return;
  }
  falhas++;
  pinBuf = '';
  d.classList.remove('shake');
  void d.offsetWidth;
  d.classList.add('shake');
  setTimeout(function () {
    d.innerHTML = [0, 1, 2, 3].map(function () {
      return '<i></i>';
    }).join('');
  }, 350);
  if (falhas >= 5) {
    bloqAte = Date.now() + 30000;
    falhas = 0;
    $('#pmsg').textContent = 'Muitas tentativas. Aguarde 30 segundos.';
    setTimeout(function () {
      if ($('#pmsg')) $('#pmsg').textContent = 'Digite seu PIN';
    }, 30000);
  } else $('#pmsg').textContent = 'PIN errado. Tente de novo.';
}
function setupHTML(ativar) {
  return "<div class=\"lock\"><div class=\"lock-h\"><span class=\"mk\">\uD83D\uDCE6</span><div><b>Primeiro acesso</b><small>Cadastre o administrador do estoque.</small></div></div>\n  " + ativar + "<div class=\"card\" style=\"max-width:460px;margin:0 auto;color:var(--ink)\">\n    <p class=\"muted small\" style=\"margin-top:0\">O administrador cadastra as pessoas, corrige saldos e exclui lan\xE7amentos. Os outros s\xF3 lan\xE7am entradas, sa\xEDdas e devolu\xE7\xF5es.</p>\n    <div class=\"f\"><label>Seu nome</label><input id=\"sNome\" autocomplete=\"off\" placeholder=\"Ex.: Geovane Lang\"></div>\n    <div class=\"f\"><label>Sua foto <span class=\"muted\">(aparece na tela de login)</span></label>\n      <div style=\"display:flex;gap:12px;align-items:center\"><span id=\"sPrev\">" + avatar({
    nome: '?'
  }, 64) + "</span>\n      <label class=\"btn soft\" style=\"cursor:pointer\">\uD83D\uDCF7 Tirar foto<input type=\"file\" accept=\"image/*\" capture=\"user\" class=\"hidden\" onchange=\"pFotoSel(this,'sPrev')\"></label></div></div>\n    <div class=\"f2\"><div class=\"f\"><label>PIN (4 n\xFAmeros)</label><input id=\"sPin\" type=\"password\" inputmode=\"numeric\" pattern=\"[0-9]*\" maxlength=\"4\" autocomplete=\"off\"></div>\n    <div class=\"f\"><label>Repita o PIN</label><input id=\"sPin2\" type=\"password\" inputmode=\"numeric\" pattern=\"[0-9]*\" maxlength=\"4\" autocomplete=\"off\"></div></div>\n    <button class=\"btn primary lg full\" onclick=\"criarAdmin()\">Criar administrador e entrar</button>\n    <p class=\"muted small\" style=\"margin-bottom:0\">Guarde bem o PIN: sem ele n\xE3o d\xE1 para entrar como administrador.</p>\n  </div></div>";
}
var pFotoTmp = '';
function pFotoSel(_x5, _x6) {
  return _pFotoSel.apply(this, arguments);
}
function _pFotoSel() {
  _pFotoSel = _asyncToGenerator(_regenerator().m(function _callee1(inp, prev) {
    var f, _t1;
    return _regenerator().w(function (_context1) {
      while (1) switch (_context1.p = _context1.n) {
        case 0:
          f = inp.files[0];
          inp.value = '';
          if (f) {
            _context1.n = 1;
            break;
          }
          return _context1.a(2);
        case 1:
          _context1.p = 1;
          _context1.n = 2;
          return fotoReduzida(f);
        case 2:
          pFotoTmp = _context1.v;
          $('#' + prev).innerHTML = "<img class=\"av\" src=\"" + pFotoTmp + "\" style=\"width:64px;height:64px\">";
          _context1.n = 4;
          break;
        case 3:
          _context1.p = 3;
          _t1 = _context1.v;
          toast('Não foi possível ler a foto');
        case 4:
          return _context1.a(2);
      }
    }, _callee1, null, [[1, 3]]);
  }));
  return _pFotoSel.apply(this, arguments);
}
var pinOk = function pinOk(p) {
  return /^\d{4}$/.test(p);
};
function criarAdmin() {
  var nome = $('#sNome').value.trim(),
    a = $('#sPin').value,
    b = $('#sPin2').value;
  if (!nome) return toast('Informe seu nome');
  if (!pinOk(a)) return toast('O PIN precisa ter 4 números');
  if (a !== b) return toast('Os dois PINs não são iguais');
  var id = uid(),
    p = {
      id: id,
      nome: nome,
      foto: pFotoTmp,
      pin: hpin(id, a),
      admin: true,
      ativo: true,
      criado: Date.now()
    };
  db.pessoas = (db.pessoas || []).concat(p);
  pFotoTmp = '';
  save();
  U = p;
  lastAct = Date.now();
  location.hash = '#inicio';
  render();
  toast('Administrador criado');
}
function pessoasSec() {
  var ps = db.pessoas || [];
  return "<div class=\"sec\"><h2>\uD83D\uDC65 Pessoas</h2><span class=\"sp\"></span><button class=\"btn primary\" style=\"padding:8px 12px\" onclick=\"formPessoa()\">\uFF0B Pessoa</button></div>\n  <div class=\"list\">" + ps.map(function (p) {
    return "<button class=\"row\" onclick=\"formPessoa('" + p.id + "')\" style=\"" + (p.ativo === false ? 'opacity:.5' : '') + "\">" + avatar(p, 44) + "<span class=\"tx\"><div class=\"t\">" + esc(p.nome) + "</div><div class=\"s\">" + (p.admin ? '⭐ Administrador' : 'Lança entradas, saídas e devoluções') + (p.ativo === false ? ' · desativado' : '') + "</div></span><span class=\"muted\">\u203A</span></button>";
  }).join('') + "</div>";
}
function formPessoa(id) {
  if (!soAdmin()) return;
  var p = id ? pessoaById(id) : {
    nome: '',
    foto: '',
    admin: false,
    ativo: true
  };
  pFotoTmp = p.foto || '';
  var campoSenha = '<div class="f"><label id="pAcesso" for="pPin"></label><input id="pPin" type="password" autocomplete="new-password"></div>';
  sheet(id ? '✏️ Editar pessoa' : '👤 Nova pessoa', "\n   <div class=\"f\"><label>Nome</label><input id=\"pNome\" value=\"" + esc(p.nome) + "\" autocomplete=\"off\" placeholder=\"Ex.: Carlos (mestre de obras)\"></div>\n   <div class=\"f\"><label>Foto</label><div style=\"display:flex;gap:12px;align-items:center\"><span id=\"pPrev\">" + avatar(p, 64) + "</span>\n     <label class=\"btn soft\" style=\"cursor:pointer\">\uD83D\uDCF7 Tirar foto<input type=\"file\" accept=\"image/*\" capture=\"user\" class=\"hidden\" onchange=\"pFotoSel(this,'pPrev')\"></label></div></div>\n   <label class=\"chk\"><input type=\"checkbox\" id=\"pAdm\" " + (p.admin ? 'checked' : '') + " onchange=\"atualizarCampoAcesso('" + (id || '') + "',true)\"> <span><b>Administrador</b><br><span class=\"muted small\">Pode excluir lan\xE7amentos, corrigir saldo, cadastrar pessoas e mexer nas configura\xE7\xF5es.</span></span></label>\n   " + campoSenha + "\n   " + (id ? "<label class=\"chk\"><input type=\"checkbox\" id=\"pAtv\" " + (p.ativo !== false ? 'checked' : '') + "> <span><b>Ativo</b><br><span class=\"muted small\">Desative quem saiu da empresa: some da tela de login, mas o hist\xF3rico continua.</span></span></label>\n   " + (U && U.id !== id ? "<button class=\"btn danger full\" onclick=\"delPessoa('" + id + "')\">\uD83D\uDDD1\uFE0F Excluir pessoa</button><div class=\"small muted mt\">Os lan\xE7amentos que ela fez continuam no hist\xF3rico com o nome dela.</div>" : '<div class="small muted">Você não pode excluir a si mesmo.</div>') : ''), "<button class=\"btn primary lg full\" onclick=\"salvarPessoa('" + (id || '') + "')\">Salvar</button>");
  atualizarCampoAcesso(id, false);
}
function atualizarCampoAcesso(id, limpar) {
  var admin = nuvem() && $('#pAdm').checked;
  var mudou = nuvem() && id && pessoaById(id).admin !== admin;
  var input = $('#pPin');
  if (limpar) input.value = '';
  input.maxLength = admin ? 128 : 4;
  input.setAttribute('inputmode', admin ? 'text' : 'numeric');
  $('#pAcesso').textContent = (admin ? 'Senha (mínimo de 10 caracteres)' : 'PIN de 4 dígitos') + (id && !mudou ? ' · em branco mantém o acesso atual' : '');
}
function salvarPessoa(_x7) {
  return _salvarPessoa.apply(this, arguments);
}
function _salvarPessoa() {
  _salvarPessoa = _asyncToGenerator(_regenerator().m(function _callee10(id) {
    var nome, pin, adm, atv, senhaAdmin, mudou, outrosAdm, pid, p;
    return _regenerator().w(function (_context10) {
      while (1) switch (_context10.n) {
        case 0:
          nome = $('#pNome').value.trim(), pin = $('#pPin').value, adm = $('#pAdm').checked, atv = id ? $('#pAtv').checked : true;
          if (nome) {
            _context10.n = 1;
            break;
          }
          return _context10.a(2, toast('Informe o nome'));
        case 1:
          senhaAdmin = nuvem() && adm, mudou = nuvem() && id && pessoaById(id).admin !== adm;
          if (!((!id || pin || mudou) && !(senhaAdmin ? senhaOk(pin) : pinOk(pin)))) {
            _context10.n = 2;
            break;
          }
          return _context10.a(2, toast(senhaAdmin ? 'A senha precisa ter entre 10 e 128 caracteres.' : 'O PIN precisa ter 4 dígitos.'));
        case 2:
          outrosAdm = (db.pessoas || []).filter(function (x) {
            return x.id !== id && x.admin && x.ativo !== false;
          }).length;
          if (!(id && (!adm || !atv) && !outrosAdm)) {
            _context10.n = 3;
            break;
          }
          return _context10.a(2, toast('Precisa existir pelo menos um administrador ativo'));
        case 3:
          pid = id || uid();
          p = _extends({}, id ? pessoaById(id) : {
            id: pid,
            criado: Date.now()
          }, {
            nome: nome,
            foto: pFotoTmp,
            admin: adm,
            ativo: atv
          });
          if (!nuvem() && pin) p.pin = hpin(pid, pin);
          if (id) db.pessoas = db.pessoas.map(function (atual) {
            return atual.id === id ? p : atual;
          });else db.pessoas.push(p);
          _context10.n = 4;
          return persistir(nuvem() && pin ? {
            credencial: {
              id: pid,
              senha: pin
            }
          } : undefined);
        case 4:
          if (_context10.v) {
            _context10.n = 5;
            break;
          }
          return _context10.a(2);
        case 5:
          if (!nuvem() && U && U.id === id) U = p;
          pFotoTmp = '';
          config();
          toast('Pessoa salva');
          if (U && !U.admin) logout();
        case 6:
          return _context10.a(2);
      }
    }, _callee10);
  }));
  return _salvarPessoa.apply(this, arguments);
}
function delPessoa(_x8) {
  return _delPessoa.apply(this, arguments);
}
function _delPessoa() {
  _delPessoa = _asyncToGenerator(_regenerator().m(function _callee11(id) {
    var p;
    return _regenerator().w(function (_context11) {
      while (1) switch (_context11.n) {
        case 0:
          if (soAdmin()) {
            _context11.n = 1;
            break;
          }
          return _context11.a(2);
        case 1:
          p = pessoaById(id);
          if (p) {
            _context11.n = 2;
            break;
          }
          return _context11.a(2);
        case 2:
          if (!(U && U.id === id)) {
            _context11.n = 3;
            break;
          }
          return _context11.a(2, toast('Você não pode excluir a si mesmo'));
        case 3:
          if (!(p.admin && !(db.pessoas || []).some(function (x) {
            return x.id !== id && x.admin && x.ativo !== false;
          }))) {
            _context11.n = 4;
            break;
          }
          return _context11.a(2, toast('Precisa existir pelo menos um administrador ativo'));
        case 4:
          if (confirm("Excluir " + p.nome + "? Ela n\xE3o poder\xE1 mais entrar no app. Os lan\xE7amentos dela continuam no hist\xF3rico.")) {
            _context11.n = 5;
            break;
          }
          return _context11.a(2);
        case 5:
          db.movs = db.movs.map(function (mv) {
            return mv.por === id && !mv.porNome ? _extends({}, mv, {
              porNome: p.nome
            }) : mv;
          });
          db.pessoas = db.pessoas.filter(function (x) {
            return x.id !== id;
          });
          _context11.n = 6;
          return persistir();
        case 6:
          if (_context11.v) {
            _context11.n = 7;
            break;
          }
          return _context11.a(2);
        case 7:
          config();
          toast('Pessoa excluída');
        case 8:
          return _context11.a(2);
      }
    }, _callee11);
  }));
  return _delPessoa.apply(this, arguments);
}
var idbP = null;
function idb() {
  return idbP || (idbP = new Promise(function (res, rej) {
    if (!window.indexedDB) return rej(new Error('sem IndexedDB'));
    setTimeout(function () {
      return rej(new Error('IndexedDB não respondeu'));
    }, 3000);
    var r = indexedDB.open('lang-estoque', 1);
    r.onupgradeneeded = function () {
      return r.result.createObjectStore('fotos');
    };
    r.onsuccess = function () {
      return res(r.result);
    };
    r.onerror = function () {
      return rej(r.error);
    };
  }));
}
function idbOp(mode, fn) {
  return idb().then(function (d) {
    return new Promise(function (res, rej) {
      var t = d.transaction('fotos', mode),
        q = fn(t.objectStore('fotos'));
      t.oncomplete = function () {
        return res(q && q.result);
      };
      t.onerror = function () {
        return rej(t.error);
      };
    });
  });
}
var LSF = 'lang-estoque-foto:';
var fotoPut = function fotoPut(k, v) {
  return idbOp('readwrite', function (s) {
    return s.put(v, k);
  }).catch(function () {
    localStorage.setItem(LSF + k, v);
  });
};
var fotoGet = function fotoGet(k) {
  return idbOp('readonly', function (s) {
    return s.get(k);
  }).catch(function () {
    return null;
  }).then(function (v) {
    return v || localStorage.getItem(LSF + k);
  });
};
var fotoDel = function fotoDel(k) {
  return idbOp('readwrite', function (s) {
    return s.delete(k);
  }).catch(function () {}).then(function () {
    try {
      localStorage.removeItem(LSF + k);
    } catch (e) {}
  });
};
function fotoTodas() {
  var ls = {};
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k.indexOf(LSF) === 0) ls[k.slice(LSF.length)] = localStorage.getItem(k);
    }
  } catch (e) {}
  return fotoTodasIdb().catch(function () {
    return {};
  }).then(function (o) {
    return Object.assign(ls, o);
  });
}
function fotoTodasIdb() {
  return idb().then(function (d) {
    return new Promise(function (res, rej) {
      var out = {},
        t = d.transaction('fotos', 'readonly'),
        c = t.objectStore('fotos').openCursor();
      c.onsuccess = function () {
        var x = c.result;
        if (x) {
          out[x.key] = x.value;
          x.continue();
        }
      };
      t.oncomplete = function () {
        return res(out);
      };
      t.onerror = function () {
        return rej(t.error);
      };
    });
  });
}
function selfie() {
  return new Promise(function (resolve) {
    sheet('📸 Foto de quem está lançando', "<div class=\"cam\"><video id=\"camV\" playsinline autoplay muted></video><div class=\"cd\" id=\"camCd\">\u23F3</div></div>\n    <p class=\"muted small\" style=\"text-align:center\" id=\"camMsg\">Olhe para a c\xE2mera\u2026</p>", "<div style=\"display:flex;gap:8px;flex-wrap:wrap\"><button class=\"btn soft\" id=\"camSkip\">Lan\xE7ar sem foto</button>\n    <label class=\"btn dark\" style=\"flex:1;cursor:pointer\">\uD83D\uDCF7 Abrir c\xE2mera do aparelho<input type=\"file\" accept=\"image/*\" capture=\"user\" id=\"camFile\" class=\"hidden\"></label></div>");
    var stream = null,
      done = false,
      timer = null;
    camAtiva = true;
    var parar = function parar() {
      camAtiva = false;
      lastAct = Date.now();
      clearInterval(timer);
      if (stream) stream.getTracks().forEach(function (t) {
        return t.stop();
      });
      stream = null;
    };
    var fim = function fim(v) {
      if (done) return;
      done = true;
      parar();
      window._onClose = null;
      closeSheet();
      resolve(v);
    };
    window._onClose = function () {
      if (!done) {
        done = true;
        parar();
        resolve(undefined);
      }
    };
    $('#camSkip').onclick = function () {
      return fim('');
    };
    $('#camFile').onchange = function () {
      var _ref = _asyncToGenerator(_regenerator().m(function _callee(e) {
        var f, _t, _t2;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              f = e.target.files[0];
              if (f) {
                _context.n = 1;
                break;
              }
              return _context.a(2);
            case 1:
              _context.p = 1;
              _t = fim;
              _context.n = 2;
              return fotoReduzida(f);
            case 2:
              _t(_context.v);
              _context.n = 4;
              break;
            case 3:
              _context.p = 3;
              _t2 = _context.v;
              toast('Não foi possível ler a foto');
            case 4:
              return _context.a(2);
          }
        }, _callee, null, [[1, 3]]);
      }));
      return function (_x9) {
        return _ref.apply(this, arguments);
      };
    }();
    var falhou = function falhou() {
      $('#camCd').textContent = '📷';
      $('#camMsg').textContent = 'Câmera indisponível aqui. Toque em "Abrir câmera do aparelho".';
    };
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      falhou();
      return;
    }
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: {
          ideal: 640
        },
        height: {
          ideal: 640
        }
      },
      audio: false
    }).then(function (s) {
      if (done) {
        s.getTracks().forEach(function (t) {
          return t.stop();
        });
        return;
      }
      stream = s;
      var v = $('#camV');
      v.srcObject = s;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
      var n = 3;
      $('#camCd').textContent = n;
      timer = setInterval(function () {
        n--;
        if (n > 0) {
          $('#camCd').textContent = n;
          return;
        }
        clearInterval(timer);
        var S = 240,
          c = document.createElement('canvas'),
          w = v.videoWidth,
          h = v.videoHeight;
        if (!w || !h) {
          falhou();
          return;
        }
        var k = Math.min(w, h);
        c.width = c.height = S;
        var g = c.getContext('2d');
        g.translate(S, 0);
        g.scale(-1, 1);
        g.drawImage(v, (w - k) / 2, (h - k) / 2, k, k, 0, 0, S, S);
        fim(c.toDataURL('image/jpeg', .6));
      }, 900);
    }).catch(falhou);
  });
}
function route() {
  var h = (location.hash || '#inicio').slice(1).split('/');
  return {
    p: h[0] || 'inicio',
    id: h[1] ? decodeURIComponent(h[1]) : null
  };
}
var state = {
  fEst: '',
  fCat: '',
  fStatus: '',
  fMovTipo: '',
  fMovObra: '',
  fMovPer: '30',
  fObraSt: 'ativa',
  limiteMov: 30,
  resumo: false
};
function render() {
  if (!U || !pessoaById(U.id) || pessoaById(U.id).ativo === false) {
    U = null;
    document.body.classList.add('locked');
    renderLock();
    return;
  }
  U = pessoaById(U.id);
  document.body.classList.remove('locked');
  $('#lock').innerHTML = '';
  $('#btnCfg').classList.toggle('hidden', !isAdmin());
  $('#btnUser').innerHTML = avatar(U, 30) + '<span>' + esc(U.nome.split(' ')[0]) + ' · Sair</span>';
  var r = route();
  document.querySelectorAll('[data-r]').forEach(function (a) {
    return a.classList.toggle('on', a.dataset.r === r.p || r.p === 'obra' && a.dataset.r === 'obras' || r.p === 'mat' && a.dataset.r === 'estoque');
  });
  $('#brandName').textContent = db.empresa ? db.empresa.split(' ')[0] + ' Estoque' : 'Estoque';
  var C = calc(),
    app = $('#app');
  var views = {
    inicio: vInicio,
    estoque: vEstoque,
    obras: vObras,
    movs: vMovs,
    obra: vObra,
    mat: vMat,
    mov: vMov
  };
  document.body.classList.toggle('movmode', r.p === 'mov');
  app.innerHTML = (views[r.p] || vInicio)(C, r.id);
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', function () {
  window._onClose = null;
  closeSheet();
  render();
});
function vInicio(C) {
  if (!db.materiais.length && !db.obras.length) return "\n    <div class=\"card empty\"><div class=\"i\">\uD83D\uDCE6\uD83C\uDFD7\uFE0F</div><h3>Bem-vindo ao controle de estoque</h3>\n    <p>Cadastre seus materiais e obras e registre cada entrada e sa\xEDda.<br>Tudo fica salvo neste aparelho e funciona sem internet.</p>\n    <div class=\"grid\" style=\"max-width:340px;margin:0 auto\">\n      <button class=\"btn primary lg\" onclick=\"formObra()\">\uD83C\uDFD7\uFE0F Cadastrar primeira obra</button>\n      <button class=\"btn dark lg\" onclick=\"formMaterial()\">\uD83D\uDCE6 Cadastrar primeiro material</button>\n      <button class=\"btn soft\" onclick=\"loadDemo()\">Ver com dados de exemplo</button>\n    </div></div>";
  var mats = db.materiais,
    obrasAt = db.obras.filter(function (o) {
      return o.status !== 'concluida';
    });
  var low = mats.filter(function (m) {
    return alerta(status(m, C.saldo[m.id]).k);
  }).sort(function (a, b) {
    return C.saldo[a.id] - C.saldo[b.id];
  });
  var valorEst = mats.reduce(function (a, m) {
    return a + Math.max(0, C.saldo[m.id]) * (C.custo[m.id] || 0);
  }, 0);
  var ult = sortedMovs().slice(0, 6);
  return (!db.obras.length ? "<div class=\"card\" style=\"display:flex;gap:12px;align-items:center;margin-bottom:12px;border:2px dashed #f0c7ad;background:#fff8f3\"><span style=\"font-size:30px\">\uD83C\uDFD7\uFE0F</span><div style=\"flex:1\"><b>Cadastre suas obras</b><div class=\"muted small\">Para poder enviar material para elas.</div></div><button class=\"btn primary\" onclick=\"formObra()\">\uFF0B Obra</button></div>" : '') + "\n  <div class=\"quick\">\n    <button class=\"qa in\" onclick=\"formMov('entrada')\"><span class=\"i\">\uD83D\uDCE5</span>Entrada<small>chegou material</small></button>\n    <button class=\"qa out\" onclick=\"formMov('saida')\"><span class=\"i\">\uD83D\uDE9A</span>Sa\xEDda<small>enviar p/ obra</small></button>\n    <button class=\"qa back\" onclick=\"formMov('devolucao')\"><span class=\"i\">\u21A9\uFE0F</span>Devolu\xE7\xE3o<small>voltou da obra</small></button>\n  </div>\n  <div class=\"grid g4 mt\">\n    <a class=\"card kpi\" href=\"#estoque\" style=\"text-decoration:none;color:inherit\"><span class=\"e\">\uD83D\uDCE6</span><div class=\"l\">Materiais</div><div class=\"v\">" + mats.length + "</div></a>\n    <a class=\"card kpi " + (low.length ? 'alert' : '') + "\" href=\"#estoque\" onclick=\"state.fStatus='baixo'\" style=\"text-decoration:none;color:inherit\"><span class=\"e\">" + (low.length ? '⚠️' : '✅') + "</span><div class=\"l\">Abaixo do m\xEDnimo</div><div class=\"v\">" + low.length + "</div></a>\n    <a class=\"card kpi\" href=\"#obras\" style=\"text-decoration:none;color:inherit\"><span class=\"e\">\uD83C\uDFD7\uFE0F</span><div class=\"l\">Obras ativas</div><div class=\"v\">" + obrasAt.length + "</div></a>\n    <div class=\"card kpi\"><span class=\"e\">\uD83D\uDCB0</span><div class=\"l\">Valor no dep\xF3sito</div><div class=\"v\" style=\"font-size:" + (valorEst >= 1e5 ? 21 : 25) + "px\">" + (valorEst ? money(valorEst) : '—') + "</div></div>\n  </div>\n  " + (low.length ? "<div class=\"sec\"><h2>\u26A0\uFE0F Precisa comprar</h2><span class=\"sp\"></span><a href=\"#estoque\" onclick=\"state.fStatus='baixo'\">ver todos</a></div>\n   <div class=\"list\">" + low.slice(0, 4).map(function (m) {
    return matRow(m, C);
  }).join('') + "</div>" : '') + "\n  " + (aparelhoAntigo ? "<button class=\"btn soft full mt2\" onclick=\"state.resumo=!state.resumo;render()\">" + (state.resumo ? 'Ocultar resumo' : 'Ver resumo') + "</button>" : '') + "\n  " + (!aparelhoAntigo || state.resumo ? resumoInicio(C) : '') + "\n  <div class=\"sec\"><h2>\xDAltimas movimenta\xE7\xF5es</h2><span class=\"sp\"></span><a href=\"#movs\">ver todas</a></div>\n  <div class=\"list\">" + (ult.length ? ult.map(function (mv) {
    return movRow(mv, C);
  }).join('') : '<div class="card muted small">Nenhuma movimentação ainda. Use os botões acima.</div>') + "</div>";
}
function resumoInicio(C) {
  var d30 = daysAgo(30),
    m30 = db.movs.filter(function (m) {
      return m.data >= d30;
    });
  var por = {};
  var temValor = false;
  for (var _iterator7 = _createForOfIteratorHelperLoose(m30), _step7; !(_step7 = _iterator7()).done;) {
    var mv = _step7.value;
    if (!mv.obra || !(mv.tipo === 'saida' || mv.tipo === 'entrada')) continue;
    var v = movValor(mv, C);
    if (v > 0) temValor = true;
    var p = por[mv.obra] || (por[mv.obra] = {
      v: 0,
      n: 0
    });
    p.v += v;
    p.n += (mv.itens || []).length;
  }
  var porArr = Object.entries(por).map(function (_ref2) {
    var id = _ref2[0],
      x = _ref2[1];
    return _extends({
      o: obraById(id)
    }, x);
  }).filter(function (x) {
    return x.o;
  }).sort(function (a, b) {
    return temValor ? b.v - a.v : b.n - a.n;
  });
  var mx = Math.max.apply(Math, [1].concat(porArr.map(function (x) {
    return temValor ? x.v : x.n;
  })));
  var days = [];
  for (var i = 13; i >= 0; i--) days.push(daysAgo(i));
  var cnt = days.map(function (d) {
    return {
      d: d,
      e: 0,
      s: 0
    };
  });
  for (var _iterator8 = _createForOfIteratorHelperLoose(db.movs), _step8; !(_step8 = _iterator8()).done;) {
    var _mv2 = _step8.value;
    var k = days.indexOf(_mv2.data);
    if (k < 0) continue;
    var n = (_mv2.itens || []).length;
    if (_mv2.tipo === 'entrada') cnt[k].e += n;else if (_mv2.tipo === 'saida') cnt[k].s += n;
  }
  var mxc = Math.max.apply(Math, [1].concat(cnt.map(function (c) {
    return Math.max(c.e, c.s);
  })));
  return "<div class=\"grid mt2\" style=\"grid-template-columns:repeat(auto-fit,minmax(300px,1fr))\">\n    <div class=\"card\"><h3 style=\"font-size:15px\">Para onde foi o material <span class=\"muted small\">\xB7 30 dias</span></h3>\n      <div class=\"bars mt\">" + (porArr.length ? porArr.slice(0, 7).map(function (x) {
    return "<a href=\"#obra/" + x.o.id + "\" class=\"bar-row\" style=\"text-decoration:none;color:inherit\"><span class=\"n\"><span class=\"dot\" style=\"background:" + x.o.cor + "\"></span>" + esc(x.o.nome) + "</span>\n        <span class=\"bar-track\"><span class=\"bar-fill\" style=\"display:block;width:" + Math.round((temValor ? x.v : x.n) / mx * 100) + "%;background:" + x.o.cor + "\"></span></span>\n        <span class=\"val\">" + (temValor ? money(x.v) : x.n + ' itens') + "</span></a>";
  }).join('') : '<p class="muted small">Nenhuma saída para obra nos últimos 30 dias.</p>') + "</div></div>\n    <div class=\"card\"><h3 style=\"font-size:15px\">Itens movimentados <span class=\"muted small\">\xB7 14 dias</span></h3>\n      <div class=\"cols\">" + cnt.map(function (c) {
    return "<div class=\"c\" title=\"" + fdate(c.d) + ": " + c.e + " item(ns) de entrada, " + c.s + " de sa\xEDda\"><div style=\"display:flex;gap:2px;align-items:flex-end;height:100%\"><i style=\"flex:1;height:" + c.e / mxc * 100 + "%;background:var(--in)\"></i><i style=\"flex:1;height:" + c.s / mxc * 100 + "%;background:var(--out)\"></i></div></div>";
  }).join('') + "</div>\n      <div class=\"cols-x\">" + cnt.map(function (c, i) {
    return "<span>" + (i % 2 ? '' : c.d.slice(8, 10)) + "</span>";
  }).join('') + "</div>\n      <div class=\"legend\"><span><i class=\"dot\" style=\"background:var(--in)\"></i>Entradas</span><span><i class=\"dot\" style=\"background:var(--out)\"></i>Sa\xEDdas</span></div></div>\n  </div>";
}
function matRow(m, C) {
  var s = C.saldo[m.id] || 0,
    st = status(m, s),
    ref = Math.max(+m.min * 3 || 0, s, 1);
  return "<a class=\"row\" href=\"#mat/" + m.id + "\"><span class=\"ic\">" + matIcon(m, !aparelhoAntigo) + "</span>\n   <span class=\"tx\"><div class=\"t\">" + esc(m.nome) + "</div><div class=\"s\"><span class=\"pill " + st.k + "\">" + st.t + "</span> " + (+m.min ? '· mín. ' + fq(m.min) : '') + (m.local ? ' · ' + esc(m.local) : '') + "</div>\n   <div class=\"lvl\"><i style=\"width:" + Math.max(0, Math.min(100, s / ref * 100)) + "%;background:" + st.c + "\"></i></div></span>\n   <span class=\"r\"><div class=\"q\" style=\"color:" + (s <= 0 ? 'var(--danger)' : 'inherit') + "\">" + fq(s) + "</div><div class=\"u\">" + esc(m.un) + "</div></span></a>";
}
function movRow(mv, C) {
  var t = TIPOS[mv.tipo] || TIPOS.ajuste,
    o = obraById(mv.obra),
    its = mv.itens || [];
  var nomes = its.map(function (it) {
    var m = matById(it.m);
    return m ? m.nome : '(excluído)';
  }).join(', ');
  var dest = mv.tipo === 'saida' ? '→ ' + (o ? o.nome : '?') : mv.tipo === 'devolucao' ? '← ' + (o ? o.nome : '?') : mv.tipo === 'entrada' ? o ? 'direto na ' + o.nome : mv.forn || 'Depósito' : mv.obs || 'Correção de saldo';
  var q1 = its.length === 1 ? function () {
    var m = matById(its[0].m);
    return "<div class=\"q\">" + (its[0].q > 0 && mv.tipo !== 'saida' ? '+' : mv.tipo === 'saida' ? '−' : '') + fq(Math.abs(its[0].q)) + "</div><div class=\"u\">" + (m ? esc(m.un) : '') + "</div>";
  }() : "<div class=\"q\">" + its.length + "</div><div class=\"u\">itens</div>";
  return "<button class=\"row\" onclick=\"verMov('" + mv.id + "')\"><span class=\"ic " + t.cls + "\">" + t.ic + "</span>\n   <span class=\"tx\"><div class=\"t\">" + (esc(nomes) || '—') + "</div><div class=\"s\">" + (o ? "<span class=\"dot\" style=\"background:" + o.cor + ";width:8px;height:8px\"></span> " : '') + esc(dest) + " \xB7 " + fdateS(mv.data) + (mv.porNome ? ' · 👤 ' + esc(mv.porNome.split(' ')[0]) : '') + "</div></span>\n   <span class=\"r\">" + q1 + "</span></button>";
}
function seletorCategorias(materiais, selecionada, acao) {
  if (selecionada) return "<div class=\"categorias-leve\"><button class=\"btn soft\" onclick=\"" + acao + "('')\">\u2039 Categorias</button> <b>" + esc(selecionada) + "</b></div>";
  var grupos = Object.create(null);
  materiais.forEach(function (m) {
    var cat = m.cat || 'Outros';
    grupos[cat] = (grupos[cat] || 0) + 1;
  });
  var botoes = Object.keys(grupos).sort(function (a, b) {
    return a.localeCompare(b, 'pt-BR');
  }).map(function (cat) {
    return "<button class=\"row\" data-cat=\"" + esc(cat) + "\" onclick=\"" + acao + "(this.dataset.cat)\"><span class=\"ic\">" + catIcon(cat) + "</span><b class=\"tx\">" + esc(cat) + "</b><span>" + grupos[cat] + " \u203A</span></button>";
  });
  return botoes.length ? "<div class=\"list categorias-leve\">" + botoes.join('') + "</div>" : '';
}
function categoriaEstoque(cat) {
  state.fCat = cat;
  render();
}
function categoriaMov(cat) {
  F.cat = cat;
  drawTiles();
}
function vEstoque(C) {
  if (!db.materiais.length) return "<div class=\"card empty\"><div class=\"i\">\uD83D\uDCE6</div><h3>Nenhum material cadastrado</h3><p>Cadastre cimento, areia, a\xE7o, tijolos\u2026 com unidade e estoque m\xEDnimo.</p><button class=\"btn primary lg\" onclick=\"formMaterial()\">\uFF0B Novo material</button></div>";
  var ws = norm(state.fEst).split(/\s+/).filter(Boolean);
  var ms = db.materiais.filter(function (m) {
    return (!state.fCat || (m.cat || 'Outros') === state.fCat) && (!ws.length || ws.every(function (w) {
      return norm(m.nome + ' ' + (m.local || '') + ' ' + m.cat).includes(w);
    }));
  });
  if (state.fStatus === 'baixo') ms = ms.filter(function (m) {
    return alerta(status(m, C.saldo[m.id]).k);
  });
  if (!aparelhoAntigo || state.fCat) ms.sort(function (a, b) {
    return a.nome.localeCompare(b.nome, 'pt-BR');
  });
  var cats = [].concat(new Set(db.materiais.map(function (m) {
    return m.cat;
  })));
  var nLow = db.materiais.filter(function (m) {
    return alerta(status(m, C.saldo[m.id]).k);
  }).length;
  return "<div class=\"sec\" style=\"margin-top:4px\"><h2 style=\"font-size:22px\">Estoque</h2><span class=\"sp\"></span><button class=\"btn primary\" onclick=\"formMaterial()\">\uFF0B Material</button></div>\n  <div class=\"search\"><input id=\"qEst\" placeholder=\"\uD83D\uDD0E Buscar material\u2026\" value=\"" + esc(state.fEst) + "\" oninput=\"state.fEst=this.value;clearTimeout(window._t);window._t=setTimeout(()=>{render();const i=$('#qEst');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)\"></div>\n  <div class=\"chips\">\n    <button class=\"chip " + (!state.fCat && !state.fStatus ? 'on' : '') + "\" onclick=\"state.fCat='';state.fStatus='';render()\">" + (aparelhoAntigo ? 'Categorias' : 'Todos') + "</button>\n    <button class=\"chip " + (state.fStatus === 'baixo' ? 'on' : '') + "\" onclick=\"state.fStatus=state.fStatus==='baixo'?'':'baixo';render()\">\u26A0\uFE0F Comprar (" + nLow + ")</button>\n    " + (aparelhoAntigo ? '' : cats.map(function (c) {
    return "<button class=\"chip " + (state.fCat === c ? 'on' : '') + "\" data-c=\"" + esc(c) + "\" onclick=\"state.fCat=state.fCat===this.dataset.c?'':this.dataset.c;render()\">" + catIcon(c) + " " + esc(c) + "</button>";
  }).join('')) + "\n  </div>\n  " + (aparelhoAntigo ? seletorCategorias(ms, state.fCat, 'categoriaEstoque') : '') + "\n  <div class=\"list\">" + (ms.length ? aparelhoAntigo && !state.fCat ? '' : ms.map(function (m) {
    return matRow(m, C);
  }).join('') : '<div class="card muted small">Nada encontrado.</div>') + "</div>";
}
function vMat(C, id) {
  var m = matById(id);
  if (!m) return notFound();
  var s = C.saldo[m.id] || 0,
    st = status(m, s),
    c = C.custo[m.id] || 0;
  var usos = db.obras.map(function (o) {
    return {
      o: o,
      q: (C.obraQ[o.id] || {})[m.id] || 0
    };
  }).filter(function (x) {
    return x.q > 0;
  }).sort(function (a, b) {
    return b.q - a.q;
  });
  var mx = Math.max.apply(Math, [1].concat(usos.map(function (x) {
    return x.q;
  })));
  var movs = sortedMovs().filter(function (mv) {
    return (mv.itens || []).some(function (it) {
      return it.m === m.id;
    });
  });
  return "<a class=\"link\" href=\"#estoque\">\u2039 Estoque</a>\n  <div class=\"card mt\" style=\"display:flex;gap:16px;align-items:center;flex-wrap:wrap\">\n    <div class=\"ic\" style=\"width:64px;height:64px;border-radius:18px;background:#f3f0ec;display:grid;place-items:center;font-size:34px\">" + matIcon(m) + "</div>\n    <div style=\"flex:1;min-width:180px\"><h1 style=\"font-size:21px\">" + esc(m.nome) + "</h1><div class=\"muted small\" style=\"margin-top:4px\">" + esc(m.cat) + (m.local ? ' · 📍 ' + esc(m.local) : '') + "</div>\n      <div style=\"margin-top:8px\"><span class=\"pill " + st.k + "\">" + st.t + "</span></div></div>\n    <div style=\"text-align:right\"><div class=\"muted small b\">No dep\xF3sito</div><div class=\"big-saldo\" style=\"color:" + st.c + "\">" + fq(s) + "</div><div class=\"muted b\">" + esc(m.un) + "</div></div>\n  </div>\n  <div class=\"grid g4 mt\">\n    <div class=\"card kpi\"><div class=\"l\">Estoque m\xEDnimo</div><div class=\"v\">" + (+m.min ? fq(m.min) : '—') + "</div></div>\n    <div class=\"card kpi\"><div class=\"l\">Custo m\xE9dio</div><div class=\"v\" style=\"font-size:20px\">" + (c ? brl.format(c) : '—') + "</div></div>\n    <div class=\"card kpi\"><div class=\"l\">Valor em estoque</div><div class=\"v\" style=\"font-size:20px\">" + (c && s > 0 ? money(s * c) : '—') + "</div></div>\n    <div class=\"card kpi\"><div class=\"l\">\xDAltima movimenta\xE7\xE3o</div><div class=\"v\" style=\"font-size:20px\">" + (C.ult[m.id] ? fdate(C.ult[m.id]) : '—') + "</div></div>\n  </div>\n  <div class=\"actions\">\n    <button class=\"btn primary\" onclick=\"formMov('entrada',{m:'" + m.id + "'})\">\uD83D\uDCE5 Entrada</button>\n    <button class=\"btn dark\" onclick=\"formMov('saida',{m:'" + m.id + "'})\">\uD83D\uDE9A Enviar p/ obra</button>\n    " + (isAdmin() ? "<button class=\"btn soft\" onclick=\"formAjuste('" + m.id + "')\">\u2696\uFE0F Corrigir saldo</button>" : '') + "\n    <button class=\"btn soft\" onclick=\"formMaterial('" + m.id + "')\">\u270F\uFE0F Editar</button>\n  </div>\n  <div class=\"sec\"><h2>Usado nas obras</h2></div>\n  <div class=\"card\">" + (usos.length ? "<div class=\"bars\">" + usos.map(function (x) {
    return "<a href=\"#obra/" + x.o.id + "\" class=\"bar-row\" style=\"text-decoration:none;color:inherit\"><span class=\"n\"><span class=\"dot\" style=\"background:" + x.o.cor + "\"></span>" + esc(x.o.nome) + "</span><span class=\"bar-track\"><span class=\"bar-fill\" style=\"display:block;width:" + x.q / mx * 100 + "%;background:" + x.o.cor + "\"></span></span><span class=\"val\">" + fq(x.q) + " " + esc(m.un) + "</span></a>";
  }).join('') + "</div>" : '<p class="muted small" style="margin:0">Ainda não foi enviado para nenhuma obra.</p>') + "</div>\n  <div class=\"sec\"><h2>Hist\xF3rico</h2></div>\n  <div class=\"list\">" + (movs.length ? movs.slice(0, 60).map(function (mv) {
    return movRowMat(mv, m);
  }).join('') : '<div class="card muted small">Sem movimentações.</div>') + "</div>";
}
function movRowMat(mv, m) {
  var t = TIPOS[mv.tipo],
    o = obraById(mv.obra),
    q = (mv.itens || []).filter(function (it) {
      return it.m === m.id;
    }).reduce(function (a, it) {
      return a + (+it.q || 0);
    }, 0);
  var sinal = mv.tipo === 'saida' ? -1 : mv.tipo === 'entrada' && mv.obra ? 0 : 1,
    val = sinal * q;
  var desc = mv.tipo === 'saida' ? 'Enviado para ' + (o ? o.nome : '?') : mv.tipo === 'devolucao' ? 'Devolvido por ' + (o ? o.nome : '?') : mv.tipo === 'entrada' ? o ? 'Entregue direto na ' + o.nome : 'Entrada' + (mv.forn ? ' · ' + mv.forn : '') : mv.obs || 'Ajuste de saldo';
  return "<button class=\"row\" onclick=\"verMov('" + mv.id + "')\"><span class=\"ic " + t.cls + "\">" + t.ic + "</span><span class=\"tx\"><div class=\"t\">" + esc(desc) + "</div><div class=\"s\">" + fdate(mv.data) + (mv.resp ? ' · ' + esc(mv.resp) : '') + (mv.doc ? ' · ' + esc(mv.doc) : '') + "</div></span>\n  <span class=\"r\"><div class=\"q\" style=\"color:" + (val < 0 ? 'var(--out)' : val > 0 ? 'var(--in)' : 'inherit') + "\">" + (val > 0 ? '+' : val < 0 ? '−' : '') + fq(Math.abs(sinal ? val : q)) + "</div><div class=\"u\">" + esc(m.un) + "</div></span></button>";
}
function vObras(C) {
  if (!db.obras.length) return "<div class=\"card empty\"><div class=\"i\">\uD83C\uDFD7\uFE0F</div><h3>Nenhuma obra cadastrada</h3><p>Cadastre as obras para onde o material \xE9 enviado. Cada uma ganha uma cor para ficar f\xE1cil de identificar.</p><button class=\"btn primary lg\" onclick=\"formObra()\">\uFF0B Nova obra</button></div>";
  var os = db.obras.filter(function (o) {
    return state.fObraSt === 'todas' || (state.fObraSt === 'ativa' ? o.status !== 'concluida' : o.status === 'concluida');
  });
  return "<div class=\"sec\" style=\"margin-top:4px\"><h2 style=\"font-size:22px\">Obras</h2><span class=\"sp\"></span><button class=\"btn primary\" onclick=\"formObra()\">\uFF0B Obra</button></div>\n  <div class=\"chips\">" + [['ativa', 'Em andamento'], ['concluida', 'Concluídas'], ['todas', 'Todas']].map(function (_ref3) {
    var k = _ref3[0],
      l = _ref3[1];
    return "<button class=\"chip " + (state.fObraSt === k ? 'on' : '') + "\" onclick=\"state.fObraSt='" + k + "';render()\">" + l + "</button>";
  }).join('') + "</div>\n  <div class=\"grid g3\">" + (os.map(function (o) {
    var rem = db.movs.filter(function (mv) {
      return mv.obra === o.id && (mv.tipo === 'saida' || mv.tipo === 'entrada');
    });
    var last = rem.reduce(function (a, mv) {
      return mv.data > a ? mv.data : a;
    }, '');
    var nIt = Object.values(C.obraQ[o.id] || {}).filter(function (q) {
      return q > 0;
    }).length;
    return "<a class=\"card obra\" href=\"#obra/" + o.id + "\" style=\"--c:" + o.cor + "\">\n      <div style=\"display:flex;gap:8px;align-items:flex-start\"><h3 style=\"flex:1\">" + esc(o.nome) + "</h3>" + (o.status === 'concluida' ? '<span class="pill gray">Concluída</span>' : '') + "</div>\n      <div class=\"muted small\" style=\"margin-top:3px\">" + esc(o.end || '') + (o.resp ? (o.end ? ' · ' : '') + '👷 ' + esc(o.resp) : '') + "</div>\n      <div class=\"meta\"><div><b>" + (C.obraV[o.id] ? money(C.obraV[o.id]) : '—') + "</b>enviado</div><div><b>" + nIt + "</b>materiais</div><div><b>" + (last ? fdateS(last) : '—') + "</b>\xFAltima</div></div></a>";
  }).join('') || '<div class="card muted small">Nenhuma obra nesta lista.</div>') + "</div>";
}
function vObra(C, id) {
  var o = obraById(id);
  if (!o) return notFound();
  var oq = C.obraQ[o.id] || {};
  var linhas = Object.entries(oq).map(function (_ref4) {
    var mid = _ref4[0],
      q = _ref4[1];
    return {
      m: matById(mid),
      q: q
    };
  }).filter(function (x) {
    return x.m && Math.abs(x.q) > 1e-9;
  }).map(function (x) {
    return _extends({}, x, {
      v: x.q * (C.custo[x.m.id] || 0)
    });
  }).sort(function (a, b) {
    return b.v - a.v || b.q - a.q;
  });
  var movs = sortedMovs().filter(function (mv) {
    return mv.obra === o.id;
  });
  var rem = movs.filter(function (mv) {
    return mv.tipo === 'saida' || mv.tipo === 'entrada';
  });
  var mxv = Math.max.apply(Math, [1].concat(linhas.map(function (x) {
    return x.v;
  })));
  var temV = linhas.some(function (x) {
    return x.v > 0;
  });
  var porCat = {};
  linhas.forEach(function (x) {
    porCat[x.m.cat] = (porCat[x.m.cat] || 0) + (temV ? x.v : 1);
  });
  var catArr = Object.entries(porCat).sort(function (a, b) {
      return b[1] - a[1];
    }),
    totCat = catArr.reduce(function (a, x) {
      return a + x[1];
    }, 0) || 1;
  return "<a class=\"link\" href=\"#obras\">\u2039 Obras</a>\n  <div class=\"hero mt\" style=\"--c:" + o.cor + "\">\n    <h1>" + esc(o.nome) + "</h1><div class=\"sub\">" + esc(o.end || '') + (o.resp ? ' · 👷 ' + esc(o.resp) : '') + (o.status === 'concluida' ? ' · ✔ Concluída' : '') + "</div>\n    <div class=\"meta\"><div><b>" + (C.obraV[o.id] ? money(C.obraV[o.id]) : '—') + "</b>em material</div><div><b>" + rem.length + "</b>remessas</div><div><b>" + linhas.length + "</b>materiais</div><div><b>" + (rem[0] ? fdate(rem[0].data) : '—') + "</b>\xFAltima remessa</div></div>\n    <div class=\"actions\" style=\"position:relative;z-index:1\">\n      <button class=\"btn white\" onclick=\"formMov('saida',{obra:'" + o.id + "'})\">\uD83D\uDE9A Enviar material</button>\n      <button class=\"btn ghost\" onclick=\"formMov('devolucao',{obra:'" + o.id + "'})\">\u21A9\uFE0F Devolu\xE7\xE3o</button>\n      <button class=\"btn ghost\" onclick=\"printObra('" + o.id + "')\">\uD83D\uDDA8\uFE0F Relat\xF3rio</button>\n      <button class=\"btn ghost\" onclick=\"formObra('" + o.id + "')\">\u270F\uFE0F</button>\n    </div>\n  </div>\n  " + (catArr.length > 1 ? "<div class=\"card mt\"><div class=\"muted small b\" style=\"margin-bottom:8px\">Divis\xE3o por tipo " + (temV ? '(valor)' : '') + "</div>\n    <div style=\"display:flex;height:16px;border-radius:9px;overflow:hidden\">" + catArr.map(function (_ref5, i) {
    var c = _ref5[0],
      v = _ref5[1];
    return "<span title=\"" + esc(c) + "\" style=\"width:" + v / totCat * 100 + "%;background:" + COLORS[i % COLORS.length] + "\"></span>";
  }).join('') + "</div>\n    <div class=\"legend\" style=\"flex-wrap:wrap;gap:6px 14px\">" + catArr.map(function (_ref6, i) {
    var c = _ref6[0],
      v = _ref6[1];
    return "<span><i class=\"dot\" style=\"background:" + COLORS[i % COLORS.length] + "\"></i>" + catIcon(c) + " " + esc(c) + " " + Math.round(v / totCat * 100) + "%</span>";
  }).join('') + "</div></div>" : '') + "\n  <div class=\"sec\"><h2>Material na obra</h2><span class=\"muted small\">enviado \u2212 devolvido</span></div>\n  <div class=\"card\" style=\"padding:6px 12px\">" + (linhas.length ? "<table class=\"tbl\"><thead><tr><th>Material</th><th class=\"n\">Qtd.</th>" + (temV ? '<th class="n">Valor</th>' : '') + "</tr></thead><tbody>\n    " + linhas.map(function (x) {
    return "<tr onclick=\"location.hash='#mat/" + x.m.id + "'\" style=\"cursor:pointer\"><td><div style=\"display:flex;align-items:center;gap:8px\"><span>" + matIcon(x.m) + "</span><div style=\"flex:1;min-width:0\"><div class=\"b\">" + esc(x.m.nome) + "</div>" + (temV ? "<div class=\"lvl\" style=\"margin-top:4px\"><i style=\"width:" + Math.max(0, x.v / mxv * 100) + "%;background:" + o.cor + "\"></i></div>" : '') + "</div></div></td>\n      <td class=\"n b\">" + fq(x.q) + " <span class=\"muted small\">" + esc(x.m.un) + "</span></td>" + (temV ? "<td class=\"n\">" + (x.v ? money(x.v) : '—') + "</td>" : '') + "</tr>";
  }).join('') + "</tbody></table>" : '<p class="muted small">Nenhum material enviado ainda. Toque em <b>Enviar material</b>.</p>') + "</div>\n  <div class=\"sec\"><h2>Hist\xF3rico da obra</h2></div>\n  <div class=\"list\">" + (movs.length ? movs.map(function (mv) {
    return movRow(mv, C);
  }).join('') : '<div class="card muted small">Sem movimentações.</div>') + "</div>";
}
function movsFiltrados() {
  var per = state.fMovPer,
    lim = per === 'todos' ? '' : daysAgo(+per);
  return sortedMovs().filter(function (mv) {
    return (!lim || mv.data >= lim) && (!state.fMovTipo || mv.tipo === state.fMovTipo) && (!state.fMovObra || mv.obra === state.fMovObra);
  });
}
function linhasMovs(ms, C, inicio, fim) {
  var html = '',
    cur = inicio > 0 && ms[inicio - 1] ? ms[inicio - 1].data : '';
  for (var _iterator9 = _createForOfIteratorHelperLoose(ms.slice(inicio, fim)), _step9; !(_step9 = _iterator9()).done;) {
    var mv = _step9.value;
    if (mv.data !== cur) {
      cur = mv.data;
      html += "<div class=\"muted small b\" style=\"margin:12px 2px 2px\">" + diaLabel(cur) + "</div>";
    }
    html += movRow(mv, C);
  }
  return html;
}
function alterarFiltroMov(campo, valor) {
  state[campo] = valor;
  state.limiteMov = 30;
  render();
}
function mostrarMaisMovs() {
  var ms = movsFiltrados(),
    inicio = state.limiteMov;
  state.limiteMov += 30;
  $('#listaMovs').insertAdjacentHTML('beforeend', linhasMovs(ms, calc(), inicio, state.limiteMov));
  $('#maisMovs').classList.toggle('hidden', ms.length <= state.limiteMov);
}
function vMovs(C) {
  var per = state.fMovPer,
    ms = movsFiltrados(),
    limite = aparelhoAntigo ? state.limiteMov : 300;
  var tot = {
    entrada: 0,
    saida: 0,
    devolucao: 0
  };
  ms.forEach(function (mv) {
    if (tot[mv.tipo] != null) tot[mv.tipo] += movValor(mv, C);
  });
  var html = linhasMovs(ms, C, 0, limite);
  return "<div class=\"sec\" style=\"margin-top:4px\"><h2 style=\"font-size:22px\">Movimenta\xE7\xF5es</h2><span class=\"sp\"></span><button class=\"btn soft\" onclick=\"exportCSV()\">\u2B07\uFE0F Planilha</button></div>\n  <div class=\"chips\">" + [['', 'Todas'], ['entrada', '📥 Entradas'], ['saida', '🚚 Saídas'], ['devolucao', '↩️ Devoluções'], ['ajuste', '⚖️ Ajustes']].map(function (_ref7) {
    var k = _ref7[0],
      l = _ref7[1];
    return "<button class=\"chip " + (state.fMovTipo === k ? 'on' : '') + "\" onclick=\"alterarFiltroMov('fMovTipo','" + k + "')\">" + l + "</button>";
  }).join('') + "</div>\n  <div class=\"search\">\n    <select onchange=\"alterarFiltroMov('fMovObra',this.value)\" style=\"flex:1\"><option value=\"\">Todas as obras</option>" + db.obras.map(function (o) {
    return "<option value=\"" + o.id + "\" " + (state.fMovObra === o.id ? 'selected' : '') + ">" + esc(o.nome) + "</option>";
  }).join('') + "</select>\n    <select onchange=\"alterarFiltroMov('fMovPer',this.value)\">" + [['7', '7 dias'], ['30', '30 dias'], ['90', '90 dias'], ['365', '12 meses'], ['todos', 'Tudo']].map(function (_ref8) {
    var k = _ref8[0],
      l = _ref8[1];
    return "<option value=\"" + k + "\" " + (per === k ? 'selected' : '') + ">" + l + "</option>";
  }).join('') + "</select>\n  </div>\n  " + (tot.entrada || tot.saida ? "<div class=\"grid g2\" style=\"grid-template-columns:repeat(3,1fr)\">\n    <div class=\"card kpi\" style=\"padding:11px\"><div class=\"l\">\uD83D\uDCE5 Entradas</div><div class=\"v\" style=\"font-size:17px;color:var(--in)\">" + money(tot.entrada) + "</div></div>\n    <div class=\"card kpi\" style=\"padding:11px\"><div class=\"l\">\uD83D\uDE9A Sa\xEDdas</div><div class=\"v\" style=\"font-size:17px;color:var(--out)\">" + money(tot.saida) + "</div></div>\n    <div class=\"card kpi\" style=\"padding:11px\"><div class=\"l\">\u21A9\uFE0F Devolu\xE7\xF5es</div><div class=\"v\" style=\"font-size:17px;color:var(--back)\">" + money(tot.devolucao) + "</div></div></div>" : '') + "\n  <div class=\"list\" id=\"listaMovs\">" + (html || '<div class="card muted small mt">Nenhuma movimentação neste filtro.</div>') + "</div>\n  " + (aparelhoAntigo && ms.length > limite ? '<button id="maisMovs" class="btn soft full mt" onclick="mostrarMaisMovs()">Ver mais</button>' : '');
}
var DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function diaLabel(d) {
  if (d === today()) return 'Hoje';
  if (d === daysAgo(1)) return 'Ontem';
  var dt = new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10), 12);
  return DIAS[dt.getDay()] + ', ' + d.slice(8, 10) + ' de ' + MESES[dt.getMonth()];
}
function notFound() {
  return "<div class=\"card empty\"><div class=\"i\">\uD83E\uDD37</div><h3>N\xE3o encontrado</h3><a class=\"btn soft\" href=\"#inicio\">Voltar ao in\xEDcio</a></div>";
}
function sheet(title, body, foot) {
  closeSheet();
  var bg = document.createElement('div');
  bg.className = 'sheet-bg';
  bg.id = 'sheetBg';
  bg.innerHTML = "<div class=\"sheet\" role=\"dialog\" aria-modal=\"true\"><div class=\"sheet-h\"><h2>" + title + "</h2><button class=\"x\" onclick=\"closeSheet()\" aria-label=\"Fechar\">\u2715</button></div><div class=\"sheet-b\" id=\"sheetBody\">" + body + "</div>" + (foot ? "<div class=\"sheet-f\" id=\"sheetFoot\">" + foot + "</div>" : '') + "</div>";
  bg.addEventListener('click', function (e) {
    if (e.target === bg) closeSheet();
  });
  $('#sheetRoot').appendChild(bg);
  document.body.style.overflow = 'hidden';
}
function closeSheet() {
  var b = $('#sheetBg');
  if (b) b.remove();
  document.body.style.overflow = '';
  var cb = window._onClose;
  window._onClose = null;
  if (b && cb) cb();
}
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeSheet();
});
var F = null,
  K = null;
function newF(tipo, obra) {
  return {
    tipo: tipo,
    obra: obra || '',
    data: today(),
    resp: U ? U.nome : '',
    doc: '',
    forn: '',
    obs: '',
    itens: {},
    q: '',
    cat: '',
    from: '#inicio'
  };
}
function formMov(tipo, pre) {
  if (tipo === void 0) {
    tipo = 'saida';
  }
  if (pre === void 0) {
    pre = {};
  }
  if (!db.materiais.length) {
    toast('Cadastre um material primeiro');
    formMaterial();
    return;
  }
  var from = route().p === 'mov' ? F && F.from || '#inicio' : location.hash || '#inicio';
  F = newF(tipo, pre.obra);
  F.from = from;
  if (route().p === 'mov') {
    closeSheet();
    drawMovPage(true);
  } else location.hash = '#mov';
  if (pre.m) setTimeout(function () {
    return openKey(pre.m);
  }, 60);
}
function itensArr() {
  return Object.entries(F.itens).map(function (_ref9) {
    var m = _ref9[0],
      x = _ref9[1];
    return {
      m: m,
      q: num(x.q),
      v: num(x.v)
    };
  }).filter(function (x) {
    return x.q > 0 && matById(x.m);
  });
}
function drawMovPage(top) {
  if (route().p !== 'mov') return;
  var y = scrollY;
  $('#app').innerHTML = vMov(calc());
  window.scrollTo(0, top ? 0 : y);
}
function drawTiles() {
  var el = $('#tiles');
  if (el) el.innerHTML = tilesHTML(calc());
}
function drawBar() {
  var el = $('#mvBar');
  if (el) el.innerHTML = barHTML();
}
function corTipo(t) {
  return t === 'entrada' ? 'var(--in)' : t === 'devolucao' ? 'var(--back)' : 'var(--out)';
}
function sairMov() {
  if (F && itensArr().length && !confirm('Descartar os materiais escolhidos?')) return;
  var to = F && F.from || '#inicio';
  F = null;
  location.hash = to === '#mov' ? '#inicio' : to;
}
function vMov(C) {
  if (!F) F = newF('saida');
  var t = F.tipo,
    cats = [].concat(new Set(db.materiais.map(function (m) {
      return m.cat;
    })));
  return "<div style=\"display:flex;align-items:center;gap:10px;margin-bottom:12px\"><button class=\"link\" style=\"font-size:15px\" onclick=\"sairMov()\">\u2039 Voltar</button><span class=\"sp\" style=\"flex:1\"></span><span class=\"muted small b\">" + fdate(F.data) + "</span></div>\n  <div class=\"seg big\">" + ['entrada', 'saida', 'devolucao'].map(function (k) {
    return "<button class=\"" + TIPOS[k].cls + " " + (t === k ? 'on' : '') + "\" onclick=\"trocaTipo('" + k + "')\"><span class=\"i\">" + TIPOS[k].ic + "</span>" + TIPOS[k].nome + "</button>";
  }).join('') + "</div>\n  <div class=\"stepper-label\"><span class=\"n\">1</span>" + (t === 'saida' ? 'Para qual obra vai?' : t === 'devolucao' ? 'De qual obra voltou?' : 'Onde o material foi entregue?') + "</div>\n  <div class=\"obras-strip\">" + obraCards() + "</div>\n  " + (t === 'entrada' && F.obra ? '<div class="small muted" style="margin:-2px 0 10px">Compra entregue direto na obra: conta para a obra e não muda o saldo do depósito.</div>' : '') + "\n  <div class=\"stepper-label\"><span class=\"n\">2</span>" + (aparelhoAntigo ? 'Escolha uma categoria e depois o material' : 'Toque no material e digite a quantidade') + "</div>\n  <div class=\"search\"><input id=\"mvQ\" type=\"search\" placeholder=\"\uD83D\uDD0E Buscar material\u2026\" value=\"" + esc(F.q) + "\" oninput=\"F.q=this.value;drawTiles()\"></div>\n  " + (!aparelhoAntigo && cats.length > 1 ? "<div class=\"chips\"><button class=\"chip " + (!F.cat ? 'on' : '') + "\" onclick=\"F.cat='';drawMovPage()\">Todos</button>" + cats.map(function (c) {
    return "<button class=\"chip " + (F.cat === c ? 'on' : '') + "\" data-c=\"" + esc(c) + "\" onclick=\"F.cat=F.cat===this.dataset.c?'':this.dataset.c;drawMovPage()\">" + catIcon(c) + " " + esc(c) + "</button>";
  }).join('') + "</div>" : '') + "\n  <div class=\"tiles\" id=\"tiles\">" + tilesHTML(C) + "</div>\n  <button class=\"add-item mt\" onclick=\"formMaterial(null,id=>{drawMovPage();openKey(id)})\">\uFF0B Cadastrar material novo</button>\n  <div class=\"mv-bar\" id=\"mvBar\">" + barHTML() + "</div>";
}
function trocaTipo(k) {
  F.tipo = k;
  if (k === 'devolucao') {
    var oq = calc().obraQ[F.obra] || {};
    for (var id in F.itens) if (!((oq[id] || 0) > 0)) delete F.itens[id];
  }
  drawMovPage();
}
function obraCards(compact) {
  var t = F.tipo,
    obrasAt = db.obras.filter(function (o) {
      return o.status !== 'concluida' || o.id === F.obra;
    });
  var fn = compact ? 'kObra' : 'escolheObra';
  var h = t === 'entrada' ? "<button class=\"oc " + (!F.obra ? 'on' : '') + "\" style=\"--c:#171717\" onclick=\"" + fn + "('')\">\uD83C\uDFEC Dep\xF3sito<small>estoque central</small></button>" : '';
  h += obrasAt.map(function (o) {
    return "<button class=\"oc " + (F.obra === o.id ? 'on' : '') + "\" style=\"--c:" + o.cor + "\" onclick=\"" + fn + "('" + o.id + "')\">" + esc(o.nome) + "<small>" + esc(o.resp ? '👷 ' + o.resp : o.end || '') + "</small></button>";
  }).join('');
  if (!compact) h += "<button class=\"oc new\" onclick=\"formObra(null,id=>{F.obra=id;drawMovPage()})\">\uFF0B Nova obra<small>cadastrar</small></button>";
  return h;
}
function escolheObra(id) {
  F.obra = id;
  if (F.tipo === 'devolucao') F.itens = {};
  drawMovPage();
}
var ACENTOS = {
  'á': 'a',
  'à': 'a',
  'â': 'a',
  'ã': 'a',
  'ä': 'a',
  'é': 'e',
  'ê': 'e',
  'è': 'e',
  'ë': 'e',
  'í': 'i',
  'î': 'i',
  'ì': 'i',
  'ï': 'i',
  'ó': 'o',
  'ô': 'o',
  'õ': 'o',
  'ò': 'o',
  'ö': 'o',
  'ú': 'u',
  'û': 'u',
  'ù': 'u',
  'ü': 'u',
  'ç': 'c',
  'ñ': 'n'
};
var norm = function norm(s) {
  return String(s || '').toLowerCase().replace(/[áàâãäéêèëíîìïóôõòöúûùüçñ]/g, function (c) {
    return ACENTOS[c];
  });
};
function tilesHTML(C) {
  var t = F.tipo,
    q = norm(F.q),
    oq = F.obra ? C.obraQ[F.obra] || {} : {};
  var ws = q.split(/\s+/).filter(Boolean);
  var ms = db.materiais.filter(function (m) {
    return (!F.cat || (m.cat || 'Outros') === F.cat) && (!ws.length || ws.every(function (w) {
      return norm(m.nome + ' ' + m.cat + ' ' + (m.local || '')).includes(w);
    }));
  });
  if (t === 'devolucao') {
    if (!F.obra) return '<div class="card muted small" style="grid-column:1/-1">Escolha acima a obra de onde o material voltou.</div>';
    ms = ms.filter(function (m) {
      return (oq[m.id] || 0) > 0;
    });
    if (!ms.length && !aparelhoAntigo) return '<div class="card muted small" style="grid-column:1/-1">Esta obra não tem material para devolver.</div>';
  }
  var categorias = aparelhoAntigo ? seletorCategorias(ms, F.cat, 'categoriaMov') : '';
  if (!ms.length) return categorias + ("<div class=\"card muted small\" style=\"grid-column:1/-1\">" + (t === 'devolucao' && !F.cat && !ws.length ? 'Esta obra não tem material para devolver.' : 'Nenhum material encontrado.') + "</div>");
  if (aparelhoAntigo && !F.cat) return categorias;
  var freq = C.freq;
  var tem = function tem(m) {
    return t === 'saida' && (C.saldo[m.id] || 0) > 0 ? 1 : 0;
  };
  ms.sort(function (a, b) {
    return tem(b) - tem(a) || (freq[b.id] || 0) - (freq[a.id] || 0) || a.nome.localeCompare(b.nome, 'pt-BR');
  });
  return categorias + ms.map(function (m) {
    var s = C.saldo[m.id] || 0,
      st = status(m, s),
      sel = F.itens[m.id],
      dim = t === 'saida' && s <= 0 && !sel;
    var info = t === 'devolucao' ? "na obra: " + fq(oq[m.id]) + " " + esc(m.un) : fq(s) + " " + esc(m.un);
    return "<button class=\"tile " + (sel ? 'sel' : '') + " " + (dim ? 'dim' : '') + "\" style=\"--tc:" + corTipo(t) + "\" onclick=\"openKey('" + m.id + "')\">" + (sel ? "<span class=\"badge\">" + fq(num(sel.q)) + " " + esc(m.un) + "</span>" : '') + "\n      <span class=\"ti\">" + matIcon(m, !aparelhoAntigo) + "</span><span class=\"tn\">" + esc(m.nome) + "</span><span class=\"ts " + (t === 'devolucao' ? '' : st.k) + "\">" + info + "</span></button>";
  }).join('');
}
function movErros() {
  var C = calc(),
    e = [],
    its = itensArr();
  if (F.tipo !== 'entrada' && !F.obra) e.push(F.tipo === 'saida' ? 'Escolha a obra de destino' : 'Escolha a obra de origem');
  if (!its.length) e.push('Toque em um material');
  if (F.tipo === 'saida') {
    for (var _iterator0 = _createForOfIteratorHelperLoose(its), _step0; !(_step0 = _iterator0()).done;) {
      var it = _step0.value;
      if (it.q > (C.saldo[it.m] || 0) + 1e-9) {
        var m = matById(it.m);
        e.push("S\xF3 h\xE1 " + fq(C.saldo[it.m] || 0) + " " + m.un + " de " + m.nome);
        break;
      }
    }
  }
  if (F.tipo === 'devolucao' && F.obra) {
    var oq = C.obraQ[F.obra] || {};
    for (var _iterator1 = _createForOfIteratorHelperLoose(its), _step1; !(_step1 = _iterator1()).done;) {
      var _it2 = _step1.value;
      if (_it2.q > (oq[_it2.m] || 0) + 1e-9) {
        var _m = matById(_it2.m);
        e.push("A obra s\xF3 recebeu " + fq(oq[_it2.m] || 0) + " " + _m.un + " de " + _m.nome);
        break;
      }
    }
  }
  if (!F.data) e.push('Informe a data');
  return e;
}
function goLabel() {
  var e = movErros(),
    o = obraById(F.obra),
    n = itensArr().length,
    t = F.tipo;
  if (e.length) return {
    ok: false,
    txt: e[0]
  };
  var verbo = t === 'saida' ? '🚚 Dar saída' : t === 'entrada' ? '📥 Dar entrada' : '↩️ Devolver';
  return {
    ok: true,
    txt: verbo + " \xB7 " + n + " " + (n === 1 ? 'item' : 'itens') + (o ? (t === 'saida' ? ' → ' : t === 'devolucao' ? ' ← ' : ' em ') + o.nome : '')
  };
}
function barHTML() {
  var its = itensArr(),
    g = goLabel();
  return "<div class=\"mv-bar-in\">\n    " + (its.length ? "<div class=\"sel-strip\">" + its.map(function (it) {
    var m = matById(it.m);
    return "<button class=\"sel-chip\" onclick=\"openKey('" + m.id + "')\"><span class=\"kic\" style=\"width:24px;height:24px;font-size:15px;border-radius:7px\">" + matIcon(m) + "</span>" + fq(it.q) + " " + esc(m.un) + "</button>";
  }).join('') + "</div>" : '') + "\n    <div style=\"display:flex;gap:8px\"><button class=\"btn soft lg\" style=\"padding:15px 14px\" onclick=\"formDetalhes()\" title=\"Data, respons\xE1vel, documento\">\uD83D\uDCDD</button>\n    <button class=\"btn lg\" style=\"flex:1;background:" + (g.ok ? corTipo(F.tipo) : '#d8d2cc') + ";color:#fff\" " + (g.ok ? '' : 'disabled') + " onclick=\"salvarMov()\">" + esc(g.txt) + "</button></div></div>";
}
function openKey(mid) {
  var m = matById(mid);
  if (!m) return;
  var C = calc(),
    cur = F.itens[mid],
    t = F.tipo;
  K = {
    m: mid,
    s: cur ? String(cur.q).replace('.', ',') : '',
    fresh: !!cur
  };
  var s = C.saldo[mid] || 0,
    oq = F.obra ? (C.obraQ[F.obra] || {})[mid] || 0 : 0;
  var info = t === 'devolucao' ? "A obra recebeu <b>" + fq(oq) + " " + esc(m.un) + "</b>" : "No dep\xF3sito: <b>" + fq(s) + " " + esc(m.un) + "</b>";
  sheet("<span style=\"display:flex;align-items:center;gap:10px\"><span class=\"kic\">" + matIcon(m) + "</span><span>" + esc(m.nome) + "</span></span>", "\n    <div class=\"kinfo\">" + info + "</div>\n    <div class=\"kdisp\"><span id=\"kVal\">0</span> <span class=\"kun\">" + esc(m.un) + "</span></div>\n    <div id=\"kErr\" style=\"min-height:8px\"></div>\n    <div class=\"kquick\">" + [1, 5, 10, 50].map(function (n) {
    return "<button onclick=\"kAdd(" + n + ")\">+" + n + "</button>";
  }).join('') + "</div>\n    <div class=\"kpad\">" + ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫'].map(function (k) {
    return "<button onclick=\"kKey('" + k + "')\">" + k + "</button>";
  }).join('') + "</div>\n    " + (t === 'entrada' ? "<div class=\"price\" style=\"margin-top:12px\">R$ por " + esc(m.un) + " <input id=\"kPreco\" inputmode=\"decimal\" placeholder=\"" + (C.custo[mid] ? nf.format(C.custo[mid]) : 'opcional') + "\" value=\"" + (cur && cur.v ? esc(String(cur.v).replace('.', ',')) : '') + "\" oninput=\"if(F.itens[K.m])F.itens[K.m].v=this.value\"></div>" : '') + "\n    " + (t !== 'devolucao' ? "<div class=\"stepper-label\" style=\"margin-top:14px\">" + (t === 'saida' ? 'Para qual obra:' : 'Entregue em:') + "</div><div class=\"obras-strip\" id=\"kObras\" style=\"margin-bottom:0\">" + obraCards(true) + "</div>" : ''), "<div style=\"display:flex;gap:8px\">" + (cur ? '<button class="btn danger lg" style="padding:15px 14px" onclick="kRemove()" title="Tirar da lista">🗑️</button>' : '') + "\n     <button class=\"btn soft lg\" style=\"flex:1\" onclick=\"closeSheet()\">\uFF0B Mais itens</button>\n     <button class=\"btn lg\" id=\"kGo\" style=\"flex:1.4;color:#fff\" onclick=\"kGo()\"></button></div>");
  window._onClose = function () {
    K = null;
    drawMovPage();
  };
  kUpd();
}
function kKey(k) {
  var s = K.fresh ? '' : K.s;
  K.fresh = false;
  if (k === '⌫') s = s.slice(0, -1);else if (k === ',') {
    if (!s.includes(',')) s = (s || '0') + ',';
  } else {
    if (s === '0') s = '';
    if (s.replace(',', '').length < 8 && !(s.includes(',') && s.split(',')[1].length >= 2)) s += k;
  }
  K.s = s;
  kUpd();
}
function kAdd(n) {
  K.s = String(Math.round((num(K.fresh ? K.s : K.s) + n) * 100) / 100).replace('.', ',');
  K.fresh = false;
  kUpd();
}
function kObra(id) {
  F.obra = id;
  $('#kObras').innerHTML = obraCards(true);
  kUpd();
}
function kUpd() {
  var m = matById(K.m),
    q = num(K.s);
  if (q > 0) F.itens[K.m] = Object.assign(F.itens[K.m] || {}, {
    q: K.s,
    v: F.itens[K.m] ? F.itens[K.m].v : $('#kPreco') ? $('#kPreco').value : ''
  });else delete F.itens[K.m];
  $('#kVal').textContent = K.s || '0';
  var C = calc(),
    lim = F.tipo === 'saida' ? C.saldo[K.m] || 0 : F.tipo === 'devolucao' ? (C.obraQ[F.obra] || {})[K.m] || 0 : Infinity;
  $('#kErr').innerHTML = q > lim + 1e-9 ? "<div class=\"errbox\" style=\"text-align:center\">" + (F.tipo === 'saida' ? "S\xF3 h\xE1 " + fq(lim) + " " + esc(m.un) + " no dep\xF3sito" : "A obra s\xF3 recebeu " + fq(lim) + " " + esc(m.un)) + "</div>" : '';
  var g = goLabel(),
    b = $('#kGo');
  b.textContent = g.ok ? F.tipo === 'saida' ? '🚚 Dar saída' : F.tipo === 'entrada' ? '📥 Dar entrada' : '↩️ Devolver' : g.txt;
  b.disabled = !g.ok;
  b.style.background = g.ok ? corTipo(F.tipo) : '#d8d2cc';
  b.style.fontSize = g.ok ? '' : '13px';
  drawBar();
}
function kRemove() {
  delete F.itens[K.m];
  closeSheet();
}
function kGo() {
  if (goLabel().ok) {
    window._onClose = null;
    closeSheet();
    salvarMov();
  }
}
function formDetalhes() {
  var t = F.tipo;
  sheet('📝 Detalhes', "\n  <div class=\"f2\"><div class=\"f\"><label>Data</label><input type=\"date\" value=\"" + F.data + "\" onchange=\"F.data=this.value\"></div>\n  <div class=\"f\"><label>" + (t === 'saida' ? 'Quem levou / recebeu' : 'Responsável') + "</label><input value=\"" + esc(F.resp) + "\" oninput=\"F.resp=this.value\" placeholder=\"Nome\" list=\"dlResp\"></div></div>\n  " + (t === 'entrada' ? "<div class=\"f2\"><div class=\"f\"><label>Fornecedor</label><input value=\"" + esc(F.forn) + "\" oninput=\"F.forn=this.value\" list=\"dlForn\" placeholder=\"Loja / distribuidora\"></div><div class=\"f\"><label>Nota fiscal</label><input value=\"" + esc(F.doc) + "\" oninput=\"F.doc=this.value\" placeholder=\"N\xBA da NF\"></div></div>" : "<div class=\"f\"><label>Ve\xEDculo / documento <span class=\"muted\">(opcional)</span></label><input value=\"" + esc(F.doc) + "\" oninput=\"F.doc=this.value\" placeholder=\"Ex.: caminh\xE3o ABC-1234\"></div>") + "\n  <div class=\"f\"><label>Observa\xE7\xE3o <span class=\"muted\">(opcional)</span></label><input value=\"" + esc(F.obs) + "\" oninput=\"F.obs=this.value\"></div>\n  <datalist id=\"dlResp\">" + [].concat(new Set(db.movs.map(function (m) {
    return m.resp;
  }).filter(Boolean))).slice(0, 30).map(function (x) {
    return "<option value=\"" + esc(x) + "\">";
  }).join('') + "</datalist>\n  <datalist id=\"dlForn\">" + [].concat(new Set(db.movs.map(function (m) {
    return m.forn;
  }).filter(Boolean))).slice(0, 30).map(function (x) {
    return "<option value=\"" + esc(x) + "\">";
  }).join('') + "</datalist>", "<button class=\"btn dark lg full\" onclick=\"closeSheet()\">OK</button>");
  window._onClose = function () {
    return drawMovPage();
  };
}
function salvarMov() {
  return _salvarMov.apply(this, arguments);
}
function _salvarMov() {
  _salvarMov = _asyncToGenerator(_regenerator().m(function _callee12() {
    var _fotos;
    var foto, itens, mv, t, o;
    return _regenerator().w(function (_context12) {
      while (1) switch (_context12.n) {
        case 0:
          if (!movErros().length) {
            _context12.n = 1;
            break;
          }
          return _context12.a(2);
        case 1:
          _context12.n = 2;
          return selfie();
        case 2:
          foto = _context12.v;
          if (!(foto === undefined)) {
            _context12.n = 3;
            break;
          }
          drawMovPage();
          toast('Lançamento cancelado');
          return _context12.a(2);
        case 3:
          if (!(!F || movErros().length)) {
            _context12.n = 4;
            break;
          }
          return _context12.a(2);
        case 4:
          itens = itensArr().map(function (it) {
            var x = {
              m: it.m,
              q: it.q
            };
            if (F.tipo === 'entrada' && it.v > 0) x.v = it.v;
            return x;
          });
          db.seq = (db.seq || 0) + 1;
          mv = {
            id: uid(),
            n: db.seq,
            tipo: F.tipo,
            obra: F.obra || '',
            data: F.data,
            resp: F.resp.trim(),
            doc: F.doc.trim(),
            forn: F.tipo === 'entrada' ? F.forn.trim() : '',
            obs: F.obs.trim(),
            itens: itens,
            criado: Date.now(),
            por: U.id,
            porNome: U.nome,
            foto: !!foto
          };
          db.movs.push(mv);
          if (mv.resp) db.ultimoResp = mv.resp;
          _context12.n = 5;
          return persistir(nuvem() && foto ? {
            fotos: (_fotos = {}, _fotos[mv.id] = foto, _fotos)
          } : undefined);
        case 5:
          if (_context12.v) {
            _context12.n = 6;
            break;
          }
          if (!nuvem() && db.movs[db.movs.length - 1] === mv) {
            db.movs.pop();
            invalidarCalculos();
          }
          return _context12.a(2);
        case 6:
          if (!nuvem() && foto) fotoPut(mv.id, foto).catch(function () {
            return toast('⚠️ A foto não pôde ser salva');
          });
          F.itens = {};
          F.doc = '';
          F.forn = '';
          F.obs = '';
          F.q = '';
          closeSheet();
          drawMovPage(true);
          t = TIPOS[mv.tipo], o = obraById(mv.obra);
          sheet(t.ic + " " + t.nome + " registrada", "<div style=\"text-align:center;padding:6px 0 4px\"><div style=\"font-size:58px\">\u2705</div>\n    <p style=\"font-size:16px;margin:8px 0 4px\" class=\"b\">" + itens.length + " " + (itens.length === 1 ? 'item' : 'itens') + (o ? (mv.tipo === 'saida' ? ' para ' : mv.tipo === 'devolucao' ? ' de ' : ' em ') + esc(o.nome) : '') + "</p>\n    <p class=\"muted\" style=\"margin:0\">Movimenta\xE7\xE3o n\xBA <b>" + mv.n + "</b> salva." + (mv.tipo === 'saida' ? '<br>Imprima a guia e peça a assinatura de quem recebeu.' : '') + "</p></div>", "<div style=\"display:flex;gap:8px;flex-wrap:wrap\"><button class=\"btn soft lg\" style=\"flex:1\" onclick=\"printGuia('" + mv.id + "')\">\uD83D\uDDA8\uFE0F " + (mv.tipo === 'saida' ? 'Guia' : 'Comprovante') + "</button>\n     <button class=\"btn soft lg\" style=\"flex:1\" onclick=\"closeSheet()\">\uFF0B Nova</button>\n     <button class=\"btn dark lg\" style=\"flex:1\" onclick=\"logout('At\xE9 logo!')\">\u2713 Concluir e sair</button></div>");
        case 7:
          return _context12.a(2);
      }
    }, _callee12);
  }));
  return _salvarMov.apply(this, arguments);
}
function verMov(id) {
  var mv = db.movs.find(function (x) {
    return x.id === id;
  });
  if (!mv) return;
  var C = calc(),
    t = TIPOS[mv.tipo],
    o = obraById(mv.obra),
    total = movValor(mv, C);
  sheet(t.ic + " " + t.nome + " n\xBA " + (mv.n || ''), "\n   <div class=\"card\" style=\"padding:12px 14px\">\n    <div style=\"display:flex;gap:8px;flex-wrap:wrap;align-items:center\"><span class=\"pill " + t.cls + "\">" + t.nome + "</span><span class=\"b\">" + fdate(mv.data) + "</span></div>\n    " + (o ? "<div class=\"mt\" style=\"display:flex;align-items:center;gap:8px\"><span class=\"dot\" style=\"background:" + o.cor + "\"></span><a href=\"#obra/" + o.id + "\" onclick=\"closeSheet()\" class=\"b\" style=\"color:inherit\">" + esc(o.nome) + "</a></div>" : mv.tipo === 'entrada' ? '<div class="mt b">🏬 Depósito</div>' : '') + "\n    <div class=\"small muted mt\">" + [mv.resp && '👤 ' + esc(mv.resp), mv.forn && '🏪 ' + esc(mv.forn), mv.doc && '📄 ' + esc(mv.doc)].filter(Boolean).join(' · ') + "</div>\n    " + (mv.obs ? "<div class=\"small mt\">\uD83D\uDCDD " + esc(mv.obs) + "</div>" : '') + "\n   </div>\n   " + (mv.por || mv.porNome ? "<div class=\"card mt\" style=\"padding:12px 14px;display:flex;align-items:center\"><div id=\"selfieBox\" style=\"margin-right:12px\">" + (mv.foto ? '<div class="selfie" style="background:#eee"></div>' : avatar(pessoaById(mv.por) || {
    nome: mv.porNome
  }, 56)) + "</div>\n     <div><div class=\"muted small b\">Lan\xE7ado por</div><div class=\"b\" style=\"font-size:16px\">" + esc((pessoaById(mv.por) || {}).nome || mv.porNome || '') + "</div><div class=\"muted small\">" + (mv.foto ? '📸 com foto no momento do lançamento' : 'sem foto') + "</div></div></div>" : '') + "\n   <div class=\"card mt\" style=\"padding:6px 12px\"><table class=\"tbl\"><thead><tr><th>Material</th><th class=\"n\">Qtd.</th>" + (total ? '<th class="n">Valor</th>' : '') + "</tr></thead><tbody>\n    " + (mv.itens || []).map(function (it) {
    var m = matById(it.m),
      pu = mv.tipo === 'entrada' && it.v ? it.v : C.custo[it.m] || 0;
    return "<tr><td>" + (m ? matIcon(m) + ' ' + esc(m.nome) : '<i>material excluído</i>') + "</td><td class=\"n b\">" + fq(it.q) + " " + (m ? esc(m.un) : '') + "</td>" + (total ? "<td class=\"n\">" + (pu ? brl.format(it.q * pu) : '—') + "</td>" : '') + "</tr>";
  }).join('') + "\n    " + (total ? "<tr><td class=\"b\">Total</td><td></td><td class=\"n b\">" + brl.format(total) + "</td></tr>" : '') + "</tbody></table></div>", "<div style=\"display:flex;gap:8px\">" + (isAdmin() ? "<button class=\"btn danger\" onclick=\"delMov('" + mv.id + "')\">\uD83D\uDDD1\uFE0F Excluir</button>" : '') + "<span style=\"flex:1\"></span>" + (mv.tipo !== 'ajuste' ? "<button class=\"btn dark\" onclick=\"printGuia('" + mv.id + "')\">\uD83D\uDDA8\uFE0F Imprimir</button>" : '') + "</div>");
  if (mv.foto) {
    var foto = nuvem() ? EstoqueCompartilhado.enviar('foto', {
      id: mv.id
    }).then(function (r) {
      return r.imagem;
    }) : fotoGet(mv.id);
    var caixa = $('#selfieBox');
    foto.then(function (d) {
      if (caixa && d) caixa.innerHTML = "<img class=\"selfie\" src=\"" + esc(d) + "\" alt=\"\">";
    }).catch(function () {});
  }
}
function delMov(_x0) {
  return _delMov.apply(this, arguments);
}
function _delMov() {
  _delMov = _asyncToGenerator(_regenerator().m(function _callee13(id) {
    return _regenerator().w(function (_context13) {
      while (1) switch (_context13.n) {
        case 0:
          if (soAdmin()) {
            _context13.n = 1;
            break;
          }
          return _context13.a(2);
        case 1:
          if (confirm('Excluir esta movimentação? O saldo do estoque será recalculado.')) {
            _context13.n = 2;
            break;
          }
          return _context13.a(2);
        case 2:
          db.movs = db.movs.filter(function (m) {
            return m.id !== id;
          });
          _context13.n = 3;
          return persistir();
        case 3:
          if (_context13.v) {
            _context13.n = 4;
            break;
          }
          return _context13.a(2);
        case 4:
          if (!nuvem()) fotoDel(id).catch(function () {});
          closeSheet();
          render();
          toast('Movimentação excluída');
        case 5:
          return _context13.a(2);
      }
    }, _callee13);
  }));
  return _delMov.apply(this, arguments);
}
function formAjuste(mid) {
  if (!soAdmin()) return;
  var m = matById(mid),
    s = calc().saldo[mid] || 0;
  sheet('⚖️ Corrigir saldo', "<p class=\"muted small\" style=\"margin-top:0\">Use depois de contar o material no dep\xF3sito. A diferen\xE7a fica registrada no hist\xF3rico como ajuste.</p>\n   <div class=\"card\" style=\"padding:12px 14px;margin-bottom:12px\"><div class=\"b\">" + matIcon(m) + " " + esc(m.nome) + "</div><div class=\"muted small\">Saldo no app: <b>" + fq(s) + " " + esc(m.un) + "</b></div></div>\n   <div class=\"f\"><label>Quantidade contada (" + esc(m.un) + ")</label><input id=\"ajQ\" inputmode=\"decimal\" value=\"" + String(Math.round(s * 100) / 100).replace('.', ',') + "\" style=\"font-size:20px;font-weight:900\"></div>\n   <div class=\"f\"><label>Motivo</label><input id=\"ajO\" placeholder=\"Ex.: invent\xE1rio, perda, quebra\" value=\"Invent\xE1rio\"></div>", "<button class=\"btn dark lg full\" onclick=\"salvarAjuste('" + mid + "'," + s + ")\">Salvar contagem</button>");
}
function salvarAjuste(_x1, _x10) {
  return _salvarAjuste.apply(this, arguments);
}
function _salvarAjuste() {
  _salvarAjuste = _asyncToGenerator(_regenerator().m(function _callee14(mid, s) {
    var v, d;
    return _regenerator().w(function (_context14) {
      while (1) switch (_context14.n) {
        case 0:
          if (soAdmin()) {
            _context14.n = 1;
            break;
          }
          return _context14.a(2);
        case 1:
          v = $('#ajQ').value.trim();
          if (!(v === '')) {
            _context14.n = 2;
            break;
          }
          toast('Informe a quantidade contada');
          return _context14.a(2);
        case 2:
          d = Math.round((num(v) - s) * 1000) / 1000;
          if (d) {
            _context14.n = 3;
            break;
          }
          closeSheet();
          toast('Saldo já está correto');
          return _context14.a(2);
        case 3:
          db.seq = (db.seq || 0) + 1;
          db.movs.push({
            id: uid(),
            n: db.seq,
            tipo: 'ajuste',
            obra: '',
            data: today(),
            resp: U.nome,
            doc: '',
            forn: '',
            obs: $('#ajO').value.trim() || 'Ajuste de saldo',
            itens: [{
              m: mid,
              q: d
            }],
            criado: Date.now(),
            por: U.id,
            porNome: U.nome
          });
          _context14.n = 4;
          return persistir();
        case 4:
          if (_context14.v) {
            _context14.n = 5;
            break;
          }
          return _context14.a(2);
        case 5:
          closeSheet();
          render();
          toast("Saldo corrigido (" + (d > 0 ? '+' : '') + fq(d) + ")");
        case 6:
          return _context14.a(2);
      }
    }, _callee14);
  }));
  return _salvarAjuste.apply(this, arguments);
}
function formMaterial(id, cb) {
  var m = id ? matById(id) : {
    nome: '',
    cat: 'Cimento e argamassa',
    un: 'saco',
    min: '',
    preco: '',
    local: ''
  };
  var used = id && db.movs.some(function (mv) {
    return (mv.itens || []).some(function (it) {
      return it.m === id;
    });
  });
  sheet(id ? '✏️ Editar material' : '📦 Novo material', "\n   <div class=\"f\"><label>Nome do material</label><input id=\"mNome\" value=\"" + esc(m.nome) + "\" placeholder=\"Ex.: Cimento CP-II 50 kg\" autocomplete=\"off\"></div>\n   <div class=\"f\"><label>\xCDcone ou foto <span class=\"muted\">(aparece na tela de sa\xEDda)</span></label>\n    <div style=\"display:flex;gap:10px;align-items:center\"><span class=\"kic\" id=\"mPrev\" style=\"width:60px;height:60px;font-size:36px;border-radius:16px\">" + matIcon(m) + "</span>\n    <label class=\"btn soft\" style=\"cursor:pointer\">\uD83D\uDCF7 Tirar/escolher foto<input type=\"file\" accept=\"image/*\" id=\"mFoto\" class=\"hidden\"></label>\n    <button type=\"button\" class=\"btn soft " + (m.foto ? '' : 'hidden') + "\" id=\"mFotoDel\">\u2715 Foto</button></div>\n    <div class=\"icons\" id=\"mIcons\">" + ICONS.map(function (_ref0) {
    var e = _ref0[0];
    return "<button type=\"button\" data-v=\"" + e + "\" class=\"" + ((m.ic || guessIcon(m.nome, m.cat)) === e && !m.foto ? 'on' : '') + "\">" + e + "</button>";
  }).join('') + "</div></div>\n   <div class=\"f\"><label>Categoria</label><div class=\"chips\" style=\"flex-wrap:wrap\" id=\"mCat\">" + CATS.map(function (_ref1) {
    var c = _ref1[0],
      i = _ref1[1];
    return "<button type=\"button\" class=\"chip " + (m.cat === c ? 'on' : '') + "\" data-v=\"" + esc(c) + "\" onclick=\"this.parentNode.querySelectorAll('.chip').forEach(x=>x.classList.remove('on'));this.classList.add('on')\">" + i + " " + esc(c) + "</button>";
  }).join('') + "</div></div>\n   <div class=\"f2\"><div class=\"f\"><label>Unidade</label><select id=\"mUn\">" + UNITS.map(function (u) {
    return "<option " + (m.un === u ? 'selected' : '') + ">" + u + "</option>";
  }).join('') + (!UNITS.includes(m.un) ? "<option selected>" + esc(m.un) + "</option>" : '') + "</select></div>\n   <div class=\"f\"><label>Estoque m\xEDnimo</label><input id=\"mMin\" inputmode=\"decimal\" value=\"" + (m.min !== '' && m.min != null ? String(m.min).replace('.', ',') : '') + "\" placeholder=\"Avisa quando baixar\"></div></div>\n   <div class=\"f2\"><div class=\"f\"><label>Pre\xE7o de refer\xEAncia (R$)</label><input id=\"mPreco\" inputmode=\"decimal\" value=\"" + (m.preco ? String(m.preco).replace('.', ',') : '') + "\" placeholder=\"opcional\"></div>\n   <div class=\"f\"><label>Local no dep\xF3sito</label><input id=\"mLocal\" value=\"" + esc(m.local || '') + "\" placeholder=\"Ex.: Prateleira A\"></div></div>\n   " + (id || !isAdmin() ? '' : "<div class=\"f\"><label>Quantidade que j\xE1 tem no dep\xF3sito</label><input id=\"mIni\" inputmode=\"decimal\" placeholder=\"0\"></div>") + "\n   " + (id && isAdmin() ? "<button class=\"btn danger full\" onclick=\"delMaterial('" + id + "')\">\uD83D\uDDD1\uFE0F Excluir material</button>" + (used ? '<div class="small muted mt">Este material tem movimentações; ao excluir, elas também serão apagadas.</div>' : '') : ''), "<button class=\"btn primary lg full\" id=\"mSave\">Salvar</button>");
  setTimeout(function () {
    if (!id) $('#mNome').focus();
  }, 60);
  var mf = {
    ic: m.ic || '',
    foto: m.foto || ''
  };
  var prev = function prev() {
    var cur = mf.ic || guessIcon($('#mNome').value, ($('#mCat .chip.on') || {
      dataset: {}
    }).dataset.v);
    $('#mPrev').innerHTML = mf.foto ? "<img class=\"mi\" src=\"" + mf.foto + "\" alt=\"\">" : cur;
    document.querySelectorAll('#mIcons button').forEach(function (b) {
      return b.classList.toggle('on', !mf.foto && b.dataset.v === cur);
    });
    $('#mFotoDel').classList.toggle('hidden', !mf.foto);
  };
  $('#mNome').addEventListener('input', prev);
  $('#mCat').addEventListener('click', function () {
    return setTimeout(prev);
  });
  $('#mIcons').onclick = function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    mf.ic = b.dataset.v;
    mf.foto = '';
    prev();
  };
  $('#mFotoDel').onclick = function () {
    mf.foto = '';
    prev();
  };
  $('#mFoto').onchange = function () {
    var _ref10 = _asyncToGenerator(_regenerator().m(function _callee2(e) {
      var f, _t3;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            f = e.target.files[0];
            if (f) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            _context2.p = 1;
            _context2.n = 2;
            return fotoReduzida(f);
          case 2:
            mf.foto = _context2.v;
            prev();
            _context2.n = 4;
            break;
          case 3:
            _context2.p = 3;
            _t3 = _context2.v;
            toast('Não foi possível ler a foto');
          case 4:
            return _context2.a(2);
        }
      }, _callee2, null, [[1, 3]]);
    }));
    return function (_x11) {
      return _ref10.apply(this, arguments);
    };
  }();
  $('#mSave').onclick = _asyncToGenerator(_regenerator().m(function _callee3() {
    var nome, cat, data, mid, ini;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          nome = $('#mNome').value.trim();
          if (nome) {
            _context3.n = 1;
            break;
          }
          toast('Informe o nome do material');
          $('#mNome').focus();
          return _context3.a(2);
        case 1:
          if (!db.materiais.some(function (x) {
            return x.id !== id && x.nome.toLowerCase() === nome.toLowerCase();
          })) {
            _context3.n = 2;
            break;
          }
          toast('Já existe um material com esse nome');
          return _context3.a(2);
        case 2:
          cat = ($('#mCat .chip.on') || {
            dataset: {}
          }).dataset.v || 'Outros';
          data = {
            nome: nome,
            cat: cat,
            un: $('#mUn').value,
            min: num($('#mMin').value),
            preco: num($('#mPreco').value),
            local: $('#mLocal').value.trim(),
            ic: mf.ic || guessIcon(nome, cat),
            foto: mf.foto
          };
          mid = id;
          if (id) db.materiais = db.materiais.map(function (atual) {
            return atual.id === id ? _extends({}, atual, data) : atual;
          });else {
            mid = uid();
            db.materiais.push(_extends({
              id: mid
            }, data, {
              criado: Date.now()
            }));
            ini = $('#mIni') ? num($('#mIni').value) : 0;
            if (ini > 0) {
              db.seq = (db.seq || 0) + 1;
              db.movs.push({
                id: uid(),
                n: db.seq,
                tipo: 'ajuste',
                obra: '',
                data: today(),
                resp: '',
                doc: '',
                forn: '',
                obs: 'Saldo inicial',
                itens: [{
                  m: mid,
                  q: ini
                }],
                criado: Date.now(),
                por: U.id,
                porNome: U.nome
              });
            }
          }
          _context3.n = 3;
          return persistir();
        case 3:
          if (_context3.v) {
            _context3.n = 4;
            break;
          }
          return _context3.a(2);
        case 4:
          closeSheet();
          if (cb) cb(mid);else {
            render();
            toast(id ? 'Material atualizado' : 'Material cadastrado');
          }
        case 5:
          return _context3.a(2);
      }
    }, _callee3);
  }));
}
function fotoReduzida(file) {
  return new Promise(function (res, rej) {
    var img = new Image();
    img.onload = function () {
      var S = 240,
        c = document.createElement('canvas');
      c.width = c.height = S;
      var k = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - k) / 2, (img.height - k) / 2, k, k, 0, 0, S, S);
      URL.revokeObjectURL(img.src);
      res(c.toDataURL('image/jpeg', .75));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}
function delMaterial(_x12) {
  return _delMaterial.apply(this, arguments);
}
function _delMaterial() {
  _delMaterial = _asyncToGenerator(_regenerator().m(function _callee15(id) {
    var m;
    return _regenerator().w(function (_context15) {
      while (1) switch (_context15.n) {
        case 0:
          if (soAdmin()) {
            _context15.n = 1;
            break;
          }
          return _context15.a(2);
        case 1:
          m = matById(id);
          if (confirm("Excluir \"" + m.nome + "\"? As movimenta\xE7\xF5es deste material tamb\xE9m ser\xE3o apagadas.")) {
            _context15.n = 2;
            break;
          }
          return _context15.a(2);
        case 2:
          db.materiais = db.materiais.filter(function (x) {
            return x.id !== id;
          });
          db.movs = db.movs.map(function (mv) {
            var itens = (mv.itens || []).filter(function (it) {
              return it.m !== id;
            });
            return mv.itens && itens.length === mv.itens.length ? mv : _extends({}, mv, {
              itens: itens
            });
          }).filter(function (mv) {
            return mv.itens.length;
          });
          _context15.n = 3;
          return persistir();
        case 3:
          if (_context15.v) {
            _context15.n = 4;
            break;
          }
          return _context15.a(2);
        case 4:
          closeSheet();
          location.hash = '#estoque';
          render();
          toast('Material excluído');
        case 5:
          return _context15.a(2);
      }
    }, _callee15);
  }));
  return _delMaterial.apply(this, arguments);
}
function formObra(id, cb) {
  var o = id ? obraById(id) : {
    nome: '',
    end: '',
    resp: '',
    cor: COLORS[db.obras.length % COLORS.length],
    status: 'ativa'
  };
  sheet(id ? '✏️ Editar obra' : '🏗️ Nova obra', "\n   <div class=\"f\"><label>Nome da obra</label><input id=\"oNome\" value=\"" + esc(o.nome) + "\" placeholder=\"Ex.: Residencial Jardins\" autocomplete=\"off\"></div>\n   <div class=\"f\"><label>Endere\xE7o</label><input id=\"oEnd\" value=\"" + esc(o.end || '') + "\" placeholder=\"Rua, n\xBA, bairro, cidade\"></div>\n   <div class=\"f\"><label>Mestre / respons\xE1vel</label><input id=\"oResp\" value=\"" + esc(o.resp || '') + "\" placeholder=\"Nome\"></div>\n   <div class=\"f\"><label>Cor de identifica\xE7\xE3o</label><div class=\"colors\" id=\"oCor\">" + COLORS.map(function (c) {
    return "<button type=\"button\" class=\"" + (o.cor === c ? 'on' : '') + "\" data-v=\"" + c + "\" style=\"background:" + c + "\" onclick=\"this.parentNode.querySelectorAll('button').forEach(x=>x.classList.remove('on'));this.classList.add('on')\"></button>";
  }).join('') + "</div></div>\n   " + (id ? "<div class=\"f\"><label>Situa\xE7\xE3o</label><select id=\"oSt\"><option value=\"ativa\" " + (o.status !== 'concluida' ? 'selected' : '') + ">Em andamento</option><option value=\"concluida\" " + (o.status === 'concluida' ? 'selected' : '') + ">Conclu\xEDda</option></select></div>\n   " + (isAdmin() ? "<button class=\"btn danger full\" onclick=\"delObra('" + id + "')\">\uD83D\uDDD1\uFE0F Excluir obra</button>" : '') : ''), "<button class=\"btn primary lg full\" id=\"oSave\">Salvar</button>");
  setTimeout(function () {
    if (!id) $('#oNome').focus();
  }, 60);
  $('#oSave').onclick = _asyncToGenerator(_regenerator().m(function _callee4() {
    var nome, data, oid;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          nome = $('#oNome').value.trim();
          if (nome) {
            _context4.n = 1;
            break;
          }
          toast('Informe o nome da obra');
          return _context4.a(2);
        case 1:
          data = {
            nome: nome,
            end: $('#oEnd').value.trim(),
            resp: $('#oResp').value.trim(),
            cor: ($('#oCor .on') || {
              dataset: {}
            }).dataset.v || COLORS[0]
          };
          if (id) {
            data.status = $('#oSt').value;
            db.obras = db.obras.map(function (atual) {
              return atual.id === id ? _extends({}, atual, data) : atual;
            });
          }
          oid = id;
          if (!id) {
            oid = uid();
            db.obras.push(_extends({
              id: oid
            }, data, {
              status: 'ativa',
              criado: Date.now()
            }));
          }
          _context4.n = 2;
          return persistir();
        case 2:
          if (_context4.v) {
            _context4.n = 3;
            break;
          }
          return _context4.a(2);
        case 3:
          closeSheet();
          if (cb) cb(oid);else {
            render();
            toast(id ? 'Obra atualizada' : 'Obra cadastrada');
          }
        case 4:
          return _context4.a(2);
      }
    }, _callee4);
  }));
}
function delObra(_x13) {
  return _delObra.apply(this, arguments);
}
function _delObra() {
  _delObra = _asyncToGenerator(_regenerator().m(function _callee16(id) {
    var n;
    return _regenerator().w(function (_context16) {
      while (1) switch (_context16.n) {
        case 0:
          if (soAdmin()) {
            _context16.n = 1;
            break;
          }
          return _context16.a(2);
        case 1:
          n = db.movs.filter(function (m) {
            return m.obra === id;
          }).length;
          if (!n) {
            _context16.n = 2;
            break;
          }
          alert("Esta obra tem " + n + " movimenta\xE7\xE3o(\xF5es). Para manter o hist\xF3rico, marque-a como \"Conclu\xEDda\" em vez de excluir.");
          return _context16.a(2);
        case 2:
          if (confirm('Excluir esta obra?')) {
            _context16.n = 3;
            break;
          }
          return _context16.a(2);
        case 3:
          db.obras = db.obras.filter(function (o) {
            return o.id !== id;
          });
          _context16.n = 4;
          return persistir();
        case 4:
          if (_context16.v) {
            _context16.n = 5;
            break;
          }
          return _context16.a(2);
        case 5:
          closeSheet();
          location.hash = '#obras';
          render();
        case 6:
          return _context16.a(2);
      }
    }, _callee16);
  }));
  return _delObra.apply(this, arguments);
}
function printHTML(html) {
  $('#print').innerHTML = html;
  closeSheet();
  setTimeout(function () {
    return window.print();
  }, 80);
}
function phead(t) {
  return "<div class=\"ph\"><div><b style=\"font-size:16px\">" + esc(db.empresa || '') + "</b><div>Controle de estoque</div></div><div style=\"text-align:right\"><b>" + t + "</b><div>Emitido em " + fdate(today()) + "</div></div></div>";
}
function printGuia(id) {
  var mv = db.movs.find(function (x) {
    return x.id === id;
  });
  if (!mv) return;
  var C = calc(),
    o = obraById(mv.obra),
    t = TIPOS[mv.tipo];
  var tit = mv.tipo === 'saida' ? 'GUIA DE REMESSA DE MATERIAL' : mv.tipo === 'devolucao' ? 'COMPROVANTE DE DEVOLUÇÃO' : 'COMPROVANTE DE ENTRADA';
  printHTML(phead(tit + ' nº ' + (mv.n || '')) + "\n   <p><b>Data:</b> " + fdate(mv.data) + " &nbsp; <b>Tipo:</b> " + t.nome + (o ? " &nbsp; <b>Obra:</b> " + esc(o.nome) + (o.end ? ' — ' + esc(o.end) : '') : '') + "</p>\n   <p>" + (mv.forn ? "<b>Fornecedor:</b> " + esc(mv.forn) + " &nbsp; " : '') + (mv.doc ? "<b>Documento:</b> " + esc(mv.doc) + " &nbsp; " : '') + (mv.resp ? "<b>Respons\xE1vel:</b> " + esc(mv.resp) : '') + "</p>\n   " + (mv.obs ? "<p><b>Obs.:</b> " + esc(mv.obs) + "</p>" : '') + (mv.porNome ? "<p><b>Lan\xE7ado por:</b> " + esc(mv.porNome) + "</p>" : '') + "\n   <table><thead><tr><th>#</th><th>Material</th><th class=\"n\">Quantidade</th><th>Un.</th><th>Conferido</th></tr></thead><tbody>\n   " + (mv.itens || []).map(function (it, i) {
    var m = matById(it.m);
    return "<tr><td>" + (i + 1) + "</td><td>" + (m ? esc(m.nome) : '—') + "</td><td class=\"n\">" + fq(it.q) + "</td><td>" + (m ? esc(m.un) : '') + "</td><td style=\"width:80px\"></td></tr>";
  }).join('') + "</tbody></table>\n   <div class=\"sig\"><div>" + (mv.tipo === 'saida' ? 'Expedido por (depósito)' : 'Entregue por') + "</div><div>" + (mv.tipo === 'saida' ? 'Recebido por (obra)' : 'Recebido por') + "</div></div>");
}
function printObra(id) {
  var o = obraById(id),
    C = calc(),
    oq = C.obraQ[id] || {};
  var linhas = Object.entries(oq).map(function (_ref13) {
    var mid = _ref13[0],
      q = _ref13[1];
    return {
      m: matById(mid),
      q: q
    };
  }).filter(function (x) {
    return x.m && Math.abs(x.q) > 1e-9;
  }).sort(function (a, b) {
    return a.m.nome.localeCompare(b.m.nome, 'pt-BR');
  });
  var movs = sortedMovs().filter(function (mv) {
    return mv.obra === id;
  }).reverse();
  var tot = 0;
  printHTML(phead('RELATÓRIO DE MATERIAL POR OBRA') + "<h1>" + esc(o.nome) + "</h1><p>" + esc(o.end || '') + (o.resp ? ' · Responsável: ' + esc(o.resp) : '') + "</p>\n   <h3>Resumo (enviado \u2212 devolvido)</h3><table><thead><tr><th>Material</th><th class=\"n\">Qtd.</th><th>Un.</th><th class=\"n\">Custo m\xE9dio</th><th class=\"n\">Valor</th></tr></thead><tbody>\n   " + linhas.map(function (x) {
    var v = x.q * (C.custo[x.m.id] || 0);
    tot += v;
    return "<tr><td>" + esc(x.m.nome) + "</td><td class=\"n\">" + fq(x.q) + "</td><td>" + esc(x.m.un) + "</td><td class=\"n\">" + (C.custo[x.m.id] ? brl.format(C.custo[x.m.id]) : '—') + "</td><td class=\"n\">" + (v ? brl.format(v) : '—') + "</td></tr>";
  }).join('') + "\n   <tr><td colspan=\"4\"><b>Total</b></td><td class=\"n\"><b>" + brl.format(tot) + "</b></td></tr></tbody></table>\n   <h3 style=\"margin-top:18px\">Movimenta\xE7\xF5es</h3><table><thead><tr><th>Data</th><th>N\xBA</th><th>Tipo</th><th>Material</th><th class=\"n\">Qtd.</th><th>Respons\xE1vel</th></tr></thead><tbody>\n   " + movs.flatMap(function (mv) {
    return (mv.itens || []).map(function (it) {
      var m = matById(it.m);
      return "<tr><td>" + fdate(mv.data) + "</td><td>" + (mv.n || '') + "</td><td>" + TIPOS[mv.tipo].nome + "</td><td>" + (m ? esc(m.nome) : '—') + "</td><td class=\"n\">" + fq(it.q) + " " + (m ? esc(m.un) : '') + "</td><td>" + esc(mv.resp || '') + "</td></tr>";
    });
  }).join('') + "</tbody></table>");
}
function download(name, content, type) {
  var b = new Blob([content], {
    type: type
  });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}
function exportCSV() {
  var C = calc(),
    q = function q(v) {
      return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    };
  var rows = [['Data', 'Nº', 'Tipo', 'Obra', 'Material', 'Categoria', 'Quantidade', 'Unidade', 'Valor unitário', 'Valor total', 'Fornecedor', 'Documento', 'Responsável', 'Observação', 'Lançado por']];
  for (var _iterator10 = _createForOfIteratorHelperLoose(sortedMovs().reverse()), _step10; !(_step10 = _iterator10()).done;) {
    var mv = _step10.value;
    for (var _iterator11 = _createForOfIteratorHelperLoose(mv.itens || []), _step11; !(_step11 = _iterator11()).done;) {
      var it = _step11.value;
      var m = matById(it.m) || {},
        o = obraById(mv.obra),
        pu = mv.tipo === 'entrada' && it.v ? it.v : C.custo[it.m] || 0;
      rows.push([fdate(mv.data), mv.n || '', TIPOS[mv.tipo].nome, o ? o.nome : mv.tipo === 'entrada' ? 'Depósito' : '', m.nome || '', m.cat || '', nf.format(it.q), m.un || '', pu ? nf.format(pu) : '', pu ? nf.format(pu * it.q) : '', mv.forn || '', mv.doc || '', mv.resp || '', mv.obs || '', mv.porNome || '']);
    }
  }
  download("movimentacoes-estoque-" + today() + ".csv", '﻿' + rows.map(function (r) {
    return r.map(q).join(';');
  }).join('\r\n'), 'text/csv;charset=utf-8');
}
function exportEstoqueCSV() {
  var C = calc(),
    q = function q(v) {
      return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    };
  var rows = [['Material', 'Categoria', 'Unidade', 'Saldo no depósito', 'Estoque mínimo', 'Situação', 'Custo médio', 'Valor em estoque', 'Local']].concat(db.materiais.map(function (m) {
    var s = C.saldo[m.id] || 0;
    return [m.nome, m.cat, m.un, nf.format(s), m.min ? nf.format(m.min) : '', status(m, s).t, C.custo[m.id] ? nf.format(C.custo[m.id]) : '', C.custo[m.id] && s > 0 ? nf.format(s * C.custo[m.id]) : '', m.local || ''];
  }));
  download("estoque-" + today() + ".csv", '﻿' + rows.map(function (r) {
    return r.map(q).join(';');
  }).join('\r\n'), 'text/csv;charset=utf-8');
}
function config() {
  if (!soAdmin()) return;
  sheet('⚙️ Configurações', "\n   " + pessoasSec() + "\n   <div class=\"sec\"><h2>Empresa</h2></div>\n   <div class=\"f\"><label>Nome da empresa (sai nas guias e relat\xF3rios)</label><input id=\"cEmp\" value=\"" + esc(db.empresa || '') + "\"></div>\n   <button class=\"btn dark full\" onclick=\"salvarEmpresa()\">Salvar nome</button>\n   <div class=\"sec\"><h2>Planilhas</h2></div>\n   <div class=\"grid g2\"><button class=\"btn soft\" onclick=\"exportEstoqueCSV()\">\uD83D\uDCE6 Estoque atual</button><button class=\"btn soft\" onclick=\"exportCSV()\">\uD83D\uDD04 Movimenta\xE7\xF5es</button></div>\n   <div class=\"sec\"><h2>Backup</h2></div>\n   <p class=\"muted small\" style=\"margin-top:0\">" + (nuvem() ? 'Os dados ficam salvos no estoque compartilhado. O backup guarda uma cópia das informações, sem as senhas.' : 'Os dados ficam salvos neste aparelho. Faça backup antes de trocar de aparelho.') + "</p>\n   <div class=\"grid g2\"><button class=\"btn primary\" onclick=\"fazerBackup()\">\u2B07\uFE0F Fazer backup</button><button class=\"btn soft\" onclick=\"$('#fileImport').click()\">\u2B06\uFE0F Restaurar backup</button></div>\n   <div class=\"sec\"><h2>Outros</h2></div>\n   " + (nuvem() ? '' : '<div class="grid g2"><button class="btn soft" onclick="loadDemoConfirmado()">Dados de exemplo</button><button class="btn danger" onclick="apagarEstoqueLocal()">Apagar tudo</button></div>') + "\n   <button class=\"btn soft full mt\" onclick=\"recolocarCatalogo()\">\uD83D\uDCCB Recolocar materiais da lista padr\xE3o</button>\n   <p class=\"muted small mt2\">" + db.materiais.length + " materiais \xB7 " + db.obras.length + " obras \xB7 " + db.movs.length + " movimenta\xE7\xF5es</p>");
}
function salvarEmpresa() {
  return _salvarEmpresa.apply(this, arguments);
}
function _salvarEmpresa() {
  _salvarEmpresa = _asyncToGenerator(_regenerator().m(function _callee17() {
    return _regenerator().w(function (_context17) {
      while (1) switch (_context17.n) {
        case 0:
          db.empresa = $('#cEmp').value.trim();
          _context17.n = 1;
          return persistir();
        case 1:
          if (!_context17.v) {
            _context17.n = 2;
            break;
          }
          render();
          toast('Nome salvo');
        case 2:
          return _context17.a(2);
      }
    }, _callee17);
  }));
  return _salvarEmpresa.apply(this, arguments);
}
function recolocarCatalogo() {
  return _recolocarCatalogo.apply(this, arguments);
}
function _recolocarCatalogo() {
  _recolocarCatalogo = _asyncToGenerator(_regenerator().m(function _callee18() {
    var n;
    return _regenerator().w(function (_context18) {
      while (1) switch (_context18.n) {
        case 0:
          n = aplicaCatalogo(true);
          _context18.n = 1;
          return persistir();
        case 1:
          if (!_context18.v) {
            _context18.n = 2;
            break;
          }
          render();
          toast(n ? n + ' materiais adicionados' : 'A lista padrão já está completa');
        case 2:
          return _context18.a(2);
      }
    }, _callee18);
  }));
  return _recolocarCatalogo.apply(this, arguments);
}
function loadDemoConfirmado() {
  if (confirm('Substituir os dados atuais pelos dados de exemplo?')) loadDemo();
}
function apagarEstoqueLocal() {
  if (nuvem() || !confirm('Apagar TODOS os dados deste aparelho? Faça backup antes.')) return;
  var pessoas = db.pessoas,
    empresa = db.empresa;
  db = Object.assign(blank(), {
    pessoas: pessoas,
    empresa: empresa
  });
  aplicaCatalogo();
  save();
  closeSheet();
  location.hash = '#inicio';
  render();
}
function fazerBackup() {
  return _fazerBackup.apply(this, arguments);
}
function _fazerBackup() {
  _fazerBackup = _asyncToGenerator(_regenerator().m(function _callee19() {
    var copia, _t10, _t11;
    return _regenerator().w(function (_context19) {
      while (1) switch (_context19.p = _context19.n) {
        case 0:
          copia = JSON.parse(JSON.stringify(db));
          _context19.p = 1;
          if (!nuvem()) {
            _context19.n = 3;
            break;
          }
          _context19.n = 2;
          return EstoqueCompartilhado.enviar('backup');
        case 2:
          _t10 = _context19.v;
          _context19.n = 5;
          break;
        case 3:
          _context19.n = 4;
          return fotoTodas();
        case 4:
          _t10 = _context19.v;
        case 5:
          copia._fotos = _t10;
          download("backup-estoque-" + today() + ".json", JSON.stringify(copia), 'application/json');
          _context19.n = 7;
          break;
        case 6:
          _context19.p = 6;
          _t11 = _context19.v;
          toast(_t11.message);
        case 7:
          return _context19.a(2);
      }
    }, _callee19, null, [[1, 6]]);
  }));
  return _fazerBackup.apply(this, arguments);
}
var lerTexto = function lerTexto(f) {
  return new Promise(function (res, rej) {
    var r = new FileReader();
    r.onload = function () {
      return res(r.result);
    };
    r.onerror = function () {
      return rej(r.error);
    };
    r.readAsText(f);
  });
};
$('#fileImport').addEventListener('change', function () {
  var _ref14 = _asyncToGenerator(_regenerator().m(function _callee5(e) {
    var f, d, fotos, ids, fotosAtivas, _t4, _t5;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          f = e.target.files[0];
          e.target.value = '';
          if (f) {
            _context5.n = 1;
            break;
          }
          return _context5.a(2);
        case 1:
          if (isAdmin()) {
            _context5.n = 2;
            break;
          }
          return _context5.a(2);
        case 2:
          _context5.p = 2;
          _t4 = JSON;
          _context5.n = 3;
          return lerTexto(f);
        case 3:
          d = _t4.parse.call(_t4, _context5.v);
          if (!(!d || !Array.isArray(d.materiais) || !Array.isArray(d.obras) || !Array.isArray(d.movs))) {
            _context5.n = 4;
            break;
          }
          throw new Error('formato');
        case 4:
          if (confirm("Restaurar backup com " + d.materiais.length + " materiais, " + d.obras.length + " obras e " + d.movs.length + " movimenta\xE7\xF5es? Os dados " + (nuvem() ? 'da equipe' : 'deste aparelho') + " ser\xE3o substitu\xEDdos.")) {
            _context5.n = 5;
            break;
          }
          return _context5.a(2);
        case 5:
          fotos = d._fotos || {};
          delete d._fotos;
          if (nuvem()) d.pessoas = db.pessoas;else if (!(d.pessoas || []).some(function (p) {
            return p.admin && p.ativo !== false;
          })) d.pessoas = (db.pessoas || []).concat((d.pessoas || []).filter(function (p) {
            return !pessoaById(p.id);
          }));
          db = Object.assign(blank(), d);
          ids = new Set(db.movs.filter(function (m) {
            return m.foto;
          }).map(function (m) {
            return m.id;
          })), fotosAtivas = {};
          Object.keys(fotos).filter(function (id) {
            return ids.has(id);
          }).forEach(function (id) {
            fotosAtivas[id] = fotos[id];
          });
          _context5.n = 6;
          return persistir({
            restaurar: true,
            fotos: fotosAtivas
          });
        case 6:
          if (_context5.v) {
            _context5.n = 7;
            break;
          }
          return _context5.a(2);
        case 7:
          if (!nuvem()) Object.keys(fotosAtivas).forEach(function (k) {
            return fotoPut(k, fotosAtivas[k]).catch(function () {});
          });
          closeSheet();
          location.hash = '#inicio';
          render();
          toast('Backup restaurado');
          _context5.n = 9;
          break;
        case 8:
          _context5.p = 8;
          _t5 = _context5.v;
          alert('Arquivo de backup inválido.');
        case 9:
          return _context5.a(2);
      }
    }, _callee5, null, [[2, 8]]);
  }));
  return function (_x14) {
    return _ref14.apply(this, arguments);
  };
}());
function loadDemo() {
  if (nuvem()) return;
  var d = blank();
  d.empresa = 'LANG Engenharia';
  var M = function M(nome, cat, un, min, preco, local) {
    var m = {
      id: uid(),
      nome: nome,
      cat: cat,
      un: un,
      min: min,
      preco: preco,
      local: local,
      criado: Date.now()
    };
    d.materiais.push(m);
    return m.id;
  };
  var cim = M('Cimento CP-II 50 kg', 'Cimento e argamassa', 'saco', 15, 38.9, 'Galpão'),
    arg = M('Argamassa AC-II 20 kg', 'Cimento e argamassa', 'saco', 10, 24.5, 'Galpão'),
    are = M('Areia média', 'Agregados', 'm³', 4, 145, 'Pátio'),
    bri = M('Brita 1', 'Agregados', 'm³', 4, 160, 'Pátio'),
    a10 = M('Vergalhão CA-50 10 mm', 'Aço e ferragens', 'barra', 10, 62, 'Baia de aço'),
    a8 = M('Vergalhão CA-50 8 mm', 'Aço e ferragens', 'barra', 30, 41, 'Baia de aço'),
    ara = M('Arame recozido 18', 'Aço e ferragens', 'kg', 10, 19.9, 'Prateleira B'),
    blo = M('Bloco cerâmico 14x19x29', 'Alvenaria', 'milheiro', 3, 1350, 'Pátio'),
    tub = M('Tubo PVC esgoto 100 mm', 'Hidráulica', 'barra', 5, 58, 'Prateleira C'),
    cab = M('Cabo flexível 2,5 mm', 'Elétrica', 'rolo', 5, 189, 'Prateleira D'),
    tab = M('Tábua de pinus 30 cm', 'Madeira e fôrmas', 'pç', 40, 28, 'Pátio'),
    tin = M('Tinta acrílica fosca 18 L', 'Pintura', 'lata', 4, 320, 'Prateleira E'),
    cap = M('Capacete de segurança', 'EPI', 'un', 10, 22, 'Armário EPI'),
    luv = M('Luva de raspa', 'EPI', 'par', 8, 12.5, 'Armário EPI');
  var O = function O(nome, end, resp, cor) {
    var o = {
      id: uid(),
      nome: nome,
      end: end,
      resp: resp,
      cor: cor,
      status: 'ativa',
      criado: Date.now()
    };
    d.obras.push(o);
    return o.id;
  };
  var o1 = O('Residencial Jardins', 'Rua das Flores, 120 — Centro', 'Carlos', '#ff5a00'),
    o2 = O('Casa Família Souza', 'Av. Brasil, 845 — Itaum', 'Marcos', '#2d6bd6'),
    o3 = O('Galpão Industrial Norte', 'Rod. BR-101, km 32', 'Paulo', '#16855f');
  var n = 0,
    t = Date.now() - 60 * 864e5;
  var V = function V(dd, tipo, obra, itens, x) {
    if (x === void 0) {
      x = {};
    }
    d.movs.push({
      id: uid(),
      n: ++n,
      tipo: tipo,
      obra: obra || '',
      data: daysAgo(dd),
      resp: x.resp || '',
      doc: x.doc || '',
      forn: x.forn || '',
      obs: x.obs || '',
      itens: itens.map(function (_ref15) {
        var m = _ref15[0],
          q = _ref15[1],
          v = _ref15[2];
        return v ? {
          m: m,
          q: q,
          v: v
        } : {
          m: m,
          q: q
        };
      }),
      criado: t += 36e5
    });
  };
  V(40, 'entrada', '', [[cim, 200, 37.5], [arg, 80, 24], [ara, 40, 19.5]], {
    forn: 'Casa do Construtor',
    doc: 'NF 10231',
    resp: 'Geovane'
  });
  V(39, 'entrada', '', [[a10, 150, 61], [a8, 150, 40]], {
    forn: 'Aço Sul',
    doc: 'NF 5512',
    resp: 'Geovane'
  });
  V(38, 'entrada', '', [[are, 30, 140], [bri, 20, 158]], {
    forn: 'Areial Itajaí',
    doc: 'NF 889',
    resp: 'Geovane'
  });
  V(37, 'entrada', '', [[blo, 12, 1320], [tub, 40, 57], [cab, 15, 185], [tab, 120, 27], [tin, 12, 315], [cap, 30, 21], [luv, 60, 12]], {
    forn: 'Depósito Central',
    doc: 'NF 7781',
    resp: 'Geovane'
  });
  V(35, 'saida', o1, [[cim, 60], [are, 8], [bri, 6], [a10, 50], [a8, 40], [ara, 12]], {
    resp: 'Carlos',
    doc: 'Caminhão QHT-2B41'
  });
  V(33, 'saida', o2, [[cim, 30], [are, 5], [blo, 4], [cap, 6], [luv, 12]], {
    resp: 'Marcos'
  });
  V(30, 'saida', o3, [[cim, 40], [bri, 8], [a10, 60], [a8, 50], [tab, 60]], {
    resp: 'Paulo',
    doc: 'Caminhão QHT-2B41'
  });
  V(26, 'saida', o1, [[blo, 5], [arg, 30], [tub, 15]], {
    resp: 'Carlos'
  });
  V(22, 'devolucao', o3, [[tab, 12], [a8, 6]], {
    resp: 'Paulo',
    obs: 'Sobra da fôrma do bloco B'
  });
  V(20, 'entrada', o2, [[tin, 6, 309]], {
    forn: 'Tintas Joinville',
    doc: 'NF 3301',
    resp: 'Marcos',
    obs: 'Entregue direto na obra'
  });
  V(16, 'saida', o2, [[cab, 6], [tub, 10], [arg, 20]], {
    resp: 'Marcos'
  });
  V(12, 'saida', o1, [[cim, 45], [are, 9], [a10, 25], [cab, 5]], {
    resp: 'Carlos'
  });
  V(9, 'entrada', '', [[cim, 100, 38.9], [are, 10, 145]], {
    forn: 'Casa do Construtor',
    doc: 'NF 10598',
    resp: 'Geovane'
  });
  V(7, 'saida', o3, [[cim, 50], [are, 10], [bri, 4], [ara, 15], [luv, 20]], {
    resp: 'Paulo'
  });
  V(5, 'saida', o2, [[tin, 4], [arg, 15], [cap, 4]], {
    resp: 'Marcos'
  });
  V(3, 'saida', o1, [[cim, 40], [tab, 30], [a8, 20], [cap, 8]], {
    resp: 'Carlos',
    doc: 'Caminhão QHT-2B41'
  });
  V(2, 'devolucao', o1, [[cim, 5]], {
    resp: 'Carlos',
    obs: 'Sacos fechados que sobraram'
  });
  V(1, 'saida', o3, [[tub, 8], [cab, 3], [luv, 18]], {
    resp: 'Paulo'
  });
  V(0, 'saida', o2, [[cim, 20], [are, 3]], {
    resp: 'Marcos'
  });
  d.seq = n;
  d.ultimoResp = 'Geovane';
  d.pessoas = db.pessoas || [];
  d.empresa = db.empresa || d.empresa;
  db = d;
  aplicaCatalogo();
  save();
  closeSheet();
  location.hash = '#inicio';
  render();
  toast('Dados de exemplo carregados');
}
$('#fab').onclick = function () {
  return formMov('saida');
};
$('#tabNew').onclick = function (e) {
  e.preventDefault();
  formMov('saida');
};
$('#btnCfg').onclick = config;
$('#btnUser').onclick = function () {
  return logout('Até logo!');
};
render();
abrirEstoque();
setInterval(function () {
  return atualizarEstoque(false);
}, 30000);
document.addEventListener('visibilitychange', function () {
  return atualizarEstoque(false);
});
if (navigator.serviceWorker && location.protocol !== 'file:') navigator.serviceWorker.register('service-worker.js').catch(function () {});
