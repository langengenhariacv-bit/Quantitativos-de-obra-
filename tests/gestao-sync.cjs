const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const html=fs.readFileSync('gestao/index.html','utf8');
for(const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
const cryptoCode=html.slice(html.indexOf('function buf64('),html.indexOf('async function fetchBlob('));
const syncCode=html.slice(html.indexOf('function syncPending(){'),html.indexOf('const offRetry='));
const errorCode=html.slice(html.indexOf('function syncErrorMessage('),html.indexOf('function netError('));
async function run(){
const c=vm.createContext({crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,btoa,atob,Blob,Response,CompressionStream,DecompressionStream,JSON});
vm.runInContext(cryptoCode,c);
// Old spread conversion fails on this size. The corrected format stays compatible.
const big={text:'ação🙂'.repeat(100000)};
c.big=big;
await vm.runInContext("encryptData(big,'test-password').then(p=>decryptData(p,'test-password')).then(d=>{if(d.text!==big.text)throw Error('round-trip')})",c);
// v2 compresses before encrypting: realistic data must fit far below the ~64 KB storage limit.
const realistic={projects:Array.from({length:300},(_,i)=>({id:'p'+i,name:'Obra residencial '+i,client:'Cliente '+(i%20),status:'em andamento',notes:'Levantamento de quantitativos e acompanhamento.'}))};
c.realistic=realistic;
const sizes=await vm.runInContext("(async()=>{const p=await encryptData(realistic,'pw');const d=await decryptData(p,'pw');if(JSON.stringify(d)!==JSON.stringify(realistic))throw Error('v2 round-trip');return {app:p.app,len:JSON.stringify(p).length,raw:JSON.stringify(realistic).length}})()",c);
assert.equal(sizes.app,'lang-engenharia-gestao-v2');
assert.ok(sizes.len<sizes.raw/3,'compressed payload '+sizes.len+' vs raw '+sizes.raw);
// old v1 payloads (uncompressed) stored on the server or in the device still open
const v1=await vm.runInContext("(async()=>{const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await derive('pw',salt);const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify({a:'ação'})));return decryptData({app:'lang-engenharia-gestao-v1',salt:buf64(salt),iv:buf64(iv),data:buf64(cipher)},'pw')})()",c);
assert.equal(v1.a,'ação');
for(const fail of [null,'network','encrypt','local-write']){
const entries=new Map([['local',{revision:2,items:['pending']}],['synced',{revision:1}]]);
let writes=0;
Object.assign(c,{currentPassword:'test',offPending:true,offNet:false,offSyncP:null,offLastError:'',state:null,
 offDB:{get:async k=>entries.get(k),set:async(k,v)=>{if(fail==='local-write')throw Error('Storage failed');entries.set(k,v)},del:async k=>entries.delete(k)},
 fetchBlob:async()=>{if(fail==='network')throw Object.assign(Error('network'),{offline:true});return {revision:1}},
 decryptData:async x=>x,encryptData:async x=>{if(fail==='encrypt')throw Error('Encryption failed');return x},
 normalize:x=>x,ensureChromeProjects:()=>{},ensureFinanceSnapshot20260930:()=>{},ensureRecoveredProjectFinance20260930:()=>{},ensureAgentLinks:()=>{},
 putBlob:async()=>{writes++},offStatus:()=>{},status:()=>{},render:()=>{},toast:()=>{},updateReminders:()=>{},document:{querySelector:()=>null},console:{error:()=>{}}
});
vm.runInContext(errorCode+syncCode,c);
const ok=await vm.runInContext('syncPending()',c);
assert.equal(ok,!fail);assert.equal(entries.has('local'),!!fail);
assert.equal(c.offSyncP,null);
if(fail)assert.match(c.offLastError,/guardadas/);
if(!fail){assert.equal(writes,1);assert.equal(c.state.items[0],'pending');assert.equal(c.offPending,false)}
}
assert.ok(html.includes("if(pend){state=normalize(await decryptData(pend,currentPassword));await syncPending();return}"));
console.log('PASS: script syntax, large encrypted round-trip, gzip v2 compression, v1 compatibility, sync success, network/encryption/local-storage failure preserves pending data.');
}
run().catch(e=>{console.error(e);process.exit(1)});
