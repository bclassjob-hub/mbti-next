(function(){
  const style=document.createElement('style');
  style.textContent=`
    .randomBtn{background:#fff;border-radius:13px;padding:12px 13px;font-size:11px;font-weight:900;box-shadow:0 5px 14px rgba(0,0,0,.05);color:#6f63d9;white-space:nowrap;min-width:78px}
    .randomBtn:active{transform:scale(.97)}
    @media(max-width:420px){.randomBtn{padding:12px 10px;font-size:11px;min-width:74px}}
  `;
  document.head.appendChild(style);

  async function randomCeleb(){
    const app=document.getElementById('app');
    if(app) app.innerHTML='<div class="loading">랜덤 유명인 찾는 중…</div>';
    try{
      const all=await loadAll();
      const pool=[];
      for(const t of TYPES){
        const d=t==='ENFP' ? await load('ENFP') : all[t];
        if(!d) continue;
        cache[t]=d;
        (d.celebrities||[]).forEach((c,i)=>{
          if(c.easter_egg || c.status==='본인 확인') return;
          pool.push({type:t,idx:i});
        });
      }
      if(!pool.length) throw Error('랜덤으로 볼 유명인이 없습니다.');
      const pick=pool[Math.floor(Math.random()*pool.length)];
      state={type:pick.type,tab:'celeb',idx:pick.idx};
      render();
      window.scrollTo({top:0,behavior:'smooth'});
    }catch(e){
      if(app) app.innerHTML=`<div class="wrap"><div class="error">${E(e.message)}</div></div>`;
    }
  }

  function decorate(){
    const top=document.querySelector('.top');
    if(!top || top.querySelector('.randomBtn')) return;
    const pill=top.querySelector('.pill');
    if(!pill) return;
    const btn=document.createElement('button');
    btn.className='randomBtn';
    btn.type='button';
    btn.textContent='🎲 랜덤';
    btn.setAttribute('aria-label','유명인 랜덤 보기');
    btn.addEventListener('click',randomCeleb);
    top.insertBefore(btn,pill);
  }

  decorate();
  const observer=new MutationObserver(decorate);
  observer.observe(document.getElementById('app'),{childList:true,subtree:true});
})();