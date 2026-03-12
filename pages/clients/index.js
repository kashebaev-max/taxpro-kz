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

const Badge = ({ children, color='blue' }) => {
  const colors = { blue:[C.blueLt,C.blueMd], green:[C.grnLt,C.grn], red:[C.redLt,C.red], amber:[C.amberLt,C.amber], ip:[C.ipLt,C.ip], gray:['#EDEBE5',C.sub], teal:['#E5F5F1','#0F6B5A'] }
  const [bg,fg] = colors[color]||colors.blue
  return <span style={{ background:bg,color:fg,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:3,whiteSpace:'nowrap' }}>{children}</span>
}

export default function Clients() {
  const router = useRouter()
  const { session } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { if (session) loadClients() }, [session])

  async function loadClients() {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', session.user.id)
      .neq('status', 'archived')
      .order('name')
    setClients(data || [])
    setLoading(false)
  }

  const filtered = clients
    .filter(c => filter === 'all' || c.type === filter)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.bin.includes(search))

  const regimeColor = { 'УНР': 'green', 'ОУР': 'blue', 'Самозан.': 'teal' }

  return (
    <Layout active="clients">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 18 }}>👥 Клиенты</h1>
          <p style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{clients.length} клиентов · ИП и ТОО на обслуживании</p>
        </div>
        <button onClick={() => router.push('/clients/new')} style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
          + Добавить клиента
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', background: C.alt, border: `1px solid ${C.brd}`, borderRadius: 8, padding: 3, gap: 2 }}>
          {[['all','Все'], ['ИП','👤 ИП'], ['ТОО','🏢 ТОО'], ['АО','🏛️ АО']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{ padding: '5px 14px', background: filter === v ? C.blue : 'transparent', color: filter === v ? '#fff' : C.sub, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>{l}</button>
          ))}
        </div>
        <input
          placeholder="🔍 Поиск по названию или ИИН/БИН..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 300, padding: '7px 12px', border: `1px solid ${C.brd}`, borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
        />
        <span style={{ fontSize: 12, color: C.muted }}>{filtered.length} из {clients.length}</span>
      </div>

      {/* Table */}
      <div style={{ background: C.surf, border: `1px solid ${C.brd}`, borderRadius: 10, overflow: 'hidden', boxShadow: C.sh }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Загрузка клиентов...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{search ? 'Ничего не найдено' : 'Клиентов пока нет'}</div>
            <div style={{ color: C.sub, fontSize: 13, marginBottom: 20 }}>{search ? 'Попробуйте другой запрос' : 'Добавьте первого клиента (ИП или ТОО)'}</div>
            {!search && <button onClick={() => router.push('/clients/new')} style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Добавить клиента</button>}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.alt, borderBottom: `2px solid ${C.brd}` }}>
                {['Тип', 'Наименование / ИИН·БИН', 'Режим', 'НДС', 'Адрес / контакт', 'Декларации'].map((h, i) => (
                  <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${C.brd}`, cursor: 'pointer', transition: 'background .1s' }}
                  onMouseOver={e => e.currentTarget.style.background = C.alt}
                  onMouseOut={e => e.currentTarget.style.background = ''}
                  onClick={() => router.push(`/clients/${c.id}`)}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ width: 30, height: 30, background: c.type === 'ИП' ? C.ipLt : C.blueLt, color: c.type === 'ИП' ? C.ip : C.blue, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{c.type}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: C.muted, fontFamily: 'monospace' }}>{c.bin}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}><Badge color={regimeColor[c.regime] || 'blue'}>{c.regime}</Badge></td>
                  <td style={{ padding: '10px 12px' }}><Badge color={c.nds ? 'amber' : 'gray'}>{c.nds ? '16%' : '—'}</Badge></td>
                  <td style={{ padding: '10px 12px', fontSize: 11, color: C.sub, maxWidth: 180 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || c.email || c.phone || '—'}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(c.regime === 'УНР' ? ['910','200'] : c.regime === 'ОУР' ? (c.type === 'ИП' ? ['220','200','300'] : ['100','200','300']) : ['912']).map(f => (
                        <button key={f} onClick={() => router.push(`/declarations/new?form=${f}&client=${c.id}`)}
                          style={{ background: C.blueLt, color: C.blue, border: 'none', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'inherit' }}>{f}</button>
                      ))}
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
