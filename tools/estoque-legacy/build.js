// Gera estoque/app-legacy.js (JavaScript ES5 para o Safari do iOS 9) a partir de estoque/app.js.
// Uso:  cd tools/estoque-legacy && npm ci && node build.js
const fs=require('fs'),path=require('path'),babel=require('@babel/core'),acorn=require('acorn');
const dir=path.join(__dirname,'..','..','estoque');
const src=fs.readFileSync(path.join(dir,'app.js'),'utf8');
const out=babel.transformSync(src,{babelrc:false,configFile:false,sourceType:'script',comments:false,
  presets:[['@babel/preset-env',{targets:{ie:'11'},loose:true,modules:false}]]});
let code=out.code;
if(/regeneratorRuntime\b/.test(code)&&!/function _regeneratorRuntime/.test(code))
  code=fs.readFileSync(require.resolve('regenerator-runtime/runtime.js'),'utf8')+'\n'+code;
code='/* GERADO por tools/estoque-legacy/build.js a partir de estoque/app.js. Não edite à mão. */\n'
  +fs.readFileSync(path.join(dir,'legacy-polyfills.js'),'utf8')+'\n'+code+'\n';
acorn.parse(code,{ecmaVersion:5,sourceType:'script'}); // falha se sobrar sintaxe que o iOS 9 não entende
fs.writeFileSync(path.join(dir,'app-legacy.js'),code);
console.log('estoque/app-legacy.js gerado:',code.length,'bytes (ES5 ok)');
