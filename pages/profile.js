import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from './_app'
import { supabase } from '../lib/supabase'

const C = { surf:'#FFF', alt:'#F7F5F1', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A', muted:'#A09880',
  blue:'#1A4E86', red:'#A82828', redLt:'#FAEAEA', grn:'#1A6B3A', grnLt:'#E5F5EC', sh:'0 1px 4px rgba(0,0,0,.07)' }
const inp = { width:'100%', padding:'9px 12px', border:`1px solid ${C.brd}`, borderRadius:7, fontSize:13, outline:'none', fontFamily:'inherit', background:C.surf }
const Label = ({children}) => <label style={{ fontSize:11,fontWeight:700,color:C.sub,display:'block',marginBottom:4,marginTop:12 }}>{children}</label>

export default function Profile() {
  const { profile, setProfile, session, signOut } = useAuth()
  const [form, setForm] = useState({ full_name:profile?.full_name||'', company:profile?.company||'', phone:profile?.phone||'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [pwForm, setPwForm] = useState({ current:'', next:'', confirm:'' })
  const [pwMsg, setPwMsg] = useState(null)

  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  async function saveProfile(e) {
    e.preventDefault(); setSaving(true); setMsg(null)
    try {
      const { data } = await supabase.from('profiles').update({ ...form, updated_at:new Date().toISOString() }).eq('id', session.user.id).select().single()
      setProfile(data)
      setMsg({ type:'success', text:'Профиль обновлён' })
    } catch(err) { setMsg({ type:'error', text:err.message }) }
    finally { setSaving(false) }
  }

  async function changePassword(e) {
    e.preventDefault(); setPwMsg(null)
    if (pwForm.next !== pwForm.confirm) return setPwMsg({ type:'error', text:'Новые пароли не совпадают' })
    if (pwForm.next.length < 6) return setPwMsg({ type:'error', text:'Пароль минимум 6 символов' })
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.next })
      if (error) throw error
      setPwMsg({ type:'success', text:'Пароль изменён' })
      setPwForm({ current:'', next:'', confirm:'' })
    } catch(err) { setPwMsg({ type:'error', text:err.message }) }
  }

  const Card = ({title, children}) => (
    <div style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, padding:20, marginBottom:16, boxShadow:C.sh }}>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${C.brd}` }}>{title}</div>
      {children}
    </div>
  )
  const Msg = ({m}) => m && (
    <div style={{ background:m.type==='error'?C.redLt:C.grnLt, border:`1px solid ${m.type==='error'?'#E8B0B0':'#A8D8BE'}`, borderRadius:7, padding:'8px 12px', marginBottom:12, fontSize:12, color:m.type==='error'?C.red:C.grn }}>
      {m.type==='error'?'⚠️':'✅'} {m.text}
    </div>
  )

  return (
    <Layout active="profile">
      <div style={{ maxWidth: 580 }}>
        <h1 style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>⚙️ Настройки профиля</h1>

        <Card title="👤 Личные данные">
          <Msg m={msg} />
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
            <div style={{ width:56, height:56, background:C.blue, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:22 }}>
              {(profile?.full_name||profile?.email||'?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:16 }}>{profile?.full_name || 'Имя не указано'}</div>
              <div style={{ fontSize:13, color:C.muted }}>{profile?.email}</div>
              <div style={{ fontSize:11, marginTop:3 }}>
                <span style={{ background:C.blue+'22', color:C.blue, fontWeight:700, padding:'1px 6px', borderRadius:3, fontSize:10 }}>{profile?.plan === 'pro' ? 'PRO' : 'Free'}</span>
              </div>
            </div>
          </div>
          <form onSubmit={saveProfile}>
            <Label>ФИО</Label>
            <input style={inp} value={form.full_name} onChange={e=>set('full_name',e.target.value)} placeholder="Фамилия Имя Отчество" />
            <Label>Компания / организация</Label>
            <input style={inp} value={form.company} onChange={e=>set('company',e.target.value)} placeholder="ТОО «Название» или ФИО ИП" />
            <Label>Телефон</Label>
            <input style={inp} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+7 (700) 000-00-00" />
            <Label>Email (изменить нельзя)</Label>
            <input style={{ ...inp, background:C.alt, color:C.muted }} value={profile?.email||''} readOnly />
            <button type="submit" disabled={saving} style={{ marginTop:16, background:C.blue, color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>
              {saving ? '⏳ Сохранение...' : '💾 Сохранить'}
            </button>
          </form>
        </Card>

        <Card title="🔒 Смена пароля">
          <Msg m={pwMsg} />
          <form onSubmit={changePassword}>
            <Label>Новый пароль</Label>
            <input style={inp} type="password" value={pwForm.next} onChange={e=>setPwForm(p=>({...p,next:e.target.value}))} placeholder="Минимум 6 символов" minLength={6} required />
            <Label>Подтвердите новый пароль</Label>
            <input style={inp} type="password" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} placeholder="Повторите пароль" required />
            <button type="submit" style={{ marginTop:16, background:C.alt, color:C.txt, border:`1px solid ${C.brd}`, borderRadius:8, padding:'9px 20px', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
              🔒 Изменить пароль
            </button>
          </form>
        </Card>

        <Card title="🚪 Выход">
          <p style={{ fontSize:13, color:C.sub, marginBottom:12 }}>Выйти из аккаунта на этом устройстве.</p>
          <button onClick={signOut} style={{ background:C.redLt, color:C.red, border:`1px solid #E8B0B0`, borderRadius:8, padding:'9px 20px', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
            Выйти из аккаунта
          </button>
        </Card>
      </div>
    </Layout>
  )
}
