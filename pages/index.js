import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { useAuth } from './_app'

const C = {
  blue:'#1A4E86', blueLt:'#E8F0FA', blueMd:'#2C69B3',
  surf:'#FFF', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A',
  muted:'#A09880', red:'#A82828', redLt:'#FAEAEA',
  grn:'#1A6B3A', grnLt:'#E5F5EC', bg:'#EFEDE8',
  amber:'#B86A00', amberLt:'#FDF0DC',
}

const FEATURES = [
  { ico:'📋', title:'Декларации онлайн', desc:'Формы 910, 300, 200, 100, 912 с автоматическим расчётом по НК РК 2026' },
  { ico:'👩‍💼', title:'AI-консультант Жанара', desc:'Мгновенные ответы на вопросы по налогам, ставкам и срокам сдачи' },
  { ico:'⚡', title:'НК РК 2026', desc:'Актуальный налоговый кодекс с поиском, НДС 16%, МРП 4 325 ₸' },
  { ico:'👥', title:'База клиентов', desc:'Управление ИП и ТОО: БИН, режим налогообложения, контакты' },
  { ico:'📅', title:'Налоговый календарь', desc:'Все дедлайны и сроки сдачи деклараций на 2026 год' },
  { ico:'💱', title:'Курсы валют', desc:'Актуальные курсы НБ РК с конвертером для налоговых расчётов' },
]

const STATS = [
  { val:'НДС 16%', label:'с 2025 года' },
  { val:'МРП 4 325 ₸', label:'на 2026 год' },
  { val:'УНР 4%', label:'упрощённый режим' },
  { val:'ОПВ 10%', label:'пенсионные взносы' },
]

export default function LoginPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email:'', password:'', name:'', company:'' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => { if (session) router.push('/dashboard') }, [session])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        if (error) throw error
        router.push('/dashboard')
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { data: { full_name: form.name, company: form.company }, emailRedirectTo: `${window.location.origin}/dashboard` }
        })
        if (error) throw error
        setMsg({ type:'success', text:'Письмо с подтверждением отправлено на ' + form.email })
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: `${window.location.origin}/reset-password` })
        if (error) throw error
        setMsg({ type:'success', text:'Ссылка для сброса пароля отправлена на ' + form.email })
      }
    } catch (err) {
      const msgs = {
        'Invalid login credentials':'Неверный email или пароль',
        'User already registered':'Пользователь с таким email уже существует',
        'Password should be at least 6 characters':'Пароль должен быть не менее 6 символов',
        'Unable to validate email address: invalid format':'Некорректный формат email',
      }
      setMsg({ type:'error', text: msgs[err.message] || err.message })
    } finally { setLoading(false) }
  }

  const inp = {
    width:'100%', padding:'10px 14px', border:`1px solid ${C.brd}`,
    borderRadius:8, fontSize:14, outline:'none', background:C.surf,
    color:C.txt, marginBottom:12, fontFamily:'inherit', boxSizing:'border-box'
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'inherit' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0D2E54,#1A4E86)', color:'#fff' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, background:'rgba(255,255,255,.15)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16 }}>Ф</div>
            <div>
              <div style={{ fontWeight:800, fontSize:18, letterSpacing:'-0.02em' }}>Finstat.kz</div>
              <div style={{ fontSize:10, opacity:.75 }}>Налоговая отчётность · НК РК 2026</div>
            </div>
          </div>
          <div style={{ fontSize:12, opacity:.8 }}>КГД МФ РК · НДС 16% · МРП 4 325 ₸</div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px', display:'grid', gridTemplateColumns:'1fr 400px', gap:40, alignItems:'start' }}>

        {/* Left — info */}
        <div>
          {/* Hero */}
          <div style={{ marginBottom:32 }}>
            <div style={{ display:'inline-block', background:C.amberLt, color:C.amber, fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, marginBottom:14 }}>
              🆕 Обновлено для НК РК 2026 · НДС 16% · МРП 4 325 ₸
            </div>
            <h1 style={{ fontSize:36, fontWeight:900, color:C.txt, lineHeight:1.2, marginBottom:14, letterSpacing:'-0.02em' }}>
              Профессиональная<br/>налоговая отчётность<br/>для бухгалтеров Казахстана
            </h1>
            <p style={{ fontSize:15, color:C.sub, lineHeight:1.7, marginBottom:20, maxWidth:540 }}>
              Finstat.kz — сервис для бухгалтеров, ИП и ТОО. Заполняйте декларации, консультируйтесь с AI, следите за дедлайнами и всегда имейте под рукой актуальный НК РК 2026.
            </p>

            {/* Stats row */}
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:28 }}>
              {STATS.map((s,i) => (
                <div key={i} style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, padding:'10px 16px', textAlign:'center' }}>
                  <div style={{ fontWeight:800, fontSize:16, color:C.blue }}>{s.val}</div>
                  <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features grid */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.muted, letterSpacing:'.04em', marginBottom:14 }}>ЧТО ВХОДИТ В СЕРВИС</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {FEATURES.map((f,i) => (
                <div key={i} style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start' }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{f.ico}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:3 }}>{f.title}</div>
                    <div style={{ fontSize:11, color:C.sub, lineHeight:1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax info banner */}
          <div style={{ background:'linear-gradient(135deg,#1A4E86,#0D3060)', borderRadius:12, padding:'16px 20px', color:'#fff' }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>📊 Актуальные ставки НК РК 2026</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
              {[['НДС','16%'],['ИПН','10%'],['КПН','20%'],['УНР','4%'],['ОПВ','10%'],['ОПВР','3.5%'],['СО','3.5%'],['МЗП','85 000 ₸']].map(([k,v],i) => (
                <div key={i} style={{ background:'rgba(255,255,255,.1)', borderRadius:7, padding:'6px 10px', textAlign:'center' }}>
                  <div style={{ fontSize:9, opacity:.75, marginBottom:2 }}>{k}</div>
                  <div style={{ fontWeight:800, fontSize:13 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — auth form */}
        <div style={{ position:'sticky', top:20 }}>
          <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:16, padding:28, boxShadow:'0 8px 32px rgba(0,0,0,.1)' }}>

            {/* Form header */}
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ width:48, height:48, background:'linear-gradient(135deg,#1A4E86,#0D3060)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:20, margin:'0 auto 10px' }}>Ф</div>
              <div style={{ fontWeight:800, fontSize:17 }}>
                {mode==='login'?'Войти в Finstat.kz': mode==='register'?'Регистрация':'Сброс пароля'}
              </div>
              <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>
                {mode==='login'?'Введите email и пароль': mode==='register'?'Создайте бесплатный аккаунт':'Введите email для ссылки'}
              </div>
            </div>

            {msg && (
              <div style={{ background:msg.type==='error'?C.redLt:C.grnLt, border:`1px solid ${msg.type==='error'?'#E8B0B0':'#A8D8BE'}`, borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13, color:msg.type==='error'?C.red:C.grn, display:'flex', gap:8 }}>
                <span>{msg.type==='error'?'⚠️':'✅'}</span>
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {mode==='register' && (
                <>
                  <label style={{ fontSize:12, fontWeight:600, color:C.sub, display:'block', marginBottom:4 }}>Ваше имя (ФИО)</label>
                  <input style={inp} placeholder="Иванов Иван Иванович" value={form.name} onChange={e=>set('name',e.target.value)} required />
                  <label style={{ fontSize:12, fontWeight:600, color:C.sub, display:'block', marginBottom:4 }}>Компания / организация</label>
                  <input style={inp} placeholder="ТОО «Название» или ФИО ИП" value={form.company} onChange={e=>set('company',e.target.value)} />
                </>
              )}

              <label style={{ fontSize:12, fontWeight:600, color:C.sub, display:'block', marginBottom:4 }}>Email</label>
              <input style={inp} type="email" placeholder="example@mail.com" value={form.email} onChange={e=>set('email',e.target.value)} required autoComplete="email" />

              {mode!=='forgot' && (
                <>
                  <label style={{ fontSize:12, fontWeight:600, color:C.sub, display:'block', marginBottom:4 }}>Пароль</label>
                  <input style={inp} type="password" placeholder={mode==='register'?'Минимум 6 символов':'••••••••'} value={form.password} onChange={e=>set('password',e.target.value)} required minLength={6} autoComplete={mode==='login'?'current-password':'new-password'} />
                </>
              )}

              {mode==='login' && (
                <div style={{ textAlign:'right', marginTop:-8, marginBottom:12 }}>
                  <button type="button" onClick={()=>setMode('forgot')} style={{ background:'none', border:'none', color:C.blueMd, fontSize:12, cursor:'pointer', padding:0 }}>Забыли пароль?</button>
                </div>
              )}

              <button type="submit" disabled={loading} style={{ width:'100%', background:loading?'#C8C2B4':'linear-gradient(135deg,#1A4E86,#0D3060)', color:'#fff', border:'none', borderRadius:8, padding:'12px 0', fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', marginTop:4, fontFamily:'inherit' }}>
                {loading?'⏳ Загрузка...': mode==='login'?'→ Войти в систему': mode==='register'?'→ Создать аккаунт':'→ Отправить ссылку'}
              </button>
            </form>

            <div style={{ borderTop:`1px solid ${C.brd}`, marginTop:20, paddingTop:16, textAlign:'center' }}>
              {mode==='login' ? (
                <p style={{ fontSize:13, color:C.sub }}>
                  Нет аккаунта?{' '}
                  <button onClick={()=>{setMode('register');setMsg(null)}} style={{ background:'none', border:'none', color:C.blue, fontWeight:700, cursor:'pointer', fontSize:13 }}>Зарегистрироваться бесплатно</button>
                </p>
              ) : (
                <button onClick={()=>{setMode('login');setMsg(null)}} style={{ background:'none', border:'none', color:C.blue, fontWeight:600, cursor:'pointer', fontSize:13 }}>← Назад к входу</button>
              )}
            </div>

            {/* Trust badges */}
            <div style={{ marginTop:16, display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
              {['🔒 Безопасно','📋 НК РК 2026','🇰🇿 Казахстан'].map((b,i) => (
                <span key={i} style={{ fontSize:11, color:C.muted }}>{b}</span>
              ))}
            </div>
          </div>

          <p style={{ fontSize:11, color:C.muted, marginTop:14, textAlign:'center', lineHeight:1.6 }}>
            © 2026 Finstat.kz · Налоговая отчётность РК<br/>
            НК РК 2026 · Закон №214-VIII · КГД МФ РК
          </p>
        </div>
      </div>
    </div>
  )
}
