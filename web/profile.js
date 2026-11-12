(() => {
  'use strict';

  const copy = {
    ru: {
      profile: 'Житель Hazelwood', map: 'Открыть интерактивную карту', back: 'Игроки', adminRole: 'Администратор Hazelwood', residentRole: 'Житель Hazelwood', joined: 'В Hazelwood с', lastVisit: 'Последний визит', notFound: 'Игрока с таким ником не найдено.',
      loading: 'Загружаем статистику…', retry: 'Попробовать снова', requestError: 'Не удалось загрузить данные игрока.', unavailable: 'Нет данных', noNames: 'Нет игроков',
      overview: 'Статистика', timePlayed: 'Время в игре', achievements: 'Достижения', deaths: 'Смерти', mobKills: 'Убито существ', blocks: 'Добыто блоков', distance: 'Пройдено',
      dimensions: 'Время по мирам', overworld: 'Обычный мир', nether: 'Незер', end: 'Энд',
      skin: 'Скин игрока', skinUnavailable: 'Скин пока недоступен.', skinHelp: 'Загрузи PNG-скин размером 64×64 или 64×32, до 256 КБ.', skinFile: 'Файл PNG', skinModel: 'Модель рук', classic: 'Классическая', slim: 'Узкие руки', changeSkin: 'Отправить скин', changeByName: 'Или взять скин по нику', skinName: 'Ник игрока', send: 'Отправить запрос', skinPending: 'Запрос отправлен. Ждём подтверждения сервера…', skinDone: 'Скин обновлён на сервере.', skinFailed: 'Сервер не смог обновить скин: {error}', skinAccepted: 'Сервер принял запрос на смену скина.', skinInvalid: 'Нужен PNG-файл 64×64 или 64×32 размером не более 256 КБ.', skinTimeout: 'Сервер ещё обрабатывает запрос. Обнови страницу чуть позже.',
      musicDisc: 'Пластинка', musicDiscHelp: 'OGG или MP3 до 8 МБ. MP3 — до 5 минут. Для прослушивания нужен Simple Voice Chat в клиенте.', musicDiscFile: 'Аудиофайл (.ogg, .mp3)', musicDiscTitle: 'Название пластинки', musicDiscSubmit: 'Выдать себе', musicDiscInvalid: 'Выбери файл .ogg или .mp3 до 8 МБ. MP3 — до 5 минут. Укажи название до 48 символов.', musicDiscPending: 'Запрос отправлен. Сервер готовит пластинку…', musicDiscQueued: 'Пластинка будет выдана при следующем входе на сервер.', musicDiscDone: 'Пластинка выдана тебе.', musicDiscFailed: 'Не удалось выдать пластинку: {error}',
      compare: 'Достижение у игроков', comparisonNote: 'Сравнение показано для игроков, у которых сохранена статистика достижений.', earned: 'Получили', missing: 'Ещё не получили', noPlayers: 'Список игроков недоступен.',
      achievementRate: 'Получили: {percent}', achievementRateUnavailable: 'Нет статистики', rareAchievement: 'Редкое достижение',
      all: 'Все', earnedFilter: 'Получены', missingFilter: 'Не получены', searchAchievements: 'Найти достижение', noAchievements: 'Достижений пока нет.', noMatches: 'Ничего не найдено.', showMore: 'Показать ещё',
      achieved: 'Получено', notAchieved: 'Не получено', unknownStatus: 'Нет данных о статусе', earnedAt: 'Получено: {date}',
      history: 'История', noHistory: 'Записей пока нет.', event: 'Событие', gameplaySession: 'Игровая сессия', eventSessionStarted: 'Начало игровой сессии', eventSessionEnded: 'Конец игровой сессии', eventPlaytime: 'Время в мире', eventAdvancement: 'Достижение', eventDimension: 'Смена мира', dateUnknown: 'Дата неизвестна', duration: 'Длительность', dimension: 'Мир', since: 'Учёт с {date}',
      online: 'В игре', offline: 'Не в игре', playersTitle: 'Игроки Hazelwood', playersEyebrow: 'ЖИТЕЛИ HAZELWOOD', searchPlayers: 'Поиск по нику', allPlayers: 'Все игроки', onlinePlayers: 'В игре', noPlayersFound: 'Игроки не найдены.', playerCount: '{count} игроков', playtime: 'Время в игре',
      guideTitle: 'Инструкция', guideTablist: 'Разделы инструкции', guideTabConnect: 'Подключение', guideTabCommands: 'Полезные команды', downloadTitle: '1. Скачать Prism Launcher', downloadsPending: 'Файлы для скачивания появятся здесь позже.', linux: 'Linux', macos: 'macOS', windows: 'Windows', installationTitle: '2. Импорт конфигурации', installationStep: 'Файл конфигурации для импорта в Prism Launcher появится здесь позже.', connectTitle: '3. Как подключиться', connectStep: 'Если Hazelwood нет в списке многопользовательской игры, выбери «Добавить сервер».', copy: 'Копировать адрес', copied: 'Адрес скопирован.', serverNameNote: 'Название сервера — любое. Введи адрес выше, сохрани и подключись.',
      guideClientKeys: 'Основные клавиши Minecraft', guideServerCommands: 'Команды сервера', guideClientAddons: 'Дополнения клиента', guideClientPackPending: 'Клиентская сборка пока не опубликована. Сочетания клавиш модов появятся здесь вместе с ней.', guideControlsNote: 'Стандартные клавиши можно изменить в меню «Настройки → Управление».', guideSearchCommands: 'Поиск по команде или назначению', guideNoCommandMatches: 'Команды не найдены.', guideExample: 'Например', guideGroupChat: 'Общение', guideGroupAccount: 'Вход и аккаунт', guideGroupTeleport: 'Телепортация', guideGroupTrade: 'Обмен с жителем', guideGroupSkin: 'Скины', guideGroupVoice: 'Голосовой чат', guideGroupEmotes: 'Эмоции', guideGroupHoliday: 'Новый год', guidePresentCreateTitle: 'Создать подарок', guidePresentCreateDescription: 'Подготовь подарок игроку с 1 декабря. Открыть его можно с 1 января.', guideAxcalendarTitle: 'Календарь событий', guideAxcalendarDescription: 'Открой календарь и забери доступные награды.', guideGroupClientKeys: 'Клавиши клиента', guidePrivateMessage: 'Личное сообщение', guidePrivateMessageDescription: 'Отправить сообщение одному игроку. Команды взаимозаменяемы.', guideMoveTitle: 'Перемещение', guideMoveDescription: 'Двигаться вперёд, влево, назад и вправо.', guideJumpTitle: 'Прыжок', guideJumpDescription: 'Прыгнуть.', guideSneakTitle: 'Красться', guideSneakDescription: 'Идти крадучись.', guideSprintTitle: 'Бег', guideSprintDescription: 'Бежать.', guideInventoryTitle: 'Инвентарь', guideInventoryDescription: 'Открыть инвентарь.', guideChatTitle: 'Чат', guideChatDescription: 'Открыть чат.', guideCommandLineTitle: 'Ввод команды', guideCommandLineDescription: 'Открыть строку команд.', guidePlayerListTitle: 'Список игроков', guidePlayerListDescription: 'Показать список игроков на сервере.', guideAdvancementsTitle: 'Достижения', guideAdvancementsDescription: 'Открыть экран достижений.', guideOffhandTitle: 'Предмет в другой руке', guideOffhandDescription: 'Поменять предметы в руках местами.', guideDropTitle: 'Выбросить предмет', guideDropDescription: 'Выбросить предмет из руки.', guideMouseTitle: 'Мышь', guideMouseDescription: 'Левая кнопка ломает и атакует; правая использует предмет и ставит блок.', guideHotbarTitle: 'Слот быстрого доступа', guideHotbarDescription: 'Выбрать слот панели быстрого доступа.', guideScreenshotTitle: 'Снимок экрана', guideScreenshotDescription: 'Сделать снимок экрана.', guidePerspectiveTitle: 'Перспектива', guidePerspectiveDescription: 'Переключить вид от первого и третьего лица.', guideFullscreenTitle: 'Полный экран', guideFullscreenDescription: 'Включить или выключить полноэкранный режим.', guideTpaTitle: 'Запросить телепортацию', guideTpaDescription: 'Запросить телепортацию к игроку. Запрос действует 60 секунд; задержка перед переносом — 3 секунды. Движение отменяет перенос.', guideTpaAcceptTitle: 'Принять запрос', guideTpaAcceptDescription: 'Принять входящий запрос на телепортацию.', guideTpaDenyTitle: 'Отклонить запрос', guideTpaDenyDescription: 'Отклонить входящий запрос на телепортацию.', guideLoginTitle: 'Войти на сервер', guideLoginDescription: 'Введи пароль от аккаунта Hazelwood. Пароль не отправляется в чат портала.', guideRegisterTitle: 'Создать аккаунт', guideRegisterDescription: 'Создай аккаунт на сайте Hazelwood перед подключением.', guideSkinSetTitle: 'Установить скин по нику', guideSkinSetDescription: 'Загрузить скин игрока по его Minecraft нику.', guideSkinClearTitle: 'Сбросить скин', guideSkinClearDescription: 'Удалить свой текущий скин с сервера.', guideSkinsTitle: 'Открыть список скинов', guideSkinsDescription: 'Посмотреть доступные категории скинов.', guideTradeCycleTitle: 'Следующий обмен', guideTradeCycleDescription: 'В интерфейсе торговли с жителем наведи курсор на слот сделки и нажми клавишу смены предмета в другой руке. Плагин установлен на сервере; работу на текущей версии Minecraft ещё нужно проверить.', guideVoicePackPending: 'Голосовой чат работает на стороне сервера. Для голосовых клавиш понадобится соответствующий мод в будущей клиентской сборке.', guideEmotesPackPending: 'Эмоции доступны через Emotecraft на сервере; для клавиш нужен мод в будущей клиентской сборке.',
      viewerFront: 'Спереди', viewerBack: 'Сзади', skinLoading: 'Загружаем скин…', mapTitle: 'Hazelwood · интерактивная карта', close: 'Закрыть карту', mapFrame: 'Интерактивная карта мира Hazelwood', unknownEvent: 'Событие',
    },
    uk: {
      profile: 'Мешканець Hazelwood', map: 'Відкрити інтерактивну мапу', back: 'Гравці', adminRole: 'Адміністратор Hazelwood', residentRole: 'Мешканець Hazelwood', joined: 'У Hazelwood з', lastVisit: 'Останній візит', notFound: 'Гравця з таким ніком не знайдено.',
      loading: 'Завантажуємо статистику…', retry: 'Спробувати ще раз', requestError: 'Не вдалося завантажити дані гравця.', unavailable: 'Немає даних', noNames: 'Немає гравців',
      overview: 'Статистика', timePlayed: 'Час у грі', achievements: 'Досягнення', deaths: 'Смерті', mobKills: 'Переможені істоти', blocks: 'Здобуто блоків', distance: 'Пройдено',
      dimensions: 'Час у світах', overworld: 'Звичайний світ', nether: 'Незер', end: 'Енд',
      skin: 'Скін гравця', skinUnavailable: 'Скін поки недоступний.', skinHelp: 'Завантаж PNG-скін розміром 64×64 або 64×32, до 256 КБ.', skinFile: 'Файл PNG', skinModel: 'Модель рук', classic: 'Класична', slim: 'Вузькі руки', changeSkin: 'Надіслати скін', changeByName: 'Або взяти скін за ніком', skinName: 'Нік гравця', send: 'Надіслати запит', skinPending: 'Запит надіслано. Очікуємо підтвердження сервера…', skinDone: 'Скін оновлено на сервері.', skinFailed: 'Сервер не зміг оновити скін: {error}', skinAccepted: 'Сервер прийняв запит на зміну скіна.', skinInvalid: 'Потрібен PNG-файл 64×64 або 64×32 розміром не більше 256 КБ.', skinTimeout: 'Сервер ще обробляє запит. Онови сторінку трохи згодом.',
      musicDisc: 'Платівка', musicDiscHelp: 'OGG або MP3 до 8 МБ. MP3 — до 5 хвилин. Для прослуховування потрібен Simple Voice Chat у клієнті.', musicDiscFile: 'Аудіофайл (.ogg, .mp3)', musicDiscTitle: 'Назва платівки', musicDiscSubmit: 'Видати собі', musicDiscInvalid: 'Обери файл .ogg або .mp3 до 8 МБ. MP3 — до 5 хвилин. Вкажи назву до 48 символів.', musicDiscPending: 'Запит надіслано. Сервер готує платівку…', musicDiscQueued: 'Платівку буде видано під час наступного входу на сервер.', musicDiscDone: 'Платівку видано тобі.', musicDiscFailed: 'Не вдалося видати платівку: {error}',
      compare: 'Досягнення гравців', comparisonNote: 'Порівняння доступне для гравців, у яких збережена статистика досягнень.', earned: 'Отримали', missing: 'Ще не отримали', noPlayers: 'Список гравців недоступний.',
      achievementRate: 'Отримали: {percent}', achievementRateUnavailable: 'Немає статистики', rareAchievement: 'Рідкісне досягнення',
      all: 'Усі', earnedFilter: 'Отримані', missingFilter: 'Не отримані', searchAchievements: 'Знайти досягнення', noAchievements: 'Досягнень поки немає.', noMatches: 'Нічого не знайдено.', showMore: 'Показати ще',
      achieved: 'Отримано', notAchieved: 'Не отримано', unknownStatus: 'Немає даних про статус', earnedAt: 'Отримано: {date}',
      history: 'Історія', noHistory: 'Записів поки немає.', event: 'Подія', gameplaySession: 'Ігрова сесія', eventSessionStarted: 'Початок ігрової сесії', eventSessionEnded: 'Кінець ігрової сесії', eventPlaytime: 'Час у світі', eventAdvancement: 'Досягнення', eventDimension: 'Зміна світу', dateUnknown: 'Дата невідома', duration: 'Тривалість', dimension: 'Світ', since: 'Облік з {date}',
      online: 'У грі', offline: 'Не у грі', playersTitle: 'Гравці Hazelwood', playersEyebrow: 'МЕШКАНЦІ HAZELWOOD', searchPlayers: 'Пошук за ніком', allPlayers: 'Усі гравці', onlinePlayers: 'У грі', noPlayersFound: 'Гравців не знайдено.', playerCount: 'Гравців: {count}', playtime: 'Час у грі',
      guideTitle: 'Інструкція', guideTablist: 'Розділи інструкції', guideTabConnect: 'Підключення', guideTabCommands: 'Корисні команди', downloadTitle: '1. Завантажити Prism Launcher', downloadsPending: 'Файли для завантаження з’являться тут пізніше.', linux: 'Linux', macos: 'macOS', windows: 'Windows', installationTitle: '2. Імпорт конфігурації', installationStep: 'Файл конфігурації для імпорту в Prism Launcher з’явиться тут пізніше.', connectTitle: '3. Як підключитися', connectStep: 'Якщо Hazelwood немає у списку мережевої гри, вибери «Додати сервер».', copy: 'Копіювати адресу', copied: 'Адресу скопійовано.', serverNameNote: 'Назву сервера можна вказати будь-яку. Введи адресу вище, збережи й підключися.',
      guideClientKeys: 'Основні клавіші Minecraft', guideServerCommands: 'Команди сервера', guideClientAddons: 'Додатки клієнта', guideClientPackPending: 'Клієнтську збірку ще не опубліковано. Поєднання клавіш модів з’являться тут разом із нею.', guideControlsNote: 'Стандартні клавіші можна змінити в меню «Налаштування → Керування».', guideSearchCommands: 'Пошук за командою або призначенням', guideNoCommandMatches: 'Команд не знайдено.', guideExample: 'Наприклад', guideGroupChat: 'Спілкування', guideGroupAccount: 'Вхід і обліковий запис', guideGroupTeleport: 'Телепортація', guideGroupTrade: 'Торгівля з жителем', guideGroupSkin: 'Скіни', guideGroupVoice: 'Голосовий чат', guideGroupEmotes: 'Емоції', guideGroupHoliday: 'Новий рік', guidePresentCreateTitle: 'Створити подарунок', guidePresentCreateDescription: 'Підготуй подарунок гравцеві з 1 грудня. Відкрити його можна з 1 січня.', guideAxcalendarTitle: 'Календар подій', guideAxcalendarDescription: 'Відкрий календар і забери доступні нагороди.', guideGroupClientKeys: 'Клавіші клієнта', guidePrivateMessage: 'Особисте повідомлення', guidePrivateMessageDescription: 'Надіслати повідомлення одному гравцю. Команди взаємозамінні.', guideMoveTitle: 'Переміщення', guideMoveDescription: 'Рухатися вперед, ліворуч, назад і праворуч.', guideJumpTitle: 'Стрибок', guideJumpDescription: 'Стрибнути.', guideSneakTitle: 'Крастися', guideSneakDescription: 'Йти навшпиньки.', guideSprintTitle: 'Біг', guideSprintDescription: 'Бігти.', guideInventoryTitle: 'Інвентар', guideInventoryDescription: 'Відкрити інвентар.', guideChatTitle: 'Чат', guideChatDescription: 'Відкрити чат.', guideCommandLineTitle: 'Введення команди', guideCommandLineDescription: 'Відкрити рядок команд.', guidePlayerListTitle: 'Список гравців', guidePlayerListDescription: 'Показати список гравців на сервері.', guideAdvancementsTitle: 'Досягнення', guideAdvancementsDescription: 'Відкрити екран досягнень.', guideOffhandTitle: 'Предмет в іншій руці', guideOffhandDescription: 'Поміняти предмети в руках місцями.', guideDropTitle: 'Викинути предмет', guideDropDescription: 'Викинути предмет з руки.', guideMouseTitle: 'Миша', guideMouseDescription: 'Ліва кнопка ламає блоки й атакує; права використовує предмет і ставить блок.', guideHotbarTitle: 'Комірка швидкого доступу', guideHotbarDescription: 'Вибрати комірку панелі швидкого доступу.', guideScreenshotTitle: 'Знімок екрана', guideScreenshotDescription: 'Зробити знімок екрана.', guidePerspectiveTitle: 'Перспектива', guidePerspectiveDescription: 'Перемкнути вигляд від першої та третьої особи.', guideFullscreenTitle: 'Повний екран', guideFullscreenDescription: 'Увімкнути або вимкнути повноекранний режим.', guideTpaTitle: 'Запросити телепортацію', guideTpaDescription: 'Запросити телепортацію до гравця. Запит діє 60 секунд; затримка перед переносом — 3 секунди. Рух скасовує перенесення.', guideTpaAcceptTitle: 'Прийняти запит', guideTpaAcceptDescription: 'Прийняти вхідний запит на телепортацію.', guideTpaDenyTitle: 'Відхилити запит', guideTpaDenyDescription: 'Відхилити вхідний запит на телепортацію.', guideLoginTitle: 'Увійти на сервер', guideLoginDescription: 'Введи пароль облікового запису Hazelwood. Пароль не надсилається в чат порталу.', guideRegisterTitle: 'Створити обліковий запис', guideRegisterDescription: 'Створи обліковий запис на сайті Hazelwood перед підключенням.', guideSkinSetTitle: 'Встановити скін за ніком', guideSkinSetDescription: 'Завантажити скін гравця за його Minecraft-ніком.', guideSkinClearTitle: 'Скинути скін', guideSkinClearDescription: 'Видалити свій поточний скін із сервера.', guideSkinsTitle: 'Відкрити список скінів', guideSkinsDescription: 'Переглянути доступні категорії скінів.', guideTradeCycleTitle: 'Наступний обмін', guideTradeCycleDescription: 'У вікні торгівлі з жителем наведи курсор на слот угоди й натисни клавішу зміни предмета в іншій руці. Плагін встановлений на сервері; роботу на поточній версії Minecraft ще потрібно перевірити.', guideVoicePackPending: 'Голосовий чат працює на сервері. Для голосових клавіш знадобиться відповідний мод у майбутній клієнтській збірці.', guideEmotesPackPending: 'Емоції доступні через Emotecraft на сервері; для клавіш потрібен мод у майбутній клієнтській збірці.',
      viewerFront: 'Спереду', viewerBack: 'Ззаду', skinLoading: 'Завантажуємо скін…', mapTitle: 'Hazelwood · інтерактивна мапа', close: 'Закрити мапу', mapFrame: 'Інтерактивна мапа світу Hazelwood', unknownEvent: 'Подія',
    },
    en: {
      profile: 'Hazelwood resident', map: 'Open interactive map', back: 'Players', adminRole: 'Hazelwood admin', residentRole: 'Hazelwood resident', joined: 'In Hazelwood since', lastVisit: 'Last visit', notFound: 'No player found with that username.',
      loading: 'Loading statistics…', retry: 'Try again', requestError: 'Could not load player data.', unavailable: 'No data', noNames: 'No players',
      overview: 'Statistics', timePlayed: 'Time played', achievements: 'Achievements', deaths: 'Deaths', mobKills: 'Mobs defeated', blocks: 'Blocks mined', distance: 'Distance walked',
      dimensions: 'Time by dimension', overworld: 'Overworld', nether: 'Nether', end: 'End',
      skin: 'Player skin', skinUnavailable: 'Skin is not available yet.', skinHelp: 'Upload a PNG skin sized 64×64 or 64×32, up to 256 KB.', skinFile: 'PNG file', skinModel: 'Arm model', classic: 'Classic', slim: 'Slim arms', changeSkin: 'Submit skin', changeByName: 'Or use a username skin', skinName: 'Player username', send: 'Send request', skinPending: 'Request sent. Waiting for server confirmation…', skinDone: 'Skin updated on the server.', skinFailed: 'The server could not update the skin: {error}', skinAccepted: 'The server accepted the skin change request.', skinInvalid: 'Choose a PNG file sized 64×64 or 64×32 and no larger than 256 KB.', skinTimeout: 'The server is still processing the request. Refresh this page shortly.',
      musicDisc: 'Music disc', musicDiscHelp: 'OGG or MP3 up to 8 MB. MP3: up to 5 minutes. The client needs Simple Voice Chat to hear music.', musicDiscFile: 'Audio file (.ogg, .mp3)', musicDiscTitle: 'Disc title', musicDiscSubmit: 'Give to myself', musicDiscInvalid: 'Choose an .ogg or .mp3 file up to 8 MB. MP3: up to 5 minutes. Enter a title up to 48 characters.', musicDiscPending: 'Request sent. The server is preparing your disc…', musicDiscQueued: 'Your disc will be given when you next join the server.', musicDiscDone: 'Music disc given to you.', musicDiscFailed: 'Could not give music disc: {error}',
      compare: 'Player comparison', comparisonNote: 'Comparison includes players whose achievement data is available.', earned: 'Earned by', missing: 'Not earned by', noPlayers: 'Player list is unavailable.',
      achievementRate: 'Earned: {percent}', achievementRateUnavailable: 'No statistics', rareAchievement: 'Rare achievement',
      all: 'All', earnedFilter: 'Earned', missingFilter: 'Not earned', searchAchievements: 'Search achievements', noAchievements: 'No achievements yet.', noMatches: 'No matches.', showMore: 'Show more',
      achieved: 'Earned', notAchieved: 'Not earned', unknownStatus: 'Status unavailable', earnedAt: 'Earned: {date}',
      history: 'History', noHistory: 'No history yet.', event: 'Event', gameplaySession: 'Gameplay session', eventSessionStarted: 'Session started', eventSessionEnded: 'Session ended', eventPlaytime: 'Time in world', eventAdvancement: 'Achievement', eventDimension: 'Dimension changed', dateUnknown: 'Date unavailable', duration: 'Duration', dimension: 'Dimension', since: 'Tracking since {date}',
      online: 'In game', offline: 'Offline', playersTitle: 'Hazelwood players', playersEyebrow: 'HAZELWOOD RESIDENTS', searchPlayers: 'Search usernames', allPlayers: 'All players', onlinePlayers: 'Online', noPlayersFound: 'No players found.', playerCount: '{count} players', playtime: 'Time played',
      guideTitle: 'Guide', guideTablist: 'Guide sections', guideTabConnect: 'Connect', guideTabCommands: 'Useful commands', downloadTitle: '1. Download Prism Launcher', downloadsPending: 'Download files will be added here later.', linux: 'Linux', macos: 'macOS', windows: 'Windows', installationTitle: '2. Import the configuration', installationStep: 'The configuration file to import in Prism Launcher will be available here later.', connectTitle: '3. Connect', connectStep: 'If Hazelwood is missing from Multiplayer, choose Add Server.', copy: 'Copy address', copied: 'Address copied.', serverNameNote: 'Choose any server name, enter the address above, save, and connect.',
      guideClientKeys: 'Core Minecraft controls', guideServerCommands: 'Server commands', guideClientAddons: 'Client add-ons', guideClientPackPending: 'The client pack is not published yet. Mod key bindings will appear here with it.', guideControlsNote: 'You can change default controls under Options → Controls.', guideSearchCommands: 'Search by command or purpose', guideNoCommandMatches: 'No commands found.', guideExample: 'Example', guideGroupChat: 'Chat', guideGroupAccount: 'Sign-in and account', guideGroupTeleport: 'Teleportation', guideGroupTrade: 'Villager trading', guideGroupSkin: 'Skins', guideGroupVoice: 'Voice chat', guideGroupEmotes: 'Emotes', guideGroupHoliday: 'New Year', guidePresentCreateTitle: 'Create a gift', guidePresentCreateDescription: 'Prepare a player gift from December 1. It can be opened starting January 1.', guideAxcalendarTitle: 'Event calendar', guideAxcalendarDescription: 'Open the calendar and claim available rewards.', guideGroupClientKeys: 'Client keys', guidePrivateMessage: 'Private message', guidePrivateMessageDescription: 'Send a message to one player. These commands are aliases.', guideMoveTitle: 'Move', guideMoveDescription: 'Move forward, left, back, and right.', guideJumpTitle: 'Jump', guideJumpDescription: 'Jump.', guideSneakTitle: 'Sneak', guideSneakDescription: 'Move carefully.', guideSprintTitle: 'Sprint', guideSprintDescription: 'Sprint.', guideInventoryTitle: 'Inventory', guideInventoryDescription: 'Open your inventory.', guideChatTitle: 'Chat', guideChatDescription: 'Open chat.', guideCommandLineTitle: 'Command input', guideCommandLineDescription: 'Open the command line.', guidePlayerListTitle: 'Player list', guidePlayerListDescription: 'Show the server player list.', guideAdvancementsTitle: 'Advancements', guideAdvancementsDescription: 'Open the advancements screen.', guideOffhandTitle: 'Swap offhand item', guideOffhandDescription: 'Swap the items in your hands.', guideDropTitle: 'Drop item', guideDropDescription: 'Drop the item you are holding.', guideMouseTitle: 'Mouse', guideMouseDescription: 'Left click breaks blocks and attacks; right click uses items and places blocks.', guideHotbarTitle: 'Hotbar slot', guideHotbarDescription: 'Select a hotbar slot.', guideScreenshotTitle: 'Screenshot', guideScreenshotDescription: 'Take a screenshot.', guidePerspectiveTitle: 'Perspective', guidePerspectiveDescription: 'Switch between first- and third-person views.', guideFullscreenTitle: 'Fullscreen', guideFullscreenDescription: 'Toggle fullscreen mode.', guideTpaTitle: 'Request teleport', guideTpaDescription: 'Request to teleport to a player. The request lasts 60 seconds; teleport has a 3-second delay. Movement cancels it.', guideTpaAcceptTitle: 'Accept request', guideTpaAcceptDescription: 'Accept an incoming teleport request.', guideTpaDenyTitle: 'Deny request', guideTpaDenyDescription: 'Deny an incoming teleport request.', guideLoginTitle: 'Log in to the server', guideLoginDescription: 'Enter your Hazelwood account password. The password is not sent to the portal chat.', guideRegisterTitle: 'Create an account', guideRegisterDescription: 'Create your Hazelwood account on the website before connecting.', guideSkinSetTitle: 'Set skin by username', guideSkinSetDescription: 'Load a player skin by their Minecraft username.', guideSkinClearTitle: 'Clear skin', guideSkinClearDescription: 'Remove your current skin from the server.', guideSkinsTitle: 'Open skin list', guideSkinsDescription: 'Browse available skin categories.', guideTradeCycleTitle: 'Next trade offer', guideTradeCycleDescription: 'In a villager trading screen, point to the offer slot and press the offhand-swap key. The plugin is installed on the server; its behavior on the current Minecraft version still needs testing.', guideVoicePackPending: 'Voice chat is available on the server. Voice keys require the matching mod in the future client pack.', guideEmotesPackPending: 'Emotes are available through Emotecraft on the server; keys require its mod in the future client pack.',
      viewerFront: 'Front', viewerBack: 'Back', skinLoading: 'Loading skin…', mapTitle: 'Hazelwood · interactive map', close: 'Close map', mapFrame: 'Hazelwood interactive world map', unknownEvent: 'Event',
    },
  };

  const PRISM_DOWNLOADS = Object.freeze({
    linux: 'https://github.com/Diegiwg/PrismLauncher-Cracked/releases/download/11.0.3/PrismLauncher-Linux-x86_64.AppImage',
    macos: 'https://github.com/Diegiwg/PrismLauncher-Cracked/releases/download/11.0.3/PrismLauncher-macOS-11.0.3.dmg',
    windows: 'https://github.com/Diegiwg/PrismLauncher-Cracked/releases/download/11.0.3/PrismLauncher-Windows-MSVC-Setup-11.0.3.exe',
  });
  const SAFE_DOWNLOAD_URLS = new Set(Object.values(PRISM_DOWNLOADS));
  const state = { language: document.documentElement.lang || 'ru', page: '', user: null, target: '', isOwn: false, details: null, players: [], error: false, loading: false, filter: 'earned', query: '', achievementsVisible: 25, directoryFilter: 'all', directoryQuery: '', guideTab: 'connect', guideQuery: '', guideInfo: { address: 'hazelwood.inne.space', downloads: PRISM_DOWNLOADS }, guideLoadPromise: null, guideReady: false, requestId: '', pollTimer: null, skinPending: false, skinStatus: '', skinStatusError: false, skinErrorText: '', skinPollStarted: 0, musicDiscPollTimer: null };

  // Keep this catalog limited to verified defaults and commands. Add plugin/mod entries only when active on the server/client pack.
  const guideCommandCatalog = [
    { type: 'client', group: 'clientKeys', trigger: 'W · A · S · D', title: 'guideMoveTitle', description: 'guideMoveDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'Esc', title: 'guideMenuTitle', description: 'guideMenuDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'Space', title: 'guideJumpTitle', description: 'guideJumpDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'Shift', title: 'guideSneakTitle', description: 'guideSneakDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'Ctrl', title: 'guideSprintTitle', description: 'guideSprintDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'E', title: 'guideInventoryTitle', description: 'guideInventoryDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'T', title: 'guideChatTitle', description: 'guideChatDescription' },
    { type: 'client', group: 'clientKeys', trigger: '/', title: 'guideCommandLineTitle', description: 'guideCommandLineDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'Tab', title: 'guidePlayerListTitle', description: 'guidePlayerListDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'L', title: 'guideAdvancementsTitle', description: 'guideAdvancementsDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'F', title: 'guideOffhandTitle', description: 'guideOffhandDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'Q', title: 'guideDropTitle', description: 'guideDropDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'Ctrl + Q', title: 'guideDropStackTitle', description: 'guideDropStackDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'Shift + ЛКМ', triggerEn: 'Shift + click', title: 'guideQuickMoveTitle', description: 'guideQuickMoveDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'ЛКМ · ПКМ', title: 'guideMouseTitle', description: 'guideMouseDescription', triggerEn: 'Left click · Right click' },
    { type: 'client', group: 'clientKeys', trigger: 'Колесо мыши', triggerUk: 'Колесо миші', triggerEn: 'Mouse wheel', title: 'guideScrollTitle', description: 'guideScrollDescription' },
    { type: 'client', group: 'clientKeys', trigger: '1–9', title: 'guideHotbarTitle', description: 'guideHotbarDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'F2', title: 'guideScreenshotTitle', description: 'guideScreenshotDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'F1', title: 'guideHideHudTitle', description: 'guideHideHudDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'F3', title: 'guideDebugTitle', description: 'guideDebugDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'F5', title: 'guidePerspectiveTitle', description: 'guidePerspectiveDescription' },
    { type: 'client', group: 'clientKeys', trigger: 'F11', title: 'guideFullscreenTitle', description: 'guideFullscreenDescription' },
    { type: 'addon', group: 'voice', trigger: 'V', title: 'guideVoiceMenuTitle', description: 'guideVoiceMenuDescription', condition: 'guideRequiresVoiceMod' },
    { type: 'addon', group: 'voice', trigger: 'M · N · H', title: 'guideVoiceKeysTitle', description: 'guideVoiceKeysDescription', condition: 'guideRequiresVoiceMod' },
    { type: 'addon', group: 'emotes', trigger: 'B', title: 'guideEmoteWheelTitle', description: 'guideEmoteWheelDescription', condition: 'guideRequiresEmoteMod' },
    { type: 'server', group: 'holiday', season: 'holiday', trigger: '/present create <player>', title: 'guidePresentCreateTitle', description: 'guidePresentCreateDescription' },
    { type: 'server', group: 'holiday', season: 'holiday', trigger: '/axcalendar', title: 'guideAxcalendarTitle', description: 'guideAxcalendarDescription' },
    { type: 'server', group: 'chat', trigger: '/msg <player> <message>', aliases: ['/tell <player> <message>', '/w <player> <message>'], title: 'guidePrivateMessage', description: 'guidePrivateMessageDescription', example: '/msg irinella Привет!', exampleEn: '/msg irinella Hi!', exampleUk: '/msg irinella Привіт!', exampleLabel: 'guideExample' },
    { type: 'server', group: 'chat', trigger: '/me <action>', title: 'guideMeTitle', description: 'guideMeDescription' },
    { type: 'server', group: 'chat', trigger: '/teammsg <text>', aliases: ['/tm <text>'], title: 'guideTeamMsgTitle', description: 'guideTeamMsgDescription', condition: 'guideRequiresTeam' },
    { type: 'server', group: 'chat', trigger: '/help [page]', title: 'guideHelpTitle', description: 'guideHelpDescription' },
    { type: 'server', group: 'chat', trigger: '/list', title: 'guideListTitle', description: 'guideListDescription' },
    { type: 'server', group: 'chat', trigger: '/trigger <objective> [add|set] [value]', title: 'guideTriggerTitle', description: 'guideTriggerDescription', condition: 'guideRequiresTrigger' },
    { type: 'server', group: 'account', trigger: '/login <password>', aliases: ['/l <password>'], title: 'guideLoginTitle', description: 'guideLoginDescription' },
    { type: 'server', group: 'account', trigger: '/register', aliases: ['/reg'], title: 'guideRegisterTitle', description: 'guideRegisterDescription' },
    { type: 'server', group: 'teleport', trigger: '/tpa <player>', aliases: ['/teleportask <player>'], title: 'guideTpaTitle', description: 'guideTpaDescription' },
    { type: 'server', group: 'teleport', trigger: '/tpaaccept', aliases: ['/tpaccept', '/tpyes'], title: 'guideTpaAcceptTitle', description: 'guideTpaAcceptDescription' },
    { type: 'server', group: 'teleport', trigger: '/tpadeny', aliases: ['/tpdeny', '/tpno'], title: 'guideTpaDenyTitle', description: 'guideTpaDenyDescription' },
    { type: 'server', group: 'teleport', trigger: '[ACCEPT] в сообщении чата', title: 'guideChatAcceptTitle', description: 'guideTpaAcceptDescription', triggerEn: '[ACCEPT] in chat' },
    { type: 'server', group: 'teleport', trigger: '[DENY] в сообщении чата', title: 'guideChatDenyTitle', description: 'guideTpaDenyDescription', triggerEn: '[DENY] in chat' },
    { type: 'server', group: 'skin', trigger: '/skin <username>', aliases: ['/skin set <username>'], title: 'guideSkinSetTitle', description: 'guideSkinSetDescription' },
    { type: 'server', group: 'skin', trigger: '/skin clear', title: 'guideSkinClearTitle', description: 'guideSkinClearDescription' },
    { type: 'server', group: 'skin', trigger: '/skins', title: 'guideSkinsTitle', description: 'guideSkinsDescription' },
    { type: 'server', group: 'skin', trigger: '/skin help', title: 'guideSkinHelpTitle', description: 'guideSkinHelpDescription' },
    { type: 'server', group: 'skin', trigger: '/skin random', title: 'guideSkinRandomTitle', description: 'guideSkinRandomDescription' },
    { type: 'server', group: 'skin', trigger: '/skin search <text>', title: 'guideSkinSearchTitle', description: 'guideSkinSearchDescription' },
    { type: 'server', group: 'skin', trigger: '/skin update', title: 'guideSkinUpdateTitle', description: 'guideSkinUpdateDescription' },
    { type: 'server', group: 'skin', trigger: '/skin undo', title: 'guideSkinUndoTitle', description: 'guideSkinUndoDescription' },
    { type: 'server', group: 'skin', trigger: '/skin history', title: 'guideSkinHistoryTitle', description: 'guideSkinHistoryDescription' },
    { type: 'server', group: 'skin', trigger: '/skin favourites', title: 'guideSkinFavouritesTitle', description: 'guideSkinFavouritesDescription' },
    { type: 'server', group: 'skin', trigger: '/skin url <URL> [classic|slim]', title: 'guideSkinURLTitle', description: 'guideSkinURLDescription' },
    { type: 'server', group: 'skin', trigger: '/skin upload', title: 'guideSkinUploadTitle', description: 'guideSkinUploadDescription' },
    { type: 'server', group: 'skin', trigger: '/skin edit', title: 'guideSkinEditTitle', description: 'guideSkinEditDescription' },
    { type: 'server', group: 'voice', trigger: '/voicechat help', title: 'guideVoiceHelpTitle', description: 'guideVoiceHelpDescription', condition: 'guideRequiresVoiceMod' },
    { type: 'server', group: 'voice', trigger: '/voicechat invite <player>', title: 'guideVoiceInviteTitle', description: 'guideVoiceInviteDescription', condition: 'guideRequiresVoiceMod' },
    { type: 'server', group: 'voice', trigger: '/voicechat join <group>', title: 'guideVoiceJoinTitle', description: 'guideVoiceJoinDescription', condition: 'guideRequiresVoiceMod' },
    { type: 'server', group: 'voice', trigger: '/voicechat leave', title: 'guideVoiceLeaveTitle', description: 'guideVoiceLeaveDescription', condition: 'guideRequiresVoiceMod' },
    { type: 'addon', group: 'emotes', trigger: '/emotes-client play <emote>', title: 'guideEmotePlayTitle', description: 'guideEmotePlayDescription', condition: 'guideRequiresEmoteMod' },
    { type: 'addon', group: 'emotes', trigger: '/emotes-client stop', title: 'guideEmoteStopTitle', description: 'guideEmoteStopDescription', condition: 'guideRequiresEmoteMod' },
    { type: 'addon', group: 'trade', trigger: 'F', title: 'guideTradeCycleTitle', description: 'guideTradeCycleDescription', condition: 'guideTradeCycleCondition' },
  ];
  const guideCommandCopy = {
    ru: {
      guideMoveTitle: 'Перемещение', guideMoveDescription: 'Двигаться вперёд, влево, назад и вправо.', guideJumpTitle: 'Прыжок', guideJumpDescription: 'Прыгнуть.', guideSneakTitle: 'Красться', guideSneakDescription: 'Идти крадучись.', guideSprintTitle: 'Бег', guideSprintDescription: 'Бежать.', guideInventoryTitle: 'Инвентарь', guideInventoryDescription: 'Открыть инвентарь.', guideChatTitle: 'Чат', guideChatDescription: 'Открыть чат.', guideCommandLineTitle: 'Ввод команды', guideCommandLineDescription: 'Открыть строку команд.', guidePlayerListTitle: 'Список игроков', guidePlayerListDescription: 'Показать список игроков на сервере.', guideAdvancementsTitle: 'Достижения', guideAdvancementsDescription: 'Открыть экран достижений.', guideOffhandTitle: 'Предмет в другой руке', guideOffhandDescription: 'Поменять предметы в руках местами.', guideDropTitle: 'Выбросить предмет', guideDropDescription: 'Выбросить предмет из руки.', guideMouseTitle: 'Мышь', guideMouseDescription: 'Левая кнопка ломает блоки и атакует; правая использует предмет и ставит блок.', guideHotbarTitle: 'Слот быстрого доступа', guideHotbarDescription: 'Выбрать слот панели быстрого доступа.', guideScreenshotTitle: 'Снимок экрана', guideScreenshotDescription: 'Сделать снимок экрана.', guidePerspectiveTitle: 'Перспектива', guidePerspectiveDescription: 'Переключить вид от первого и третьего лица.', guideFullscreenTitle: 'Полный экран', guideFullscreenDescription: 'Включить или выключить полноэкранный режим.', guideVoiceMenuTitle: 'Меню голосового чата', guideVoiceMenuDescription: 'Открыть меню Simple Voice Chat.', guideVoiceKeysTitle: 'Настройки голоса', guideVoiceKeysDescription: 'M — выключить микрофон в режиме активации голосом; N — отключить голосовой чат; H — скрыть индикаторы.', guideEmoteWheelTitle: 'Колесо эмоций', guideEmoteWheelDescription: 'Открыть колесо эмоций Emotecraft.', guideMeTitle: 'Действие от первого лица', guideMeDescription: 'Показать действие от имени своего персонажа.', guideTeamMsgTitle: 'Сообщение команде', guideTeamMsgDescription: 'Отправить сообщение участникам своей команды.', guideHelpTitle: 'Справка по командам', guideHelpDescription: 'Показать доступные команды и разделы справки.', guideListTitle: 'Игроки онлайн', guideListDescription: 'Показать игроков, подключённых к серверу.', guideTriggerTitle: 'Изменить цель scoreboard', guideTriggerDescription: 'Работает только если в мире настроена цель типа trigger.', guideRequiresTeam: 'Доступно только участникам команды.', guideRequiresTrigger: 'Работает, только если в мире создана цель trigger.', guideLoginTitle: 'Войти на сервер', guideLoginDescription: 'Введи пароль от аккаунта Hazelwood. Не сообщай пароль другим игрокам.', guideRegisterTitle: 'Создать аккаунт', guideRegisterDescription: 'Создай аккаунт на сайте Hazelwood перед подключением.', guideTpaTitle: 'Запросить телепортацию', guideTpaDescription: 'Запрос действует 60 секунд; новый запрос можно отправлять раз в 30 секунд. После принятия телепорт начинается через 3 секунды; движение отменяет его. После переноса действует задержка 60 секунд.', guideTpaAcceptTitle: 'Принять запрос', guideTpaAcceptDescription: 'Принять входящий запрос на телепортацию.', guideTpaDenyTitle: 'Отклонить запрос', guideTpaDenyDescription: 'Отклонить входящий запрос на телепортацию.', guideSkinSetTitle: 'Установить скин по нику', guideSkinSetDescription: 'Установить свой скин по нику Minecraft игрока.', guideSkinClearTitle: 'Сбросить скин', guideSkinClearDescription: 'Удалить сохранённый выбор скина.', guideSkinsTitle: 'Список скинов', guideSkinsDescription: 'Открыть доступные категории скинов.', guideSkinRandomTitle: 'Случайный скин', guideSkinRandomDescription: 'Выбрать случайный скин.', guideSkinSearchTitle: 'Найти скин', guideSkinSearchDescription: 'Найти скин по тексту.', guideSkinUpdateTitle: 'Обновить скин', guideSkinUpdateDescription: 'Заново загрузить выбранный скин.', guideSkinUndoTitle: 'Вернуть прошлый скин', guideSkinUndoDescription: 'Отменить последнюю смену скина.', guideSkinHistoryTitle: 'История скинов', guideSkinHistoryDescription: 'Посмотреть историю своих скинов.', guideSkinFavouritesTitle: 'Избранные скины', guideSkinFavouritesDescription: 'Посмотреть сохранённые скины.', guideSkinURLTitle: 'Скин по URL', guideSkinURLDescription: 'Загрузить текстуру по URL; локальный файл не принимается.', guideSkinUploadTitle: 'Загрузить скин', guideSkinUploadDescription: 'Открыть веб-загрузку скина.', guideSkinEditTitle: 'Изменить скин', guideSkinEditDescription: 'Открыть веб-редактор скина.', guideVoiceHelpTitle: 'Справка голосового чата', guideVoiceHelpDescription: 'Требуется клиентский мод Simple Voice Chat.', guideVoiceInviteTitle: 'Пригласить в группу', guideVoiceInviteDescription: 'Отправить приглашение игроку в голосовую группу. Нужен клиентский мод.', guideVoiceJoinTitle: 'Войти в голосовую группу', guideVoiceJoinDescription: 'Имя должно точно соответствовать одной группе; используй приглашение, если группа находится неоднозначно.', guideVoiceLeaveTitle: 'Выйти из голосовой группы', guideVoiceLeaveDescription: 'Покинуть текущую голосовую группу.', guideEmotePlayTitle: 'Проиграть эмоцию', guideEmotePlayDescription: 'Локальная команда Emotecraft, она не отправляется серверу. Нужен клиентский мод.', guideEmoteStopTitle: 'Остановить эмоцию', guideEmoteStopDescription: 'Локальная команда Emotecraft, она не отправляется серверу. Нужен клиентский мод.', guideRequiresVoiceMod: 'Работает только с клиентским модом Simple Voice Chat.', guideRequiresEmoteMod: 'Работает только с клиентским модом Emotecraft.', guideTradeCycleTitle: 'Следующее предложение жителя', guideTradeCycleDescription: 'В окне торговли наведи курсор на область инвентаря и нажми клавишу смены предмета в другой руке.', guideTradeCycleCondition: 'Плагин установлен на сервере; работу на текущей версии Minecraft ещё нужно проверить.',
    },
    uk: {
      guideMoveTitle: 'Переміщення', guideMoveDescription: 'Рухатися вперед, ліворуч, назад і праворуч.', guideJumpTitle: 'Стрибок', guideJumpDescription: 'Стрибнути.', guideSneakTitle: 'Крастися', guideSneakDescription: 'Йти навшпиньки.', guideSprintTitle: 'Біг', guideSprintDescription: 'Бігти.', guideInventoryTitle: 'Інвентар', guideInventoryDescription: 'Відкрити інвентар.', guideChatTitle: 'Чат', guideChatDescription: 'Відкрити чат.', guideCommandLineTitle: 'Введення команди', guideCommandLineDescription: 'Відкрити рядок команд.', guidePlayerListTitle: 'Список гравців', guidePlayerListDescription: 'Показати список гравців на сервері.', guideAdvancementsTitle: 'Досягнення', guideAdvancementsDescription: 'Відкрити екран досягнень.', guideOffhandTitle: 'Предмет в іншій руці', guideOffhandDescription: 'Поміняти предмети в руках місцями.', guideDropTitle: 'Викинути предмет', guideDropDescription: 'Викинути предмет з руки.', guideMouseTitle: 'Миша', guideMouseDescription: 'Ліва кнопка ламає блоки й атакує; права використовує предмет і ставить блок.', guideHotbarTitle: 'Комірка швидкого доступу', guideHotbarDescription: 'Вибрати комірку панелі швидкого доступу.', guideScreenshotTitle: 'Знімок екрана', guideScreenshotDescription: 'Зробити знімок екрана.', guidePerspectiveTitle: 'Перспектива', guidePerspectiveDescription: 'Перемкнути вигляд від першої та третьої особи.', guideFullscreenTitle: 'Повний екран', guideFullscreenDescription: 'Увімкнути або вимкнути повноекранний режим.', guideVoiceMenuTitle: 'Меню голосового чату', guideVoiceMenuDescription: 'Відкрити меню Simple Voice Chat.', guideVoiceKeysTitle: 'Керування голосом', guideVoiceKeysDescription: 'M — вимкнути мікрофон у режимі голосової активації; N — вимкнути голосовий чат; H — сховати індикатори.', guideEmoteWheelTitle: 'Колесо емоцій', guideEmoteWheelDescription: 'Відкрити колесо емоцій Emotecraft.', guideMeTitle: 'Дія від першої особи', guideMeDescription: 'Показати дію від імені свого персонажа.', guideTeamMsgTitle: 'Повідомлення команді', guideTeamMsgDescription: 'Надіслати повідомлення учасникам своєї команди.', guideHelpTitle: 'Довідка команд', guideHelpDescription: 'Показати доступні команди та розділи довідки.', guideListTitle: 'Гравці онлайн', guideListDescription: 'Показати гравців, підключених до сервера.', guideTriggerTitle: 'Змінити ціль scoreboard', guideTriggerDescription: 'Працює лише якщо у світі налаштована ціль типу trigger.', guideRequiresTeam: 'Доступно лише учасникам команди.', guideRequiresTrigger: 'Працює, лише якщо у світі створена ціль trigger.', guideLoginTitle: 'Увійти на сервер', guideLoginDescription: 'Введи пароль облікового запису Hazelwood. Не повідомляй пароль іншим гравцям.', guideRegisterTitle: 'Створити обліковий запис', guideRegisterDescription: 'Створи обліковий запис на сайті Hazelwood перед підключенням.', guideTpaTitle: 'Запросити телепортацію', guideTpaDescription: 'Запит діє 60 секунд; новий запит можна надсилати раз на 30 секунд. Після прийняття телепортація починається через 3 секунди; рух скасує її. Після перенесення діє затримка 60 секунд.', guideTpaAcceptTitle: 'Прийняти запит', guideTpaAcceptDescription: 'Прийняти вхідний запит на телепортацію.', guideTpaDenyTitle: 'Відхилити запит', guideTpaDenyDescription: 'Відхилити вхідний запит на телепортацію.', guideSkinSetTitle: 'Встановити скін за ніком', guideSkinSetDescription: 'Встановити свій скін за Minecraft-ніком гравця.', guideSkinClearTitle: 'Скинути скін', guideSkinClearDescription: 'Видалити збережений вибір скіна.', guideSkinsTitle: 'Список скінів', guideSkinsDescription: 'Відкрити доступні категорії скінів.', guideSkinRandomTitle: 'Випадковий скін', guideSkinRandomDescription: 'Вибрати випадковий скін.', guideSkinSearchTitle: 'Знайти скін', guideSkinSearchDescription: 'Знайти скін за текстом.', guideSkinUpdateTitle: 'Оновити скін', guideSkinUpdateDescription: 'Завантажити вибраний скін знову.', guideSkinUndoTitle: 'Повернути попередній скін', guideSkinUndoDescription: 'Скасувати останню зміну скіна.', guideSkinHistoryTitle: 'Історія скінів', guideSkinHistoryDescription: 'Переглянути історію своїх скінів.', guideSkinFavouritesTitle: 'Улюблені скіни', guideSkinFavouritesDescription: 'Переглянути збережені скіни.', guideSkinURLTitle: 'Скін за URL', guideSkinURLDescription: 'Завантажити текстуру за URL; локальний файл не приймається.', guideSkinUploadTitle: 'Завантажити скін', guideSkinUploadDescription: 'Відкрити вебзавантаження скіна.', guideSkinEditTitle: 'Змінити скін', guideSkinEditDescription: 'Відкрити вебредактор скіна.', guideVoiceHelpTitle: 'Довідка голосового чату', guideVoiceHelpDescription: 'Потрібен клієнтський мод Simple Voice Chat.', guideVoiceInviteTitle: 'Запросити до групи', guideVoiceInviteDescription: 'Надіслати гравцю запрошення до голосової групи. Потрібен клієнтський мод.', guideVoiceJoinTitle: 'Увійти до голосової групи', guideVoiceJoinDescription: 'Назва має точно відповідати одній групі; скористайся запрошенням, якщо групу не вдається однозначно знайти.', guideVoiceLeaveTitle: 'Вийти з голосової групи', guideVoiceLeaveDescription: 'Покинути поточну голосову групу.', guideEmotePlayTitle: 'Відтворити емоцію', guideEmotePlayDescription: 'Локальна команда Emotecraft, вона не надсилається серверу. Потрібен клієнтський мод.', guideEmoteStopTitle: 'Зупинити емоцію', guideEmoteStopDescription: 'Локальна команда Emotecraft, вона не надсилається серверу. Потрібен клієнтський мод.', guideRequiresVoiceMod: 'Працює лише з клієнтським модом Simple Voice Chat.', guideRequiresEmoteMod: 'Працює лише з клієнтським модом Emotecraft.', guideTradeCycleTitle: 'Наступна пропозиція жителя', guideTradeCycleDescription: 'У вікні торгівлі наведи курсор на область інвентаря й натисни клавішу зміни предмета в іншій руці.', guideTradeCycleCondition: 'Плагін встановлено на сервері; роботу на поточній версії Minecraft ще потрібно перевірити.',
    },
    en: {
      guideMoveTitle: 'Move', guideMoveDescription: 'Move forward, left, back, and right.', guideJumpTitle: 'Jump', guideJumpDescription: 'Jump.', guideSneakTitle: 'Sneak', guideSneakDescription: 'Move carefully.', guideSprintTitle: 'Sprint', guideSprintDescription: 'Sprint.', guideInventoryTitle: 'Inventory', guideInventoryDescription: 'Open your inventory.', guideChatTitle: 'Chat', guideChatDescription: 'Open chat.', guideCommandLineTitle: 'Command input', guideCommandLineDescription: 'Open the command line.', guidePlayerListTitle: 'Player list', guidePlayerListDescription: 'Show the server player list.', guideAdvancementsTitle: 'Advancements', guideAdvancementsDescription: 'Open the advancements screen.', guideOffhandTitle: 'Swap offhand item', guideOffhandDescription: 'Swap the items in your hands.', guideDropTitle: 'Drop item', guideDropDescription: 'Drop the item you are holding.', guideMouseTitle: 'Mouse', guideMouseDescription: 'Left click breaks blocks and attacks; right click uses items and places blocks.', guideHotbarTitle: 'Hotbar slot', guideHotbarDescription: 'Select a hotbar slot.', guideScreenshotTitle: 'Screenshot', guideScreenshotDescription: 'Take a screenshot.', guidePerspectiveTitle: 'Perspective', guidePerspectiveDescription: 'Switch between first- and third-person views.', guideFullscreenTitle: 'Fullscreen', guideFullscreenDescription: 'Toggle fullscreen mode.', guideVoiceMenuTitle: 'Voice chat menu', guideVoiceMenuDescription: 'Open the Simple Voice Chat menu.', guideVoiceKeysTitle: 'Voice controls', guideVoiceKeysDescription: 'M mutes the microphone in voice activation mode; N disables voice chat; H hides indicators.', guideEmoteWheelTitle: 'Emote wheel', guideEmoteWheelDescription: 'Open the Emotecraft emote wheel.', guideMeTitle: 'Third-person action', guideMeDescription: 'Show an action from your character.', guideTeamMsgTitle: 'Team message', guideTeamMsgDescription: 'Send a message to members of your team.', guideHelpTitle: 'Command help', guideHelpDescription: 'Show available commands and help topics.', guideListTitle: 'Players online', guideListDescription: 'Show players connected to the server.', guideTriggerTitle: 'Change scoreboard trigger', guideTriggerDescription: 'Works only when the world has a trigger-type scoreboard objective.', guideRequiresTeam: 'Only available to team members.', guideRequiresTrigger: 'Works only when the world has a trigger objective.', guideLoginTitle: 'Log in to the server', guideLoginDescription: 'Enter your Hazelwood account password. Do not share it with other players.', guideRegisterTitle: 'Create an account', guideRegisterDescription: 'Create your Hazelwood account on the website before connecting.', guideTpaTitle: 'Request teleport', guideTpaDescription: 'Requests last 60 seconds; send a new request every 30 seconds. After acceptance, teleport starts in 3 seconds; movement cancels it. A 60-second cooldown follows teleport.', guideTpaAcceptTitle: 'Accept request', guideTpaAcceptDescription: 'Accept an incoming teleport request.', guideTpaDenyTitle: 'Deny request', guideTpaDenyDescription: 'Deny an incoming teleport request.', guideSkinSetTitle: 'Set a skin by username', guideSkinSetDescription: 'Set your skin from a Minecraft username.', guideSkinClearTitle: 'Clear skin', guideSkinClearDescription: 'Remove your saved skin choice.', guideSkinsTitle: 'Skin list', guideSkinsDescription: 'Open available skin categories.', guideSkinRandomTitle: 'Random skin', guideSkinRandomDescription: 'Choose a random skin.', guideSkinSearchTitle: 'Find a skin', guideSkinSearchDescription: 'Search for a skin by text.', guideSkinUpdateTitle: 'Update skin', guideSkinUpdateDescription: 'Reload the selected skin.', guideSkinUndoTitle: 'Restore previous skin', guideSkinUndoDescription: 'Undo the latest skin change.', guideSkinHistoryTitle: 'Skin history', guideSkinHistoryDescription: 'View your skin history.', guideSkinFavouritesTitle: 'Favorite skins', guideSkinFavouritesDescription: 'View saved skins.', guideSkinURLTitle: 'Skin from URL', guideSkinURLDescription: 'Load a texture from a URL; local files are not accepted.', guideSkinUploadTitle: 'Upload a skin', guideSkinUploadDescription: 'Open the web skin upload flow.', guideSkinEditTitle: 'Edit a skin', guideSkinEditDescription: 'Open the web skin editor.', guideVoiceHelpTitle: 'Voice chat help', guideVoiceHelpDescription: 'Requires the Simple Voice Chat client mod.', guideVoiceInviteTitle: 'Invite to a group', guideVoiceInviteDescription: 'Invite a player to a voice group. Requires the client mod.', guideVoiceJoinTitle: 'Join a voice group', guideVoiceJoinDescription: 'The name must match exactly one group; use an invitation if the group cannot be resolved uniquely.', guideVoiceLeaveTitle: 'Leave a voice group', guideVoiceLeaveDescription: 'Leave the current voice group.', guideEmotePlayTitle: 'Play an emote', guideEmotePlayDescription: 'A local Emotecraft command; it is not sent to the server. Requires the client mod.', guideEmoteStopTitle: 'Stop an emote', guideEmoteStopDescription: 'A local Emotecraft command; it is not sent to the server. Requires the client mod.', guideRequiresVoiceMod: 'Works only with the Simple Voice Chat client mod.', guideRequiresEmoteMod: 'Works only with the Emotecraft client mod.', guideTradeCycleTitle: 'Next villager offer', guideTradeCycleDescription: 'In the trading screen, point to the inventory area and press the offhand-swap key.', guideTradeCycleCondition: 'The plugin is installed on the server; behavior on the current Minecraft version still needs testing.',
    },
  };
  const guideExtraCopy = {
    ru: { guideMenuTitle: 'Меню игры', guideMenuDescription: 'Открыть главное меню.', guideDropStackTitle: 'Выбросить весь стак', guideDropStackDescription: 'Выбросить весь стак предметов из руки.', guideQuickMoveTitle: 'Быстро переместить предмет', guideQuickMoveDescription: 'Переместить предмет между инвентарём и окном контейнера.', guideScrollTitle: 'Выбрать слот', guideScrollDescription: 'Переключить слот панели быстрого доступа.', guideHideHudTitle: 'Скрыть интерфейс', guideHideHudDescription: 'Скрыть или показать игровой интерфейс.', guideDebugTitle: 'Отладочная информация', guideDebugDescription: 'Открыть или закрыть экран отладочной информации.', guideSkinHelpTitle: 'Справка по скинам', guideSkinHelpDescription: 'Показать команды со скинами, доступные аккаунту.', guideChatAcceptTitle: 'Принять из сообщения', guideChatDenyTitle: 'Отклонить из сообщения', guidePttNote: 'Клавиша Push-to-talk по умолчанию не назначена. Выбери её в мастере первой настройки голосового чата.', guideTpaDescription: 'Запрос действует 60 секунд; повторный запрос можно отправить через 30 секунд. После принятия телепорт начинается через 3 секунды; движение отменяет его. После переноса действует задержка 60 секунд.', guideTpaAcceptDescription: 'Прими запрос командой или кнопкой [ACCEPT] в сообщении чата.', guideTpaDenyDescription: 'Отклони запрос командой или кнопкой [DENY] в сообщении чата.', guideTradeCycleDescription: 'В окне торговли наведи курсор на область инвентаря и нажми клавишу смены предмета в другой руке. Работает только с профессией у жителя и до первой сделки.', guideTradeCycleCondition: 'Плагин установлен на сервере; работу на текущей версии Minecraft ещё нужно проверить.' },
    uk: { guideMenuTitle: 'Меню гри', guideMenuDescription: 'Відкрити головне меню.', guideDropStackTitle: 'Викинути весь стос', guideDropStackDescription: 'Викинути весь стос предметів з руки.', guideQuickMoveTitle: 'Швидко перемістити предмет', guideQuickMoveDescription: 'Перемістити предмет між інвентарем і вікном контейнера.', guideScrollTitle: 'Вибрати комірку', guideScrollDescription: 'Перемкнути комірку панелі швидкого доступу.', guideHideHudTitle: 'Сховати інтерфейс', guideHideHudDescription: 'Сховати або показати ігровий інтерфейс.', guideDebugTitle: 'Налагоджувальна інформація', guideDebugDescription: 'Відкрити або закрити екран налагодження.', guideSkinHelpTitle: 'Довідка зі скінів', guideSkinHelpDescription: 'Показати команди скінів, доступні обліковому запису.', guideChatAcceptTitle: 'Прийняти з повідомлення', guideChatDenyTitle: 'Відхилити з повідомлення', guidePttNote: 'Клавішу Push-to-talk типово не призначено. Вибери її в майстрі першого налаштування голосового чату.', guideTpaDescription: 'Запит діє 60 секунд; наступний можна надіслати через 30 секунд. Після прийняття телепортація починається через 3 секунди; рух скасовує її. Після перенесення діє затримка 60 секунд.', guideTpaAcceptDescription: 'Прийми запит командою або кнопкою [ACCEPT] у повідомленні чату.', guideTpaDenyDescription: 'Відхили запит командою або кнопкою [DENY] у повідомленні чату.', guideTradeCycleDescription: 'У вікні торгівлі наведи курсор на область інвентаря й натисни клавішу зміни предмета в іншій руці. Працює лише з професією у жителя та до першої угоди.', guideTradeCycleCondition: 'Плагін встановлено на сервері; роботу на поточній версії Minecraft ще потрібно перевірити.' },
    en: { guideMenuTitle: 'Game menu', guideMenuDescription: 'Open the main menu.', guideDropStackTitle: 'Drop full stack', guideDropStackDescription: 'Drop the full stack of held items.', guideQuickMoveTitle: 'Quick-move item', guideQuickMoveDescription: 'Move an item between your inventory and a container screen.', guideScrollTitle: 'Select hotbar slot', guideScrollDescription: 'Switch the selected hotbar slot.', guideHideHudTitle: 'Hide interface', guideHideHudDescription: 'Hide or show the game interface.', guideDebugTitle: 'Debug information', guideDebugDescription: 'Open or close the debug screen.', guideSkinHelpTitle: 'Skin help', guideSkinHelpDescription: 'Show skin commands available to your account.', guideChatAcceptTitle: 'Accept from chat', guideChatDenyTitle: 'Deny from chat', guidePttNote: 'Push-to-talk has no default key binding. Choose one in the voice chat first-time setup.', guideTpaDescription: 'Requests last 60 seconds; send another after 30 seconds. After acceptance, teleport starts in 3 seconds; movement cancels it. A 60-second cooldown follows teleport.', guideTpaAcceptDescription: 'Accept using the command or the [ACCEPT] button in chat.', guideTpaDenyDescription: 'Deny using the command or the [DENY] button in chat.', guideTradeCycleDescription: 'In the trading screen, point to the inventory area and press the offhand-swap key. The villager needs a profession and must not have completed a trade.', guideTradeCycleCondition: 'The plugin is installed on the server; behavior on the current Minecraft version still needs testing.' },
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };
  const tr = (key, values = {}) => String(guideExtraCopy[state.language]?.[key] || guideCommandCopy[state.language]?.[key] || (copy[state.language] || copy.ru)[key] || guideExtraCopy.ru[key] || guideCommandCopy.ru[key] || copy.ru[key] || key).replace(/\{(\w+)\}/g, (_m, k) => String(values[k] ?? ''));
  const validNick = (name) => typeof name === 'string' && /^[A-Za-z0-9_]{3,16}$/.test(name);

  async function getJSON(path, options = {}) {
    const response = await fetch(path, { credentials: 'same-origin', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || data.message || tr('requestError'));
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function formattedDuration(seconds) {
    if (seconds === null || seconds === undefined || !Number.isFinite(Number(seconds)) || Number(seconds) < 0) return tr('unavailable');
    const total = Math.floor(Number(seconds));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const parts = [];
    if (days) parts.push(`${days} ${state.language === 'en' ? 'd' : 'д'}`);
    if (hours || days) parts.push(`${hours} ${state.language === 'en' ? 'h' : 'ч'}`);
    if (minutes || total >= 60) parts.push(`${minutes} ${state.language === 'en' ? 'min' : 'мин'}`);
    if (total < 60) parts.push(`${total} ${state.language === 'en' ? 's' : 'с'}`);
    return parts.join(' ');
  }

  function formattedDate(value) {
    if (!value) return tr('dateUnknown');
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return tr('dateUnknown');
    return new Intl.DateTimeFormat({ ru: 'ru-RU', uk: 'uk-UA', en: 'en-US' }[state.language] || 'ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  function renderMemberCard(details) {
    const root = $('#member-profile');
    if (!root) return;
    const username = details.username || state.target;
    document.title = `${state.isOwn ? tr('profile') : username} — Hazelwood`;
    const main = el('div', 'profile-main');
    const avatar = el('div', `profile-avatar${state.isOwn && state.user?.role === 'admin' ? ' admin-avatar' : ''}`);
    avatar.setAttribute('aria-hidden', 'true');
    const fallback = el('span', 'profile-avatar-fallback', username.slice(0, 1).toUpperCase());
    const head = el('img', 'profile-avatar-head');
    head.alt = '';
    head.loading = 'eager';
    head.decoding = 'async';
    head.referrerPolicy = 'no-referrer';
    head.hidden = true;
    head.addEventListener('load', () => {
      fallback.hidden = true;
      head.hidden = false;
    }, { once: true });
    head.addEventListener('error', () => head.remove(), { once: true });
    avatar.append(fallback, head);
    const headVersion = details.skin?.headVersion || 'default';
    head.src = `/api/players/${encodeURIComponent(username)}/head.png?v=${encodeURIComponent(headVersion)}`;
    const identity = el('div');
    identity.append(el('h2', 'profile-nickname', username), el('p', 'profile-subline', state.isOwn && state.user?.role === 'admin' ? tr('adminRole') : tr('residentRole')));
    main.append(avatar, identity);
    if (typeof details.online === 'boolean') {
      const presence = el('span', `profile-presence ${details.online ? 'is-online' : 'is-offline'}`);
      presence.append(el('span', 'state-dot'), document.createTextNode(tr(details.online ? 'online' : 'offline')));
      main.append(presence);
    }
    root.replaceChildren(main);
    const createdAt = details.createdAt || (state.isOwn ? state.user?.createdAt : null);
    const lastSeenAt = details.lastSeenAt || (state.isOwn ? state.user?.lastSeenAt : null);
    const facts = [];
    if (createdAt) facts.push([tr('joined'), formattedDate(createdAt)]);
    if (lastSeenAt) facts.push([tr('lastVisit'), formattedDate(lastSeenAt)]);
    if (facts.length) {
      const factsNode = el('div', 'profile-facts');
      facts.forEach(([label, value]) => {
        const fact = el('div', 'profile-fact');
        fact.append(el('span', '', label), el('strong', '', value));
        factsNode.append(fact);
      });
      root.append(factsNode);
    }
  }

  function statTile(label, value, className = '') {
    const tile = el('article', `profile-stat-tile${className ? ` ${className}` : ''}`);
    tile.append(el('span', 'profile-stat-label', label), el('strong', 'profile-stat-value', value));
    return tile;
  }

  function sectionHeading(label, count) {
    const head = el('div', 'profile-section-heading');
    head.append(el('h2', '', label));
    if (count !== undefined) head.append(el('span', 'profile-section-count', count));
    return head;
  }

  function profileTop() {
    const title = $('#profile-title');
    const back = $('#profile-back-link');
    const mapOpen = $('#profile-map-open');
    if (title) title.textContent = state.isOwn ? tr('profile') : state.target;
    if (back) back.hidden = state.isOwn;
    if (mapOpen) mapOpen.textContent = `${tr('map')} ↗`;
    const dialog = $('#profile-map-dialog');
    const frame = $('#profile-map-frame');
    const close = $('#profile-map-close');
    if (dialog && !dialog.dataset.bound) {
      dialog.dataset.bound = 'true';
      mapOpen?.addEventListener('click', () => {
        if (frame && frame.dataset.loaded !== 'true') { frame.src = '/map/'; frame.dataset.loaded = 'true'; }
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      });
      close?.addEventListener('click', () => dialog.close ? dialog.close() : dialog.removeAttribute('open'));
      dialog.addEventListener('click', (event) => { if (event.target === dialog && typeof dialog.close === 'function') dialog.close(); });
      dialog.addEventListener('close', () => { if (frame) { frame.removeAttribute('src'); frame.dataset.loaded = 'false'; } });
    }
    const mapTitle = $('#profile-map-title');
    if (mapTitle) mapTitle.textContent = tr('mapTitle');
    if (close) close.setAttribute('aria-label', tr('close'));
    if (frame) frame.title = tr('mapFrame');
  }

  function profileLoading() {
    const root = $('#profile-dashboard');
    if (!root) return;
    root.replaceChildren(el('p', 'profile-load-state', tr('loading')));
  }

  function profileError() {
    const root = $('#profile-dashboard');
    if (!root) return;
    const panel = el('div', 'profile-error-panel');
    panel.setAttribute('role', 'alert');
    panel.append(el('p', '', tr('requestError')));
    const retry = el('button', 'button button-outline', tr('retry'));
    retry.type = 'button';
    retry.addEventListener('click', loadProfileDetails);
    panel.append(retry);
    root.replaceChildren(panel);
  }

  async function loadProfileDetails() {
    if (!validNick(state.target)) return;
    state.loading = true;
    state.error = false;
    profileLoading();
    try {
      state.details = await getJSON(`/api/players/${encodeURIComponent(state.target)}/details`);
      state.loading = false;
      renderMemberCard(state.details);
      renderDashboard();
    } catch (error) {
      state.loading = false;
      state.error = true;
      const member = $('#member-profile');
      if (member) member.replaceChildren(el('p', `inline-message${error.status === 404 ? '' : ' is-error'}`, error.status === 404 ? tr('notFound') : tr('requestError')));
      profileError();
    }
  }

  function playerLink(name) {
    const link = el('a', 'profile-player-link', name);
    link.href = `/app/profile/?player=${encodeURIComponent(name)}`;
    return link;
  }

  function nameList(names, emptyMessage) {
    const list = el('ul', 'profile-name-list');
    if (!Array.isArray(names)) {
      list.append(el('li', 'profile-empty-inline', emptyMessage));
      return list;
    }
    if (!names.length) {
      list.append(el('li', 'profile-empty-inline', tr('noNames')));
      return list;
    }
    names.filter(validNick).forEach((name) => {
      const item = el('li');
      item.append(playerLink(name));
      list.append(item);
    });
    return list;
  }

  function renderSkin(canvas, data, model, onFailure, onSuccess) {
    if (!canvas || !data) return;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx || image.naturalWidth !== 64 || ![32, 64].includes(image.naturalHeight)) {
        canvas.classList.add('is-unavailable');
        onFailure?.();
        return;
      }
      const slim = model === 'slim';
      const legacy = image.naturalHeight === 32;
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      const scale = 4;
      canvas.width = 200;
      canvas.height = 128;
      ctx.imageSmoothingEnabled = false;
      const draw = (sx, sy, sw, sh, dx, dy, mirror = false) => {
        if (sx < 0 || sy < 0 || sx + sw > width || sy + sh > height || sw <= 0 || sh <= 0) return;
        const dw = sw * scale;
        const dh = sh * scale;
        if (mirror) {
          ctx.save();
          ctx.translate(2 * dx + dw, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
          ctx.restore();
          return;
        }
        ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
      };
      const armWidth = slim ? 3 : 4;
      const rightArmFront = [44, 20, armWidth, 12];
      const rightArmBack = [slim ? 51 : 52, 20, armWidth, 12];
      const leftArmFront = [36, 52, armWidth, 12];
      const leftArmBack = [slim ? 43 : 44, 52, armWidth, 12];

      // Front silhouette (one skin pixel is drawn as a 4×4 block).
      draw(8, 8, 8, 8, 40, 0); draw(20, 20, 8, 12, 40, 32);
      draw(...rightArmFront, 72, 32); draw(...(legacy ? rightArmFront : leftArmFront), 24, 32, legacy);
      draw(4, 20, 4, 12, 40, 80); draw(...(legacy ? [4, 20, 4, 12] : [20, 52, 4, 12]), 56, 80, legacy);
      // Back silhouette, kept separate from the front to avoid overlap.
      draw(24, 8, 8, 8, 144, 0); draw(32, 20, 8, 12, 144, 32);
      draw(...rightArmBack, 176, 32); draw(...(legacy ? rightArmBack : leftArmBack), 128, 32, legacy);
      draw(12, 20, 4, 12, 144, 80); draw(...(legacy ? [12, 20, 4, 12] : [28, 52, 4, 12]), 160, 80, legacy);

      // Hat/helmet layer exists on both legacy and modern skins.
      draw(40, 8, 8, 8, 40, 0); draw(56, 8, 8, 8, 144, 0);
      if (!legacy) {
        draw(20, 36, 8, 12, 40, 32); draw(32, 36, 8, 12, 144, 32);
        draw(44, 36, armWidth, 12, 72, 32); draw(slim ? 51 : 52, 36, armWidth, 12, 176, 32);
        draw(52, 52, armWidth, 12, 24, 32); draw(slim ? 59 : 60, 52, armWidth, 12, 128, 32);
        draw(4, 36, 4, 12, 40, 80); draw(12, 36, 4, 12, 144, 80);
        draw(4, 52, 4, 12, 56, 80); draw(12, 52, 4, 12, 160, 80);
      }
      canvas.classList.add('is-ready');
      canvas.classList.remove('is-unavailable');
      onSuccess?.();
    };
    image.onerror = () => { canvas.classList.add('is-unavailable'); onFailure?.(); };
    image.src = data;
  }

  function safeSkinURL(url) {
    if (typeof url !== 'string') return '';
    try {
      const parsed = new URL(url, location.origin);
      if (parsed.origin !== location.origin || !parsed.pathname.startsWith('/api/')) return '';
      return parsed.href;
    } catch (_error) { return ''; }
  }

  function renderSkinCard() {
    const details = state.details || {};
    const panel = el('section', 'profile-panel profile-skin-panel');
    panel.append(sectionHeading(tr('skin')));
    const row = el('div', 'profile-skin-layout');
    const stage = el('div', 'profile-skin-stage');
    const canvas = el('canvas', 'profile-skin-canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `${tr('skin')}: ${state.target}`);
    stage.append(canvas);
    const imageStatus = el('p', 'profile-skin-unavailable', tr('skinLoading'));
    imageStatus.setAttribute('role', 'status');
    stage.append(imageStatus);
    const buttons = el('div', 'profile-skin-view-controls');
    const front = el('span', 'profile-skin-view-label', tr('viewerFront'));
    const back = el('span', 'profile-skin-view-label', tr('viewerBack'));
    buttons.append(front, back);
    stage.append(buttons);
    const skin = details.skin || {};
    const url = skin.available ? safeSkinURL(skin.textureURL) : '';
    if (url) {
      renderSkin(canvas, url, skin.model, () => { imageStatus.textContent = tr('skinUnavailable'); }, () => { imageStatus.hidden = true; });
    } else imageStatus.textContent = tr('skinUnavailable');
    row.append(stage);
    if (state.isOwn) row.append(renderSkinForm());
    panel.append(row);
    return panel;
  }

  function skinMessageText() {
    if (!state.skinStatus) return '';
    if (state.skinStatus === 'raw') return state.skinErrorText;
    return tr(state.skinStatus, state.skinStatusValues || {});
  }

  function setSkinMessage(_form, key, error = false, values = {}) {
    state.skinStatus = key;
    state.skinStatusError = error;
    state.skinStatusValues = values;
    state.skinErrorText = key === 'raw' ? String(values.message || '') : '';
    document.querySelectorAll('[data-skin-message]').forEach((node) => {
      node.textContent = skinMessageText();
      node.classList.toggle('is-error', state.skinStatusError);
    });
  }

  function setSkinPending(pending) {
    state.skinPending = pending;
    document.querySelectorAll('[data-skin-submit]').forEach((button) => { button.disabled = pending; });
  }

  async function submitSkinRequest(form, body) {
    setSkinPending(true);
    state.skinPollStarted = Date.now();
    setSkinMessage(form, 'skinPending');
    try {
      const headers = typeof body === 'string' ? { 'Content-Type': 'application/json' } : undefined;
      const response = await fetch('/api/me/skin', { method: 'POST', credentials: 'same-origin', body, headers });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || result.message || tr('requestError'));
      const id = result.requestId || result.id;
      if (!id) throw new Error(tr('requestError'));
      state.requestId = String(id);
      setSkinMessage(form, 'skinAccepted');
      await pollSkinRequest(form, state.requestId);
    } catch (error) {
      setSkinPending(false);
      setSkinMessage(form, 'raw', true, { message: error.message || tr('requestError') });
    }
  }

  async function pollSkinRequest(form, requestId) {
    clearTimeout(state.pollTimer);
    try {
      const result = await getJSON(`/api/me/skin/requests/${encodeURIComponent(requestId)}`);
      if (result.status === 'completed') {
        setSkinPending(false);
        setSkinMessage(form, 'skinDone');
        await loadProfileDetails();
        return;
      }
      if (result.status === 'failed') {
        setSkinPending(false);
        setSkinMessage(form, 'skinFailed', true, { error: result.error || tr('requestError') });
        return;
      }
      if (Date.now() - state.skinPollStarted >= 120_000) {
        setSkinPending(false);
        setSkinMessage(form, 'skinTimeout', true);
        return;
      }
      setSkinMessage(form, 'skinPending');
      state.pollTimer = setTimeout(() => pollSkinRequest(form, requestId), 1800);
    } catch (error) {
      setSkinPending(false);
      setSkinMessage(form, 'raw', true, { message: error.message || tr('requestError') });
    }
  }

  function renderSkinForm() {
    const form = el('div', 'profile-skin-editor');
    form.append(el('p', 'profile-skin-help', tr('skinHelp')));
    const uploadForm = el('form', 'profile-skin-form');
    uploadForm.enctype = 'multipart/form-data';
    const fileLabel = el('label', 'profile-form-label', tr('skinFile'));
    const file = el('input', 'profile-file-input');
    file.type = 'file';
    file.name = 'skin';
    file.accept = 'image/png,.png';
    file.required = true;
    fileLabel.append(file);
    const modelLabel = el('label', 'profile-form-label', tr('skinModel'));
    const model = el('select', 'profile-select');
    model.name = 'model';
    [['classic', 'classic'], ['slim', 'slim']].forEach(([value, labelKey]) => {
      const option = el('option', '', tr(labelKey));
      option.value = value;
      model.append(option);
    });
    modelLabel.append(model);
    const submit = el('button', 'button button-dark', tr('changeSkin'));
    submit.type = 'submit';
    submit.dataset.skinSubmit = 'true';
    submit.disabled = state.skinPending;
    const message = el('p', 'profile-skin-message', '');
    message.dataset.skinMessage = '';
    message.setAttribute('role', 'status');
    message.textContent = skinMessageText();
    message.classList.toggle('is-error', state.skinStatusError);
    uploadForm.append(fileLabel, modelLabel, submit, message);
    uploadForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!file.files || !file.files[0]) return;
      const chosen = file.files[0];
      if (chosen.size > 256 * 1024 || chosen.type !== 'image/png') {
        setSkinMessage(uploadForm, 'raw', true, { message: tr('skinInvalid') });
        return;
      }
      const dimensions = await new Promise((resolve) => {
        const image = new Image();
        const objectURL = URL.createObjectURL(chosen);
        image.onload = () => { URL.revokeObjectURL(objectURL); resolve([image.naturalWidth, image.naturalHeight]); };
        image.onerror = () => { URL.revokeObjectURL(objectURL); resolve(null); };
        image.src = objectURL;
      });
      if (!dimensions || dimensions[0] !== 64 || ![32, 64].includes(dimensions[1])) {
        setSkinMessage(uploadForm, 'raw', true, { message: tr('skinInvalid') });
        return;
      }
      const payload = new FormData();
      payload.append('skin', chosen);
      payload.append('model', model.value);
      await submitSkinRequest(uploadForm, payload);
    });
    const separator = el('p', 'profile-skin-or', tr('changeByName'));
    const nameForm = el('form', 'profile-skin-form profile-skin-name-form');
    const nameLabel = el('label', 'profile-form-label', tr('skinName'));
    const name = el('input', 'profile-text-input');
    name.name = 'playerName';
    name.autocomplete = 'off';
    name.minLength = 3;
    name.maxLength = 16;
    name.pattern = '[A-Za-z0-9_]{3,16}';
    name.required = true;
    nameLabel.append(name);
    const nameModel = model.cloneNode(true);
    nameModel.name = 'model';
    nameModel.value = model.value;
    const nameModelLabel = el('label', 'profile-form-label', tr('skinModel'));
    nameModelLabel.append(nameModel);
    const nameSubmit = el('button', 'button button-outline', tr('send'));
    nameSubmit.type = 'submit';
    nameSubmit.dataset.skinSubmit = 'true';
    nameSubmit.disabled = state.skinPending;
    const nameMessage = el('p', 'profile-skin-message', '');
    nameMessage.dataset.skinMessage = '';
    nameMessage.setAttribute('role', 'status');
    nameMessage.textContent = skinMessageText();
    nameMessage.classList.toggle('is-error', state.skinStatusError);
    nameForm.append(nameLabel, nameModelLabel, nameSubmit, nameMessage);
    nameForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!nameForm.reportValidity()) return;
      await submitSkinRequest(nameForm, JSON.stringify({ playerName: name.value.trim(), model: nameModel.value }));
    });
    form.append(uploadForm, separator, nameForm);
    return form;
  }

  function renderAchievements() {
    const achievements = Array.isArray(state.details?.advancements) ? state.details.advancements : [];
    const panel = el('details', 'profile-panel profile-collapsible-panel profile-achievements-panel');
    const summary = el('summary', 'profile-collapsible-summary');
    const title = el('span', 'profile-collapsible-title', tr('achievements'));
    title.setAttribute('role', 'heading');
    title.setAttribute('aria-level', '2');
    summary.append(title, el('span', 'profile-section-count', String(achievements.length)));
    panel.append(summary);
    const content = el('div', 'profile-collapsible-content');
    const controls = el('div', 'profile-achievement-controls');
    const search = el('input', 'profile-text-input');
    search.type = 'search';
    search.placeholder = tr('searchAchievements');
    search.setAttribute('aria-label', tr('searchAchievements'));
    search.value = state.query;
    search.addEventListener('input', () => { state.query = search.value; state.achievementsVisible = 25; drawAchievementList(list); });
    const filters = el('div', 'profile-filter-list');
    [['all', 'all'], ['earned', 'earnedFilter'], ['missing', 'missingFilter']].forEach(([value, label]) => {
      const button = el('button', 'profile-filter-button', tr(label));
      button.type = 'button';
      button.setAttribute('aria-pressed', String(state.filter === value));
      button.addEventListener('click', () => { state.filter = value; state.achievementsVisible = 25; filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button))); drawAchievementList(list); });
      filters.append(button);
    });
    controls.append(search, filters);
    const list = el('div', 'profile-achievement-list');
    content.append(el('p', 'profile-comparison-note', tr('comparisonNote')), controls, list);
    panel.append(content);
    drawAchievementList(list);
    return panel;
  }

  function achievementCompletion(item) {
    const earnedCount = Array.isArray(item.earnedBy) ? item.earnedBy.length : 0;
    const missingCount = Array.isArray(item.missingBy) ? item.missingBy.length : 0;
    const eligibleCount = earnedCount + missingCount;
    if (!eligibleCount) return null;

    const fraction = earnedCount / eligibleCount;
    return {
      percent: new Intl.NumberFormat(state.language, { style: 'percent', maximumFractionDigits: 1 }).format(fraction),
      isRare: fraction < 0.1,
    };
  }

  function localizedAchievement(item) {
    const translations = window.hazelwoodAdvancementTranslations || {};
    const translation = translations[state.language]?.[item.id];
    if (!translation) return item;
    return {
      ...item,
      originalTitle: item.title,
      originalDescription: item.description,
      title: translation.title || item.title,
      description: translation.description || item.description,
    };
  }

  function advancementIconPath(id) {
    if (typeof id !== 'string') return null;
    const match = /^([a-z0-9_.-]+):([a-z0-9/._-]+)$/.exec(id);
    if (!match || match[1] === '.' || match[1] === '..' || match[2].split('/').some((segment) => !segment || segment === '.' || segment === '..')) return null;
    return `/assets/advancements/${match[1]}/${match[2]}.png`;
  }

  function drawAchievementList(list) {
    if (!list) return;
    list.replaceChildren();
    const query = state.query.trim().toLocaleLowerCase();
    const all = Array.isArray(state.details?.advancements) ? state.details.advancements.map(localizedAchievement) : [];
    const matches = all.filter((item) => {
      if (state.filter === 'earned' && item.done !== true) return false;
      if (state.filter === 'missing' && item.done !== false) return false;
      return !query || `${item.title || ''} ${item.description || ''} ${item.originalTitle || ''} ${item.originalDescription || ''} ${item.id || ''}`.toLocaleLowerCase().includes(query);
    }).sort((left, right) => {
      const rank = (item) => item.done === true ? 0 : item.done === false ? 1 : 2;
      return rank(left) - rank(right);
    });
    if (!matches.length) {
      list.append(el('p', 'profile-empty-state', all.length ? tr('noMatches') : tr('noAchievements')));
      return;
    }
    const visible = matches.slice(0, state.achievementsVisible);
    visible.forEach((item) => {
      const completion = achievementCompletion(item);
      const details = el('details', `profile-achievement${completion?.isRare ? ' is-rare' : ''}`);
      const summary = el('summary', 'profile-achievement-summary');
      const titleBox = el('span', 'profile-achievement-title');
      const iconPath = advancementIconPath(item.id);
      if (iconPath) {
        const icon = el('img', 'profile-achievement-icon');
        icon.setAttribute('src', iconPath);
        icon.setAttribute('alt', '');
        icon.setAttribute('aria-hidden', 'true');
        icon.setAttribute('loading', 'lazy');
        icon.setAttribute('decoding', 'async');
        icon.addEventListener('error', () => icon.remove(), { once: true });
        titleBox.append(icon);
      }
      const titleCopy = el('span', 'profile-achievement-copy');
      titleCopy.append(el('strong', '', item.title || item.id || tr('event')));
      if (item.description) titleCopy.append(el('small', '', item.description));
      titleBox.append(titleCopy);
      const status = item.done === true ? tr('achieved') : item.done === false ? tr('notAchieved') : tr('unknownStatus');
      const statusColumn = el('span', 'profile-achievement-status-column');
      statusColumn.append(el('span', `profile-achievement-state${item.done === true ? ' is-earned' : ''}`, status));
      const rateText = completion ? tr('achievementRate', { percent: completion.percent }) : tr('achievementRateUnavailable');
      const rate = el('small', `profile-achievement-rate${completion?.isRare ? ' is-rare' : ''}`, `${completion?.isRare ? '★★★ ' : ''}${rateText}`);
      if (completion?.isRare) rate.setAttribute('aria-label', `${tr('rareAchievement')}: ${rateText}`);
      statusColumn.append(rate);
      summary.append(titleBox, statusColumn);
      details.append(summary);
      if (item.done === true && item.completedAt) details.append(el('p', 'profile-achievement-date', tr('earnedAt', { date: formattedDate(item.completedAt) })));
      const comparison = el('div', 'profile-achievement-comparison');
      const earned = el('div', 'profile-comparison-group');
      earned.append(el('h3', '', tr('earned')), nameList(item.earnedBy, tr('noPlayers')));
      comparison.append(earned);
      details.append(comparison);
      list.append(details);
    });
    if (visible.length < matches.length) {
      const more = el('button', 'button button-outline profile-show-more', tr('showMore'));
      more.type = 'button';
      more.addEventListener('click', () => { state.achievementsVisible += 25; drawAchievementList(list); });
      list.append(more);
    }
  }

  function renderHistory() {
    const records = Array.isArray(state.details?.history)
      ? state.details.history.filter((record) => ['gameplay_session', 'session_summary'].includes(String(record.type || '').toLowerCase().replace(/[-\s]+/g, '_')))
      : [];
    const panel = el('details', 'profile-panel profile-collapsible-panel profile-history-panel');
    const summary = el('summary', 'profile-collapsible-summary');
    const title = el('span', 'profile-collapsible-title', tr('history'));
    title.setAttribute('role', 'heading');
    title.setAttribute('aria-level', '2');
    summary.append(title, el('span', 'profile-section-count', String(records.length)));
    panel.append(summary);
    const content = el('div', 'profile-collapsible-content');
    if (!records.length) {
      content.append(el('p', 'profile-empty-state', tr('noHistory')));
      panel.append(content);
      return panel;
    }
    records.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
    const list = el('ol', 'profile-history-list');
    records.forEach((record) => {
      const item = el('li', 'profile-history-item');
      item.append(el('strong', 'profile-history-type', tr('gameplaySession')), el('time', 'profile-history-time', formattedDate(record.at)));

      const summary = el('div', 'profile-history-meta profile-history-session-meta');
      summary.append(el('span', '', `${tr('duration')}: ${formattedDuration(record.durationSeconds)}`));
      if (record.deaths !== null && record.deaths !== undefined && Number.isFinite(Number(record.deaths))) {
        summary.append(el('span', '', `${tr('deaths')}: ${formatNumber(record.deaths)}`));
      }
      item.append(summary);

      const dimensions = Object.entries(record.dimensions || {})
        .filter(([dimension, seconds]) => ['overworld', 'nether', 'end'].includes(dimension) && Number.isFinite(Number(seconds)) && Number(seconds) > 0)
        .map(([dimension, seconds]) => `${tr(dimension)}: ${formattedDuration(seconds)}`);
      if (dimensions.length) item.append(el('div', 'profile-history-meta', `${tr('dimensions')}: ${dimensions.join(' · ')}`));

      const advancements = Array.isArray(record.advancements) ? record.advancements : [];
      if (advancements.length) {
        const titles = advancements.map((id) => {
          const achievement = (state.details?.advancements || []).find((entry) => entry.id === id);
          if (achievement) return localizedAchievement(achievement).title || id;
          return String(id).replace(/^minecraft:/, '').split('/').pop().replace(/[_-]+/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
        });
        item.append(el('div', 'profile-history-meta', `${tr('achievements')}: ${titles.join(', ')}`));
      }
      list.append(item);
    });
    content.append(list);
    panel.append(content);
    return panel;
  }

  function renderDashboard() {
    profileTop();
    const root = $('#profile-dashboard');
    if (!root || !state.details) return;
    const details = state.details;
    const stats = details.stats || {};
    const available = stats.available !== false;
    const achievements = Array.isArray(details.advancements) ? details.advancements : [];
    const knownAchievements = achievements.filter((item) => item.done === true || item.done === false);
    const earnedCount = achievements.filter((item) => item.done === true).length;
    const earnedSummary = knownAchievements.length ? `${earnedCount} / ${knownAchievements.length}` : tr('unavailable');
    const overview = el('section', 'profile-panel profile-overview-panel');
    overview.append(sectionHeading(tr('overview')));
    const tiles = el('div', 'profile-stats-grid');
    tiles.append(
      statTile(tr('timePlayed'), available ? formattedDuration(stats.playSeconds) : tr('unavailable'), 'is-primary'),
      statTile(tr('achievements'), earnedSummary),
      statTile(tr('deaths'), available ? formatNumber(stats.deaths) : tr('unavailable')),
      statTile(tr('mobKills'), available ? formatNumber(stats.mobKills) : tr('unavailable')),
      statTile(tr('blocks'), available ? formatNumber(stats.blocksMined) : tr('unavailable')),
      statTile(tr('distance'), available && stats.distanceMeters != null ? `${formatNumber(stats.distanceMeters)} ${{ ru: 'м', uk: 'м', en: 'm' }[state.language] || 'm'}` : tr('unavailable')),
    );
    overview.append(tiles);
    const dimensionPanel = el('section', 'profile-panel profile-dimensions-panel');
    dimensionPanel.append(sectionHeading(tr('dimensions')));
    const dimensions = stats.dimensions || {};
    const dimensionGrid = el('div', 'profile-dimensions-grid');
    [['overworld', 'overworld'], ['nether', 'nether'], ['end', 'end']].forEach(([key, label]) => dimensionGrid.append(statTile(tr(label), formattedDuration(dimensions[key]))));
    dimensionPanel.append(dimensionGrid);
    const columns = el('div', 'profile-dashboard-columns');
    columns.append(renderSkinCard(), dimensionPanel);
    const sections = [overview, columns];
    if (state.isOwn) sections.push(renderMusicDiscForm());
    sections.push(renderHistory(), renderAchievements());
    root.replaceChildren(...sections);
  }

  function renderMusicDiscForm() {
    const panel = el('section', 'profile-panel profile-music-panel');
    panel.append(sectionHeading(tr('musicDisc')));
    panel.append(el('p', 'profile-music-help', tr('musicDiscHelp')));

    const form = el('form', 'profile-music-form');
    form.enctype = 'multipart/form-data';

    const fileLabel = el('label', 'profile-form-label', tr('musicDiscFile'));
    const file = el('input', 'profile-file-input');
    file.type = 'file';
    file.name = 'audio';
    file.accept = '.ogg,.mp3,audio/ogg,application/ogg,audio/mpeg,audio/mp3';
    file.required = true;
    fileLabel.append(file);

    const titleLabel = el('label', 'profile-form-label', tr('musicDiscTitle'));
    const title = el('input', 'profile-text-input');
    title.type = 'text';
    title.name = 'title';
    title.minLength = 1;
    title.maxLength = 48;
    title.required = true;
    title.autocomplete = 'off';
    titleLabel.append(title);

    const submit = el('button', 'button button-dark profile-music-submit', tr('musicDiscSubmit'));
    submit.type = 'submit';
    const message = el('p', 'profile-music-message', '');
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    form.append(fileLabel, titleLabel, submit, message);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const audio = file.files?.[0];
      const discTitle = title.value.trim();
      const extension = audio?.name.toLowerCase().split('.').pop();
      if (!audio || !['ogg', 'mp3'].includes(extension) || audio.size > 8 * 1024 * 1024 || !discTitle || discTitle.length > 48) {
        setMusicDiscMessage(message, 'musicDiscInvalid', true);
        return;
      }
      const payload = new FormData();
      payload.append('audio', audio);
      payload.append('title', discTitle);
      await submitMusicDisc(payload, message, submit);
    });
    panel.append(form);
    return panel;
  }

  function setMusicDiscMessage(message, key, isError = false, values = {}) {
    message.textContent = tr(key, values);
    message.classList.toggle('is-error', isError);
  }

  async function submitMusicDisc(payload, message, submit) {
    clearTimeout(state.musicDiscPollTimer);
    submit.disabled = true;
    setMusicDiscMessage(message, 'musicDiscPending');
    const started = Date.now();
    try {
      const response = await fetch('/api/me/music-disc', { method: 'POST', credentials: 'same-origin', body: payload });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || result.message || tr('requestError'));
      const requestId = String(result.requestId || result.id || '');
      if (!requestId) throw new Error(tr('requestError'));
      await pollMusicDiscRequest(requestId, started, message, submit);
    } catch (error) {
      submit.disabled = false;
      setMusicDiscMessage(message, 'musicDiscFailed', true, { error: error.message || tr('requestError') });
    }
  }

  async function pollMusicDiscRequest(requestId, started, message, submit) {
    try {
      const result = await getJSON(`/api/me/music-disc/requests/${encodeURIComponent(requestId)}`);
      if (result.status === 'completed') {
        submit.disabled = false;
        setMusicDiscMessage(message, 'musicDiscDone');
        return;
      }
      if (result.status === 'failed') {
        submit.disabled = false;
        setMusicDiscMessage(message, 'musicDiscFailed', true, { error: result.error || tr('requestError') });
        return;
      }
      if (Date.now() - started >= 120_000) {
        submit.disabled = false;
        setMusicDiscMessage(message, 'musicDiscQueued');
        return;
      }
      setMusicDiscMessage(message, 'musicDiscPending');
      state.musicDiscPollTimer = setTimeout(() => pollMusicDiscRequest(requestId, started, message, submit), 2000);
    } catch (error) {
      submit.disabled = false;
      setMusicDiscMessage(message, 'musicDiscFailed', true, { error: error.message || tr('requestError') });
    }
  }

  function formatNumber(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return tr('unavailable');
    return new Intl.NumberFormat({ ru: 'ru-RU', uk: 'uk-UA', en: 'en-US' }[state.language] || 'ru-RU', { maximumFractionDigits: 1 }).format(Number(value));
  }

  function playerCountLabel(value) {
    const count = Math.max(0, Math.floor(Number(value) || 0));
    const lastTwo = count % 100;
    const last = count % 10;
    if (state.language === 'en') return `${count} ${count === 1 ? 'player' : 'players'}`;
    if (state.language === 'uk') {
      const noun = last === 1 && lastTwo !== 11 ? 'гравець' : last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14) ? 'гравці' : 'гравців';
      return `${count} ${noun}`;
    }
    const noun = last === 1 && lastTwo !== 11 ? 'игрок' : last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14) ? 'игрока' : 'игроков';
    return `${count} ${noun}`;
  }

  async function getPlayerList() {
    const result = await getJSON('/api/players');
    return Array.isArray(result.players) ? result.players : [];
  }

  function applyPageLabels() {
    if (state.page === 'players') {
      const eyebrow = $('#players-eyebrow');
      const title = $('#players-title');
      if (eyebrow) eyebrow.textContent = tr('playersEyebrow');
      if (title) title.textContent = tr('playersTitle');
    } else if (state.page === 'guide') {
      const title = $('#guide-title');
      if (title) title.textContent = tr('guideTitle');
    }
  }

  function drawDirectory(root) {
    root.replaceChildren();
    const toolbar = el('div', 'players-toolbar');
    const search = el('input', 'profile-text-input');
    search.type = 'search';
    search.placeholder = tr('searchPlayers');
    search.setAttribute('aria-label', tr('searchPlayers'));
    search.value = state.directoryQuery;
    const filters = el('div', 'profile-filter-list');
    [['all', 'allPlayers'], ['online', 'onlinePlayers']].forEach(([value, label]) => {
      const button = el('button', 'profile-filter-button', tr(label));
      button.type = 'button';
      button.setAttribute('aria-pressed', String(state.directoryFilter === value));
      button.addEventListener('click', () => { state.directoryFilter = value; drawDirectory(root); });
      filters.append(button);
    });
    toolbar.append(search, filters);
    const count = el('p', 'players-result-count', playerCountLabel(state.players.length));
    const list = el('div', 'players-card-grid');
    const drawCards = () => {
      state.directoryQuery = search.value;
      list.replaceChildren();
      const query = state.directoryQuery.trim().toLocaleLowerCase();
      const visible = state.players.filter((item) => {
        const username = String(item.username || '');
        return (!query || username.toLocaleLowerCase().includes(query)) && (state.directoryFilter !== 'online' || item.online === true);
      });
      if (!visible.length) list.append(el('p', 'profile-empty-state', tr('noPlayersFound')));
      visible.forEach((player) => {
        if (!validNick(player.username)) return;
        const card = el('article', 'player-directory-card');
        const identity = el('div', 'player-directory-identity');
        identity.append(el('span', 'player-directory-avatar', player.username.slice(0, 1).toUpperCase()));
        const name = playerLink(player.username);
        name.classList.add('player-directory-name');
        const presence = el('span', `player-directory-presence${player.online ? ' is-online' : ''}`, tr(player.online ? 'online' : 'offline'));
        const facts = el('div', 'player-directory-facts');
        facts.append(el('span', '', `${tr('playtime')}: ${formattedDuration(player.playSeconds)}`), el('span', '', `${tr('achievements')}: ${formatNumber(player.advancementCount)}`));
        identity.append(el('div', 'player-directory-copy')); 
        const copy = $('.player-directory-copy', identity);
        copy.append(name, presence);
        card.append(identity, facts);
        list.append(card);
      });
      count.textContent = playerCountLabel(visible.length);
    };
    search.addEventListener('input', drawCards);
    root.append(toolbar, count, list);
    drawCards();
  }

  async function initPlayers() {
    const root = $('#players-directory');
    if (!root) return;
    applyPageLabels();
    root.replaceChildren(el('p', 'profile-load-state', tr('loading')));
    try {
      state.players = await getPlayerList();
      drawDirectory(root);
    } catch (_error) {
      const panel = el('div', 'profile-error-panel');
      panel.append(el('p', '', tr('requestError')));
      const retry = el('button', 'button button-outline', tr('retry'));
      retry.type = 'button';
      retry.addEventListener('click', initPlayers);
      panel.append(retry);
      root.replaceChildren(panel);
    }
  }

  function safeDownload(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value.trim());
      return url.protocol === 'https:' && url.origin === 'https://github.com' && SAFE_DOWNLOAD_URLS.has(url.href) ? url.href : '';
    } catch (_error) { return ''; }
  }

  function guideDateParts(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: 'Europe/Moscow',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(now);
    return {
      month: Number(parts.find((part) => part.type === 'month')?.value),
      day: Number(parts.find((part) => part.type === 'day')?.value),
    };
  }

  function isHolidayGuideSeason(now = new Date()) {
    const { month, day } = guideDateParts(now);
    return (month === 12 && day >= 1) || (month === 1 && day <= 7);
  }

  function isChristmasGuideDecorationSeason(now = new Date()) {
    const { month, day } = guideDateParts(now);
    return (month === 12 && day >= 14) || (month === 1 && day <= 7);
  }

  function guideGroupLabel(group) {
    return tr(({ clientKeys: 'guideGroupClientKeys', chat: 'guideGroupChat', account: 'guideGroupAccount', teleport: 'guideGroupTeleport', trade: 'guideGroupTrade', skin: 'guideGroupSkin', voice: 'guideGroupVoice', emotes: 'guideGroupEmotes', holiday: 'guideGroupHoliday' })[group] || 'guideGroupChat');
  }

  function guideTriggerText(value) {
    const args = {
      ru: { player: 'игрок', username: 'ник', message: 'сообщение', action: 'действие', text: 'текст', page: 'страница', password: 'пароль сайта', objective: 'цель', value: 'значение', group: 'имя группы', emote: 'эмоция' },
      uk: { player: 'гравець', username: 'нік', message: 'повідомлення', action: 'дія', text: 'текст', page: 'сторінка', password: 'пароль сайту', objective: 'ціль', value: 'значення', group: 'назва групи', emote: 'емоція' },
      en: { player: 'player', username: 'username', message: 'message', action: 'action', text: 'text', page: 'page', password: 'website password', objective: 'objective', value: 'value', group: 'group name', emote: 'emote' },
    }[state.language] || {};
    return value.replace(/<([a-z ]+)>|\[([a-z]+)\]/gi, (match, angle, square) => {
      const key = (angle || square || '').toLowerCase();
      if (!args[key]) return match;
      return angle ? `<${args[key]}>` : `[${args[key]}]`;
    });
  }

  function renderGuideCatalog(results, now = new Date()) {
    results.replaceChildren();
    const query = state.guideQuery.trim().toLocaleLowerCase();
    const availableCatalog = guideCommandCatalog.filter((entry) => entry.season !== 'holiday' || isHolidayGuideSeason(now));
    const visible = availableCatalog.filter((entry) => {
      if (!query) return true;
      const searchable = [entry.trigger, guideTriggerText(entry.trigger), ...(entry.aliases || []), ...(entry.aliases || []).map(guideTriggerText), entry.triggerEn || '', tr(entry.title), tr(entry.description), entry.condition ? tr(entry.condition) : '', entry.group ? guideGroupLabel(entry.group) : '', entry.example || '', entry.exampleEn || '', entry.exampleUk || ''].join(' ').toLocaleLowerCase();
      return searchable.includes(query);
    });
    if (!visible.length) {
      results.append(el('p', 'profile-empty-state', tr('guideNoCommandMatches')));
      return;
    }
    const typeOrder = [
      { id: 'server', label: 'guideServerCommands' },
      { id: 'client', label: 'guideClientKeys' },
      { id: 'addon', label: 'guideClientAddons' },
    ];
    typeOrder.forEach(({ id, label }) => {
      const entries = visible.filter((entry) => entry.type === id);
      if (!entries.length) return;
      const typeSection = el('section', 'guide-command-section');
      typeSection.append(el('h2', 'guide-command-section-title', tr(label)));
      const groupOrder = [...new Set(availableCatalog.filter((entry) => entry.type === id).map((entry) => entry.group))];
      groupOrder.forEach((group) => {
        const groupEntries = entries.filter((entry) => entry.group === group);
        if (!groupEntries.length) return;
        const holidayClasses = group === 'holiday'
          ? `guide-command-group guide-command-group-holiday${isChristmasGuideDecorationSeason(now) ? ' is-christmas' : ''}`
          : 'guide-command-group';
        const groupSection = el('details', holidayClasses);
        const groupSummary = el('summary', 'guide-command-group-summary');
        const groupTitle = el('h3', 'guide-command-group-title', guideGroupLabel(group));
        if (group === 'holiday' && isChristmasGuideDecorationSeason(now)) {
          const snowflake = el('span', 'guide-command-holiday-snow', '❄');
          snowflake.setAttribute('aria-hidden', 'true');
          groupTitle.append(snowflake);
        }
        groupSummary.append(groupTitle);
        groupSection.append(groupSummary);
        const list = el('div', 'guide-command-list');
        groupEntries.forEach((entry) => {
          const row = el('article', 'guide-command-row');
          const trigger = el('div', 'guide-command-triggers');
          const triggerLabel = state.language === 'en' ? entry.triggerEn : state.language === 'uk' ? entry.triggerUk : '';
          const primaryTrigger = el('code', 'guide-command-code', triggerLabel || guideTriggerText(entry.trigger));
          trigger.append(primaryTrigger);
          (entry.aliases || []).forEach((alias) => trigger.append(el('code', 'guide-command-code guide-command-alias', guideTriggerText(alias))));
          const description = el('div', 'guide-command-description');
          description.append(el('h4', 'guide-command-title', tr(entry.title)), el('p', 'guide-muted', tr(entry.description)));
          if (entry.condition) description.append(el('p', 'guide-command-condition', tr(entry.condition)));
          if (entry.example) {
            const example = el('p', 'guide-command-example');
            const exampleText = state.language === 'en' ? (entry.exampleEn || entry.example) : state.language === 'uk' ? (entry.exampleUk || entry.example) : entry.example;
            example.append(document.createTextNode(`${tr(entry.exampleLabel || 'guideExample')}: `), el('code', '', exampleText));
            description.append(example);
          }
          row.append(trigger, description);
          list.append(row);
        });
        groupSection.append(list);
        typeSection.append(groupSection);
      });
      if (id === 'addon') {
        typeSection.append(el('p', 'guide-command-condition', tr('guideClientPackPending')));
        typeSection.append(el('p', 'guide-command-condition', tr('guidePttNote')));
      }
      results.append(typeSection);
    });
  }

  function renderGuideConnection(panel, info) {
    const downloads = PRISM_DOWNLOADS;
    const sections = el('div', 'guide-sections');
    const downloadPanel = el('section', 'profile-panel guide-panel');
    downloadPanel.append(sectionHeading(tr('downloadTitle')));
    const platforms = el('div', 'guide-downloads');
    [['linux', 'linux'], ['macos', 'macos'], ['windows', 'windows']].forEach(([key, label]) => {
      const url = safeDownload(downloads[key]);
      const link = url ? el('a', 'button button-outline', tr(label)) : el('button', 'button button-outline', `${tr(label)} · ${tr('unavailable')}`);
      if (url) { link.href = url; link.rel = 'noopener'; }
      else link.disabled = true;
      platforms.append(link);
    });
    if (!Object.values(downloads).some((item) => safeDownload(item))) downloadPanel.append(el('p', 'guide-muted', tr('downloadsPending')));
    downloadPanel.append(platforms);
    const installPanel = el('section', 'profile-panel guide-panel guide-install-panel');
    installPanel.append(sectionHeading(tr('installationTitle')), el('p', 'guide-muted', tr('installationStep')));
    const connectPanel = el('section', 'profile-panel guide-panel');
    connectPanel.append(sectionHeading(tr('connectTitle')), el('p', 'guide-muted', tr('connectStep')));
    const address = el('code', 'guide-address', info.address || 'hazelwood.inne.space');
    const connectRow = el('div', 'guide-connect-row');
    connectRow.append(address);
    address.tabIndex = 0;
    const copyButton = el('button', 'button button-outline', tr('copy'));
    copyButton.type = 'button';
    copyButton.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(address.textContent); copyButton.textContent = tr('copied'); }
      catch (_error) {
        address.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(address);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
    connectRow.append(copyButton, el('p', 'guide-muted', tr('serverNameNote')));
    connectPanel.append(connectRow);
    sections.append(downloadPanel, installPanel, connectPanel);
    panel.replaceChildren(sections);
  }

  function activateGuideTab(name, updateHash = false, focus = false) {
    const tabName = name === 'commands' ? 'commands' : 'connect';
    state.guideTab = tabName;
    const root = $('#guide-content');
    if (!root) return;
    root.querySelectorAll('[role="tab"]').forEach((tab) => {
      const selected = tab.dataset.guideTab === tabName;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    root.querySelectorAll('[role="tabpanel"]').forEach((panel) => { panel.hidden = panel.id !== `guide-panel-${tabName}`; });
    if (updateHash && location.hash !== `#${tabName}`) {
      const url = new URL(location.href);
      url.hash = tabName;
      history.replaceState(history.state, '', url);
    }
  }

  function renderGuide(root) {
    const wrapper = el('div', 'guide-layout');
    const tablist = el('div', 'guide-tabs');
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', tr('guideTablist'));
    const panelConnect = el('section', 'guide-tabpanel');
    panelConnect.id = 'guide-panel-connect';
    panelConnect.setAttribute('role', 'tabpanel');
    panelConnect.setAttribute('aria-labelledby', 'guide-tab-connect');
    panelConnect.tabIndex = 0;
    const panelCommands = el('section', 'guide-tabpanel guide-commands-panel');
    panelCommands.id = 'guide-panel-commands';
    panelCommands.setAttribute('role', 'tabpanel');
    panelCommands.setAttribute('aria-labelledby', 'guide-tab-commands');
    panelCommands.tabIndex = 0;
    const makeTab = (name, label) => {
      const tab = el('button', 'guide-tab', tr(label));
      tab.type = 'button';
      tab.id = `guide-tab-${name}`;
      tab.dataset.guideTab = name;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `guide-panel-${name}`);
      tab.addEventListener('click', () => activateGuideTab(name, true));
      tab.addEventListener('keydown', (event) => {
        const tabs = [...tablist.querySelectorAll('[role="tab"]')];
        const index = tabs.indexOf(tab);
        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') nextIndex = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        activateGuideTab(tabs[nextIndex].dataset.guideTab, true, true);
      });
      return tab;
    };
    tablist.append(makeTab('connect', 'guideTabConnect'), makeTab('commands', 'guideTabCommands'));
    renderGuideConnection(panelConnect, state.guideInfo);
    const controlsNote = el('p', 'guide-muted guide-controls-note', tr('guideControlsNote'));
    const search = el('input', 'profile-text-input guide-command-search');
    search.type = 'search';
    search.autocomplete = 'off';
    search.placeholder = tr('guideSearchCommands');
    search.setAttribute('aria-label', tr('guideSearchCommands'));
    search.value = state.guideQuery;
    search.addEventListener('input', () => {
      state.guideQuery = search.value;
      renderGuideCatalog(results);
    });
    const results = el('div', 'guide-command-results');
    if (guideCommandCatalog.length > 8) panelCommands.append(search);
    panelCommands.append(controlsNote, results);
    renderGuideCatalog(results);
    wrapper.append(tablist, panelConnect, panelCommands);
    root.replaceChildren(wrapper);
    activateGuideTab(state.guideTab, false);
  }

  function initGuide() {
    const root = $('#guide-content');
    if (!root) return;
    applyPageLabels();
    if (!state.guideReady) {
      state.guideTab = location.hash === '#commands' ? 'commands' : 'connect';
      state.guideReady = true;
    }
    renderGuide(root);
    if (!state.guideLoadPromise) {
      state.guideLoadPromise = getJSON('/api/server-info').then((info) => {
        state.guideInfo = { address: 'hazelwood.inne.space', ...info, downloads: PRISM_DOWNLOADS };
        if (state.page === 'guide' && $('#guide-content') === root) {
          const connect = $('#guide-panel-connect', root);
          if (connect) renderGuideConnection(connect, state.guideInfo);
        }
      }).catch(() => { /* Keep the configured address when service info is unavailable. */ });
    }
  }

  function init(args) {
    if (!args || !args.page) return;
    state.page = args.page;
    state.user = args.user || null;
    if (args.page === 'profile') {
      state.target = args.target || '';
      state.isOwn = args.isOwn === true;
      profileTop();
      if (validNick(state.target)) loadProfileDetails();
      return;
    }
    if (args.page === 'players') initPlayers();
    if (args.page === 'guide') initGuide();
  }

  window.addEventListener('hazelwood:languagechange', (event) => {
    state.language = event.detail?.language || document.documentElement.lang || 'ru';
    if (state.page === 'profile') {
      profileTop();
      if (state.details) { renderMemberCard(state.details); renderDashboard(); }
      else if (state.error) profileError();
      else if (state.loading) profileLoading();
    } else if (state.page === 'players') { applyPageLabels(); drawDirectory($('#players-directory')); }
    else if (state.page === 'guide') initGuide();
  });

  window.HazelwoodProfilePages = { init };
  if (window.HazelwoodPendingAppInit) {
    window.HazelwoodProfilePages.init(window.HazelwoodPendingAppInit);
    window.HazelwoodPendingAppInit = null;
  }
})();
