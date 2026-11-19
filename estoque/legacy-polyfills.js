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
