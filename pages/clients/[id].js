import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useAuth } from '../_app'
import { supabase } from '../../lib/supabase'

const C = {
  surf:'#FFF', alt:'#F7F5F1', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A', muted:'#A09880',
  blue:'#1A4E86', blueLt:'#E8F0FA', red:'#A82828', redLt:'#FAEAEA',
  grn:'#1A6B3A', grnLt:'#E5F5EC', ip:'#0F5C8A', sh:'0 1px 4px rgba(0,0,0,.07)',
}

const inp = {
  width: '100%', padding: '9px 12px', border: `1px solid ${C.brd}`,
  borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'inherit',
  background: C.surf, color: C.txt,
}

export default function ClientForm() {
  const router = useRouter()
  const { id } = router.query
  const isEdit = id && id !== 'new'
  const { session } = useAuth()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({
    type: 'ТОО', name: '', bin: '', regime: 'УНР', nds: false,
    address: '', director: '', accountant_name: '', phone: '', email: '', notes: ''
  })

  useEffect(() => {
    if (isEdit && session) loadClient()
  }, [isEdit, session])

  async function loadClient() {
    const { data } = await supabase.from('clients').select('*').eq('id', id).single()
    if (data) setForm(data)
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) return setMsg({ type: 'error', text: 'Укажите наименование' })
    if (form.bin.length !== 12 || !/^\d+$/.test(form.bin)) return setMsg({ type: 'error', text: 'ИИН/БИН должен содержать ровно 12 цифр' })

    setSaving(true)
    setMsg(null)
    try {
      if (isEdit) {
        await supabase.from('clients').update({ ...form, updated_at: new Date().toISOString() }).eq('id', id)
        setMsg({ type: 'success', text: 'Клиент обновлён' })
      } else {
        await supabase.from('clients').insert({ ...form, user_id: session.user.id })
        setMsg({ type: 'success', text: 'Клиент добавлен' })
        setTimeout(() => router.push('/clients'), 1000)
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Удалить клиента "${form.name}"? Все его декларации останутся.`)) return
    await supabase.from('clients').update({ status: 'archived' }).eq('id', id)
    router.push('/clients')
  }

  const Label = ({ children }) => <label style={{ fontSize: 11, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 4, marginTop: 12 }}>{children}</label>
  const Section = ({ title, children }) => (
    <div style={{ background: C.surf, border: `1px solid ${C.brd}`, borderRadius: 10, padding: 20, marginBottom: 14, boxShadow: C.sh }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.brd}` }}>{title}</div>
      {children}
    </div>
  )

  return (
    <Layout active="clients">
      <div style={{ maxWidth: 720 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <button onClick={() => router.push('/clients')} style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: 13, padding: 0 }}>← Клиенты</button>
          <span style={{ color: C.muted }}>/</span>
          <h1 style={{ fontWeight: 800, fontSize: 18 }}>{isEdit ? `Редактировать: ${form.name}` : 'Новый клиент'}</h1>
        </div>

        {msg && (
          <div style={{ background: msg.type === 'error' ? C.redLt : C.grnLt, border: `1px solid ${msg.type === 'error' ? '#E8B0B0' : '#A8D8BE'}`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: msg.type === 'error' ? C.red : C.grn, display: 'flex', gap: 8 }}>
            {msg.type === 'error' ? '⚠️' : '✅'} {msg.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          <Section title="🏢 Основная информация">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label>Тип организации *</Label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['ИП', 'ТОО', 'АО'].map(t => (
                    <button type="button" key={t} onClick={() => set('type', t)} style={{ flex: 1, padding: '8px 0', background: form.type === t ? (t === 'ИП' ? C.ip : C.blue) : C.alt, color: form.type === t ? '#fff' : C.sub, border: `1px solid ${C.brd}`, borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label>{form.type === 'ИП' ? 'ИИН *' : 'БИН *'} (12 цифр)</Label>
                <input style={inp} value={form.bin} onChange={e => set('bin', e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="000000000000" required />
              </div>
            </div>
            <Label>{form.type === 'ИП' ? 'ФИО индивидуального предпринимателя *' : 'Наименование организации *'}</Label>
            <input style={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder={form.type === 'ИП' ? 'Фамилия Имя Отчество' : 'ТОО «Название»'} required />
          </Section>

          <Section title="📋 Налоговый режим">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <Label>Режим налогообложения *</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[['УНР', 'Упрощённый (УНР) — 4%'], ['ОУР', 'Общеустановленный (ОУР)'], ['Самозан.', 'Самозанятый ИП — 4%']].map(([v, l]) => (
                    <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, padding: '7px 10px', background: form.regime === v ? C.blueLt : C.alt, borderRadius: 7, border: `1px solid ${form.regime === v ? C.blue : C.brd}` }}>
                      <input type="radio" checked={form.regime === v} onChange={() => set('regime', v)} style={{ accentColor: C.blue }} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>НДС</Label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: form.nds ? '#FFF3E0' : C.alt, borderRadius: 8, border: `1px solid ${form.nds ? '#E8C07A' : C.brd}` }}>
                  <input type="checkbox" checked={form.nds} onChange={e => set('nds', e.target.checked)} style={{ width: 18, height: 18, accentColor: C.amber }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Плательщик НДС</div>
                    <div style={{ fontSize: 11, color: C.muted }}>Ставка 16% · Порог 10 000 МРП</div>
                  </div>
                </label>
              </div>
            </div>
          </Section>

          <Section title="👤 Контактная информация">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {form.type !== 'ИП' && (
                <>
                  <div><Label>Руководитель (ФИО)</Label><input style={inp} value={form.director||''} onChange={e => set('director', e.target.value)} placeholder="Фамилия И.О." /></div>
                  <div><Label>Главный бухгалтер (ФИО)</Label><input style={inp} value={form.accountant_name||''} onChange={e => set('accountant_name', e.target.value)} placeholder="Фамилия И.О." /></div>
                </>
              )}
              <div><Label>Телефон</Label><input style={inp} value={form.phone||''} onChange={e => set('phone', e.target.value)} placeholder="+7 (700) 000-00-00" /></div>
              <div><Label>Email</Label><input style={inp} type="email" value={form.email||''} onChange={e => set('email', e.target.value)} placeholder="client@mail.com" /></div>
            </div>
            <Label>Адрес (юридический / регистрации ИП)</Label>
            <input style={inp} value={form.address||''} onChange={e => set('address', e.target.value)} placeholder="г. Алматы, ул. Примерная, д. 1" />
            <Label>Заметки</Label>
            <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} value={form.notes||''} onChange={e => set('notes', e.target.value)} placeholder="Любые дополнительные сведения..." />
          </Section>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}>
                {saving ? '⏳ Сохранение...' : isEdit ? '💾 Сохранить изменения' : '✅ Добавить клиента'}
              </button>
              <button type="button" onClick={() => router.push('/clients')} style={{ background: C.alt, color: C.sub, border: `1px solid ${C.brd}`, borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Отмена</button>
            </div>
            {isEdit && (
              <button type="button" onClick={handleDelete} style={{ background: C.redLt, color: C.red, border: `1px solid #E8B0B0`, borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>🗑️ Удалить</button>
            )}
          </div>
        </form>
      </div>
    </Layout>
  )
}
