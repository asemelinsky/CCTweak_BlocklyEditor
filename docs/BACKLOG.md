# CCTweak BlocklyEditor — backlog

Живий беклог задач для візуального редактора блоків. Порядок = приблизна пріоритетність. Кожен пункт — короткий опис + TBD-питання перед стартом.

**Statuses:** `📋 backlog` `🚧 в роботі` `✅ done` `⏸ pause`

**Пріоритети:** `🔴 P1` (робити першою чергою) · `🟡 P2` (важливо, але не терміново) · `🟢 P3` (nice-to-have, cosmetic)

---

## 1. Прибрати ліву панель «дорослий Lua код» 📋 🔴 P1

**Що зараз:** ліворуч від workspace показується панель з raw Lua-кодом що генерується з блоків.

**Мета:** дітям це зайве — вони працюють з блоками, а не з текстом Lua. Панель тільки займає екран і плутає.

**Що зробити:**
- Прибрати панель code-preview з UI
- Опційно — сховати за toggle («Показати Lua-код») для просунутих учнів / debug

**TBD:**
- Q1. Прибрати повністю чи лишити toggle-кнопку у header (для тих хто хоче побачити результат)?

---

## 2. Вкладки для декількох файлів одночасно ✅ (2026-08-15)

**Що зараз:** один workspace — один файл. Щоб редагувати інший — треба save + перезавантажити.

**Мета:** аналогічно `CCTweak_LuaPageCoding` (Ace Editor) — вкладки з відкритими файлами, швидке перемикання між ними.

**Що зробити:**
- Tab bar угорі workspace
- Кожна вкладка = окремий Blockly workspace state (серіалізується у localStorage або як частина сесії)
- Кнопка «+ New tab» + close per tab
- Опційно — індикатор «unsaved» на вкладці

**TBD:**
- Q1. Persistence — localStorage (клієнт) чи VPS (server-side save)?
- Q2. Naming вкладок — за file name (якщо загружений з сервера) чи free-form?
- Q3. Обмеження на кількість вкладок?
- Q4. Ліміт зберігання у localStorage (blockly xml може бути тяжким)?

**Референс:** `/root/projects/CCTweak_LuaPageCoding/` — там уже готовий tabs-механізм (Ace + savе на VPS)

---

## 3. «Рюкзак» — cross-tab clipboard блоків (як у Scratch) ✅ (2026-08-15)

**Що зараз:** copy-paste блоків працює тільки у межах поточного workspace.

**Мета:** візуальна зона (як у Scratch backpack) де user перетягує групу блоків → вона зберігається як мініатюра з силуетом → доступна з будь-якої вкладки → drag назад у workspace вставляє блоки.

**Приклад workflow:**
1. Ти на вкладці A маєш готовий скрипт «Копати 10 блоків уперед»
2. Тягнеш ці блоки у рюкзак (piktograma внизу/збоку екрану)
3. Рюкзак показує зменшену мініатюру (силуети блоків), можна підписати «Копати 10»
4. Переходиш на вкладку B — рюкзак все ще видно (persistent across tabs)
5. Тягнеш мініатюру з рюкзака у workspace вкладки B → блоки з'являються

**Що зробити:**
- UI: dock/панель рюкзака (fixed position, напр. знизу праворуч)
- Store: масив збережених «packages», кожен = серіалізований Blockly XML + generated thumbnail SVG + user label
- Drag-in: DnD listener на рюкзак — при drop блоків згенерувати thumbnail і додати до store
- Drag-out: DnD зі store у workspace — deserialize XML + insert at cursor position
- Persistence — localStorage (доступ між вкладками автоматично)

**TBD:**
- Q1. Розмір мініатюри (силуету) — скільки блоків показувати? Full скріншот чи compact icon?
- Q2. Максимальна кількість item'ів у рюкзаку?
- Q3. Rename/delete item — контекстне меню чи inline edit?
- Q4. Sync рюкзака між пристроями (server-side) — робимо чи локально?
- Q5. Категорії/теги для орг'янізації рюкзака (якщо буде багато item'ів)?
- Q6. Thumbnail generation — HTML canvas render Blockly SVG? (Blockly natively не має API — може треба через html2canvas або svg export)

**Складність:** середня-висока. DnD патерни + thumbnail generation — не тривіальне.

**Референс:** MIT Scratch backpack — https://scratch.mit.edu/discuss/topic/24447/ (feature опис)

---

## 4. Кнопка «Новий файл» ✅ (2026-08-15)

**Що зараз:** щоб почати новий проект — треба відкрити існуючий файл → перейменувати → зберегти (він же одразу завантажиться у turtle на сервері → перезапише). Кривий workflow, ризик випадково перезаписати existing файл на сервері.

**Мета:** одна кнопка «Новий файл» → чистий workspace без прив'язки до існуючого файлу на сервері.

**Що зробити:**
- Кнопка «+ Новий файл» у панелі кнопок (біля Open/Save)
- Клік → confirm (якщо workspace не порожній і unsaved) → clear workspace + reset filename до default (`untitled` чи empty)
- Файл на сервері НЕ створюється до першого save (тільки локально у workspace)
- Interaction з вкладками (пункт #2) — «Новий файл» відкриває нову вкладку

**TBD:**
- Q1. Default filename — `untitled.lua`, `new_program`, empty?
- Q2. Одразу створити локальний draft у localStorage чи лишити у пам'яті до save?

---

## 5. Redesign UI лівої панелі (після прибирання Lua-code) ✅ (2026-08-15)

**Що зараз:** ліва панель містить:
- Селектор мови (UA/EN)
- Назва файлу (input)
- Кнопки: Копіювати · Завантажити (файл) · Завантажити Lua · Відкрити
- Server ID (dropdown 1/2/3)
- Computer ID (input)
- «Надіслати на Minecraft»
- «Файли на сервері» — список
- «Оновити список»
- Вікно з raw Lua code (буде прибране за #1)

**Мета:** після прибирання Lua-preview — простіший, компактніший layout. Плюс — врахувати зону «рюкзака» (пункт #3) що може згортатися/розгортатися.

**Що зробити:**
- Проаналізувати які кнопки лишаються потрібними після прибирання Lua-code (напр. «Копіювати Lua» ймовірно вже не треба — bo нема куди копіювати з)
- Згрупувати controls за смисловими блоками:
  - **File** (Name, New, Open, Save, Download)
  - **Deploy** (Server, Computer, Send to Minecraft)
  - **Files on server** (List, Refresh)
  - **Backpack** (згортається/розгортається, окрема секція)
  - **Language toggle** (можливо у header замість лівої панелі)
- Запропонувати ASCII/wireframe mockup — узгодити з тобою перед implementation

**TBD:**
- Q1. **Кнопка «Копіювати Lua»** — прибираємо (bo немає preview) чи лишаємо (копіює generated Lua у буфер обміну без preview)?
- Q2. **«Завантажити Lua»** (як окремий файл на диск user'а) — потрібно чи ні?
- Q3. Language toggle — залишити у лівій панелі чи винести у header (щоб звільнити місце)?
- Q4. Backpack розташування — bottom (як у Scratch) чи ліва панель (згорнута секція)?
- Q5. Server + Computer як завжди видимі чи згорнути у «Deploy» dropdown?
- Q6. Показувати ASCII wireframe до implementation? (пропоную так — щоб узгодити структуру перед кодом)

**Складність:** середня. Тонкощі — UX-decisions (не тільки code).

**Референс:** `/root/projects/CCTweak_LuaPageCoding/` — там компактний layout з вкладками для наслідування.

---

## 6. Розділити «Рух» на «Рухатись» + «Повернути» 📋 🔴 P1

**Що зараз:** блок `turtle_move` містить 6 options у одному dropdown: `forward/up/down/back/turnLeft/turnRight`. Але «рухатись ліворуч» насправді значить «повернути ліворуч» — misлеади.

**Мета:** розділити візуально на 2 різні блоки:
- **Рухатись** — `forward` / `up` / `down` / `back` (4 напрямки поступального руху)
- **Повернути** — `left` / `right` (2 напрямки повороту)

**⚠️ КРИТИЧНА вимога — backward compatibility:**
Існуючі програми на серверах серіалізовані з `turtle_move` DIR=`turnLeft`/`turnRight`. При load/execute старої програми — вона МУСИТЬ продовжити працювати без помилок і давати той самий Lua. Не ламати legacy!

**Стратегія (щоб зберегти сумісність):**
- **НЕ видаляти** старий `turtle_move` блок з definitions. Лишити з усіма 6 options — legacy.
- **Створити новий блок** `turtle_turn` з 2 options (left, right) — генерує `turtle.turnLeft()` / `turtle.turnRight()`.
- **Модифікувати** `turtle_move` у toolbox — прибрати `turnLeft`/`turnRight` з dropdown (залишити 4). Але сам блок definition має ті самі 6 options щоб load'ити старі workspaces.
- **У toolbox** (нові workspaces): показувати `turtle_move` (4 dirs) + `turtle_turn` (2 dirs) окремо.
- Legacy програми з `turtle_move` DIR=`turnLeft` — при deserialize спрацюють ok (option все ще у definition).

**Що зробити:**
1. У `src/blocks/computcraft.js` — додати новий блок `turtle_turn` з 2 dropdown options.
2. У `src/generators/lua.js` — додати generator для `turtle_turn` → `turtle.turnLeft()` / `turtle.turnRight()`.
3. У `src/i18n/{uk,en}.js` — додати i18n keys `TURTLE_TURN`, `TURTLE_TURN_LEFT`, `TURTLE_TURN_RIGHT`.
4. У `src/toolbox.js` — розділити старий один блок на 2 у категорії «Рух».
5. У `src/index.js` (мутація JSON перед compile) — додати `patch("turtle_turn", D.TURTLE_TURN, turnDirs)`.
6. Модифікувати `moveDirs` у `index.js` — прибрати `turnLeft`/`turnRight` (залишити 4 forward/up/down/back). Але у самому blockJsonArray старі options лишаються для legacy.

**TBD:**
- Q1. Іконки — розрізняти візуально (стрілки vs крутка)?
- Q2. Показувати у категорії «Рух» обидва блоки поруч, чи створити нову «Повороти»?

---

## Готове / закрито ✅

### 2026-08-15

- **#3 Backpack (Scratch clipboard)** — commit `da177cb`. Використано `@blockly/workspace-backpack@5.3.9` (Blockly 10 compat). Native drag workspace↔backpack, auto thumbnails, context menu, cross-tab автоматично (attached до `ws` який один на всі tabs).
- **#2 Вкладки для декількох файлів** — commit `147beab`. Tab bar над Blockly workspace, адаптовано з `CCTweak_LuaPageCoding` (Ace) під Blockly (state = `save(ws)` JSON string). localStorage keys: `cctweak_blockly_tabs`, `cctweak_blockly_active_tab`. Клік → switch, `+`/Ctrl+T → addTab, `×` → close (не остання), double-click → inline rename, drag&drop reorder. `newButton` (#4) тепер = addTab.
- **#4 Кнопка «Новий файл»** — commit `5b3dd6c`. Додано `newButton` у File-панелі + handler з confirm (якщо workspace непорожній) → `ws.clear()` + reset filename + reset `currentServerFile=null`. i18n `newFile`+`confirmNew` (uk/en).
- **#5 Redesign UI лівої панелі** — commit `5b3dd6c`. Новий layout: header (title + lang toggle) → mainRow (left panel 320px + Blockly workspace) → footer backpack dock (згортається). Ліва панель розбита на 3 секції: 📁 File / 🎯 Deploy / 📚 Files on server. Прибрано «Завантажити Lua» + dead `downloadLuaButton` reference. Compact styling (gap, padding, unified button styling).
- **#1 Прибрати ліву панель «дорослий Lua код»** — commit `3c79758`. Прибрано повністю (не toggle). Прибрані з `src/index.html`, `src/index.css`, `src/index.js`: `<pre id="generatedCode">`, `#generatedCode` CSS, Prism imports, `codeDiv`, `htmlDecode`, `runCode()`. `luaGenerator.workspaceToCode(ws)` викликається on-demand у upload/copy/download (без preview). Build OK. Rollback via `git revert <commit>`.

_(поки нічого)_

---

## Формат роботи з беклогом

- Коли беремо пункт у роботу — статус змінюємо на `🚧 в роботі`
- Коли закінчено — переносимо у секцію «Готове» з датою + git commit hash
- Нові ідеї — додаємо як нові пункти, підтверджую розуміння перед додаванням
