import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useAuth } from './_app'
import { supabase } from '../lib/supabase'

const C = {
  bg:'#EFEDE8', surf:'#FFF', alt:'#F7F5F1', brd:'#E0DBCF',
  txt:'#18170F', sub:'#6A655A', muted:'#A09880',
  blue:'#1A4E86', blueLt:'#E8F0FA', blueMd:'#2C69B3',
  amber:'#B86A00', amberLt:'#FDF0DC', red:'#A82828', redLt:'#FAEAEA',
  grn:'#1A6B3A', grnLt:'#E5F5EC', ip:'#0F5C8A', ipLt:'#E5F2FA',
  sh:'0 1px 4px rgba(0,0,0,.07)',
}
const fmt = (v, d=0) => (parseFloat(v)||0).toLocaleString('ru-KZ', {minimumFractionDigits:d, maximumFractionDigits:d})

export default function Dashboard() {
  const router = useRouter()
  const { session, profile } = useAuth()
  const [stats, setStats] = useState({ clients: 0, declarations: 0, drafts: 0, submitted: 0 })
  const [recentDecl, setRecentDecl] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) loadData()
  }, [session])

  async function loadData() {
    try {
      const uid = session.user.id
      const [{ count: clients }, { count: declarations }, { count: drafts }, { count: submitted }, { data: recent }] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('status', 'active'),
        supabase.from('declarations').select('*', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('declarations').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('status', 'draft'),
        supabase.from('declarations').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('status', 'submitted'),
        supabase.from('declarations').select('*, clients(name, type)').eq('user_id', uid).order('updated_at', { ascending: false }).limit(8),
      ])
      setStats({ clients: clients||0, declarations: declarations||0, drafts: drafts||0, submitted: submitted||0 })
      setRecentDecl(recent || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const Card = ({ children, style }) => (
    <div style={{ background: C.surf, border: `1px solid ${C.brd}`, borderRadius: 10, padding: 20, boxShadow: C.sh, ...style }}>{children}</div>
  )
  const Badge = ({ children, color='blue' }) => {
    const colors = { blue:[C.blueLt,C.blueMd], green:[C.grnLt,C.grn], red:[C.redLt,C.red], amber:[C.amberLt,C.amber], ip:[C.ipLt,C.ip], gray:['#EDEBE5',C.sub] }
    const [bg,fg] = colors[color]||colors.blue
    return <span style={{ background:bg,color:fg,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:3 }}>{children}</span>
  }

  const statusColor = { draft:'gray', ready:'blue', signed:'amber', submitted:'green' }
  const statusLabel = { draft:'Черновик', ready:'Готова', signed:'Подписана', submitted:'Отправлена' }
  const formDeadlines = {
    '910': 'до 15.08.2026',
    '200': 'до 15.08.2026',
    '300': 'до 15.08.2026',
    '100': 'до 31.03.2027',
    '220': 'до 31.03.2027',
    '912': 'до 15.08.2026',
  }

  const upcomingDeadlines = [
    { date: '15 мая 2026', label: 'Форма 200 (1 кв.)', form: '200', urgent: false },
    { date: '15 мая 2026', label: 'Форма 300 НДС (1 кв.)', form: '300', urgent: false },
    { date: '15 авг. 2026', label: 'Форма 910 УНР (1 п/г)', form: '910', urgent: true },
    { date: '15 авг. 2026', label: 'Форма 200 (2 кв.)', form: '200', urgent: true },
  ]

  return (
    <Layout active="dashboard">
      {/* Welcome */}
      <div style={{ background: 'linear-gradient(135deg,#1A4E86,#0D3060)', borderRadius: 10, padding: '16px 22px', marginBottom: 20, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 3 }}>
            Добро пожаловать{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
          </div>
          <div style={{ fontSize: 12, opacity: .85 }}>⚡ НК РК 2026 · Закон №214-VIII · НДС 16% · УНР 4% · ИПН 10/15%</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/clients/new')} style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>+ Добавить клиента</button>
          <button onClick={() => router.push('/declarations/new')} style={{ background: '#fff', color: C.blue, border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>+ Новая декларация</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { l: 'Клиентов', v: stats.clients, s: 'активных', c: C.blue, lt: C.blueLt, href: '/clients' },
          { l: 'Деклараций', v: stats.declarations, s: 'всего', c: C.grn, lt: C.grnLt, href: '/declarations' },
          { l: 'Черновики', v: stats.drafts, s: 'не отправлено', c: C.amber, lt: C.amberLt, href: '/declarations?status=draft' },
          { l: 'Отправлено', v: stats.submitted, s: 'в КГД', c: C.ip, lt: C.ipLt, href: '/declarations?status=submitted' },
        ].map((s, i) => (
          <div key={i} onClick={() => router.push(s.href)} style={{ background: s.lt, border: `1px solid ${C.brd}`, borderRadius: 10, padding: '14px 16px', borderTop: `3px solid ${s.c}`, boxShadow: C.sh, cursor: 'pointer', transition: 'transform .1s' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: s.c, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>{s.l}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.c, lineHeight: 1 }}>{loading ? '...' : s.v}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{s.s}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>

        {/* Recent declarations */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.brd}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>📋 Последние декларации</div>
            <button onClick={() => router.push('/declarations')} style={{ background: 'none', border: 'none', color: C.blueMd, cursor: 'pointer', fontSize: 12 }}>Все →</button>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: C.muted }}>Загрузка...</div>
          ) : recentDecl.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: C.muted }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Деклараций пока нет</div>
              <button onClick={() => router.push('/declarations/new')} style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 7, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Создать первую декларацию</button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.alt }}>
                  {['Клиент', 'Форма', 'Период', 'Статус', ''].map((h, i) => (
                    <th key={i} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.muted, borderBottom: `1px solid ${C.brd}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentDecl.map((d, i) => (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${C.brd}` }}>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{d.clients?.name || '—'}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{d.clients?.type}</div>
                    </td>
                    <td style={{ padding: '9px 12px' }}><Badge color="blue">{d.form_code}</Badge></td>
                    <td style={{ padding: '9px 12px', fontSize: 11, color: C.sub }}>{d.period}</td>
                    <td style={{ padding: '9px 12px' }}><Badge color={statusColor[d.status]}>{statusLabel[d.status]}</Badge></td>
                    <td style={{ padding: '9px 12px' }}>
                      <button onClick={() => router.push(`/declarations/${d.id}`)} style={{ background: 'none', border: `1px solid ${C.brd}`, borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, color: C.sub, fontFamily: 'inherit' }}>Открыть</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Sidebar: deadlines + quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📅 Ближайшие сроки</div>
            {upcomingDeadlines.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < upcomingDeadlines.length - 1 ? `1px solid ${C.brd}` : 'none', alignItems: 'center' }}>
                <div style={{ width: 3, background: d.urgent ? C.amber : C.brd, borderRadius: 2, alignSelf: 'stretch', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: d.urgent ? C.amber : C.muted }}>{d.date}</div>
                  <div style={{ fontSize: 12 }}>{d.label}</div>
                </div>
                <Badge color={d.urgent ? 'amber' : 'blue'}>{d.form}</Badge>
              </div>
            ))}
          </Card>

          <Card style={{ background: C.amberLt, borderColor: '#E8C07A' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginBottom: 8 }}>⚡ Быстрые действия</div>
            {[
              { label: '+ Новый клиент', href: '/clients/new' },
              { label: '📝 Форма 910 (УНР)', href: '/declarations/new?form=910' },
              { label: '📝 Форма 200 (ИПН)', href: '/declarations/new?form=200' },
              { label: '📝 Форма 300 (НДС)', href: '/declarations/new?form=300' },
            ].map((a, i) => (
              <button key={i} onClick={() => router.push(a.href)} style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,.6)', border: '1px solid #E8C07A', borderRadius: 6, padding: '7px 10px', cursor: 'pointer', fontSize: 12, color: '#7A4A0A', fontFamily: 'inherit', textAlign: 'left', marginBottom: i < 3 ? 6 : 0 }}>{a.label}</button>
            ))}
          </Card>
        </div>
      </div>
    </Layout>
  )
}
