# Проект сейчас: статический лендинг + опционально React в `web/`

## Что уже сделано

- **Главный сайт** (`index.html`): блок «Что говорят родители» — карусель на чистом JS (`testimonial-carousel.js`) в духе компонента с framer-motion: стопка из трёх карточек, свайп, стрелки, точки, те же тексты и аватары Unsplash.
- **Папка `web/`**: Next.js 15 + TypeScript + Tailwind + компонент **`components/ui/testimonial.tsx`** и демо **`components/testimonial-carousel-demo.tsx`**. Зависимости: `framer-motion`, `clsx`, `tailwind-merge` (для `cn` в `lib/utils.ts`).

## Почему `components/ui`

В экосистеме **shadcn/ui** все переиспользуемые примитивы кладут в `components/ui`, чтобы:

- единообразно импортировать (`@/components/ui/...`);
- не смешивать низкоуровневые UI-блоки с экранами и бизнес-компонентами;
- проще обновлять и копировать компоненты из реестра shadcn.

Если вы инициализируете shadcn CLI, он по умолчанию ожидает именно эту структуру.

## Запуск React-версии (после установки Node.js)

В терминале:

```bash
cd web
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Подключение shadcn через CLI (рекомендуется после `npm install`)

Из папки `web/`:

```bash
npx shadcn@latest init
```

Укажите те же пути, что уже в проекте: **Tailwind**, **RSC**, alias **`@/*`** → корень `web/`. После init можно добавлять компоненты:

```bash
npx shadcn@latest add button
```

Файл `components/ui/testimonial.tsx` уже лежит в нужном месте; при конфликте с генератором — сохраните свою версию или объедините вручную.

## Зависимости компонента `TestimonialCarousel`

| Пакет           | Назначение                          |
|----------------|--------------------------------------|
| `framer-motion`| анимации, drag, spring               |
| `clsx` + `tailwind-merge` | функция `cn()` в `lib/utils.ts` |

**lucide-react** для этой карусели не обязателен (стрелки — символы `←` / `→`).

## Вопросы из гайда (кратко)

- **Данные**: массив `Testimonial[]` — `id`, `name`, `avatar`, `description` (на сайте и в `web` совпадают с лендингом).
- **Состояние**: только индекс текущей карточки и `exitX` для жеста; отдельный стейт-менеджер не нужен.
- **Ассеты**: URL Unsplash с `crop=faces` (как в коде).
- **Адаптив**: на лендинге карусель ограничена `max-width`; в React — `w-80 max-w-full` внутри обёртки.
- **Куда вставлять**: на лендинге — секция `#reviews`; в Next — любая страница, импорт `TestimonialCarouselDemo` или самого `TestimonialCarousel`.
