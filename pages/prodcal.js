import { useState } from 'react'
import Layout from '../components/Layout'
const C = { surf:'#FFF', alt:'#F7F5F1', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A', muted:'#A09880',
  blue:'#1A4E86', blueLt:'#E8F0FA', amber:'#B86A00', amberLt:'#FDF0DC',
  grn:'#1A6B3A', grnLt:'#E5F5EC', sh:'0 1px 4px rgba(0,0,0,.07)' }
const MONTHS = [
  {m:'Январь',  kd:31,kdb:29,d55:19,h55:152,d56:24,h56:158,d65:19,h65:136.8,d66:24,h66:144},
  {m:'Февраль', kd:28,kdb:28,d55:20,h55:160,d56:24,h56:160,d65:20,h65:144.0,d66:24,h66:144},
  {m:'Март*',   kd:31,kdb:27,d55:18,h55:144,d56:22,h56:148,d65:18,h65:129.6,d66:22,h66:132,star:true},
  {m:'Апрель',  kd:30,kdb:30,d55:22,h55:176,d56:26,h56:174,d65:22,h65:158.4,d66:26,h66:156},
  {m:'Май*',    kd:31,kdb:28,d55:17,h55:136,d56:22,h56:146,d65:17,h65:122.4,d66:22,h66:132,star:true},
  {m:'Июнь',    kd:30,kdb:30,d55:22,h55:176,d56:26,h56:174,d65:22,h65:158.4,d66:26,h66:156},
  {m:'Июль',    kd:31,kdb:30,d55:22,h55:176,d56:26,h56:174,d65:22,h65:158.4,d66:26,h66:156},
  {m:'Август*', kd:31,kdb:30,d55:20,h55:160,d56:25,h56:165,d65:20,h65:144.0,d66:25,h66:150,star:true},
  {m:'Сентябрь',kd:30,kdb:30,d55:22,h55:176,d56:26,h56:174,d65:22,h65:158.4,d66:26,h66:156},
  {m:'Октябрь*',kd:31,kdb:30,d55:21,h55:168,d56:26,h56:172,d65:21,h65:151.2,d66:26,h66:156,star:true},
  {m:'Ноябрь',  kd:30,kdb:30,d55:21,h55:168,d56:25,h56:167,d65:21,h65:151.2,d66:25,h66:150},
  {m:'Декабрь', kd:31,kdb:30,d55:22,h55:176,d56:26,h56:174,d65:22,h65:158.4,d66:26,h66:156},
]
const Q = [
  {m:'I квартал',  kd:90, kdb:84, d55:57,h55:456,d56:70,h56:466,d65:57,h65:410.4,d66:70,h66:420},
  {m:'II квартал', kd:91, kdb:88, d55:61,h55:488,d56:74,h56:494,d65:61,h65:439.2,d66:74,h66:444},
  {m:'III квартал',kd:92, kdb:90, d55:64,h55:512,d56:77,h56:513,d65:64,h65:460.8,d66:77,h66:462},
  {m:'IV квартал', kd:92, kdb:90, d55:64,h55:512,d56:77,h56:513,d65:64,h65:460.8,d66:77,h66:462},
]
const YEAR = {m:'Год 2026',kd:365,kdb:352,d55:246,h55:1968,d56:298,h56:1986,d65:246,h65:1771.2,d66:298,h66:1788}
const OPTS = [['d55','h55','40ч · 5 дней'],['d56','h56','40ч · 6 дней'],['d65','h65','36ч · 5 дней'],['d66','h66','36ч · 6 дней']]

export default function ProdCal() {
  const [mode, setMode] = useState('d55')
  const hKey = mode.replace('d','h')
  const rows = [
    ...MONTHS.slice(0,3), Q[0], ...MONTHS.slice(3,6), Q[1],
    ...MONTHS.slice(6,9), Q[2], ...MONTHS.slice(9), Q[3], YEAR
  ]
  const isQ = r => r.m.includes('квартал')||r.m==='Год 2026'
  const th = t => <th style={{ padding:'7px 10px', background:C.blue, color:'#fff', fontSize:10, fontWeight:700, textAlign:'left', borderRight:'1px solid rgba(255,255,255,.15)', whiteSpace:'nowrap' }}>{t}</th>
  const td = (v,bold,color,bg) => <td style={{ padding:'7px 10px', fontSize:12, fontWeight:bold?700:400, color:color||C.txt, background:bg||'transparent', borderBottom:`1px solid ${C.brd}`, borderRight:`1px solid ${C.brd}` }}>{v}</td>
  return (
    <Layout active="prodcal">
      <div style={{ background:'linear-gradient(135deg,#1A4E86,#0D3060)', borderRadius:10, padding:'16px 22px', marginBottom:16, color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:800, fontSize:17, marginBottom:3 }}>📆 Производственный календарь 2026</div>
          <div style={{ fontSize:12, opacity:.85 }}>Республика Казахстан · Баланс рабочего времени</div>
        </div>
        <div style={{ textAlign:'right', fontSize:12, opacity:.85 }}>
          <div>Норма рабочего времени</div>
          <div style={{ fontWeight:700, fontSize:15 }}>{YEAR[mode]} дн / {YEAR[hKey]} ч</div>
        </div>
      </div>
      <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, padding:'10px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', boxShadow:C.sh }}>
        <span style={{ fontSize:12, fontWeight:700, color:C.sub }}>Режим работы:</span>
        <div style={{ display:'flex', background:C.alt, border:`1px solid ${C.brd}`, borderRadius:8, padding:3, gap:2 }}>
          {OPTS.map(([dk,,label]) => (
            <button key={dk} onClick={()=>setMode(dk)} style={{ padding:'5px 14px', background:mode===dk?C.blue:'transparent', color:mode===dk?'#fff':C.sub, border:'none', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:600, fontFamily:'inherit' }}>{label}</button>
          ))}
        </div>
        <span style={{ fontSize:11, color:C.muted, marginLeft:'auto' }}>Среднемесячно: <b>{({d55:'20.50',d56:'24.83',d65:'20.50',d66:'24.83'})[mode]} дн</b></span>
      </div>
      <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, overflow:'auto', boxShadow:C.sh }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>{[th('Период'),th('Кал. дни'),th('КД без пр.'),th('Раб. дней'),th('Раб. часов')]}</tr></thead>
          <tbody>
            {rows.map((r,i) => {
              const q=isQ(r), year=r.m==='Год 2026'
              const bg=year?'#E5F5EC':q?'#EEF4FF':i%2===0?C.surf:C.alt
              const fc=year?C.grn:q?C.blue:r.star?C.amber:C.txt
              return <tr key={i}>{[
                td(r.m, q||year, fc, bg),
                td(r.kd, q||year, fc, bg),
                td(r.kdb, q||year, fc, bg),
                td(r[mode], q||year, fc, bg),
                td(r[hKey], q||year, fc, bg),
              ]}</tr>
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop:12, fontSize:11, color:C.muted }}>* При совпадении праздника с выходным днём выходным является следующий рабочий день (ст.85 ТК РК)</div>
    </Layout>
  )
}
