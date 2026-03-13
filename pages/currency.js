import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

const C = { surf:'#FFF', alt:'#F7F5F1', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A', muted:'#A09880',
  blue:'#1A4E86', blueLt:'#E8F0FA', amber:'#B86A00', amberLt:'#FDF0DC', ip:'#0F5C8A', ipLt:'#E5F2FA',
  grn:'#1A6B3A', grnLt:'#E5F5EC', red:'#A82828', sh:'0 1px 4px rgba(0,0,0,.07)' }

const fmt = (v, d=2) => parseFloat(v).toLocaleString('ru-KZ', { minimumFractionDigits:d, maximumFractionDigits:d })

const CURRENCIES = [
  { code:'USD', name:'Доллар США',        flag:'🇺🇸' },
  { code:'EUR', name:'Евро',              flag:'🇪🇺' },
  { code:'RUB', name:'Российский рубль',  flag:'🇷🇺' },
  { code:'CNY', name:'Китайский юань',    flag:'🇨🇳' },
  { code:'GBP', name:'Фунт стерлингов',  flag:'🇬🇧' },
  { code:'JPY', name:'Японская иена',     flag:'🇯🇵' },
  { code:'KGS', name:'Кыргызский сом',   flag:'🇰🇬' },
  { code:'UZS', name:'Узбекский сум',     flag:'🇺🇿' },
  { code:'CHF', name:'Швейцарский франк', flag:'🇨🇭' },
  { code:'TRY', name:'Турецкая лира',     flag:'🇹🇷' },
  { code:'AED', name:'Дирхам ОАЭ',        flag:'🇦🇪' },
]

export default function Currency() {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [date, setDate] = useState('')
  const [calc, setCalc] = useState({ from:'USD', amount:'100' })
  const [source, setSource] = useState('')

  useEffect(() => {
    setDate(new Date().toLocaleDateString('ru-KZ', { day:'2-digit', month:'long', year:'numeric' }))
    loadRates()
  }, [])

  async function loadRates() {
    setLoading(true)
    // Try exchangerate-api (free, no CORS issues)
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/KZT')
      const data = await res.json()
      if (data.result === 'success') {
        const r = data.rates
        const parsed = CURRENCIES.map(c => ({
          ...c,
          rate: c.code === 'KZT' ? 1 : parseFloat((1 / r[c.code]).toFixed(4)),
          quant: 1
        })).filter(c => r[c.code])
        setRates(parsed)
        setSource('exchangerate-api.com')
        setLoading(false)
        return
      }
    } catch(e) {}

    // Fallback: frankfurter.app
    try {
      const codes = CURRENCIES.map(c => c.code).filter(c => c !== 'KZT').join(',')
      const res = await fetch(`https://api.frankfurter.app/latest?from=KZT&to=USD,EUR,RUB,CNY,GBP,JPY,CHF`)
      const data = await res.json()
      if (data.rates) {
        const parsed = CURRENCIES.map(c => ({
          ...c,
          rate: data.rates[c.code] ? parseFloat((1 / data.rates[c.code]).toFixed(4)) : null,
          quant: 1
        })).filter(c => c.rate)
        setRates(parsed)
        setSource('frankfurter.app')
        setLoading(false)
        return
      }
    } catch(e) {}

    // Final fallback: static approximate rates
    setRates(CURRENCIES.map(c => ({
      ...c,
      rate: { USD:508, EUR:543, RUB:5.4, CNY:70, GBP:643, JPY:3.3, KGS:5.8, UZS:0.041, CHF:577, TRY:14.5, AED:138 }[c.code] || 0,
      quant: 1
    })))
    setError('Не удалось загрузить актуальные курсы. Показаны ориентировочные данные.')
    setSource('резервные данные')
    setLoading(false)
  }

  const result = calc.amount && rates.length ? (() => {
    const r = rates.find(x => x.code === calc.from)
    return r ? (parseFloat(calc.amount) * r.rate / r.quant).toFixed(2) : ''
  })() : ''

  return (
    <Layout active="currency">
      <div style={{ background:'linear-gradient(135deg,#0F5C8A,#063A5A)', borderRadius:10, padding:'16px 22px', marginBottom:20, color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:800, fontSize:17, marginBottom:3 }}>💱 Курсы валют к тенге (KZT)</div>
          <div style={{ fontSize:12, opacity:.85 }}>Актуальные данные · Источник: {source||'загрузка...'}</div>
        </div>
        <div style={{ textAlign:'right', fontSize:12, opacity:.85 }}>
          <div>Дата курса</div>
          <div style={{ fontWeight:700, fontSize:15 }}>{date}</div>
        </div>
      </div>

      {error && (
        <div style={{ background:C.amberLt, border:'1px solid #E8C07A', borderRadius:7, padding:'8px 14px', marginBottom:14, fontSize:12, color:'#7A4A0A' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16 }}>
        <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, overflow:'hidden', boxShadow:C.sh }}>
          {loading ? (
            <div style={{ padding:60, textAlign:'center', color:C.muted }}>⏳ Загрузка актуальных курсов...</div>
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
                    <td style={{ padding:'10px 14px', fontSize:20 }}>{r.flag}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{r.name}</div>
                      {r.quant>1 && <div style={{ fontSize:10, color:C.muted }}>за {r.quant} {r.code}</div>}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ background:C.ipLt, color:C.ip, fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:3 }}>{r.code}</span>
                    </td>
                    <td style={{ padding:'10px 14px', textAlign:'right', fontWeight:700, fontSize:15, color:C.ip, fontFamily:'IBM Plex Mono,monospace' }}>
                      {fmt(r.rate, r.rate > 10 ? 2 : 4)} ₸
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ padding:'8px 14px', fontSize:10, color:C.muted, borderTop:`1px solid ${C.brd}` }}>
            Для официальных налоговых расчётов используйте курс на <b>nationalbank.kz</b>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, padding:18, boxShadow:C.sh }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>🧮 Конвертер валют</div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:C.sub, marginBottom:4 }}>Сумма</div>
              <div style={{ display:'flex', gap:8 }}>
                <input type="number" value={calc.amount} onChange={e=>setCalc(p=>({...p,amount:e.target.value}))}
                  style={{ flex:1, padding:'9px 10px', border:`1px solid ${C.brd}`, borderRadius:7, fontSize:14, outline:'none', fontFamily:'IBM Plex Mono,monospace' }}/>
                <select value={calc.from} onChange={e=>setCalc(p=>({...p,from:e.target.value}))}
                  style={{ padding:'9px 10px', border:`1px solid ${C.brd}`, borderRadius:7, fontSize:13, outline:'none', background:C.surf, cursor:'pointer' }}>
                  {rates.map(r => <option key={r.code} value={r.code}>{r.code}</option>)}
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
          <button onClick={loadRates} style={{ padding:'10px', background:C.blueLt, color:C.blue, border:`1px solid ${C.blue}30`, borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit' }}>
            🔄 Обновить курсы
          </button>
        </div>
      </div>
    </Layout>
  )
}
