import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../pages/_app'
import { supabase } from '../lib/supabase'

const C = {
  bg:'#EFEDE8', surf:'#FFF', alt:'#F7F5F1', brd:'#E0DBCF', brdH:'#C8C2B4',
  txt:'#18170F', sub:'#6A655A', muted:'#A09880',
  blue:'#1A4E86', blueLt:'#E8F0FA', blueMd:'#2C69B3',
  amber:'#B86A00', amberLt:'#FDF0DC', red:'#A82828',
  grn:'#1A6B3A', grnLt:'#E5F5EC', ip:'#0F5C8A', ipLt:'#E5F2FA',
}

const NAV = [
  { id: 'dashboard', label: 'Главная', ico: '🏠', href: '/dashboard' },
  { id: 'clients', label: 'Клиенты', ico: '👥', href: '/clients' },
  { id: 'declarations', label: 'Декларации', ico: '📋', href: '/declarations' },
  { id: 'calendar', label: 'Календарь', ico: '📅', href: '/calendar' },
  { id: 'prodcal', label: 'Произв. календарь', ico: '📆', href: '/prodcal' },
  { id: 'rates', label: 'Базовые ставки', ico: '📊', href: '/rates' },
  { id: 'currency', label: 'Курсы валют', ico: '💱', href: '/currency' },
  { id: 'changes', label: 'НК РК 2026', ico: '⚡', href: '/changes', badge: true },
  { id: 'consultant', label: 'AI Консультант', ico: '👩‍💼', href: '/consultant' },
  { id: 'admin', label: 'Администратор', ico: '🛡️', href: '/admin', adminOnly: true },
]

export default function Layout({ children, active }) {
  const router = useRouter()
  const { session, profile, signOut, loading } = useAuth()
  const [notifCount, setNotifCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !session) router.push('/')
  }, [session, loading])

  useEffect(() => {
    if (session) {
      supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', session.user.id)
        .eq('is_read', false)
        .then(({ count }) => setNotifCount(count || 0))
    }
  }, [session])

  if (loading || !session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <div style={{ color: C.muted }}>Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif", background: C.bg }}>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className="sidebar" style={{ width: 224, background: C.surf, borderRight: `1px solid ${C.brd}`, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', boxShadow: '2px 0 6px rgba(0,0,0,.04)', zIndex: 20 }}>

        {/* Logo */}
        <div style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${C.brd}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, background: C.blue, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>ТП</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.txt }}>Finstat.kz</div>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: '.04em', textTransform: 'uppercase' }}>НК РК 2026</div>
            </div>
          </div>
          {/* User info */}
          <div style={{ background: C.alt, borderRadius: 7, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: C.blue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {(profile?.full_name || profile?.email || '?')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name || 'Пользователь'}
              </div>
              <div style={{ fontSize: 10, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {NAV.filter(item => !item.adminOnly || profile?.role === 'admin').map(item => (
            <button key={item.id}
              onClick={() => router.push(item.href)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 10px', background: active === item.id ? C.blueLt : 'transparent',
                border: 'none', color: active === item.id ? C.blue : C.sub, cursor: 'pointer',
                fontSize: 13, borderRadius: 7, fontWeight: active === item.id ? 700 : 400,
                fontFamily: 'inherit', marginBottom: 2, transition: 'all .1s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>{item.ico}</span>
                {item.label}
              </div>
              {item.badge && (
                <span style={{ fontSize: 8, fontWeight: 800, background: C.red, color: '#fff', width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom: MRP + sign out */}
        <div style={{ padding: '10px 12px', borderTop: `1px solid ${C.brd}` }}>
          <div style={{ background: C.amberLt, border: '1px solid #E8C07A', borderRadius: 7, padding: '7px 10px', marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.amber, letterSpacing: '.04em', marginBottom: 2 }}>МРП 2026</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#7A4A0A' }}>4 325 ₸</div>
            <div style={{ fontSize: 9, color: C.muted }}>МЗП: 85 000 ₸</div>
          </div>
          <button onClick={signOut} style={{ width: '100%', background: 'transparent', border: `1px solid ${C.brd}`, borderRadius: 7, padding: '7px 0', fontSize: 12, color: C.sub, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s' }}>
            Выйти
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Topbar */}
        <header className="no-print" style={{ background: C.surf, borderBottom: `1px solid ${C.brd}`, padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.txt }}>
              {NAV.find(n => n.id === active)?.ico} {NAV.find(n => n.id === active)?.label || 'Finstat.kz'}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>
              КГД МФ РК · НК РК 2026 · {new Date().toLocaleDateString('ru-KZ', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {notifCount > 0 && (
              <button onClick={() => router.push('/notifications')} style={{ position: 'relative', background: C.amberLt, border: '1px solid #E8C07A', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                🔔 <span style={{ fontWeight: 700, color: C.amber }}>{notifCount}</span>
              </button>
            )}
            <button onClick={() => router.push('/profile')} style={{ background: C.alt, border: `1px solid ${C.brd}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: C.sub, fontFamily: 'inherit' }}>
              ⚙️ Профиль
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 22, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
