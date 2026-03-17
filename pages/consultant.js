import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'

const C = {
  surf:'#FFF', alt:'#F7F5F1', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A', muted:'#A09880',
  blue:'#1A4E86', blueLt:'#E8F0FA', blueMd:'#2C69B3',
  grn:'#1A6B3A', grnLt:'#E5F5EC',
  sh:'0 1px 4px rgba(0,0,0,.07)',
}

const SYSTEM_PROMPT = `Ты — профессиональный бухгалтер-консультант по налоговому законодательству Республики Казахстан. Твоё имя — Жанара. Ты работаешь в системе TaxPro KZ.

ТВОИ ЗНАНИЯ (актуальны на 2026 год):

СТАВКИ И ПОКАЗАТЕЛИ 2026:
- МРП: 4 325 тенге
- МЗП: 85 000 тенге
- НДС: 16% (повышен с 12% с 01.01.2025, Закон №214-VIII)
- ИПН: 10% (дивиденды при владении >3 лет — 5%, нерезиденты — 15%)
- КПН: 20% (сельхоз — 10%, СЭЗ — 0%)
- УНР (Форма 910): 4% от дохода, полугодовая
- Патент: 1% от дохода
- Розничный налог (Форма 912): 4% (Алматы/Астана/Шымкент — 6%)
- ОПВ работника: 10% (max 50 МЗП = 4 250 000 ₸/мес.)
- ОПВР работодателя: 3.5% в 2026 г. (max 50 МЗП)
- ВОСМС работника: 2% (max 10 МЗП = 850 000 ₸/мес.)
- ВОСМС работодателя: 3% (max 10 МЗП)
- СО работодателя: 3.5% (max 7 МЗП = 595 000 ₸/мес.)
- Социальный налог (ОУР): 9.5% от ФОТ
- Налог на имущество юрлиц: 1.5%/год

ЛИМИТЫ 2026:
- Порог НДС: 20 000 МРП = 86 500 000 ₸/год
- УНР лимит дохода: 24 038 МРП = 103 964 350 ₸ за полугодие, макс. 30 сотрудников
- Патент лимит: 3 528 МРП = 15 258 600 ₸/год, без наёмных работников

СРОКИ ДЕКЛАРАЦИЙ:
- Форма 910 (УНР): 1 п/г — до 15 августа; 2 п/г — до 15 февраля
- Форма 300 (НДС): до 15-го числа 2-го месяца после квартала
- Форма 200 (ИПН/СН): до 15-го числа 2-го месяца после квартала
- Форма 100 (КПН): до 31 марта следующего года
- Форма 700 (имущество/земля/транспорт): до 31 марта

КЛЮЧЕВЫЕ ИЗМЕНЕНИЯ 2025-2026:
- НДС повышен с 12% до 16% с 01.01.2025 (Закон №214-VIII от 12.12.2023)
- ОПВР введены поэтапно: 2024 — 1.5%, 2025 — 2.5%, 2026 — 3.5%
- ЭСФ обязательны для всех плательщиков НДС с 2025 г.
- Виртуальный склад обязателен для торговли при обороте >500 МРП/квартал
- Новый МРП 4 325 ₸ на 2026 год

РАСЧЁТЫ (примеры):
- Зарплата 200 000 ₸: ОПВ 20 000 + ВОСМС 4 000 + стандартный вычет 85 000 = база ИПН 91 000 → ИПН 9 100 ₸. На руки: 200 000 − 20 000 − 4 000 − 9 100 = 166 900 ₸
- ОПВР: 200 000 × 3.5% = 7 000 ₸; СО: 200 000 × 3.5% = 7 000 ₸; ВОСМС работодателя: 200 000 × 3% = 6 000 ₸

ПРАВИЛА ОТВЕТОВ:
- Отвечай чётко, структурировано, по делу
- Используй цифры, формулы, конкретные примеры
- Если нужен расчёт — показывай его пошагово
- Ссылайся на конкретные статьи НК РК, формы деклараций
- Если вопрос вне твоей компетенции — честно скажи об этом
- Отвечай на русском языке
- Используй эмодзи умеренно для структурирования ответа
- Не давай юридических советов, только бухгалтерские консультации`

const QUICK = [
  'Как рассчитать зарплату с налогами?',
  'Какие сроки сдачи Формы 910?',
  'Как рассчитать НДС к уплате?',
  'Чем отличается УНР от ОУР?',
  'Как рассчитать ОПВР в 2026 году?',
  'Кто обязан регистрироваться по НДС?',
]

export default function Consultant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Здравствуйте! Я Жанара, ваш бухгалтер-консультант по налоговому законодательству Казахстана.\n\nЗнаю все актуальные ставки, сроки и изменения НК РК на 2026 год. Задайте любой вопрос — отвечу чётко и с расчётами.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  async function send(text) {
    const q = text || input.trim()
    if (!q || loading) return
    setInput('')
    const newMessages = [...messages, { role:'user', content:q }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role:m.role, content:m.content }))
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Ошибка получения ответа.'
      setMessages(prev => [...prev, { role:'assistant', content:reply }])
    } catch(e) {
      setMessages(prev => [...prev, { role:'assistant', content:'⚠️ Ошибка соединения. Попробуйте ещё раз.' }])
    }
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function formatText(text) {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />
      if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontWeight:700, marginTop:6 }}>{line.slice(2,-2)}</div>
      // Bold within text
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <div key={i} style={{ marginBottom:1 }}>
          {parts.map((p, j) => j%2===1 ? <strong key={j}>{p}</strong> : p)}
        </div>
      )
    })
  }

  return (
    <Layout active="consultant">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:14, height:'calc(100vh - 120px)', minHeight:500 }}>
        {/* Chat */}
        <div style={{ display:'flex', flexDirection:'column', background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, overflow:'hidden', boxShadow:C.sh }}>
          {/* Chat header */}
          <div style={{ background:'linear-gradient(135deg,#1A4E86,#0D3060)', padding:'12px 18px', color:'#fff', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, background:'rgba(255,255,255,.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>👩‍💼</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>Жанара — AI Бухгалтер-консультант</div>
              <div style={{ fontSize:11, opacity:.85 }}>Налоговое законодательство РК 2026 · НДС 16% · МРП 4 325 ₸</div>
            </div>
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
              <div style={{ width:7, height:7, background:'#4ADE80', borderRadius:'50%' }}/>
              Онлайн
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', gap:8, alignItems:'flex-start' }}>
                {m.role==='assistant' && (
                  <div style={{ width:32, height:32, background:C.blue, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, marginTop:2 }}>👩‍💼</div>
                )}
                <div style={{
                  maxWidth:'75%',
                  background: m.role==='user' ? C.blue : C.alt,
                  color: m.role==='user' ? '#fff' : C.txt,
                  padding:'10px 14px',
                  borderRadius: m.role==='user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize:13, lineHeight:1.65,
                  boxShadow:C.sh,
                  border: m.role==='assistant' ? `1px solid ${C.brd}` : 'none'
                }}>
                  {m.role==='assistant' ? formatText(m.content) : m.content}
                </div>
                {m.role==='user' && (
                  <div style={{ width:32, height:32, background:C.grn, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0, color:'#fff', fontWeight:700, marginTop:2 }}>В</div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <div style={{ width:32, height:32, background:C.blue, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>👩‍💼</div>
                <div style={{ background:C.alt, border:`1px solid ${C.brd}`, padding:'12px 16px', borderRadius:'16px 16px 16px 4px', display:'flex', gap:5, alignItems:'center' }}>
                  {[0,1,2].map(d => (
                    <div key={d} style={{ width:7, height:7, background:C.muted, borderRadius:'50%', animation:'bounce 1s infinite', animationDelay:`${d*0.2}s` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'12px 14px', borderTop:`1px solid ${C.brd}`, background:C.alt, display:'flex', gap:10 }}>
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send() }}}
              placeholder="Задайте вопрос по бухгалтерии Казахстана..."
              disabled={loading}
              style={{ flex:1, padding:'10px 14px', border:`1px solid ${C.brd}`, borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit', background:C.surf }} />
            <button onClick={()=>send()} disabled={loading||!input.trim()}
              style={{ padding:'10px 18px', background:input.trim()&&!loading?C.blue:'#CBD5E0', color:'#fff', border:'none', borderRadius:10, cursor:input.trim()&&!loading?'pointer':'default', fontSize:13, fontWeight:600, fontFamily:'inherit', transition:'background .2s' }}>
              {loading ? '...' : '➤'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Quick questions */}
          <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, overflow:'hidden', boxShadow:C.sh }}>
            <div style={{ padding:'10px 14px', background:C.alt, borderBottom:`1px solid ${C.brd}`, fontSize:11, fontWeight:700, color:C.muted }}>⚡ ЧАСТЫЕ ВОПРОСЫ</div>
            {QUICK.map((q,i) => (
              <button key={i} onClick={()=>send(q)} disabled={loading}
                style={{ width:'100%', textAlign:'left', padding:'9px 14px', background:'none', border:'none', borderBottom:`1px solid ${C.brd}`, cursor:loading?'default':'pointer', fontSize:12, color:C.blue, lineHeight:1.4 }}>
                {q}
              </button>
            ))}
          </div>

          {/* Rates reference */}
          <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, overflow:'hidden', boxShadow:C.sh }}>
            <div style={{ padding:'10px 14px', background:'linear-gradient(135deg,#1A4E86,#0D3060)', fontSize:11, fontWeight:700, color:'#fff' }}>📊 СТАВКИ 2026</div>
            {[
              ['НДС','16%'],['ИПН','10%'],['КПН','20%'],['УНР','4%'],
              ['ОПВ','10%'],['ОПВР','3.5%'],['ВОСМС','2%+3%'],['СО','3.5%'],
              ['МРП','4 325 ₸'],['МЗП','85 000 ₸'],
            ].map(([k,v],i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'7px 14px', borderBottom:`1px solid ${C.brd}`, fontSize:12 }}>
                <span style={{ color:C.sub }}>{k}</span>
                <span style={{ fontWeight:700, color:C.blue }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Clear button */}
          <button onClick={()=>setMessages([{role:'assistant',content:'👋 Здравствуйте! Я Жанара, ваш бухгалтер-консультант. Задайте любой вопрос по бухгалтерии Казахстана Жанаре.'}])}
            style={{ padding:'9px', background:C.alt, border:`1px solid ${C.brd}`, borderRadius:10, cursor:'pointer', fontSize:12, color:C.sub, fontFamily:'inherit' }}>
            🗑️ Очистить чат
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)}
        }
      `}</style>
    </Layout>
  )
}
