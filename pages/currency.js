import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
const C = { surf:'#FFF', alt:'#F7F5F1', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A', muted:'#A09880',
  blue:'#1A4E86', blueLt:'#E8F0FA', amber:'#B86A00', amberLt:'#FDF0DC', ip:'#0F5C8A', ipLt:'#E5F2FA',
  grn:'#1A6B3A', grnLt:'#E5F5EC', red:'#A82828', sh:'0 1px 4px rgba(0,0,0,.07)' }
const fmt = (v,d=2) => parseFloat(v).toLocaleString('ru-KZ',{minimumFractionDigits:d,maximumFractionDigits:d})
const NAMES = { USD:'Доллар США',EUR:'Евро',RUB:'Российский рубль',CNY:'Китайский юань',GBP:'Фунт стерлингов',JPY:'Японская иена',KGS:'Кыргызский сом',UZS:'Узбекский сум',BYR:'Белорусский рубль',CHF:'Швейцарский франк',TRY:'Турецкая лира',AED:'Дирхам ОАЭ' }
const FLAGS = { USD:'🇺🇸',EUR:'🇪🇺',RUB:'🇷🇺',CNY:'🇨🇳',GBP:'🇬🇧',JPY:'🇯🇵',KGS:'🇰🇬',UZS:'🇺🇿',BYR:'🇧🇾',CHF:'🇨🇭',TRY:'🇹🇷',AED:'🇦🇪' }
const FALLBACK = [
  {code:'USD',rate:508,quant:1},{code:'EUR',rate:543,quant:1},{code:'RUB',rate:5.4,quant:1},
  {code:'CNY',rate:70,quant:1},{code:'GBP',rate:643,quant:1},{code:'JPY',rate:3.3,quant:1},
  {code:'KGS',rate:5.8,quant:1},{code:'UZS',rate:0.041,quant:1},{code:'CHF',rate:577,quant:1},{code:'AED',rate:138,quant:1},
]

export default function Currency() {
  const [rates, setRates] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [date, setDate] = useState('')
  const [calc, setCalc] = useState({ from:'USD', amount:'' })

  useEffect(() => {
    const today = new Date()
    setDate(today.toLocaleDateString('ru-KZ', { day:'2-digit', month:'long', year:'numeric' }))
    const url = 'https://nationalbank.kz/rss/rates_all.xml'
    fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)
      .then(r => r.text())
      .then(xml => {
        const doc = new DOMParser().parseFromString(xml, 'text/xml')
        const KEYS = ['USD','EUR','RUB','CNY','GBP','JPY','KGS','UZS','CHF','TRY','AED']
        const parsed = KEYS.map(code => {
          const item = [...doc.querySelectorAll('item')].find(el => el.querySelector('title')?.textContent === code)
          if (!item) return null
          return { code, rate: parseFloat(item.querySelector('description')?.textContent||0), quant: parseInt(item.querySelector('quant')?.textContent||1) }
        }).filter(Boolean)
        setRates(parsed.length ? parsed : FALLBACK)
        setLoading(false)
      })
      .catch(() => { setRates(FALLBACK); setError('Ориентировочные курсы (нет соединения с НБ РК)'); setLoading(false) })
  }, [])

  const result = calc.amount && rates ? (() => {
    const r = rates.find(x => x.code === calc.from)
    return r ? (parseFloat(calc.amount) * r.rate / r.quant).toFixed(2) : ''
  })() : ''

  return (
    <Layout active="currency">
      <div style={{ background:'linear-gradient(135deg,#0F5C8A,#063A5A)', borderRadius:10, padding:'16px 22px', marginBottom:20, color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:800, fontSize:17, marginBottom:3 }}>💱 Курсы валют к тенге (KZT)</div>
          <div style={{ fontSize:12, opacity:.85 }}>Источник: Национальный Банк Республики Казахстан · nationalbank.kz</div>
        </div>
        <div style={{ textAlign:'right', fontSize:12, opacity:.85 }}>
          <div>Дата курса</div>
          <div style={{ fontWeight:700, fontSize:15 }}>{date}</div>
        </div>
      </div>
      {error && <div style={{ background:C.amberLt, border:'1px solid #E8C07A', borderRadius:7, padding:'8px 14px', marginBottom:14, fontSize:12, color:'#7A4A0A' }}>⚠️ {error}</div>}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16 }}>
        <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, overflow:'hidden', boxShadow:C.sh }}>
          {loading ? (
            <div style={{ padding:'60px', textAlign:'center', color:C.muted }}>⏳ Загрузка курсов от НБ РК...</div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:C.ip }}>
                  {['','Валюта','Код','Курс (тенге)'].map((h,i) => (
                    <th key={i} style={{ padding:'9px 14px', color:'#fff', fontSize:10, fontWeight:700, textAlign:i===3?'right':'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rates.map((r,i) => (
                  <tr key={r.code} style={{ borderBottom:`1px solid ${C.brd}`, background:i%2===0?C.surf:C.alt }}>
                    <td style={{ padding:'10px 14px', fontSize:20 }}>{FLAGS[r.code]||'🏳️'}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{NAMES[r.code]||r.code}</div>
                      {r.quant>1 && <div style={{ fontSize:10, color:C.muted }}>за {r.quant} {r.code}</div>}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ background:C.ipLt, color:C.ip, fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:3 }}>{r.code}</span>
                    </td>
                    <td style={{ padding:'10px 14px', textAlign:'right', fontWeight:700, fontSize:15, color:C.ip, fontFamily:'IBM Plex Mono,monospace' }}>
                      {fmt(r.rate, r.rate>10?2:4)} ₸
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, padding:18, boxShadow:C.sh }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>🧮 Конвертер валют</div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:C.sub, marginBottom:4 }}>Сумма</div>
              <div style={{ display:'flex', gap:8 }}>
                <input type="number" value={calc.amount} onChange={e=>setCalc(p=>({...p,amount:e.target.value}))} placeholder="100"
                  style={{ flex:1, padding:'9px 10px', border:`1px solid ${C.brd}`, borderRadius:7, fontSize:14, outline:'none', fontFamily:'IBM Plex Mono,monospace' }}/>
                <select value={calc.from} onChange={e=>setCalc(p=>({...p,from:e.target.value}))}
                  style={{ padding:'9px 10px', border:`1px solid ${C.brd}`, borderRadius:7, fontSize:13, outline:'none', background:C.surf, cursor:'pointer' }}>
                  {(rates||FALLBACK).map(r => <option key={r.code} value={r.code}>{r.code}</option>)}
                </select>
              </div>
            </div>
            <div style={{ background:C.ipLt, border:`1px solid ${C.ip}30`, borderRadius:8, padding:'14px 16px', textAlign:'center' }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>= тенге (KZT)</div>
              <div style={{ fontSize:26, fontWeight:800, color:C.ip, fontFamily:'IBM Plex Mono,monospace' }}>
                {result ? fmt(parseFloat(result), 2)+' ₸' : '— ₸'}
              </div>
            </div>
          </div>
          <div style={{ background:C.amberLt, border:'1px solid #E8C07A', borderRadius:10, padding:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.amber, marginBottom:6 }}>ℹ️ Для налоговых расчётов</div>
            <div style={{ fontSize:11, color:'#7A4A0A', lineHeight:1.6 }}>
              Используйте официальный курс НБ РК на дату операции.<br/>
              Сайт: <b>nationalbank.kz</b> → Курсы валют.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
