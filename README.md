# 📊 CryptoView — Frontend

Веб-приложение для мониторинга криптовалютного рынка в реальном времени.

## 🔗 Демо

👉 [cryptoview-app.github.io/frontend](https://cryptoview-app.github.io/frontend)

## 📄 Страницы

| Файл             | Описание                                                |
|------------------|---------------------------------------------------------|
| `index.html`     | Рынок — таблица топ-20 криптовалют с реальными данными  |
| `detail.html`    | Детали монеты — график цены, метрики, описание          |
| `converter.html` | Конвертер — крипто ↔ фиат (USD, EUR, RUB, GBP, JPY)     |

## 🛠 Технологии

- **HTML5** — семантическая разметка
- **CSS3** — кастомные переменные, анимации, адаптивная вёрстка
- **JavaScript** — работа с API, динамический рендеринг, кэширование
- **Chart.js** — графики цен
- **CoinGecko API** — данные о криптовалютах (бесплатный, без ключа)

## 🚀 Запуск

Откройте `index.html` напрямую в браузере, или через локальный сервер:

```bash
cd frontend
python3 -m http.server 3000
```

Далее откройте в браузере: [http://localhost:3000](http://localhost:3000)

## 📁 Структура проекта

```
frontend/
├── index.html           # Главная страница — рынок
├── detail.html          # Страница монеты
├── converter.html       # Конвертер валют
├── description.md       # Описание дипломного проекта
├── usecase-diagram.png  # Use-case диаграмма
├── img/                 # Локальные иконки криптовалют
├── css/
│   └── style.css        # Общие стили
├── js/
│   └── app.js           # Общая логика, форматтеры, API, кэш
├── .gitignore
├── .eslintrc.json
├── package.json
└── README.md
```

## 🔌 API

Используется публичный [CoinGecko API v3](https://docs.coingecko.com/):

- `GET /coins/markets` — список монет с ценами
- `GET /global` — глобальная статистика рынка
- `GET /coins/{id}/market_chart` — история цен для графика
- `GET /coins/{id}` — детальная информация о монете

> Бесплатный план: ~30 запросов/минуту. Данные кэшируются на 60 секунд. При ошибке нажмите «⟳ обновить».

## 🎓 Учебная практика УП.02

Этот репозиторий — часть дипломного проекта **CryptoView**.  
Смежный модуль (база данных): [cryptoview-app/database](https://github.com/cryptoview-app/database)