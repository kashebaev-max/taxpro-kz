// pages/changes.js
import Layout from '../components/Layout'
export default function Changes() {
  const C = { surf:'#FFF', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A', muted:'#A09880',
    blue:'#1A4E86', blueLt:'#E8F0FA', amber:'#B86A00', amberLt:'#FDF0DC',
    red:'#A82828', redLt:'#FAEAEA', grn:'#1A6B3A', grnLt:'#E5F5EC', sh:'0 1px 4px rgba(0,0,0,.07)' }
  const changes = [
    { cat:'НДС', ico:'🔴', color:C.red, lt:C.redLt, items:[
      { name:'Ставка НДС', was:'12%', now:'16%', up:true },
      { name:'Порог регистрации', was:'20 000 МРП', now:'10 000 МРП', up:false, note:'≈43.25 млн ₸' },
    ]},
    { cat:'УНР', ico:'🟡', color:C.amber, lt:C.amberLt, items:[
      { name:'Ставка УНР', was:'3%', now:'4%', up:true, note:'региональная 2–6%' },
      { name:'Лимит оборота', was:'24 038 МРП', now:'600 000 МРП', up:true, note:'расширен' },
    ]},
    { cat:'ИПН', ico:'🟠', color:'#9B4A00', lt:'#FEF3E7', items:[
      { name:'Ставка ИПН', was:'10% (плоская)', now:'10% / 15%', up:true, note:'прогрессивная' },
      { name:'Порог ставки 15%', was:'—', now:'8 500 МРП/год', up:false },
      { name:'Стандартный вычет', was:'14 МРП/мес', now:'30 МРП/мес', up:true, note:'выгодно для работников' },
    ]},
    { cat:'Соц. платежи', ico:'🟢', color:C.grn, lt:C.grnLt, items:[
      { name:'ОПВР (работодатель)', was:'2.5%', now:'3.5%', up:true },
      { name:'Социальный налог', was:'11%−СО', now:'6%', up:false, note:'упрощён' },
    ]},
    { cat:'КПН', ico:'🔵', color:C.blue, lt:C.blueLt, items:[
      { name:'КПН базовая', was:'20%', now:'20%', up:null },
      { name:'КПН банки', was:'20%', now:'25%', up:true },
      { name:'КПН соц. сфера', was:'0%', now:'5%', up:true, note:'с 2027 — 10%' },
    ]},
    { cat:'Основные величины', ico:'📌', color:'#5B2A88', lt:'#F3EEF9', items:[
      { name:'МРП', was:'3 932 ₸', now:'4 325 ₸', up:true },
      { name:'МЗП', was:'85 000 ₸', now:'85 000 ₸', up:null },
    ]},
  ]
  return (
    <Layout active="changes">
      <div style={{ background:'linear-gradient(135deg,#1A4E86,#0D3060)', borderRadius:10, padding:'16px 22px', marginBottom:20, color:'#fff' }}>
        <div style={{ fontWeight:800, fontSize:17, marginBottom:3 }}>⚡ Изменения налогового законодательства 2026</div>
        <div style={{ fontSize:12, opacity:.85 }}>Закон РК №214-VIII от 18.07.2025 · Вступил в силу 01.01.2026</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:14 }}>
        {changes.map((g,gi) => (
          <div key={gi} style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, overflow:'hidden', boxShadow:C.sh }}>
            <div style={{ background:g.color, color:'#fff', padding:'10px 16px', fontWeight:700, fontSize:13 }}>{g.ico} {g.cat}</div>
            {g.items.map((item,i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 90px 90px 20px', alignItems:'center', padding:'9px 14px', borderBottom:i<g.items.length-1?`1px solid ${C.brd}`:'none', background:item.up===true?g.lt:item.up===false?C.grnLt:'transparent' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:500 }}>{item.name}</div>
                  {item.note && <div style={{ fontSize:10, color:C.muted }}>{item.note}</div>}
                </div>
                <div style={{ fontSize:11, color:C.sub, textDecoration:'line-through', textAlign:'center' }}>{item.was}</div>
                <div style={{ fontSize:12, fontWeight:700, color:g.color, fontFamily:'monospace', textAlign:'center' }}>{item.now}</div>
                <div style={{ textAlign:'center', fontSize:14 }}>{item.up===true?'↑':item.up===false?'↓':'='}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Layout>
  )
}
