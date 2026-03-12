// pages/calendar.js
import Layout from '../components/Layout'
export default function Calendar() {
  const C = { surf:'#FFF', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A', muted:'#A09880',
    blue:'#1A4E86', blueLt:'#E8F0FA', amber:'#B86A00', amberLt:'#FDF0DC', sh:'0 1px 4px rgba(0,0,0,.07)' }
  const deadlines = [
    { d:'15 мая 2026',    form:'200', desc:'ИПН и соц. платежи — 1 кв.',   type:['ИП','ТОО'], urgent:false },
    { d:'15 мая 2026',    form:'300', desc:'НДС 16% — 1 квартал',           type:['ИП','ТОО'], urgent:false },
    { d:'15 авг. 2026',   form:'910', desc:'УНР 4% — 1 полугодие',          type:['ИП','ТОО'], urgent:true },
    { d:'15 авг. 2026',   form:'200', desc:'ИПН и соц. платежи — 2 кв.',   type:['ИП','ТОО'], urgent:true },
    { d:'15 авг. 2026',   form:'300', desc:'НДС 16% — 2 квартал',           type:['ИП','ТОО'], urgent:true },
    { d:'15 ноя. 2026',   form:'200', desc:'ИПН и соц. платежи — 3 кв.',   type:['ИП','ТОО'], urgent:false },
    { d:'15 ноя. 2026',   form:'300', desc:'НДС 16% — 3 квартал',           type:['ИП','ТОО'], urgent:false },
    { d:'15 фев. 2027',   form:'910', desc:'УНР 4% — 2 полугодие 2026',    type:['ИП','ТОО'], urgent:false },
    { d:'31 мар. 2027',   form:'100', desc:'КПН — год 2026',                type:['ТОО'],       urgent:false },
    { d:'31 мар. 2027',   form:'220', desc:'ИПН ИП (ОУР) — год 2026',      type:['ИП'],        urgent:false },
  ]
  const formColor = { '910':'#1A6B3A','200':'#1A4E86','300':'#A82828','100':'#5B2A88','220':'#0F5C8A','912':'#0F6B5A' }
  return (
    <Layout active="calendar">
      <h1 style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>📅 Налоговый календарь 2026</h1>
      <p style={{ fontSize:13, color:C.sub, marginBottom:20 }}>Сроки сдачи деклараций · КГД МФ РК · НК РК 2026</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:12 }}>
        {deadlines.map((d,i) => (
          <div key={i} style={{ background:d.urgent?C.amberLt:C.surf, border:`1px solid ${d.urgent?'#E8C07A':C.brd}`, borderRadius:10, padding:16, boxShadow:C.sh, borderLeft:`4px solid ${d.urgent?C.amber:formColor[d.form]||C.blue}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div style={{ fontWeight:700, fontSize:13, color:d.urgent?C.amber:C.txt }}>{d.urgent?'⚡ ':''}{d.d}</div>
              <span style={{ background:formColor[d.form]+'22', color:formColor[d.form]||C.blue, fontSize:11, fontWeight:800, padding:'2px 8px', borderRadius:4 }}>{d.form}</span>
            </div>
            <div style={{ fontSize:13, marginBottom:8 }}>{d.desc}</div>
            <div style={{ display:'flex', gap:6 }}>
              {d.type.map(t => <span key={t} style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:3, background:t==='ИП'?'#E5F2FA':'#E8F0FA', color:t==='ИП'?'#0F5C8A':'#1A4E86' }}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
