const originalLoad=load;
load=async function(t){
  if(cache[t]) return cache[t];
  if(t==='ENFP'){
    const r=await fetch('data/enfp.json?v=20260913-easter1',{cache:'no-store'});
    if(!r.ok) throw Error('ENFP 이스터에그 데이터를 불러오지 못했습니다.');
    return cache[t]=await r.json();
  }
  return originalLoad(t);
};
