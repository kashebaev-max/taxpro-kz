import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useAuth } from '../_app'
import { supabase } from '../../lib/supabase'

const C = {
  surf:'#FFF', alt:'#F7F5F1', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A', muted:'#A09880',
  blue:'#1A4E86', blueLt:'#E8F0FA', blueMd:'#2C69B3', amber:'#B86A00', amberLt:'#FDF0DC',
  red:'#A82828', redLt:'#FAEAEA', grn:'#1A6B3A', grnLt:'#E5F5EC', ip:'#0F5C8A', ipLt:'#E5F2FA',
  sh:'0 1px 4px rgba(0,0,0,.07)',
}

const STATUS_COLOR = { draft:'gray', ready:'blue', signed:'amber', submitted:'green' }
const STATUS_LABEL = { draft:'Черновик', ready:'Готова', signed:'Подписана', submitted:'Отправлена' }
const FORM_COLOR   = { '910':'#1A6B3A', '200':'#1A4E86', '300':'#A82828', '100':'#5B2A88', '220':'#0F5C8A', '912':'#0F6B5A' }

const Badge = ({ children, color='blue' }) => {
  const m = { blue:[C.blueLt,C.blueMd], green:[C.grnLt,C.grn], red:[C.redLt,C.red], amber:[C.amberLt,C.amber], ip:[C.ipLt,C.ip], gray:['#EDEBE5',C.sub] }
  const [bg,fg] = m[color]||m.blue
  return <span style={{ background:bg,color:fg,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:3 }}>{children}</span>
}

export default function Declarations() {
  const router = useRouter()
  const { session } = useAuth()
  const [decls, setDecls] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterForm, setFilterForm] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (session) load()
    // Apply URL filter
    if (router.query.status) setFilterStatus(router.query.status)
  }, [session, router.query])

  async function load() {
    const { data } = await supabase
      .from('declarations')
      .select('*, clients(name, bin, type, regime)')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
    setDecls(data || [])
    setLoading(false)
  }

  async function deleteDecl(id, e) {
    e.stopPropagation()
    if (!confirm('Удалить декларацию?')) return
    await supabase.from('declarations').delete().eq('id', id)
    setDecls(p => p.filter(d => d.id !== id))
  }

  const filtered = decls
    .filter(d => filterStatus === 'all' || d.status === filterStatus)
    .filter(d => filterForm === 'all' || d.form_code === filterForm)
    .filter(d => !search || d.clients?.name?.toLowerCase().includes(search.toLowerCase()) || d.period?.toLowerCase().includes(search.toLowerCase()))

  return (
    <Layout active="declarations">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 18 }}>📋 Декларации</h1>
          <p style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{decls.length} деклараций · НК РК 2026</p>
        </div>
        <button onClick={() => router.push('/declarations/new')} style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
          + Новая декларация
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', background: C.alt, border: `1px solid ${C.brd}`, borderRadius: 8, padding: 3, gap: 2 }}>
          {[['all','Все'], ['draft','Черновики'], ['ready','Готовы'], ['submitted','Отправлены']].map(([v,l]) => (
            <button key={v} onClick={() => setFilterStatus(v)} style={{ padding: '5px 12px', background: filterStatus === v ? C.blue : 'transparent', color: filterStatus === v ? '#fff' : C.sub, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', background: C.alt, border: `1px solid ${C.brd}`, borderRadius: 8, padding: 3, gap: 2 }}>
          {[['all','Все формы'], ['910','910'], ['200','200'], ['300','300'], ['100','100'], ['220','220'], ['912','912']].map(([v,l]) => (
            <button key={v} onClick={() => setFilterForm(v)} style={{ padding: '5px 10px', background: filterForm === v ? FORM_COLOR[v]||C.blue : 'transparent', color: filterForm === v ? '#fff' : C.sub, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>{l}</button>
          ))}
        </div>
        <input placeholder="🔍 Поиск по клиенту или периоду..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 280, padding: '7px 12px', border: `1px solid ${C.brd}`, borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
      </div>

      {/* Table */}
      <div style={{ background: C.surf, border: `1px solid ${C.brd}`, borderRadius: 10, overflow: 'hidden', boxShadow: C.sh }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: C.muted }}>Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Деклараций нет</div>
            <button onClick={() => router.push('/declarations/new')} style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Создать декларацию</button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.alt, borderBottom: `2px solid ${C.brd}` }}>
                {['Форма', 'Клиент', 'Период', 'Статус', 'Обновлено', 'Действия'].map((h, i) => (
                  <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} onClick={() => router.push(`/declarations/${d.id}`)} style={{ borderBottom: `1px solid ${C.brd}`, cursor: 'pointer' }}
                  onMouseOver={e => e.currentTarget.style.background = C.alt}
                  onMouseOut={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '9px 12px' }}>
                    <span style={{ background: FORM_COLOR[d.form_code]+'22', color: FORM_COLOR[d.form_code]||C.blue, fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>{d.form_code}</span>
                  </td>
                  <td style={{ padding: '9px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{d.clients?.name}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{d.clients?.type} · {d.clients?.regime}</div>
                  </td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: C.sub }}>{d.period}</td>
                  <td style={{ padding: '9px 12px' }}><Badge color={STATUS_COLOR[d.status]}>{STATUS_LABEL[d.status]}</Badge></td>
                  <td style={{ padding: '9px 12px', fontSize: 11, color: C.muted }}>{new Date(d.updated_at).toLocaleDateString('ru-KZ')}</td>
                  <td style={{ padding: '9px 12px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => router.push(`/declarations/${d.id}`)} style={{ background: C.blueLt, color: C.blue, border: 'none', borderRadius: 5, padding: '3px 9px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>Открыть</button>
                      <button onClick={(e) => deleteDecl(d.id, e)} style={{ background: C.redLt, color: C.red, border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
