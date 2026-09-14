const TYPES=['ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP','ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ'];
const GC={ST:'st',SF:'sf',NF:'nf',NT:'nt'}; const cache={}; let state={type:null,tab:'celeb',idx:0};
const E=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
let ALL=null;
async function loadAll(){
  if(ALL)return ALL;
  if(!('DecompressionStream' in window))throw Error('이 브라우저는 압축 데이터 해제를 지원하지 않습니다. 최신 Safari·Chrome·Samsung Internet으로 열어주세요.');
  const files=['chunk0.txt','chunk1.txt','chunk2a.txt','chunk2bfix.txt','chunk3a.txt','chunk3b.txt','chunk4.txt','chunk5.txt','chunk6.txt','chunk7.txt'];
  const parts=await Promise.all(files.map(async name=>{
    const r=await fetch(`data/${name}`);
    if(!r.ok)throw Error(`데이터 파일 ${name}을 불러오지 못했습니다.`);
    return r.text();
  }));
  const bin=atob(parts.join(''));
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  ALL=JSON.parse(await new Response(stream).text());
  return ALL;
}
async function load(t){
  if(cache[t])return cache[t];
  if(t==='ENFP'){
    const r=await fetch('data/types/enfp.json?v=20260913-easter3',{cache:'no-store'});
    if(!r.ok)throw Error('ENFP 데이터를 불러오지 못했습니다.');
    return cache[t]=await r.json();
  }
  const all=await loadAll();
  return cache[t]=all[t];
}
function home(){document.getElementById('app').innerHTML=`<div class="wrap"><div class="brand"><div class="logo">M</div>MBTI NEXT</div><section class="home"><div class="hero"><div class="kicker">YOUR TYPE, YOUR NEXT STEP</div><h1>내 MBTI를 선택하세요</h1><p class="lead">16개 유형 전체가 연결된 통합 버전입니다. <b>인물 설명 · 추천 활동 · 도전 활동</b>을 확인해보세요.</p><div class="grid">${TYPES.map(t=>`<button class="typeBtn ${GC[groupOf(t)]}" onclick="openType('${t}')">${t}</button>`).join('')}</div><div class="legend"><span>ST</span><span>SF</span><span>NF</span><span>NT</span></div><div class="note">유명인의 MBTI는 대부분 비공식 추정입니다. 공개된 경력과 대외 이미지를 유형의 선호 특성과 연결한 수업용 예시이며 실제 성격을 단정하는 자료가 아닙니다.</div><div class="signatureHero">MADE BY <b>RANCHO</b></div><div style="margin-top:10px;text-align:center;font-size:9px;line-height:1.5;color:#9a9ca5">교육용 비공식 콘텐츠입니다. 공식 MBTI® 검사 또는 관련 기관의 공식 서비스가 아닙니다.<br>MBTI®는 The Myers &amp; Briggs Foundation의 등록상표입니다.</div></div></section></div>`}
function groupOf(t){return ['ISTJ','ISTP','ESTP','ESTJ'].includes(t)?'ST':['ISFJ','ISFP','ESFP','ESFJ'].includes(t)?'SF':['INFJ','INFP','ENFP','ENFJ'].includes(t)?'NF':'NT'}
async function openType(t){state={type:t,tab:'celeb',idx:0}; document.getElementById('app').innerHTML='<div class="loading">불러오는 중…</div>'; try{await load(t); render()}catch(e){document.getElementById('app').innerHTML=`<div class="wrap"><div class="error">${E(e.message)}</div></div>`}}
function setTab(tab){state.tab=tab;state.idx=0;render()} function next(){const d=cache[state.type],a=state.tab==='celeb'?d.celebrities:state.tab==='recommend'?d.recommend:d.challenge;state.idx=(state.idx+1)%a.length;render()}
function detailBox(d){return `<details><summary>자세히 보기</summary><div class="detailGrid"><div class="box"><b>네 글자의 의미</b><div class="letters">${(d.letters||[]).map(x=>`<span>${E(x)}</span>`).join('')}</div></div><div class="box"><b>강점</b>${E((d.strengths||[]).join(' · '))}</div><div class="box"><b>주의할 점</b>${E((d.watchouts||[]).join(' · '))}</div><div class="box"><b>대학생활에서는</b>${E(d.campus)}</div><div class="box"><b>성장 포인트</b>${E(d.growth)}</div><div class="box"><b>기억하기</b>MBTI는 능력이나 가능성을 결정하는 점수가 아니라 자신의 선호 경향을 이해하는 하나의 도구입니다.</div></div></details>`}
function render(){const t=state.type,d=cache[t],g=d.group; let body=''; if(state.tab==='celeb'){const c=d.celebrities[state.idx];body=`<div class="card"><div class="eyebrow">FAMOUS PERSON</div><h2>${E(c.name_ko)}</h2><div class="meta">${E(c.name_en)} · ${E(c.profession)} · ${E(c.nationality)} <span class="status">${E(c.status)}</span><span class="confidence">신뢰도 ${E(c.confidence)}</span></div><p class="profile">${E(c.intro_long)}</p>${c.signature?.length?`<div class="keybox"><b>대표작 · 대표영역 <span style="font-weight:700;color:#9a9ca5">(국내 제목 우선)</span></b>${c.signature.map(E).join(' · ')}</div>`:''}${c.achievement?.length?`<div class="keybox"><b>주요 성과</b>${c.achievement.map(E).join(' · ')}</div>`:''}<div class="typeWhy"><b>왜 ${t}로 분류될까?</b>${E(c.type_rationale)}<span class="caution">※ ${E(c.status)} · 공개된 경력과 대외 이미지로 실제 MBTI를 확정할 수 없습니다.</span></div><button class="next" onclick="next()">다른 사람 보기 ↻</button></div>`} else {const a=(state.tab==='recommend'?d.recommend:d.challenge)[state.idx],ch=state.tab==='challenge';body=`<div class="card"><div class="eyebrow">${ch?'CHALLENGE':'RECOMMENDED'} ACTIVITY</div><h2>${E(a.title)}</h2><div class="reason ${ch?'challenge':''}"><b>${ch?'왜 도전할까?':'왜 추천할까?'}</b>${E(a.reason)}</div><div class="mission"><b>MISSION · 이렇게 해보세요</b>${E(a.mission)}</div><div class="complete"><b>완료 기준</b>${E(a.completion)}</div><div class="chips"><span>${E(a.duration)}</span><span>${E(a.mode)}</span><span>난이도 ${E(a.difficulty)}</span><span>${E(a.category)}</span></div><button class="next" onclick="next()">다른 활동 보기 ↻</button></div>`}
document.getElementById('app').innerHTML=`<div class="wrap"><div class="brand"><div class="logo">M</div>MBTI NEXT</div><div class="top"><button class="back" onclick="home()">← 16유형</button><span class="pill">${t} · ${g}</span></div><div class="panel"><div class="eyebrow">MY TYPE</div><div class="tt">${t}</div><div class="tag">${E(d.tagline)}</div><div class="summary">${E(d.detail.summary)}</div>${detailBox(d.detail)}</div><div class="tabs"><button class="${state.tab==='celeb'?'active':''}" onclick="setTab('celeb')">유명인</button><button class="${state.tab==='recommend'?'active':''}" onclick="setTab('recommend')">추천 활동</button><button class="${state.tab==='challenge'?'active':''}" onclick="setTab('challenge')">도전 활동</button></div>${body}<div class="signatureFooter">Made by RanCho · 2026</div><div style="margin:6px 8px 0;text-align:center;font-size:8px;line-height:1.5;color:#a5a7af">교육용 비공식 콘텐츠 · 공식 MBTI® 검사 또는 관련 기관의 공식 서비스가 아닙니다.<br>MBTI®는 The Myers &amp; Briggs Foundation의 등록상표입니다.</div></div>`}
home();