import Layout from '../components/Layout'
const C = { surf:'#FFF', alt:'#F7F5F1', brd:'#E0DBCF', txt:'#18170F', sub:'#6A655A', muted:'#A09880',
  blue:'#1A4E86', blueLt:'#E8F0FA', amber:'#B86A00', amberLt:'#FDF0DC',
  red:'#A82828', grn:'#1A6B3A', grnLt:'#E5F5EC', ip:'#0F5C8A', ipLt:'#E5F2FA', sh:'0 1px 4px rgba(0,0,0,.07)' }
const NK = { МРП:4325, МЗП:85000 }
const fmt = v => v.toLocaleString('ru-KZ')

export default function Rates() {
  const groups = [
    { title:'📌 Основные величины 2026', color:C.blue, items:[
      { name:'МЗП — Минимальная заработная плата', val:'85 000 ₸', note:'с 01.01.2026', hi:true },
      { name:'МРП — Месячный расчётный показатель', val:'4 325 ₸', note:'с 01.01.2026', hi:true },
      { name:'БДО — Базовый должностной оклад', val:'17 697 ₸', note:'с 01.01.2026' },
      { name:'1.4 × МЗП (база СО и ОСМС для ИП)', val:'119 000 ₸', note:'1.4 × 85 000' },
      { name:'Порог НДС (10 000 МРП/год)', val:fmt(10000*NK.МРП)+' ₸', note:'10 000 × 4 325' },
    ]},
    { title:'🏛️ Налоги', color:C.red, items:[
      { name:'КПН — Корпоративный подоходный налог (ОУР)', val:'20%', note:'базовая' },
      { name:'КПН — банки, страхование, игорный бизнес', val:'25%', note:'повышенная' },
      { name:'КПН — сельхозпроизводители', val:'3%', note:'льготная' },
      { name:'КПН — организации социальной сферы', val:'5%', note:'до 2027, затем 10%' },
      { name:'ИПН — до 8 500 МРП/год', val:'10%', note:'стандартная', hi:true },
      { name:'ИПН — свыше 8 500 МРП/год', val:'15%', note:'прогрессивная, с 2026', hi:true },
      { name:'Порог ИПН 15%', val:fmt(8500*NK.МРП)+' ₸/год', note:'8 500 × 4 325' },
      { name:'Стандартный вычет ИПН', val:'30 МРП/мес', note:fmt(30*NK.МРП)+' ₸/мес' },
      { name:'НДС — Налог на добавленную стоимость', val:'16%', note:'↑ с 12%, с 01.01.2026', hi:true },
      { name:'УНР (упрощённая декларация)', val:'4%', note:'↑ с 3%, базовая (регион. 2–6%)', hi:true },
      { name:'ИПН по СНР СМП (малый бизнес)', val:'1%', note:'специальный режим' },
      { name:'Единый платёж с заработной платы', val:'24.8%', note:'совокупно' },
    ]},
    { title:'🛡️ Социальные платежи', color:C.grn, items:[
      { name:'ОПВ — Обязательные пенсионные взносы (работник)', val:'10%', note:'от дохода' },
      { name:'ОПВР — ОПВ работодателя', val:'3.5%', note:'↑ с 2.5%, с 01.01.2026', hi:true },
      { name:'ОППВ — Добровольные пенсионные взносы', val:'5%', note:'по желанию' },
      { name:'ОПВ по договору ГПХ', val:'10%', note:'гражданско-правовой договор' },
      { name:'Социальный налог (работодатель)', val:'6%', note:'↓ с 11%−СО, с 01.01.2026', hi:true },
      { name:'Социальные отчисления (СО)', val:'5%', note:'от 1.4 × МЗП' },
      { name:'ОСМС — работодатель (ООСМС)', val:'3%', note:'от дохода работника' },
      { name:'ВОСМС — работник', val:'2%', note:'от дохода' },
      { name:'ИП: ОПВ за себя', val:'10%', note:'от дохода ИП' },
      { name:'ИП: СО за себя', val:'5%', note:'от 1.4 × МЗП = '+fmt(Math.round(1.4*NK.МЗП*0.05))+' ₸/мес' },
      { name:'ИП: ОСМС за себя', val:'5%', note:'от 1.4 × МЗП = '+fmt(Math.round(1.4*NK.МЗП*0.05))+' ₸/мес' },
    ]},
    { title:'📋 Прочие ставки', color:C.amber, items:[
      { name:'Ставка рефинансирования НБРК', val:'18%', note:'на 01.01.2026' },
      { name:'Майнинг (цифровой майнинг)', val:'2 ₸/кВтч', note:'специальный налог' },
      { name:'КПН у источника (дивиденды резидентам)', val:'5%', note:'' },
      { name:'КПН у источника (нерезиденты)', val:'15%', note:'без договора' },
    ]},
  ]
  return (
    <Layout active="rates">
      <div style={{ background:'linear-gradient(135deg,#1A4E86,#0D3060)', borderRadius:10, padding:'16px 22px', marginBottom:20, color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:800, fontSize:17, marginBottom:3 }}>📊 Базовые ставки и показатели 2026</div>
          <div style={{ fontSize:12, opacity:.85 }}>НК РК 2026 · Закон №214-VIII от 18.07.2025 · Обновлено: январь 2026</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:10, opacity:.7 }}>МРП 2026</div>
          <div style={{ fontWeight:800, fontSize:22 }}>4 325 ₸</div>
          <div style={{ fontSize:10, opacity:.7 }}>МЗП: 85 000 ₸</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {groups.map((g,gi) => (
          <div key={gi} style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:10, overflow:'hidden', boxShadow:C.sh }}>
            <div style={{ background:g.color, color:'#fff', padding:'10px 16px', fontWeight:700, fontSize:13 }}>{g.title}</div>
            {g.items.map((item,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', background:item.hi?g.color+'0D':'transparent', borderBottom:i<g.items.length-1?`1px solid ${C.brd}`:'none' }}>
                <div style={{ flex:1, marginRight:12 }}>
                  <div style={{ fontSize:12, fontWeight:item.hi?600:400, color:item.hi?g.color:C.txt }}>{item.name}</div>
                  {item.note && <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{item.note}</div>}
                </div>
                <div style={{ fontWeight:800, fontSize:13, color:g.color, background:g.color+'18', padding:'3px 9px', borderRadius:5, whiteSpace:'nowrap', fontFamily:'IBM Plex Mono,monospace' }}>{item.val}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ marginTop:14, padding:'10px 16px', background:C.amberLt, border:'1px solid #E8C07A', borderRadius:8, fontSize:11, color:'#7A4A0A' }}>
        ⚠️ Ставки действуют с 01.01.2026. МРП = 4 325 ₸. Актуальную информацию проверяйте на <b>minfin.gov.kz</b> и <b>zakon.kz</b>.
      </div>
    </Layout>
  )
}
