# TaxPro KZ — Инструкция по деплою
## Публичное облачное приложение · Supabase + Vercel · Бесплатно

---

## 📋 ЧТО ВЫ ПОЛУЧИТЕ

- ✅ Работающее веб-приложение 24/7 по адресу вида `taxpro-kz.vercel.app`
- ✅ Регистрация и вход для каждого пользователя
- ✅ Личный кабинет с клиентами и декларациями
- ✅ База данных в облаке (Supabase PostgreSQL)
- ✅ HTTPS, CDN, автодеплой из GitHub
- ✅ До 50 000 строк и 500 МБ данных — бесплатно

---

## ⏱️ ВРЕМЯ: ~30–40 минут

---

## ШАГ 1: Создать проект в Supabase (10 мин)

1. Перейдите на **supabase.com** → Sign Up (бесплатно)
2. **New Project** → введите:
   - Name: `taxpro-kz`
   - Database Password: придумайте надёжный пароль (запишите!)
   - Region: выберите ближайший (можно `Singapore` или `Frankfurt`)
3. Подождите ~2 минуты пока проект создаётся
4. Перейдите в **SQL Editor** → **New query**
5. Скопируйте содержимое файла `supabase/schema.sql` и нажмите **Run**
   > ✅ Должно появиться: "Success. No rows returned"

6. Перейдите в **Settings → API**:
   - Скопируйте **Project URL** (вида `https://xxxxx.supabase.co`)
   - Скопируйте **anon public** ключ

---

## ШАГ 2: Загрузить код на GitHub (5 мин)

1. Перейдите на **github.com** → Sign Up (бесплатно)
2. **New repository** → Name: `taxpro-kz` → **Public** → Create
3. На вашем компьютере откройте терминал в папке проекта:

```bash
git init
git add .
git commit -m "TaxPro KZ initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/taxpro-kz.git
git push -u origin main
```

> Если нет Git: скачайте на **git-scm.com**

---

## ШАГ 3: Деплой на Vercel (10 мин)

1. Перейдите на **vercel.com** → Sign Up with GitHub
2. **Add New Project** → выберите репозиторий `taxpro-kz`
3. Framework Preset: выберите **Next.js**
4. Разверните раздел **Environment Variables** и добавьте:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhb...` (anon key из Supabase) |
   | `NEXT_PUBLIC_SITE_URL` | `https://taxpro-kz.vercel.app` |

5. Нажмите **Deploy** → ждите ~3 минуты
6. Vercel даст вам ссылку вида: `https://taxpro-kz-xxx.vercel.app`

---

## ШАГ 4: Настроить авторизацию в Supabase (5 мин)

1. В Supabase → **Authentication → URL Configuration**
2. **Site URL**: вставьте ваш Vercel URL (`https://taxpro-kz.vercel.app`)
3. **Redirect URLs**: добавьте:
   - `https://taxpro-kz.vercel.app/**`
   - `http://localhost:3000/**`
4. Сохраните

---

## ШАГ 5: Проверка (5 мин)

Откройте ваш Vercel URL:
- [ ] Открывается страница входа
- [ ] Регистрация нового пользователя работает
- [ ] После входа открывается Dashboard
- [ ] Можно добавить клиента
- [ ] Можно создать и сохранить декларацию
- [ ] Скачивание XML работает

---

## 🔄 ОБНОВЛЕНИЕ КОДА

После любых изменений:
```bash
git add .
git commit -m "описание изменений"
git push
```
Vercel автоматически пересоберёт и задеплоит за ~2 минуты.

---

## 💻 ЛОКАЛЬНАЯ РАЗРАБОТКА

```bash
# Установить зависимости (один раз)
npm install

# Создать файл с переменными
cp .env.example .env.local
# Заполните .env.local вашими ключами Supabase

# Запустить локально
npm run dev
# Открыть http://localhost:3000
```

---

## 🗂️ СТРУКТУРА ПРОЕКТА

```
taxpro-kz/
├── pages/
│   ├── index.js              ← Страница входа/регистрации
│   ├── _app.js               ← Auth context (обёртка)
│   ├── dashboard.js          ← Главная страница
│   ├── profile.js            ← Профиль пользователя
│   ├── calendar.js           ← Налоговый календарь
│   ├── changes.js            ← Изменения НК РК 2026
│   ├── rates.js              ← Базовые ставки
│   ├── currency.js           ← Курсы валют (НБ РК)
│   ├── prodcal.js            ← Производственный календарь
│   ├── clients/
│   │   ├── index.js          ← Список клиентов
│   │   └── [id].js           ← Добавить / редактировать клиента
│   └── declarations/
│       ├── index.js          ← Список деклараций
│       └── [id].js           ← Редактор декларации (910/200/300/100/220/912)
├── components/
│   └── Layout.js             ← Sidebar + topbar + auth guard
├── lib/
│   └── supabase.js           ← Supabase client + DB helpers
├── styles/
│   └── globals.css           ← Глобальные стили
├── supabase/
│   └── schema.sql            ← Структура БД (запустить в Supabase SQL Editor)
├── .env.example              ← Шаблон переменных окружения
├── next.config.js
└── package.json
```

---

## 📊 ЛИМИТЫ БЕСПЛАТНОГО ПЛАНА

### Supabase Free:
- 500 МБ база данных
- 1 ГБ хранилище файлов
- 50 000 активных пользователей / мес
- 2 ГБ трафика
- **При превышении**: $25/мес (Pro план)

### Vercel Free (Hobby):
- Неограниченный трафик
- 100 ГБ полосы пропускания
- Автодеплой из GitHub
- **Без ограничений** для публичных проектов

---

## 🔧 ДОБАВИТЬ СОБСТВЕННЫЙ ДОМЕН

В Vercel → Settings → Domains → Add:
- Введите: `taxpro.kz` (или любой ваш домен)
- Добавьте DNS записи у регистратора домена (Vercel покажет)

---

## ❓ ЧАСТЫЕ ПРОБЛЕМЫ

**"Module not found"** — запустите `npm install`

**"Invalid API key"** — проверьте переменные в Vercel Settings → Environment Variables

**Белый экран после входа** — проверьте Site URL в Supabase Authentication settings

**SQL Error при запуске schema.sql** — убедитесь что запускаете в правильном проекте Supabase

---

## 🗺️ СЛЕДУЮЩИЕ ШАГИ (после запуска)

1. **Формы 100, 220** — доделать расчёты (КПН, ИПН ОУР)
2. **Экспорт PDF** — печатная версия деклараций
3. **NCALayer интеграция** — подписание ЭЦП прямо из браузера
4. **Email уведомления** — напоминания о сроках через Supabase Edge Functions
5. **Мобильная версия** — адаптивный дизайн
6. **Telegram бот** — напоминания в Telegram

---

*TaxPro KZ · НК РК 2026 · Закон №214-VIII от 18.07.2025*
