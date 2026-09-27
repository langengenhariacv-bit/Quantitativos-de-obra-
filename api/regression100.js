const sharp=require('sharp');

const PLANS=[
 {id:1,name:'Hangzhou 3 quartos',kind:'P/B cotada',url:'https://imgpicture.kan3721.com/221128013800_thumb.jpg'},
 {id:2,name:'Edifício multifamiliar colorido',kind:'multifamiliar',url:'https://i.archi.ru/i/650/235527.png'},
 {id:3,name:'Lagom residencial com garagem',kind:'P/B mobiliada',url:'https://static.wixstatic.com/media/860bee_a80eb8e49f104cdeb26f59818a85bdae~mv2.jpg/v1/fill/w_2500%2Ch_2777%2Cal_c/860bee_a80eb8e49f104cdeb26f59818a85bdae~mv2.jpg'},
 {id:4,name:'Imobiliária colorida',kind:'marketing',url:'https://lid.zoocdn.com/u/1024/768/a0577c1b6b507a34f811e8e385ebc4f7e19a7e40.jpg'},
 {id:5,name:'Duplex simétrico',kind:'duplex P/B',url:'https://images.squarespace-cdn.com/content/v1/678844c055cd445561eb0942/de015f7b-4f6a-400e-acc5-cf78084b6419/MSCAN5220-1BX%2B%28Canton-duplex%29.jpg'},
 {id:6,name:'Casa moderna em L',kind:'P/B mobiliada',url:'https://hitech-house.com/application/files/2215/2378/6037/bower-barwon-plan.jpeg'},
 {id:7,name:'Prancha com carimbo 1:50',kind:'prancha técnica',url:'https://khamsat.hsoubcdn.com/images/profiles/992519/a8704483da4e52c974953edd09577573.jpg'},
 {id:8,name:'ProcessOn colorida',kind:'colorida cotada',url:'https://pocdn.processon.com/admin/knowledge/article_content_img/66f140f0f8e22204bf981aed.png'},
 {id:9,name:'Apartamento Aparna',kind:'P/B escala',url:'https://coohom-biz-sg-s3.coohom.com/ins/static/case/kitchen-gallery-balcony-floorplan-1765430417791544100.jpg'},
 {id:10,name:'Casa dois pavimentos imobiliária',kind:'P/B dois pavimentos',url:'https://lc.zoocdn.com/0de9474c63fd1c243bb3db9bbb4572db10e33729.jpg'},
 {id:11,name:'Apartamento colorido IA layout',kind:'colorida',url:'https://floordesign.ai/nuxt_img/floor-plan-generator/generator-style-colored.webp'},
 {id:12,name:'Casa moderna 180 m²',kind:'P/B complexa',url:'https://optimumhouse.ru/history-projects/floors/mikea-x-v3.jpg'},
 {id:13,name:'Bungalow imobiliária',kind:'P/B espessa',url:'https://greenhouseos-media.s3.eu-west-2.amazonaws.com/00DQH000007lqC12AI/a0dWS000006PO5cYAG/467c6d/60_manor_road-high.jpg'},
 {id:14,name:'Casa africana 3 quartos',kind:'P/B cotada',url:'https://4.bp.blogspot.com/--5xqY0vhfP0/V0BfD1IJPbI/AAAAAAAAelQ/pWND2zk1lPYhvCd9VWLkKjWB1OZ4s5rnQCLcB/s1600/ra4.jpg'},
 {id:15,name:'Apartamento hachurado',kind:'hachuras/cotas',url:'https://i.pinimg.com/736x/26/24/ee/2624eec9fcb01e358ef81e8070b1ef22.jpg'},
 {id:16,name:'Sobrado brasileiro 5x25',kind:'Brasil cotada',url:'https://www.gaprojetos.com/assets/site/uploader/projetos/1000a/planta_com_medidas_-PLOT-A4_page-0001.jpg'},
 {id:17,name:'Casa brasileira 3 quartos',kind:'Brasil mobiliada',url:'https://i.pinimg.com/736x/75/b7/bd/75b7bd0e24abf3f6a6322b3134288263.jpg'},
 {id:18,name:'Apartamento A2 técnico',kind:'Brasil técnico',url:'https://imgv2-2-f.scribdassets.com/img/document/931688771/original/392c32c2e9/1?v=1'},
 {id:19,name:'Casa Metricon 4 quartos',kind:'P/B mobiliada',url:'https://files.openlot.com.au/p/home_stock/Lot%20238%20Westringia%20Approach%20by%20Metricon%20Homes___6902_floorplan_1725970020.jpg'},
 {id:20,name:'Ranch 1400 sq ft',kind:'P/B densa',url:'https://i.pinimg.com/originals/01/b2/e4/01b2e413cfc774006d4a00a9a3315c2d.jpg'},
 {id:21,name:'UNCW 3 quartos',kind:'P/B fina',url:'https://uncw.edu/media/images/application-assets/housing/village-3-br-notpad-housing.png'},
 {id:22,name:'Casa MCMV compacta',kind:'P/B imobiliária',url:'https://i.pinimg.com/originals/25/b3/74/25b374e105cd3a1ed9442578579c83ae.png'},
 {id:23,name:'Casa com pátio central',kind:'curvas/pátio',url:'https://i.pinimg.com/736x/82/c9/d1/82c9d1a8abeeba993a5dfc25dabe5108.jpg'},
 {id:24,name:'Casa em U',kind:'U complexa',url:'https://i.pinimg.com/originals/97/e4/1f/97e41f01df188685ed643ac2d57bca7c.jpg'},
 {id:25,name:'Casa modular 64 m²',kind:'P/B escala gráfica',url:'https://optim.tildacdn.net/tild3437-6633-4035-b731-633266336133/-/format/webp/7.jpg.webp'},
 {id:26,name:'Split level',kind:'níveis',url:'https://hel1.your-objectstorage.com/old-web/remodelai/seo1/split-level-house-floor-plans/5.jpg'},
 {id:27,name:'Garagem + apartamento',kind:'dois desenhos',url:'https://i.ebayimg.com/images/g/kTgAAOSwLF1X-jrj/s-l1200.jpg'},
 {id:28,name:'Prancha universitária A1',kind:'carimbo/cotas',url:'https://website-assets.studocu.com/img/document_thumbnails/da624d7c2555a882cd0ec4c68dbf1a1f/thumb_1200_848.png'},
 {id:29,name:'Bungalow 6,5x8,5',kind:'colorida fina',url:'https://i0.wp.com/prohomedecors.com/wp-content/uploads/2020/06/Small-Bungalow-6.5x8.5-meter-22x28-feet.jpg?resize=640%2C512&ssl=1'},
 {id:30,name:'Casa 2 quartos 42m²',kind:'P/B verde/cotas',url:'https://i.pinimg.com/736x/e1/a5/db/e1a5dbc84d9fc10b706521f08ae66c94.jpg'}
];

function bounds(gray,w,h){
 const row=new Float32Array(h),col=new Float32Array(w);
 for(let y=0;y<h;y++){let l=0;for(let x=0;x<w;x+=2)if(gray[y*w+x]>205)l++;row[y]=l/Math.ceil(w/2)}
 for(let x=0;x<w;x++){let l=0;for(let y=0;y<h;y+=2)if(gray[y*w+x]>205)l++;col[x]=l/Math.ceil(h/2)}
 const longest=(a,m)=>{let bs=0,be=a.length-1,s=-1,best=0;for(let i=0;i<=a.length;i++){const on=i<a.length&&a[i]>=m;if(on&&s<0)s=i;if((!on||i===a.length)&&s>=0){if(i-s>best){best=i-s;bs=s;be=i-1}s=-1}}return[bs,be]};
 const rx=longest(col,.18),ry=longest(row,.18);let r={x0:rx[0],x1:rx[1]+1,y0:ry[0],y1:ry[1]+1};
 if((r.x1-r.x0)*(r.y1-r.y0)<w*h*.18)r={x0:0,y0:0,x1:w,y1:h};
 const mx=Math.max(2,Math.round((r.x1-r.x0)*.004)),my=Math.max(2,Math.round((r.y1-r.y0)*.004));
 return{x0:Math.min(r.x1-1,r.x0+mx),x1:Math.max(r.x0+1,r.x1-mx),y0:Math.min(r.y1-1,r.y0+my),y1:Math.max(r.y0+1,r.y1-my)};
}
function otsu(gray,roi,w){
 const hist=new Uint32Array(256);let n=0,sum=0;
 for(let y=roi.y0;y<roi.y1;y++)for(let x=roi.x0;x<roi.x1;x++){const v=gray[y*w+x];hist[v]++;n++;sum+=v}
 let wb=0,sb=0,best=90,max=-1;for(let t=0;t<256;t++){wb+=hist[t];if(!wb)continue;const wf=n-wb;if(!wf)break;sb+=t*hist[t];const mb=sb/wb,mf=(sum-sb)/wf,v=wb*wf*(mb-mf)*(mb-mf);if(v>max){max=v;best=t}}
 return Math.max(45,Math.min(205,best));
}
function darkMask(gray,w,h,roi){
 const th=otsu(gray,roi,w),rw=roi.x1-roi.x0,rh=roi.y1-roi.y0,integ=new Uint32Array((rw+1)*(rh+1)),mask=new Uint8Array(w*h);
 for(let yy=0;yy<rh;yy++){let rs=0;for(let xx=0;xx<rw;xx++){rs+=gray[(roi.y0+yy)*w+roi.x0+xx];integ[(yy+1)*(rw+1)+xx+1]=integ[yy*(rw+1)+xx+1]+rs}}
 const rad=Math.max(6,Math.round(Math.min(rw,rh)*.012));
 for(let yy=0;yy<rh;yy++)for(let xx=0;xx<rw;xx++){const x0=Math.max(0,xx-rad),x1=Math.min(rw-1,xx+rad),y0=Math.max(0,yy-rad),y1=Math.min(rh-1,yy+rad),A=integ[y0*(rw+1)+x0],B=integ[y0*(rw+1)+x1+1],C=integ[(y1+1)*(rw+1)+x0],D=integ[(y1+1)*(rw+1)+x1+1],mean=(D-B-C+A)/((x1-x0+1)*(y1-y0+1)),v=gray[(roi.y0+yy)*w+roi.x0+xx];if(v<th||v<mean-25)mask[(roi.y0+yy)*w+roi.x0+xx]=1}
 return{mask,threshold:th};
}
function scan(mask,w,roi,axis,minLen){
 const out=[],outer=axis==='h'?[roi.y0,roi.y1]:[roi.x0,roi.x1],inner=axis==='h'?[roi.x0,roi.x1]:[roi.y0,roi.y1],allow=Math.max(1,Math.round(minLen*.035));
 for(let o=outer[0];o<outer[1];o++){let s=-1,last=-1,g=0;for(let i=inner[0];i<=inner[1];i++){const x=axis==='h'?i:o,y=axis==='h'?o:i,on=i<inner[1]&&mask[y*w+x];if(on){if(s<0)s=i;last=i;g=0}else if(s>=0&&++g>allow){if(last-s+1>=minLen)out.push({axis,pos:o,a:s,b:last,len:last-s+1});s=-1;last=-1;g=0}}}
 return out;
}
function cluster(runs,roi,axis,minLen){
 if(!runs.length)return[];runs.sort((a,b)=>a.pos-b.pos||a.a-b.a);const used=new Uint8Array(runs.length),out=[],span=axis==='h'?roi.y1-roi.y0:roi.x1-roi.x0,maxBand=Math.max(4,Math.round(span*.01)),edge=Math.max(4,span*.012);
 for(let i=0;i<runs.length;i++){if(used[i])continue;const cl=[runs[i]];used[i]=1;let ch=true;while(ch){ch=false;for(let j=i+1;j<runs.length;j++){if(used[j])continue;for(const r of cl){if(Math.abs(runs[j].pos-r.pos)>maxBand)continue;const ov=Math.max(0,Math.min(r.b,runs[j].b)-Math.max(r.a,runs[j].a)+1),rr=ov/Math.max(1,Math.min(r.len,runs[j].len));if(rr>.66&&Math.abs(r.len-runs[j].len)<Math.max(22,r.len*.45)){used[j]=1;cl.push(runs[j]);ch=true;break}}}}
 const ps=cl.map(r=>r.pos).sort((a,b)=>a-b),as=cl.map(r=>r.a).sort((a,b)=>a-b),bs=cl.map(r=>r.b).sort((a,b)=>a-b),minP=ps[0],maxP=ps[ps.length-1],th=maxP-minP+1,pos=ps[Math.floor(ps.length/2)],a=as[Math.floor(as.length/2)],b=bs[Math.floor(bs.length/2)],len=b-a+1,near=pos<(axis==='h'?roi.y0:roi.x0)+edge||pos>(axis==='h'?roi.y1:roi.x1)-edge;if(len>=minLen&&(cl.length>=2||th>=3||len>=minLen*2.25)&&th<=Math.max(55,span*.05)&&len/Math.max(1,th)>=3&&!near)out.push({axis,pos,a,b,len,thick:th,count:cl.length})}
 return out;
}
function merge(list,roi){
 const out=[],minDim=Math.min(roi.x1-roi.x0,roi.y1-roi.y0),gapMax=minDim*.055,posTol=Math.max(3,minDim*.006);
 for(const axis of ['h','v']){const arr=list.filter(x=>x.axis===axis).sort((a,b)=>a.pos-b.pos||a.a-b.a),used=new Uint8Array(arr.length);for(let i=0;i<arr.length;i++){if(used[i])continue;let cur={...arr[i]};used[i]=1;let ch=true;while(ch){ch=false;for(let j=i+1;j<arr.length;j++){if(used[j])continue;const q=arr[j];if(Math.abs(q.pos-cur.pos)>posTol)continue;const gap=Math.max(q.a-cur.b,cur.a-q.b,0),ov=Math.max(0,Math.min(cur.b,q.b)-Math.max(cur.a,q.a));if(gap<=gapMax||ov>0){cur.a=Math.min(cur.a,q.a);cur.b=Math.max(cur.b,q.b);cur.len=cur.b-cur.a+1;cur.thick=Math.max(cur.thick,q.thick);used[j]=1;ch=true}}}out.push(cur)}}
 return out;
}
function connected(a,b,t){if(a.axis!==b.axis){const H=a.axis==='h'?a:b,V=a.axis==='v'?a:b;return V.pos>=H.a-t&&V.pos<=H.b+t&&H.pos>=V.a-t&&H.pos<=V.b+t}return Math.abs(a.pos-b.pos)<=t&&Math.max(a.a,b.a)<=Math.min(a.b,b.b)+t*2}
function analyzeSegments(seg,roi){
 const tol=Math.max(4,Math.round(Math.min(roi.x1-roi.x0,roi.y1-roi.y0)*.014)),adj=seg.map(()=>[]);
 for(let i=0;i<seg.length;i++)for(let j=i+1;j<seg.length;j++)if(connected(seg[i],seg[j],tol)){adj[i].push(j);adj[j].push(i)}
 const seen=new Uint8Array(seg.length),comps=[];for(let i=0;i<seg.length;i++){if(seen[i])continue;const st=[i],ids=[];seen[i]=1;while(st.length){const n=st.pop();ids.push(n);for(const q of adj[n])if(!seen[q]){seen[q]=1;st.push(q)}}comps.push({ids,length:ids.reduce((s,k)=>s+seg[k].len,0),nodes:ids.length})}comps.sort((a,b)=>b.length-a.length);
 const largest=comps[0]?.length||1,ids=new Set();for(const cp of comps)if(cp===comps[0]||((cp.length>=largest*.08||cp.nodes>=3)&&(cp.nodes>=2||cp.length>=largest*.22)))for(const id of cp.ids)ids.add(id);
 let accepted=[],uncertain=[];seg.forEach((r,i)=>{const degree=adj[i].length,score=.42*Math.min(1,r.thick/5)+.28*Math.min(1,r.len/Math.max(1,Math.min(roi.x1-roi.x0,roi.y1-roi.y0)*.12))+.30*Math.min(1,degree/2);r.score=score;r.connections=degree;(ids.has(i)&&score>=.28&&(degree>0||r.thick>=3)?accepted:uncertain).push(r)});
 if(!accepted.length&&uncertain.length>=6){const minDim=Math.min(roi.x1-roi.x0,roi.y1-roi.y0),strong=uncertain.filter(r=>r.thick>=3&&r.len>=minDim*.055);if(strong.length>=4){let minX=1e9,maxX=-1,minY=1e9,maxY=-1;for(const r of strong){if(r.axis==='h'){minX=Math.min(minX,r.a);maxX=Math.max(maxX,r.b);minY=Math.min(minY,r.pos);maxY=Math.max(maxY,r.pos)}else{minX=Math.min(minX,r.pos);maxX=Math.max(maxX,r.pos);minY=Math.min(minY,r.a);maxY=Math.max(maxY,r.b)}}const coverage=Math.sqrt(Math.max(0,((maxX-minX)/(roi.x1-roi.x0))*((maxY-minY)/(roi.y1-roi.y0))));if(coverage>=.32){const set=new Set(strong);accepted=strong;uncertain=uncertain.filter(r=>!set.has(r));}}}
 return{accepted,uncertain,comps,adj};
}
function metrics(gray,w,h){
 const roi=bounds(gray,w,h),dm=darkMask(gray,w,h,roi),minDim=Math.min(roi.x1-roi.x0,roi.y1-roi.y0),minLen=Math.max(14,Math.round(minDim*.013)),hRuns=cluster(scan(dm.mask,w,roi,'h',minLen),roi,'h',minLen),vRuns=cluster(scan(dm.mask,w,roi,'v',minLen),roi,'v',minLen),merged=merge([...hRuns,...vRuns],roi),g=analyzeSegments(merged,roi),a=g.accepted,u=g.uncertain,total=a.reduce((s,r)=>s+r.len,0),cand=merged.reduce((s,r)=>s+r.len,0),conn=a.filter(r=>r.connections>0).length,q=a.length?Math.max(0,Math.min(1,.48*total/Math.max(1,cand)+.30*conn/a.length+.22*Math.min(1,a.length/14))):0;
 let minX=1e9,maxX=-1,minY=1e9,maxY=-1;for(const r of a){if(r.axis==='h'){minX=Math.min(minX,r.a);maxX=Math.max(maxX,r.b);minY=Math.min(minY,r.pos);maxY=Math.max(maxY,r.pos)}else{minX=Math.min(minX,r.pos);maxX=Math.max(maxX,r.pos);minY=Math.min(minY,r.a);maxY=Math.max(maxY,r.b)}}const bw=maxX>=minX?(maxX-minX)/(roi.x1-roi.x0):0,bh=maxY>=minY?(maxY-minY)/(roi.y1-roi.y0):0,dom=(g.comps[0]?.length||0)/Math.max(1,cand),unc=u.length/Math.max(1,merged.length),hv=[a.filter(x=>x.axis==='h').length,a.filter(x=>x.axis==='v').length],network=Math.sqrt(Math.max(0,bw*bh)),multiOk=q>=.50&&a.length>=8&&network>=.42&&unc<=.86,pass=a.length>=4&&q>=.30&&(dom>=.24||multiOk)&&(bw>=.24||bh>=.24)&&unc<=.86;
 return{pass,threshold:dm.threshold,accepted:a.length,uncertain:u.length,quality:+q.toFixed(3),dominant:+dom.toFixed(3),bboxWidth:+bw.toFixed(3),bboxHeight:+bh.toFixed(3),networkCoverage:+network.toFixed(3),horizontal:hv[0],vertical:hv[1],lengthPx:Math.round(total),roi:{w:roi.x1-roi.x0,h:roi.y1-roi.y0},uncertainDebug:{thickness:u.map(r=>r.thick).sort((a,b)=>a-b),lengths:u.map(r=>Math.round(r.len)).sort((a,b)=>a-b),scores:u.map(r=>+r.score.toFixed(3)).sort((a,b)=>a-b)},reason:pass?'ok':a.length<4?'few-segments':q<.30?'low-quality':(!multiOk&&dom<.24)?'fragmented':unc>.86?'too-uncertain':'small-coverage'};
}
async function fetchImageWithRetry(url){
  let last=null;
  for(let attempt=0;attempt<4;attempt++){
    const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),15000);
    try{
      const r=await fetch(url,{signal:ctl.signal,headers:{'user-agent':'Mozilla/5.0 LANG-Quantitativos-Regressao/1.0 (+https://langquantitativos.vercel.app/)','accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8','referer':'https://commons.wikimedia.org/'}});
      clearTimeout(timer);
      if(r.ok)return r;
      last=new Error('HTTP '+r.status);
      if(r.status!==429&&r.status<500)throw last;
    }catch(e){clearTimeout(timer);last=e}
    await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));
  }
  throw last||new Error('Falha ao baixar imagem');
}
async function one(p){
 try{
  const r=await fetchImageWithRetry(p.url);const buf=Buffer.from(await r.arrayBuffer());if(buf.length>12*1024*1024)throw new Error('image-too-large');
  const {data,info}=await sharp(buf,{failOn:'none'}).rotate().resize({width:900,height:900,fit:'inside',withoutEnlargement:true}).flatten({background:'#fff'}).greyscale().raw().toBuffer({resolveWithObject:true});
  return{...p,status:'ok',width:info.width,height:info.height,bytes:buf.length,...metrics(data,info.width,info.height)};
 }catch(e){return{...p,status:'error',pass:false,error:String(e&&e.message||e)}}
}

let DATASET100=null;
function hashTitle(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
async function commonsCategory(category,limit=250){
  const url='https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle='+encodeURIComponent('Category:'+category)+'&gcmtype=file&gcmlimit='+limit+'&prop=imageinfo&iiprop=url|mime&iiurlwidth=1200&format=json&formatversion=2&origin=*';
  const r=await fetch(url,{headers:{'user-agent':'LANG-Quantitativos-Regressao/1.0'}});
  if(!r.ok)throw new Error('Commons API '+r.status);
  const j=await r.json(),pages=j.query&&j.query.pages||[];
  return pages.map(p=>{
    const ii=p.imageinfo&&p.imageinfo[0];if(!ii)return null;
    const mime=ii.mime||'',u=ii.thumburl||ii.url||'';
    if(!/^image\/(jpeg|png|webp)$/i.test(mime)||!u)return null;
    return{name:String(p.title||'').replace(/^File:/,''),url:u,mime};
  }).filter(Boolean);
}
async function commonsSearch(query,limit=100){
  const url='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(query)+'&gsrnamespace=6&gsrlimit='+limit+'&prop=imageinfo&iiprop=url|mime&iiurlwidth=1200&format=json&formatversion=2&origin=*';
  const r=await fetch(url,{headers:{'user-agent':'LANG-Quantitativos-Regressao/1.0'}});
  if(!r.ok)throw new Error('Commons search '+r.status);
  const j=await r.json(),pages=j.query&&j.query.pages||[];
  return pages.map(p=>{
    const ii=p.imageinfo&&p.imageinfo[0];if(!ii)return null;
    const mime=ii.mime||'',u=ii.thumburl||ii.url||'';
    if(!/^image\/(jpeg|png|webp)$/i.test(mime)||!u)return null;
    return{name:String(p.title||'').replace(/^File:/,''),url:u,mime};
  }).filter(Boolean);
}
async function buildDataset100(){
  if(DATASET100)return DATASET100;
  const pools=[];
  try{pools.push(...await commonsCategory('Floor_plans_of_houses',500))}catch(e){}
  for(const q of ['"floor plan" house','"house plan" floor','"apartment plan" floor','"ground floor plan" house','"first floor plan" house','"residential floor plan"']){
    try{pools.push(...await commonsSearch(q,100))}catch(e){}
  }
  const seen=new Set(PLANS.map(p=>p.url)),unique=[];
  for(const p of pools){
    if(seen.has(p.url))continue;
    const n=p.name.toLowerCase();
    if(/elevation|facade|façade|section|portrait|map\b|photograph|photo\b/.test(n))continue;
    seen.add(p.url);unique.push(p);
  }
  unique.sort((a,b)=>hashTitle(a.name)-hashTitle(b.name));
  const selected=unique.slice(0,70).map((p,i)=>({id:31+i,name:'Commons — '+p.name,kind:'Wikimedia Commons',url:p.url,source:'commons'}));
  if(selected.length<70)throw new Error('Base pública retornou apenas '+selected.length+' imagens válidas.');
  DATASET100=[...PLANS.map(p=>({...p,source:'internet-static'})),...selected];
  return DATASET100;
}

module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  let dataset;
  try{dataset=await buildDataset100()}catch(e){return res.status(500).json({error:String(e&&e.message||e)})}
  if(req.query.list)return res.status(200).json({dataset:dataset.length,items:dataset.map(({id,name,kind,url,source})=>({id,name,kind,url,source}))});
  const start=Math.max(0,Math.min(dataset.length-1,Number(req.query.start||0))),
        count=Math.max(1,Math.min(5,Number(req.query.count||5))),
        slice=dataset.slice(start,start+count),
        results=[];for(const p of slice){results.push(await one(p));if(p.source==='commons')await new Promise(resolve=>setTimeout(resolve,120));}
  res.status(200).json({dataset:dataset.length,start,count:results.length,passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,results});
};