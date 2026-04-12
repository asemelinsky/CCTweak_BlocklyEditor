# CCTweak Blockly Editor — План відновлення

**Дата:** 2026-04-12
**Мета:** Відновити роботу над візуальним блочним редактором коду для ComputerCraft (Minecraft мод) та перенести його з godlike.host на нову інфраструктуру (Vercel + VPS 46.225.227.42), спростити для учнів-початківців та додати українську локалізацію.

---

## Контекст

- **Стара версія:** `bajka.pp.ua/minecraft/blockly/index.html`
- **Оригінал у файловій системі:** `/root/projects/minecraft/old/blockly/blockyeditor_vers3/BlockyEditorFiles/`
- **Старий стек:** Flask (Python) + SFTP до godlike.host + мініфікований `bundle.js` (без джерел)
- **Джерело bundle.js:** https://github.com/Sarxzer/cc-blockly-editor (GPL-3.0, активний, останній push 2026-03-11)

---

## Цільова архітектура

За аналогією з `/root/projects/CCTweak_LuaPageCoding/`:

- **Frontend:** статика (Blockly + webpack build з форку `Sarxzer/cc-blockly-editor`)
- **Backend:** Vercel Serverless Function `api/upload.js` (Node.js + `ssh2-sftp-client`)
- **SFTP target:** VPS `46.225.227.42:2022`
  - Server 1 (Forge 1.20.1): user `admin.3c4202c1`
  - Server 2 (Arclight 1.21.1): user `admin.cfc9be31`
  - Шлях: `world/computercraft/computer/{N}/*.lua`
- **Хостинг:** Vercel (окремий проєкт `cctweak-blockly`)
- **Repo:** GitHub (новий, форк від Sarxzer)

### Структура проєкту

```
CCTweak_BlocklyEditor/
├── src/
│   ├── index.html           ← UI (селектор server/computer замість world)
│   ├── index.js             ← entrypoint
│   ├── index.css
│   ├── toolbox.js           ← ✏️ СПРОЩЕНО до 8 категорій
│   ├── blocks/
│   │   └── computcraft.js   ← turtle/fs/disk блоки (з оригіналу)
│   ├── generators/
│   │   └── lua.js           ← Lua-генератори
│   ├── i18n/
│   │   ├── uk.js            ← 🆕 український переклад
│   │   └── en.js            ← 🆕 англійський (fallback)
│   └── serialization.js
├── api/
│   └── upload.js            ← 🆕 Vercel SFTP (копія з CCTweak)
├── docs/
│   └── PLAN.md              ← цей файл
├── webpack.config.js
├── package.json             ← + ssh2-sftp-client
├── vercel.json
└── README.md
```

---

## Спрощене меню блоків (для початківців)

Замість повного API ComputerCraft — **8 базових категорій**:

| UA             | EN        | Блоки                                                           |
|----------------|-----------|-----------------------------------------------------------------|
| 🚶 Рух         | Movement  | forward, back, up, down, turnLeft, turnRight                    |
| 🧱 Будова      | Build     | place, placeUp, placeDown, dig, digUp, digDown, select slot     |
| 🔁 Цикли       | Loops     | repeat N, while, for                                            |
| 📦 Змінні      | Variables | стандартні Blockly variables                                    |
| 🔧 Функції     | Functions | стандартні Blockly procedures                                   |
| ➕ Математика  | Math      | number, arithmetic, random                                      |
| 🔀 Логіка      | Logic     | if, compare, and/or/not, boolean                                |
| 📝 Текст       | Text      | text, print (write до term)                                     |

**Сховані (залишаються в коді, але не в toolbox):** `fs_*`, `disk_*`, `peripheral_*`, `http_*`, `shell_*`, `rednet_*` — при потребі вмикаються для просунутих учнів.

---

## Локалізація UA/EN

- Вбудований механізм Blockly: `Blockly.Msg.*`
- Підключити офіційний `blockly/msg/uk.js` для стандартних блоків
- Кастомні turtle-блоки — власний словник у `src/i18n/uk.js` та `src/i18n/en.js`
- Перемикач UA/EN у хедері, стан у `localStorage`
- Мова за замовчуванням: **UA**

---

## Етапи виконання

### Етап 1 — Bootstrap
- [ ] `git clone https://github.com/Sarxzer/cc-blockly-editor` у тимчасову теку
- [ ] Скопіювати `src/`, `webpack.config.js`, `package.json` у `CCTweak_BlocklyEditor/`
- [ ] Видалити Windows-специфічне сміття (`*.bat`)
- [ ] `npm install` + перевірка `npm run build`
- [ ] Створити git-репо

### Етап 2 — Backend
- [ ] Скопіювати `api/upload.js` з `CCTweak_LuaPageCoding/`
- [ ] Адаптувати (computerId + код + server selection)
- [ ] Створити `vercel.json`
- [ ] Додати `ssh2-sftp-client` у `package.json`

### Етап 3 — Frontend UI
- [ ] Замінити блок "Connect to World" на селектор Server 1/2 + Computer ID (як у CCTweak)
- [ ] Додати кнопку Upload (виклик `/api/upload`)
- [ ] Додати перемикач мови UA/EN

### Етап 4 — Спрощення toolbox
- [ ] Переписати `src/toolbox.js` — 8 категорій
- [ ] Приховати зайві блоки (fs, disk, peripheral тощо)
- [ ] Перевірити що всі блоки генерують правильний Lua

### Етап 5 — i18n
- [ ] Створити `src/i18n/uk.js` + `en.js`
- [ ] Підключити `blockly/msg/uk.js`
- [ ] Перемикач мови + localStorage

### Етап 6 — Deploy
- [ ] GitHub repo (`asemelinsky/CCTweak_BlocklyEditor`?)
- [ ] Vercel project `cctweak-blockly`
- [ ] Env vars: `SFTP_HOST`, `SFTP_USER_1`, `SFTP_USER_2`, `SFTP_PASS`
- [ ] Перевірка E2E: блоки → Lua → SFTP → запуск на сервері

### Етап 7 — Тестування з учнями
- [ ] Простий приклад: черепашка копає 10 блоків уперед
- [ ] Зібрати фідбек і допиляти toolbox

---

## Відкриті питання

1. **Назва GitHub repo:** `CCTweak_BlocklyEditor` чи інакше?
2. **Vercel проєкт:** окремий `cctweak-blockly` — підтверджено.
3. **Ліцензія:** оригінал GPL-3.0, наш форк також GPL-3.0 (обовʼязково за умовами ліцензії).
4. **Домен:** субдомен на `skillbridge.pp.ua` чи окремий Vercel URL?

---

## Референси

- Оригінал: https://github.com/Sarxzer/cc-blockly-editor
- Аналог-проєкт: `/root/projects/CCTweak_LuaPageCoding/`
- VPS: memory `project_vps_server.md`
- Minecraft сервери: memory `project_minecraft_server2.md`
