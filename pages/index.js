import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { useAuth } from './_app'

const C = {
  blue:'#1A4E86', blueLt:'#E8F0FA', blueMd:'#2C69B3',
  surf:'#FFF', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A',
  muted:'#A09880', red:'#A82828', redLt:'#FAEAEA',
  grn:'#1A6B3A', grnLt:'#E5F5EC', bg:'#EFEDE8'
}

export default function LoginPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [mode, setMode] = useState('login') // login | register | forgot
  const [form, setForm] = useState({ email: '', password: '', name: '', company: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null) // { type: 'error'|'success', text }

  useEffect(() => {
    if (session) router.push('/dashboard')
  }, [session])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (error) throw error
        router.push('/dashboard')

      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.name, company: form.company },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        })
        if (error) throw error
        setMsg({ type: 'success', text: 'Письмо с подтверждением отправлено на ' + form.email + '. Проверьте почту.' })

      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: `${window.location.origin}/reset-password`
        })
        if (error) throw error
        setMsg({ type: 'success', text: 'Ссылка для сброса пароля отправлена на ' + form.email })
      }
    } catch (err) {
      const msgs = {
        'Invalid login credentials': 'Неверный email или пароль',
        'User already registered': 'Пользователь с таким email уже существует',
        'Password should be at least 6 characters': 'Пароль должен быть не менее 6 символов',
        'Unable to validate email address: invalid format': 'Некорректный формат email',
      }
      setMsg({ type: 'error', text: msgs[err.message] || err.message })
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', padding: '10px 14px', border: `1px solid ${C.brd}`,
    borderRadius: 8, fontSize: 14, outline: 'none',
    background: C.surf, color: C.txt, marginBottom: 12,
    fontFamily: 'inherit',
    transition: 'border-color .15s'
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, background: C.blue, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 auto 12px' }}>ТП</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: C.txt }}>TaxPro KZ</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Налоговая отчётность ИП и ТОО · НК РК 2026</div>
      </div>

      {/* Card */}
      <div style={{ background: C.surf, border: `1px solid ${C.brd}`, borderRadius: 14, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>

        <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
          {mode === 'login' ? 'Войти в аккаунт' : mode === 'register' ? 'Создать аккаунт' : 'Сброс пароля'}
        </h2>
        <p style={{ fontSize: 13, color: C.sub, marginBottom: 24 }}>
          {mode === 'login' ? 'Введите email и пароль для входа' :
           mode === 'register' ? 'Заполните данные для регистрации' :
           'Введите email для получения ссылки'}
        </p>

        {msg && (
          <div style={{ background: msg.type === 'error' ? C.redLt : C.grnLt, border: `1px solid ${msg.type === 'error' ? '#E8B0B0' : '#A8D8BE'}`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: msg.type === 'error' ? C.red : C.grn, display: 'flex', gap: 8 }}>
            <span>{msg.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: 'block', marginBottom: 4 }}>Ваше имя (ФИО)</label>
              <input style={inp} placeholder="Иванов Иван Иванович" value={form.name} onChange={e => set('name', e.target.value)} required />
              <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: 'block', marginBottom: 4 }}>Компания / организация</label>
              <input style={inp} placeholder="ТОО «Название» или ФИО ИП" value={form.company} onChange={e => set('company', e.target.value)} />
            </>
          )}

          <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: 'block', marginBottom: 4 }}>Email</label>
          <input style={inp} type="email" placeholder="example@mail.com" value={form.email} onChange={e => set('email', e.target.value)} required autoComplete="email" />

          {mode !== 'forgot' && (
            <>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: 'block', marginBottom: 4 }}>Пароль</label>
              <input style={inp} type="password" placeholder={mode === 'register' ? 'Минимум 6 символов' : '••••••••'} value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </>
          )}

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
              <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: C.blueMd, fontSize: 12, cursor: 'pointer', padding: 0 }}>Забыли пароль?</button>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#C8C2B4' : C.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8, fontFamily: 'inherit', transition: 'background .15s' }}>
            {loading ? '⏳ Загрузка...' :
             mode === 'login' ? '→ Войти' :
             mode === 'register' ? '→ Создать аккаунт' : '→ Отправить ссылку'}
          </button>
        </form>

        <div style={{ borderTop: `1px solid ${C.brd}`, marginTop: 24, paddingTop: 20, textAlign: 'center' }}>
          {mode === 'login' ? (
            <p style={{ fontSize: 13, color: C.sub }}>
              Нет аккаунта?{' '}
              <button onClick={() => { setMode('register'); setMsg(null) }} style={{ background: 'none', border: 'none', color: C.blue, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Зарегистрироваться</button>
            </p>
          ) : (
            <button onClick={() => { setMode('login'); setMsg(null) }} style={{ background: 'none', border: 'none', color: C.blue, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>← Назад к входу</button>
          )}
        </div>
      </div>

      <p style={{ fontSize: 11, color: C.muted, marginTop: 24, textAlign: 'center' }}>
        Используя TaxPro KZ, вы соглашаетесь с условиями использования.<br />
        © 2026 TaxPro KZ · НК РК 2026 · Закон №214-VIII
      </p>
    </div>
  )
}
