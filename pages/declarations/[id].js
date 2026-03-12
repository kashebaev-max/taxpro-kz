import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useAuth } from '../_app'
import { supabase } from '../../lib/supabase'

const NK = { МРП:4325,МЗП:85000,НДС:16,ИПН:10,ИПН_ПРОГ:15,ИПН_ПОРОГ_МРП:8500,
  ВЫЧЕТ_МРП:30,КПН:20,УНР:4,УНР_ЛИМИТ:600000,СН:6,ОПВ:10,ОПВР:3.5,СО:5,
  ВОСМС:2,ООСМС:3,ИП_ОПВ:10,ИП_СО:5,ИП_ОСМС:5 }

const C = {
  surf:'#FFF', alt:'#F7F5F1', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A', muted:'#A09880',
  blue:'#1A4E86', blueLt:'#E8F0FA', blueMd:'#2C69B3', amber:'#B86A00', amberLt:'#FDF0DC',
  red:'#A82828', redLt:'#FAEAEA', grn:'#1A6B3A', grnLt:'#E5F5EC', ip:'#0F5C8A', ipLt:'#E5F2FA',
  sh:'0 1px 4px rgba(0,0,0,.07)',
}

const n = v => parseFloat(v) || 0
const fmt = (v, d=2) => v==null||v==='' ? '' : parseFloat(v).toLocaleString('ru-KZ',{minimumFractionDigits:d,maximumFractionDigits:d})

// ── UI ATOMS ────────────────────────────────────────────────────
function FR({ code, label, children, auto, total, indent, hint }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'56px 1fr 200px', borderBottom:`1px solid ${C.brd}`, minHeight:38, background:total?'#EEF4FF':auto?'#F5FBF0':'#FFF' }}>
      <div style={{ padding:'6px 8px', borderRight:`1px solid ${C.brd}`, fontSize:10, fontWeight:700, color:C.muted, display:'flex', alignItems:'center', fontFamily:'monospace', background:C.alt }}>{code}</div>
      <div style={{ padding:'6px 10px', borderRight:`1px solid ${C.brd}`, display:'flex', alignItems:'center', fontSize:12, color:total?C.blue:C.txt, fontWeight:total?700:400, paddingLeft:indent?24:10 }}>
        {label}
        {hint && <span style={{ color:C.muted, fontSize:10, marginLeft:6 }}>{hint}</span>}
        {auto && <span style={{ color:C.grn, fontSize:10, marginLeft:6, fontWeight:600 }}>⚡авто</span>}
      </div>
      <div style={{ padding:'4px 8px', display:'flex', alignItems:'center' }}>{children}</div>
    </div>
  )
}

function FI({ value, onChange, auto, type='number', readOnly, placeholder }) {
  return (
    <input type={type} value={value||''} readOnly={auto||readOnly}
      onChange={e => onChange && onChange(e.target.value)}
      placeholder={placeholder||(type==='number'?'0.00':'')}
      style={{ width:'100%', background:'transparent', border:'none', outline:'none',
        fontSize:13, color:auto?C.grn:C.txt, fontWeight:auto?600:400, padding:'2px 4px',
        textAlign:type==='number'?'right':'left',
        fontFamily:type==='number'?'IBM Plex Mono,Courier New,monospace':'inherit' }}/>
  )
}

function FS({ value, onChange, options }) {
  return (
    <select value={value||''} onChange={e=>onChange&&onChange(e.target.value)}
      style={{ width:'100%', background:'transparent', border:'none', outline:'none', fontSize:12, color:C.txt, padding:'2px 4px', cursor:'pointer' }}>
      <option value=''>— выбрать —</option>
      {options.map((o,i) => <option key={i} value={o.v||o}>{o.l||o}</option>)}
    </select>
  )
}

// ── CALCULATORS ────────────────────────────────────────────────
function calc910(s, isIP) {
  const inc = n(s.inc_sales) + n(s.inc_other)
  s.inc_total = inc > 0 ? inc.toFixed(2) : ''
  const rate = n(s.rate) || 4
  const tax = inc * rate / 100
  s.tax_calc = tax.toFixed(2)
  if (isIP) {
    s.opv_self = (inc * NK.ИП_ОПВ / 100).toFixed(2)
    s.so_self = (1.4 * NK.МЗП * NK.ИП_СО / 100).toFixed(2)
    const red = n(s.opv_self) + n(s.so_self)
    s.tax_red = red.toFixed(2)
    s.tax_pay = Math.max(0, tax - red).toFixed(2)
  } else {
    s.tax_pay = tax.toFixed(2)
  }
  const fot = n(s.fot)
  s.opv_w = (fot * NK.ОПВ / 100).toFixed(2)
  s.opvr_w = (fot * NK.ОПВР / 100).toFixed(2)
  s.so_w = (fot * NK.СО / 100).toFixed(2)
  s.vosms_w = (fot * NK.ВОСМС / 100).toFixed(2)
  s.oosms_w = (fot * NK.ООСМС / 100).toFixed(2)
  s.sn_w = Math.max(0, fot * NK.СН / 100).toFixed(2)
  return s
}

function calc200(s, isIP) {
  const fot = n(s.fot), emp = n(s.emp), avg = n(s.avg_sal)
  const ded = NK.ВЫЧЕТ_МРП * NK.МРП / 12
  const base = Math.max(0, avg - avg*NK.ОПВ/100 - avg*NK.ВОСМС/100 - ded)
  const thresh = NK.ИПН_ПОРОГ_МРП * NK.МРП / 12
  const ir = base > thresh ? NK.ИПН_ПРОГ : NK.ИПН
  s.ipn_rate_info = ir + '%' + (base > thresh ? ' (прогрессивный)' : '')
  s.ipn_total = (base * ir / 100 * emp).toFixed(2)
  s.opv_total = (fot * NK.ОПВ / 100).toFixed(2)
  s.opvr_total = (fot * NK.ОПВР / 100).toFixed(2)
  s.so_total = (fot * NK.СО / 100).toFixed(2)
  s.vosms_total = (fot * NK.ВОСМС / 100).toFixed(2)
  s.oosms_total = (fot * NK.ООСМС / 100).toFixed(2)
  s.sn_total = Math.max(0, fot * NK.СН / 100).toFixed(2)
  if (isIP) {
    s.opv_self = (n(s.self_inc) * NK.ИП_ОПВ / 100).toFixed(2)
    s.so_self = (1.4 * NK.МЗП * NK.ИП_СО / 100).toFixed(2)
  }
  const tot = n(s.ipn_total)+n(s.opv_total)+n(s.opvr_total)+n(s.so_total)+n(s.vosms_total)+n(s.oosms_total)+n(s.sn_total)
  s.total_pay = tot.toFixed(2)
  return s
}

function calc300(s) {
  s.rev_total = (n(s.rev_taxable)+n(s.rev_zero)+n(s.rev_exempt)).toFixed(2)
  s.nds_charged = (n(s.rev_taxable)*NK.НДС/100).toFixed(2)
  s.nds_credit = (n(s.nds_purchases)*NK.НДС/(100+NK.НДС)).toFixed(2)
  const diff = n(s.nds_charged) - n(s.nds_credit)
  s.nds_pay = diff > 0 ? diff.toFixed(2) : '0.00'
  s.nds_return = diff < 0 ? Math.abs(diff).toFixed(2) : '0.00'
  return s
}

// ── XML GENERATOR ──────────────────────────────────────────────
function generateXML(formCode, d, client, isIP) {
  const idTag = isIP ? 'IIN' : 'BIN'
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<Envelope>
  <Header>
    <FormCode>${formCode}</FormCode>
    <EntityType>${isIP?'ИП':'ТОО'}</EntityType>
    <${idTag}>${client.bin}</${idTag}>
    <TaxpayerName><![CDATA[${client.name}]]></TaxpayerName>
    <TaxPeriod>${d.period||''}</TaxPeriod>
    <DeclarationType>${d.type||'Первоначальная'}</DeclarationType>
    ${!isIP?`<Director><![CDATA[${client.director||''}]]></Director>`:''}
  </Header>`

  if (formCode === '910') return header + `
  <F910_Income>
    <IncTotal>${d.inc_total||0}</IncTotal>
    <Rate>${d.rate||4}</Rate>
    <TaxPay>${d.tax_pay||0}</TaxPay>
  </F910_Income>
  <F910_Workers>
    <Emp>${d.emp||0}</Emp><FOT>${d.fot||0}</FOT>
    <IPN>${d.ipn_w||0}</IPN><OPV>${d.opv_w||0}</OPV>
    <OPVR>${d.opvr_w||0}</OPVR><SO>${d.so_w||0}</SO>
    <SN>${d.sn_w||0}</SN>
  </F910_Workers>
</Envelope>`

  if (formCode === '200') return header + `
  <Workers>
    <Emp>${d.emp||0}</Emp><FOT>${d.fot||0}</FOT>
    <IPN>${d.ipn_total||0}</IPN><OPVR>${d.opvr_total||0}</OPVR>
    <SN>${d.sn_total||0}</SN>
  </Workers>
  <TotalPay>${d.total_pay||0}</TotalPay>
</Envelope>`

  if (formCode === '300') return header + `
  <Turnover>
    <Taxable16>${d.rev_taxable||0}</Taxable16>
    <Total>${d.rev_total||0}</Total>
  </Turnover>
  <NDS>
    <Charged>${d.nds_charged||0}</Charged>
    <Credit>${d.nds_credit||0}</Credit>
    <Pay>${d.nds_pay||0}</Pay>
  </NDS>
</Envelope>`

  return header + `\n  <!-- Form ${formCode} -->\n</Envelope>`
}

// ── MAIN PAGE ──────────────────────────────────────────────────
export default function DeclarationEditor() {
  const router = useRouter()
  const { id } = router.query
  const isNew = !id || id === 'new'
  const { session } = useAuth()

  const [tab, setTab] = useState('form')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [declId, setDeclId] = useState(isNew ? null : id)
  const [client, setClient] = useState(null)
  const [clients, setClients] = useState([])
  const [formCode, setFormCode] = useState(router.query.form || '910')
  const [status, setStatus] = useState('draft')
  const [d, setD] = useState({ period:'1 полугодие 2026', type:'Первоначальная', rate:'4' })

  const isIP = client?.type === 'ИП'
  const ac = isIP ? C.ip : C.blue

  useEffect(() => {
    if (!session) return
    loadClients()
    if (!isNew) loadDeclaration()
    if (router.query.form) setFormCode(router.query.form)
    if (router.query.client) loadClientById(router.query.client)
  }, [session, router.query])

  async function loadClients() {
    const { data } = await supabase.from('clients').select('id,name,bin,type,regime,director,nds').eq('user_id', session.user.id).eq('status','active').order('name')
    setClients(data || [])
  }

  async function loadClientById(cid) {
    const { data } = await supabase.from('clients').select('*').eq('id', cid).single()
    if (data) setClient(data)
  }

  async function loadDeclaration() {
    const { data } = await supabase.from('declarations').select('*, clients(*)').eq('id', id).single()
    if (data) {
      setDeclId(data.id)
      setFormCode(data.form_code)
      setStatus(data.status)
      setClient(data.clients)
      setD(data.form_data || {})
    }
  }

  const set = useCallback((k, v) => {
    setD(p => {
      let s = { ...p, [k]: v }
      if (formCode === '910') s = calc910(s, isIP)
      if (formCode === '200') s = calc200(s, isIP)
      if (formCode === '300') s = calc300(s)
      return s
    })
    setSaved(false)
  }, [formCode, isIP])

  async function handleSave(newStatus) {
    if (!client) return alert('Выберите клиента')
    setSaving(true)
    const xml = generateXML(formCode, d, client, isIP)
    const payload = {
      user_id: session.user.id,
      client_id: client.id,
      form_code: formCode,
      period: d.period || '',
      status: newStatus || status,
      form_data: d,
      xml_content: xml,
    }
    try {
      if (declId) {
        await supabase.from('declarations').update(payload).eq('id', declId)
      } else {
        const { data } = await supabase.from('declarations').insert(payload).select().single()
        setDeclId(data.id)
        router.replace(`/declarations/${data.id}`, undefined, { shallow: true })
      }
      if (newStatus) setStatus(newStatus)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) { alert('Ошибка: ' + e.message) }
    finally { setSaving(false) }
  }

  function downloadXML() {
    const xml = generateXML(formCode, d, client, isIP)
    const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `Форма_${formCode}_${client?.bin||'xxx'}_${d.period||'2026'}.xml`
    a.click()
  }

  const periodOpts910 = ['1 полугодие 2026','2 полугодие 2026','1 полугодие 2025','2 полугодие 2025']
  const periodOptsQ = ['1 квартал 2026','2 квартал 2026','3 квартал 2026','4 квартал 2026']
  const periodOptsY = ['2026 год','2025 год','2024 год']
  const periods = formCode === '910' ? periodOpts910 : (formCode === '100' || formCode === '220') ? periodOptsY : periodOptsQ

  const FORM_TITLES = {
    '910': 'Форма 910 — УНР (4%)',
    '200': 'Форма 200 — ИПН и соц. платежи',
    '300': 'Форма 300 — НДС 16%',
    '100': 'Форма 100 — КПН',
    '220': 'Форма 220 — ИПН ИП (ОУР)',
    '912': 'Форма 912 — Самозанятый',
  }

  const statusLabel = { draft:'Черновик', ready:'Готова', signed:'Подписана', submitted:'Отправлена' }
  const statusColor = { draft:C.muted, ready:C.blue, signed:C.amber, submitted:C.grn }

  const xml = client ? generateXML(formCode, d, client, isIP) : ''

  return (
    <Layout active="declarations">
      {/* Topbar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={() => router.push('/declarations')} style={{ background:'none', border:'none', color:C.blueMd, cursor:'pointer', fontSize:13, padding:0 }}>← Декларации</button>
          <span style={{ color:C.muted }}>/</span>
          <b>{FORM_TITLES[formCode] || 'Новая декларация'}</b>
          <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', background:statusColor[status]+'22', color:statusColor[status], borderRadius:4 }}>{statusLabel[status]}</span>
          {saved && <span style={{ fontSize:11, color:C.grn }}>✅ Сохранено</span>}
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={() => handleSave()} disabled={saving} style={{ background:C.alt, color:C.txt, border:`1px solid ${C.brd}`, borderRadius:7, padding:'7px 14px', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
            {saving ? '⏳' : '💾'} Сохранить
          </button>
          <button onClick={downloadXML} disabled={!client} style={{ background:C.grnLt, color:C.grn, border:`1px solid #A8D8BE`, borderRadius:7, padding:'7px 14px', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
            📤 Скачать XML
          </button>
          {status === 'draft' && (
            <button onClick={() => handleSave('ready')} style={{ background:C.blue, color:'#fff', border:'none', borderRadius:7, padding:'7px 14px', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }}>
              ✅ Готова к подписанию
            </button>
          )}
          <button onClick={() => window.print()} style={{ background:C.alt, color:C.sub, border:`1px solid ${C.brd}`, borderRadius:7, padding:'7px 12px', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>🖨️</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{ display:'flex', gap:2, borderBottom:`1px solid ${C.brd}`, marginBottom:16 }}>
        {[['form','📝 Форма'],['xml','📄 XML'],['history','📋 История']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding:'8px 16px', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:tab===k?700:400, color:tab===k?ac:C.sub, borderBottom:tab===k?`2px solid ${ac}`:'2px solid transparent', marginBottom:-1 }}>{l}</button>
        ))}
      </div>

      {/* ── FORM TAB ─────────────────────────────────────────── */}
      {tab === 'form' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:16 }}>
          <div>
            {/* Client + Form selector */}
            <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, padding:16, marginBottom:12, boxShadow:C.sh }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:'block', marginBottom:4 }}>Клиент *</label>
                  <select value={client?.id||''} onChange={e => { const c = clients.find(x=>x.id===e.target.value); setClient(c||null) }}
                    style={{ width:'100%', padding:'8px 10px', border:`1px solid ${C.brd}`, borderRadius:7, fontSize:13, outline:'none', fontFamily:'inherit' }}>
                    <option value=''>— выберите клиента —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:C.sub, display:'block', marginBottom:4 }}>Форма декларации *</label>
                  <select value={formCode} onChange={e => setFormCode(e.target.value)}
                    style={{ width:'100%', padding:'8px 10px', border:`1px solid ${C.brd}`, borderRadius:7, fontSize:13, outline:'none', fontFamily:'inherit' }}>
                    {[['910','910 — УНР (4%)'],['200','200 — ИПН и соц. платежи'],['300','300 — НДС 16%'],['100','100 — КПН (ТОО)'],['220','220 — ИПН ИП (ОУР)'],['912','912 — Самозанятый']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Header block */}
            <div style={{ border:`1px solid ${C.brd}`, borderRadius:10, overflow:'hidden', marginBottom:12 }}>
              <div style={{ background:ac, color:'#fff', padding:'8px 14px', fontWeight:700, fontSize:13 }}>
                {FORM_TITLES[formCode]} · НК РК 2026
              </div>
              <FR code="00.01" label={isIP?'ИИН налогоплательщика':'БИН налогоплательщика'}>
                <FI type="text" value={client?.bin||''} readOnly placeholder="— выберите клиента выше —" />
              </FR>
              <FR code="00.02" label="Наименование / ФИО">
                <FI type="text" value={client?.name||''} readOnly />
              </FR>
              <FR code="00.03" label="Налоговый период">
                <FS value={d.period} onChange={v=>set('period',v)} options={periods} />
              </FR>
              <FR code="00.04" label="Вид декларации">
                <FS value={d.type} onChange={v=>set('type',v)} options={['Первоначальная','Очередная','Дополнительная','По уведомлению']} />
              </FR>
            </div>

            {/* Form 910 */}
            {formCode === '910' && (
              <>
                <div style={{ background:ac, color:'#fff', padding:'7px 12px', fontWeight:700, fontSize:12 }}>Раздел 910.00 — Исчисление налога</div>
                <div style={{ border:`1px solid ${C.brd}`, borderTop:'none', borderRadius:'0 0 8px 8px', overflow:'hidden', marginBottom:10 }}>
                  <FR code="00.001" label="Доход от реализации"><FI value={d.inc_sales} onChange={v=>set('inc_sales',v)}/></FR>
                  <FR code="00.002" label="Прочие доходы"><FI value={d.inc_other} onChange={v=>set('inc_other',v)}/></FR>
                  <FR code="00.003" label="Итого доходов" auto total><FI value={d.inc_total} auto/></FR>
                  <FR code="00.004" label="Ставка налога (%)" hint="базовая 4%"><FI value={d.rate} onChange={v=>set('rate',v)} placeholder="4"/></FR>
                  <FR code="00.005" label="Исчисленная сумма налога" auto><FI value={d.tax_calc} auto/></FR>
                  {isIP && <FR code="00.006" label="Уменьшение налога (ОПВ+СО за себя)" auto><FI value={d.tax_red} auto/></FR>}
                  <FR code={isIP?'00.007':'00.006'} label="Налог УНР к уплате" auto total><FI value={d.tax_pay} auto/></FR>
                </div>
                {isIP && (
                  <>
                    <div style={{ background:C.ip, color:'#fff', padding:'7px 12px', fontWeight:700, fontSize:12 }}>Раздел 910.01 — Платежи ИП за себя</div>
                    <div style={{ border:`1px solid ${C.brd}`, borderTop:'none', borderRadius:'0 0 8px 8px', overflow:'hidden', marginBottom:10 }}>
                      <FR code="01.001" label={`ОПВ ИП за себя — ${NK.ИП_ОПВ}%`} auto><FI value={d.opv_self} auto/></FR>
                      <FR code="01.002" label={`СО ИП за себя — ${NK.ИП_СО}% от 1.4×МЗП`} auto><FI value={d.so_self} auto/></FR>
                    </div>
                  </>
                )}
                <div style={{ background:'#3D5A80', color:'#fff', padding:'7px 12px', fontWeight:700, fontSize:12 }}>Работники</div>
                <div style={{ border:`1px solid ${C.brd}`, borderTop:'none', borderRadius:'0 0 8px 8px', overflow:'hidden' }}>
                  <FR code="w.001" label="Среднесписочная численность работников"><FI value={d.emp} onChange={v=>set('emp',v)} placeholder="0"/></FR>
                  <FR code="w.002" label="Фонд оплаты труда"><FI value={d.fot} onChange={v=>set('fot',v)}/></FR>
                  <FR code="w.003" label={`ОПВ — ${NK.ОПВ}%`} auto><FI value={d.opv_w} auto/></FR>
                  <FR code="w.004" label={`ОПВР — ${NK.ОПВР}% ↑`} auto><FI value={d.opvr_w} auto/></FR>
                  <FR code="w.005" label={`Соц. налог — ${NK.СН}% ↓`} auto total><FI value={d.sn_w} auto/></FR>
                </div>
              </>
            )}

            {/* Form 200 */}
            {formCode === '200' && (
              <>
                <div style={{ background:ac, color:'#fff', padding:'7px 12px', fontWeight:700, fontSize:12 }}>Раздел 200.01 — ИПН работников</div>
                <div style={{ border:`1px solid ${C.brd}`, borderTop:'none', borderRadius:'0 0 8px 8px', overflow:'hidden', marginBottom:10 }}>
                  <FR code="01.001" label="Кол-во работников"><FI value={d.emp} onChange={v=>set('emp',v)} placeholder="0"/></FR>
                  <FR code="01.002" label="ФОТ за квартал"><FI value={d.fot} onChange={v=>set('fot',v)}/></FR>
                  <FR code="01.003" label="Средняя зарплата / мес"><FI value={d.avg_sal} onChange={v=>set('avg_sal',v)}/></FR>
                  <FR code="01.004" label="Ставка ИПН" auto><FI type="text" value={d.ipn_rate_info} auto/></FR>
                  <FR code="01.005" label="ИПН с работников" auto total><FI value={d.ipn_total} auto/></FR>
                </div>
                <div style={{ background:'#3D5A80', color:'#fff', padding:'7px 12px', fontWeight:700, fontSize:12 }}>Раздел 200.02 — Соц. платежи</div>
                <div style={{ border:`1px solid ${C.brd}`, borderTop:'none', borderRadius:'0 0 8px 8px', overflow:'hidden', marginBottom:10 }}>
                  <FR code="02.001" label={`ОПВ — ${NK.ОПВ}%`} auto><FI value={d.opv_total} auto/></FR>
                  <FR code="02.002" label={`ОПВР — ${NK.ОПВР}% ↑`} auto><FI value={d.opvr_total} auto/></FR>
                  <FR code="02.003" label={`СО — ${NK.СО}%`} auto><FI value={d.so_total} auto/></FR>
                  <FR code="02.004" label={`ВОСМС — ${NK.ВОСМС}%`} auto><FI value={d.vosms_total} auto/></FR>
                  <FR code="02.005" label={`ООСМС — ${NK.ООСМС}%`} auto><FI value={d.oosms_total} auto/></FR>
                  <FR code="02.006" label={`Соц. налог — ${NK.СН}% ↓`} auto total><FI value={d.sn_total} auto/></FR>
                </div>
                <div style={{ background:C.grn, color:'#fff', padding:'7px 12px', fontWeight:700, fontSize:12 }}>ИТОГО к уплате</div>
                <div style={{ border:`1px solid ${C.brd}`, borderTop:'none', borderRadius:'0 0 8px 8px', overflow:'hidden' }}>
                  <FR code="04.001" label="ИТОГО к уплате" auto total><FI value={d.total_pay} auto/></FR>
                </div>
              </>
            )}

            {/* Form 300 */}
            {formCode === '300' && (
              <>
                <div style={{ background:C.red, color:'#fff', padding:'8px 14px', borderRadius:'7px 7px 0 0', fontSize:12, marginBottom:0 }}>
                  ⚠️ Ставка НДС с 01.01.2026: <b>16%</b> (было 12%). Порог регистрации: {(10000*NK.МРП).toLocaleString('ru-KZ')} ₸.
                </div>
                <div style={{ border:`1px solid ${C.brd}`, overflow:'hidden', marginBottom:10 }}>
                  <FR code="01.001" label="Облагаемый оборот (НДС 16%)"><FI value={d.rev_taxable} onChange={v=>set('rev_taxable',v)}/></FR>
                  <FR code="01.002" label="Нулевая ставка (экспорт)"><FI value={d.rev_zero} onChange={v=>set('rev_zero',v)}/></FR>
                  <FR code="01.003" label="Освобождённый оборот"><FI value={d.rev_exempt} onChange={v=>set('rev_exempt',v)}/></FR>
                  <FR code="01.004" label="Итого оборот" auto total><FI value={d.rev_total} auto/></FR>
                  <FR code="02.001" label="НДС начисленный (×16%)" auto><FI value={d.nds_charged} auto/></FR>
                  <FR code="03.001" label="Стоимость покупок с НДС"><FI value={d.nds_purchases} onChange={v=>set('nds_purchases',v)}/></FR>
                  <FR code="03.002" label="НДС к зачёту (16/116)" auto><FI value={d.nds_credit} auto/></FR>
                  <FR code="04.001" label="НДС к уплате" auto total><FI value={d.nds_pay} auto/></FR>
                  <FR code="04.002" label="НДС к возврату" auto><FI value={d.nds_return} auto/></FR>
                </div>
              </>
            )}

            {!['910','200','300'].includes(formCode) && (
              <div style={{ textAlign:'center', padding:'40px 20px', background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🔧</div>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>Форма {formCode} — в разработке</div>
                <div style={{ color:C.sub, fontSize:13 }}>Скоро будет добавлена полная форма</div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Summary */}
            {client && (
              <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, padding:16, boxShadow:C.sh }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>💰 Итоговые суммы</div>
                {formCode==='910' && [
                  {l:'Доход', v:d.inc_total},{l:'Налог УНР к уплате', v:d.tax_pay, bold:true, c:C.red},
                  {l:'ОПВР работодателя ↑', v:d.opvr_w, c:C.amber},{l:'Соц. налог', v:d.sn_w},
                ].filter(x=>n(x.v)>0).map((x,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${C.brd}`, fontSize:12 }}>
                    <span style={{ color:C.sub }}>{x.l}</span>
                    <span style={{ fontWeight:x.bold?800:500, color:x.c||C.txt, fontFamily:'monospace' }}>{fmt(n(x.v))} ₸</span>
                  </div>
                ))}
                {formCode==='200' && [
                  {l:'ИПН', v:d.ipn_total, c:C.red},{l:'ОПВР ↑', v:d.opvr_total, c:C.amber},
                  {l:'Итого к уплате', v:d.total_pay, bold:true, c:C.red},
                ].filter(x=>n(x.v)>0).map((x,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${C.brd}`, fontSize:12 }}>
                    <span style={{ color:C.sub }}>{x.l}</span>
                    <span style={{ fontWeight:x.bold?800:500, color:x.c||C.txt, fontFamily:'monospace' }}>{fmt(n(x.v))} ₸</span>
                  </div>
                ))}
                {formCode==='300' && [
                  {l:'НДС начислен', v:d.nds_charged, c:C.red},{l:'НДС к зачёту', v:d.nds_credit, c:C.grn},
                  {l:n(d.nds_pay)>0?'НДС к уплате':'НДС к возврату', v:n(d.nds_pay)>0?d.nds_pay:d.nds_return, bold:true, c:n(d.nds_pay)>0?C.red:C.grn},
                ].filter(x=>n(x.v)>0).map((x,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${C.brd}`, fontSize:12 }}>
                    <span style={{ color:C.sub }}>{x.l}</span>
                    <span style={{ fontWeight:x.bold?800:500, color:x.c||C.txt, fontFamily:'monospace' }}>{fmt(n(x.v))} ₸</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ background:C.amberLt, border:'1px solid #E8C07A', borderRadius:10, padding:14, fontSize:11, color:'#7A4A0A' }}>
              <b>⚡ Авторасчёт</b><br/>Зелёные поля рассчитываются автоматически по НК РК 2026.
            </div>
            <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, padding:14 }}>
              <div style={{ fontWeight:700, fontSize:12, color:C.sub, marginBottom:8 }}>📅 Сроки сдачи</div>
              {{'910':['1 п/г — до 15 августа','2 п/г — до 15 февраля'],'200':['1кв — до 15 мая','2кв — до 15 авг.','3кв — до 15 ноя.','4кв — до 15 фев.'],'300':['Квартально до 15-го','2-го мес. следующего кв.'],'100':['Годовая до 31 марта'],'220':['Годовая до 31 марта'],'912':['Квартально до 15-го']}[formCode]?.map((t,i)=>(
                <div key={i} style={{ fontSize:11, color:C.txt, padding:'2px 0' }}>• {t}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── XML TAB ───────────────────────────────────────────── */}
      {tab === 'xml' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontWeight:700 }}>📄 XML для cabinet.salyk.kz</div>
              <div style={{ fontSize:11, color:C.sub }}>Скачайте → подпишите через NCALayer → загрузите в личный кабинет КГД</div>
            </div>
            <button onClick={downloadXML} disabled={!client} style={{ background:C.grn, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>⬇️ Скачать XML</button>
          </div>
          {!client ? (
            <div style={{ padding:40, textAlign:'center', color:C.muted, background:C.surf, borderRadius:10, border:`1px solid ${C.brd}` }}>Выберите клиента во вкладке «Форма»</div>
          ) : (
            <>
              <div style={{ background:'#0F1117', borderRadius:8, padding:'14px 18px', fontFamily:'IBM Plex Mono,monospace', fontSize:12, color:'#7EC8A4', lineHeight:1.9, overflow:'auto', maxHeight:500, marginBottom:12 }}>
                <pre style={{ margin:0, whiteSpace:'pre-wrap' }}>{xml}</pre>
              </div>
              <div style={{ padding:'10px 14px', background:C.amberLt, border:'1px solid #E8C07A', borderRadius:7, fontSize:11, color:'#7A4A0A' }}>
                ⚠️ Для подачи нужна ЭЦП. Установите <b>NCALayer</b> (ncl.gov.kz), подпишите XML, загрузите на <b>cabinet.salyk.kz</b> → Налоговая отчётность → Импорт.
              </div>
            </>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ──────────────────────────────────────── */}
      {tab === 'history' && (
        <div>
          <div style={{ fontWeight:700, marginBottom:12 }}>📋 История статусов</div>
          {[{s:'draft',l:'Черновик создан',d:new Date().toLocaleDateString('ru-KZ'),done:true},...(status!=='draft'?[{s:status,l:'Статус изменён на: '+statusLabel[status],d:new Date().toLocaleDateString('ru-KZ'),done:true}]:[])].map((h,i)=>(
            <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:`1px solid ${C.brd}` }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:h.done?C.grn:C.muted, marginTop:4, flexShrink:0 }}/>
              <div><div style={{ fontSize:13, fontWeight:500 }}>{h.l}</div><div style={{ fontSize:11, color:C.muted }}>{h.d}</div></div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
