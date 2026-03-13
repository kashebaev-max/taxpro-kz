import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useAuth } from './_app'
import { supabase } from '../lib/supabase'

const C = {
  surf:'#FFF', alt:'#F7F5F1', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A', muted:'#A09880',
  blue:'#1A4E86', blueLt:'#E8F0FA', blueMd:'#2C69B3',
  amber:'#B86A00', amberLt:'#FDF0DC',
  red:'#A82828', redLt:'#FAEAEA',
  grn:'#1A6B3A', grnLt:'#E5F5EC',
  sh:'0 1px 4px rgba(0,0,0,.07)',
}

const fmt = v => (parseFloat(v)||0).toLocaleString('ru-KZ')

export default function Admin() {
  const router = useRouter()
  const { session, profile } = useAuth()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ total:0, active:0, pro:0, declarations:0, clients:0 })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!session) return
    if (profile && profile.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    if (profile?.role === 'admin') loadData()
  }, [session, profile])

  async function loadData() {
    try {
      const [
        { data: profilesData, count: totalUsers },
        { count: declCount },
        { count: clientCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false }),
        supabase.from('declarations').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
      ])

      setUsers(profilesData || [])
      setStats({
        total: totalUsers || 0,
        active: profilesData?.filter(u => u.role !== 'blocked').length || 0,
        pro: profilesData?.filter(u => u.plan === 'pro').length || 0,
        declarations: declCount || 0,
        clients: clientCount || 0,
      })
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function setUserRole(userId, role) {
    await supabase.from('profiles').update({ role }).eq('id', userId)
    setUsers(p => p.map(u => u.id === userId ? { ...u, role } : u))
  }

  async function setUserPlan(userId, plan) {
    await supabase.from('profiles').update({ plan }).eq('id', userId)
    setUsers(p => p.map(u => u.id === userId ? { ...u, plan } : u))
  }

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <Layout active="admin">
      <div style={{ textAlign:'center', padding:60, color:C.muted }}>⏳ Загрузка...</div>
    </Layout>
  )

  if (profile?.role !== 'admin') return (
    <Layout active="admin">
      <div style={{ textAlign:'center', padding:60 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🔒</div>
        <div style={{ fontWeight:700, fontSize:18 }}>Доступ запрещён</div>
        <div style={{ color:C.sub, marginTop:8 }}>Только для администраторов</div>
      </div>
    </Layout>
  )

  const StatCard = ({ label, value, icon, color, sub }) => (
    <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, padding:'16px 20px', borderTop:`3px solid ${color}`, boxShadow:C.sh }}>
      <div style={{ fontSize:10, fontWeight:700, color, textTransform:'uppercase', letterSpacing:'.04em', marginBottom:6 }}>{icon} {label}</div>
      <div style={{ fontSize:32, fontWeight:800, color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{sub}</div>}
    </div>
  )

  const planColor = { free:[C.alt,C.sub], pro:[C.amberLt,C.amber], enterprise:['#F3EEF9','#5B2A88'] }
  const roleColor = { admin:[C.redLt,C.red], accountant:[C.blueLt,C.blue], blocked:['#EDEBE5',C.muted] }

  return (
    <Layout active="admin">
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1A4E86,#0D3060)', borderRadius:10, padding:'16px 22px', marginBottom:20, color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:800, fontSize:18, marginBottom:3 }}>🛡️ Панель администратора</div>
          <div style={{ fontSize:12, opacity:.85 }}>TaxPro KZ · Управление пользователями и подписками</div>
        </div>
        <div style={{ textAlign:'right', fontSize:12, opacity:.85 }}>
          <div>Администратор</div>
          <div style={{ fontWeight:700 }}>{profile?.full_name || profile?.email}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
        <StatCard label="Пользователей" value={stats.total} icon="👥" color={C.blue} sub="всего зарегистрировано" />
        <StatCard label="Активных" value={stats.active} icon="✅" color={C.grn} sub="не заблокированы" />
        <StatCard label="Pro подписка" value={stats.pro} icon="⭐" color={C.amber} sub="платных аккаунтов" />
        <StatCard label="Деклараций" value={stats.declarations} icon="📋" color={C.blue} sub="создано всего" />
        <StatCard label="Клиентов" value={stats.clients} icon="🏢" color={C.grn} sub="ИП и ТОО" />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:2, borderBottom:`1px solid ${C.brd}`, marginBottom:16 }}>
        {[['overview','👥 Пользователи'],['stats','📊 Статистика']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding:'8px 16px', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:tab===k?700:400, color:tab===k?C.blue:C.sub, borderBottom:tab===k?`2px solid ${C.blue}`:'2px solid transparent', marginBottom:-1 }}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* Search */}
          <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'center' }}>
            <input placeholder="🔍 Поиск по email или имени..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex:1, maxWidth:360, padding:'8px 12px', border:`1px solid ${C.brd}`, borderRadius:8, fontSize:13, outline:'none', fontFamily:'inherit' }} />
            <span style={{ fontSize:12, color:C.muted }}>{filtered.length} из {users.length} пользователей</span>
          </div>

          {/* Users table */}
          <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, overflow:'hidden', boxShadow:C.sh }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:C.alt, borderBottom:`2px solid ${C.brd}` }}>
                  {['Пользователь', 'Email', 'Зарегистрирован', 'Подписка', 'Роль', 'Действия'].map((h,i) => (
                    <th key={i} style={{ padding:'8px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:C.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const [planBg, planFg] = planColor[u.plan] || planColor.free
                  const [roleBg, roleFg] = roleColor[u.role] || roleColor.accountant
                  return (
                    <tr key={u.id} style={{ borderBottom:`1px solid ${C.brd}` }}>
                      <td style={{ padding:'10px 12px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:30, height:30, background:C.blue, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700, flexShrink:0 }}>
                            {(u.full_name||u.email||'?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize:12, fontWeight:600 }}>{u.full_name || '—'}</div>
                            {u.company && <div style={{ fontSize:10, color:C.muted }}>{u.company}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'10px 12px', fontSize:12, color:C.sub }}>{u.email}</td>
                      <td style={{ padding:'10px 12px', fontSize:11, color:C.muted }}>
                        {new Date(u.created_at).toLocaleDateString('ru-KZ')}
                      </td>
                      <td style={{ padding:'10px 12px' }}>
                        <select value={u.plan||'free'} onChange={e => setUserPlan(u.id, e.target.value)}
                          style={{ background:planBg, color:planFg, border:'none', borderRadius:5, padding:'3px 8px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                          <option value="free">Free</option>
                          <option value="pro">Pro ⭐</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>
                      <td style={{ padding:'10px 12px' }}>
                        <select value={u.role||'accountant'} onChange={e => setUserRole(u.id, e.target.value)}
                          style={{ background:roleBg, color:roleFg, border:'none', borderRadius:5, padding:'3px 8px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                          <option value="accountant">Бухгалтер</option>
                          <option value="admin">Admin 🛡️</option>
                          <option value="blocked">Заблокирован</option>
                        </select>
                      </td>
                      <td style={{ padding:'10px 12px' }}>
                        {u.id !== session?.user?.id && (
                          <button onClick={() => setUserRole(u.id, u.role === 'blocked' ? 'accountant' : 'blocked')}
                            style={{ background:u.role==='blocked'?C.grnLt:C.redLt, color:u.role==='blocked'?C.grn:C.red, border:'none', borderRadius:5, padding:'3px 10px', cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>
                            {u.role === 'blocked' ? '✅ Разблокировать' : '🚫 Заблокировать'}
                          </button>
                        )}
                        {u.id === session?.user?.id && <span style={{ fontSize:11, color:C.muted }}>Это вы</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding:40, textAlign:'center', color:C.muted }}>Пользователи не найдены</div>
            )}
          </div>
        </>
      )}

      {tab === 'stats' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, padding:20, boxShadow:C.sh }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>📊 Распределение по тарифам</div>
            {[
              { plan:'Free', count:users.filter(u=>u.plan!=='pro'&&u.plan!=='enterprise').length, color:C.sub },
              { plan:'Pro', count:users.filter(u=>u.plan==='pro').length, color:C.amber },
              { plan:'Enterprise', count:users.filter(u=>u.plan==='enterprise').length, color:'#5B2A88' },
            ].map((p,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ fontSize:13, width:80, color:p.color, fontWeight:600 }}>{p.plan}</div>
                <div style={{ flex:1, background:C.alt, borderRadius:4, height:20, overflow:'hidden' }}>
                  <div style={{ width:users.length?`${p.count/users.length*100}%`:'0%', background:p.color, height:'100%', borderRadius:4, transition:'width .3s' }} />
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:p.color, width:30, textAlign:'right' }}>{p.count}</div>
              </div>
            ))}
          </div>

          <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, padding:20, boxShadow:C.sh }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>📅 Последние регистрации</div>
            {users.slice(0, 8).map((u,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:i<7?`1px solid ${C.brd}`:'none' }}>
                <div style={{ fontSize:12 }}>{u.email}</div>
                <div style={{ fontSize:11, color:C.muted }}>{new Date(u.created_at).toLocaleDateString('ru-KZ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}
