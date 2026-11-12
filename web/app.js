(() => {
  'use strict';

  const API = '/api';
  const localeTags = { ru: 'ru-RU', uk: 'uk-UA', en: 'en-US' };
  const languageCodes = { ru: 'RU', uk: 'UK', en: 'EN' };
  const messages = {
    ru: {
      'page.title': 'Hazelwood — мир Minecraft', 'page.description': 'Hazelwood — игроки онлайн, BlueMap и карточки жителей закрытого Minecraft-сервера.',
      'skip': 'К содержимому', 'brand.home': 'Hazelwood — главная', 'nav.label': 'Основная навигация',
      'nav.server': 'Сервер', 'nav.map': 'Карта', 'nav.login': 'Войти', 'nav.account': 'Моя карточка',
      'nav.players': 'Игроки', 'nav.guide': 'Инструкция',
      'app.navLabel': 'Разделы профиля', 'app.settings': 'Настройки', 'app.playersTitle': 'Игроки', 'app.guideTitle': 'Инструкция', 'app.preferences': 'ПРЕДПОЧТЕНИЯ', 'app.loading': 'Загрузка профиля…',
      'settings.system': 'Как в системе', 'auth.inviteOnly': 'ПО ПРИГЛАШЕНИЮ', 'auth.loginTitle': 'Войти', 'auth.registerTitle': 'Регистрация',
      'account.inviteRule': 'Один код — одна регистрация.', 'map.title': 'КАРТА МИРА',
      'language.label': 'Язык сайта',
      'theme.dark': 'Тёмная', 'theme.light': 'Светлая', 'theme.switchToDark': 'Переключить на тёмную тему', 'theme.switchToLight': 'Переключить на светлую тему',
      'hero.title': 'Мир, который мы строим вместе.',
      'hero.intro': 'Строй свой дом, исследуй новые места и встречайся с друзьями в Minecraft.', 'hero.cta': 'Регистрация',
      'hero.registeredPlayers': 'Зарегистрировано игроков: {count}',
      'scene.carousel': 'Сцены мира Hazelwood', 'scene.previous': 'Предыдущая сцена', 'scene.next': 'Следующая сцена',
      'scene.pause': 'Поставить карусель на паузу', 'scene.resume': 'Продолжить карусель',
      'scene.dayControls': 'Дневные сцены', 'scene.nightControls': 'Ночные сцены',
      'scene.day1': 'Показать дневную сцену 1', 'scene.day2': 'Показать дневную сцену 2', 'scene.day3': 'Показать дневную сцену 3',
      'scene.night1': 'Показать ночную сцену 1', 'scene.night2': 'Показать ночную сцену 2', 'scene.night3': 'Показать ночную сцену 3',
      'world.eyebrow': 'МИР HAZELWOOD', 'world.title': 'Активность',
      'leaderboard.title': 'Рейтинг игроков',
      'leaderboard.rank': 'Место', 'leaderboard.player': 'Игрок', 'leaderboard.playtime': 'Время в игре', 'leaderboard.advancements': 'Достижения',
      'leaderboard.online': 'В сети', 'leaderboard.offline': 'Не в сети', 'leaderboard.statusUnknown': 'Статус недоступен',
      'leaderboard.loading': 'Загружаем рейтинг…', 'leaderboard.empty': 'Пока нет игроков для рейтинга.', 'leaderboard.error': 'Рейтинг сейчас недоступен.',
      'leaderboard.noData': 'Нет данных', 'leaderboard.hours': 'ч', 'leaderboard.lessThanHour': 'меньше 1 ч',
      'server.kicker': 'СЕРВЕР · JAVA', 'server.title': 'Состояние сервера', 'server.loading': 'Проверяем', 'server.offline': 'Недоступен', 'server.offlineMessage': 'Сервер сейчас недоступен.', 'server.online': 'В сети', 'server.quiet': 'Сейчас тихо',
      'server.playersLabel': 'игроков\nв мире', 'server.playersUnavailable': 'Список недоступен.', 'server.playersEmpty': 'Игроков нет.', 'server.onlineList': 'Игроки онлайн',
      'map.iframeTitle': 'Интерактивная карта мира Hazelwood', 'map.previewTitle': 'Снимок карты мира Hazelwood',
      'map.previewUnavailable': 'Снимок карты недоступен', 'map.modalTitle': 'Hazelwood · интерактивная карта', 'map.close': 'Закрыть карту',
      'account.title': 'Вход',
      'account.tabsLabel': 'Действия с аккаунтом', 'account.loginTab': 'Войти', 'account.registerTab': 'Регистрация', 'account.nickname': 'Игровой ник', 'account.nicknamePlaceholder': 'Твой ник в Minecraft',
      'account.password': 'Пароль', 'account.passwordHint': 'От 12 символов.', 'account.inviteCode': 'Код приглашения', 'account.loginSubmit': 'Продолжить', 'account.registerSubmit': 'Создать',
      'member.title': 'Житель Hazelwood', 'member.logout': 'Выйти', 'member.openMap': 'Открыть интерактивную карту',
      'admin.eyebrow': 'УПРАВЛЕНИЕ', 'admin.title': 'Администрирование', 'admin.badge': 'АДМИН', 'admin.inviteTitle': 'Приглашения', 'admin.inviteMeta': 'ОДНОРАЗОВЫЙ · ПОКАЗ ОДИН РАЗ',
      'admin.inviteButton': 'Создать код', 'admin.copy': 'Копировать',
      'admin.playersTitle': 'Игроки', 'admin.searchLabel': 'Поиск игрока', 'admin.searchPlaceholder': 'Ник игрока', 'admin.searchButton': 'Найти', 'admin.playersHint': 'Введите ник для поиска.',
      'footer': 'JAVA EDITION · 26.3',
      'theme.label': 'Переключить тему оформления', 'auth.busyLogin': 'Входим…', 'auth.busyRegister': 'Создаём…', 'auth.loginFallback': 'Вход выполнен. Обнови страницу, если карточка не появилась.',
      'auth.registerFallback': 'Карточка создана, но не удалось открыть профиль. Войди в аккаунт.', 'auth.loggedOut': 'Ты вышел из аккаунта.',
      'profile.player': 'Игрок', 'profile.admin': 'Администратор Hazelwood', 'profile.resident': 'Житель Hazelwood', 'profile.inWorld': 'Сейчас в мире', 'profile.notPlaying': 'Не в игре',
      'profile.joined': 'В Hazelwood с', 'profile.lastVisit': 'Последний визит', 'profile.loading': 'Загружаем карточку игрока…', 'profile.notFound': 'Игрок с таким ником не найден.',
      'admin.inviteCreating': 'Создаём код…', 'admin.inviteCreated': 'Код создан. Сохрани его до передачи игроку.', 'admin.inviteMissing': 'Сервис не вернул код приглашения.',
      'admin.inviteCopied': 'Код скопирован. Сохрани его — он одноразовый.', 'admin.inviteManual': 'Выделил код. Скопируй его вручную.', 'admin.inviteCopyDone': 'Скопировано',
      'admin.playersLoading': 'Загружаем список игроков…', 'admin.playersNotFound': 'Игроки не найдены. Проверь ник или попробуй другой запрос.', 'admin.adminRole': 'Администратор',
      'admin.playerJoined': 'В Hazelwood с {date}', 'admin.playerBanned': 'Заблокирован', 'admin.playerActive': 'Активен', 'admin.unban': 'Снять бан', 'admin.banReason': 'Причина блокировки',
      'admin.banReasonFor': 'Причина блокировки игрока {username}', 'admin.ban': 'Забанить', 'admin.reasonRequired': 'Укажи причину блокировки.',
      'admin.bannedToast': '{username} заблокирован.', 'admin.unbannedToast': 'Блокировка {username} снята.',
      'error.generic': 'Не удалось выполнить запрос. Попробуй ещё раз.', 'error.authRequired': 'Нужно войти в аккаунт.', 'error.adminRequired': 'Недостаточно прав для этого действия.',
      'error.invalidNickname': 'Игровой ник должен содержать от 3 до 16 латинских букв, цифр или подчёркиваний.', 'error.invalidPassword': 'Пароль должен содержать от 12 до 1024 байт.',
      'error.invalidInvite': 'Неверный код приглашения.', 'error.usedInvite': 'Код приглашения недействителен или уже использован.', 'error.nicknameTaken': 'Этот ник уже зарегистрирован.',
      'error.invalidCredentials': 'Проверь игровой ник и пароль.', 'error.wrongPassword': 'Неверный игровой ник или пароль.', 'error.banned': 'Этот аккаунт заблокирован.',
      'error.accountCreate': 'Не удалось создать аккаунт.', 'error.accountCreated': 'Аккаунт создан. Войди, чтобы продолжить.', 'error.signIn': 'Не удалось войти.',
      'error.invalidJson': 'Не удалось обработать запрос.', 'error.invalidPlayer': 'Некорректный игровой ник.', 'error.playerMissing': 'Игрок не найден.', 'error.profileLoad': 'Не удалось загрузить карточку игрока.',
      'error.adminPlayersLoad': 'Не удалось загрузить список игроков.', 'error.searchNickname': 'Укажи часть игрового ника для поиска.', 'error.inviteCreate': 'Не удалось создать приглашение.',
      'error.banReasonLong': 'Причина блокировки не должна превышать 200 символов.', 'error.banReasonChars': 'В причине блокировки есть недопустимые символы.', 'error.banPlayer': 'Не удалось заблокировать игрока.',
      'error.unbanPlayer': 'Не удалось снять блокировку.', 'error.minecraftUnavailable': 'Сервер Minecraft сейчас недоступен.', 'error.banSync': 'Игрок заблокирован на сервере, но не удалось обновить карточку.',
      'error.unbanSync': 'Блокировка снята на сервере, но не удалось обновить карточку.', 'error.origin': 'Запрос отклонён: неверный источник.',
    },
    uk: {
      'page.title': 'Hazelwood — світ Minecraft', 'page.description': 'Hazelwood — гравці онлайн, BlueMap і картки мешканців закритого сервера Minecraft.',
      'skip': 'До вмісту', 'brand.home': 'Hazelwood — головна', 'nav.label': 'Основна навігація',
      'nav.server': 'Сервер', 'nav.map': 'Мапа', 'nav.login': 'Увійти', 'nav.account': 'Моя картка',
      'nav.players': 'Гравці', 'nav.guide': 'Інструкція',
      'app.navLabel': 'Розділи профілю', 'app.settings': 'Налаштування', 'app.playersTitle': 'Гравці', 'app.guideTitle': 'Інструкція', 'app.preferences': 'НАЛАШТУВАННЯ', 'app.loading': 'Завантажуємо профіль…',
      'settings.system': 'Як у системі', 'auth.inviteOnly': 'ЗА ЗАПРОШЕННЯМ', 'auth.loginTitle': 'Увійти', 'auth.registerTitle': 'Реєстрація',
      'account.inviteRule': 'Один код — одна реєстрація.', 'map.title': 'МАПА СВІТУ',
      'language.label': 'Мова сайту',
      'theme.dark': 'Темна', 'theme.light': 'Світла', 'theme.switchToDark': 'Перемкнути на темну тему', 'theme.switchToLight': 'Перемкнути на світлу тему',
      'hero.title': 'Світ, який ми будуємо разом.',
      'hero.intro': 'Будуй власну оселю, відкривай нові місця та зустрічайся з друзями у Minecraft.', 'hero.cta': 'Реєстрація',
      'hero.registeredPlayers': 'Зареєстровано гравців: {count}',
      'scene.carousel': 'Сцени світу Hazelwood', 'scene.previous': 'Попередня сцена', 'scene.next': 'Наступна сцена',
      'scene.pause': 'Призупинити карусель', 'scene.resume': 'Продовжити карусель',
      'scene.dayControls': 'Денні сцени', 'scene.nightControls': 'Нічні сцени',
      'scene.day1': 'Показати денну сцену 1', 'scene.day2': 'Показати денну сцену 2', 'scene.day3': 'Показати денну сцену 3',
      'scene.night1': 'Показати нічну сцену 1', 'scene.night2': 'Показати нічну сцену 2', 'scene.night3': 'Показати нічну сцену 3',
      'world.eyebrow': 'СВІТ HAZELWOOD', 'world.title': 'Активність',
      'leaderboard.title': 'Рейтинг гравців',
      'leaderboard.rank': 'Місце', 'leaderboard.player': 'Гравець', 'leaderboard.playtime': 'Час у грі', 'leaderboard.advancements': 'Досягнення',
      'leaderboard.online': 'У мережі', 'leaderboard.offline': 'Не у грі', 'leaderboard.statusUnknown': 'Статус недоступний',
      'leaderboard.loading': 'Завантажуємо рейтинг…', 'leaderboard.empty': 'Поки немає гравців для рейтингу.', 'leaderboard.error': 'Рейтинг зараз недоступний.',
      'leaderboard.noData': 'Немає даних', 'leaderboard.hours': 'год', 'leaderboard.lessThanHour': 'менше 1 год',
      'server.kicker': 'СЕРВЕР · JAVA', 'server.title': 'Стан сервера', 'server.loading': 'Перевіряємо', 'server.offline': 'Недоступний', 'server.offlineMessage': 'Сервер зараз недоступний.', 'server.online': 'У мережі', 'server.quiet': 'Зараз тихо',
      'server.playersLabel': 'гравців\nу світі', 'server.playersUnavailable': 'Список недоступний.', 'server.playersEmpty': 'Гравців немає.', 'server.onlineList': 'Гравці онлайн',
      'map.iframeTitle': 'Інтерактивна мапа світу Hazelwood', 'map.previewTitle': 'Знімок мапи світу Hazelwood',
      'map.previewUnavailable': 'Знімок мапи недоступний', 'map.modalTitle': 'Hazelwood · інтерактивна мапа', 'map.close': 'Закрити мапу',
      'account.title': 'Вхід',
      'account.tabsLabel': 'Дії з обліковим записом', 'account.loginTab': 'Увійти', 'account.registerTab': 'Реєстрація', 'account.nickname': 'Ігровий нік', 'account.nicknamePlaceholder': 'Твій нік у Minecraft',
      'account.password': 'Пароль', 'account.passwordHint': 'Від 12 символів.', 'account.inviteCode': 'Код запрошення', 'account.loginSubmit': 'Продовжити', 'account.registerSubmit': 'Створити',
      'member.title': 'Мешканець Hazelwood', 'member.logout': 'Вийти', 'member.openMap': 'Відкрити інтерактивну мапу',
      'admin.eyebrow': 'КЕРУВАННЯ', 'admin.title': 'Адміністрування', 'admin.badge': 'АДМІН', 'admin.inviteTitle': 'Запрошення', 'admin.inviteMeta': 'ОДНОРАЗОВИЙ · ПОКАЗ ОДИН РАЗ',
      'admin.inviteButton': 'Створити код', 'admin.copy': 'Копіювати',
      'admin.playersTitle': 'Гравці', 'admin.searchLabel': 'Пошук гравця', 'admin.searchPlaceholder': 'Нік гравця', 'admin.searchButton': 'Знайти', 'admin.playersHint': 'Введи нік для пошуку.',
      'footer': 'JAVA EDITION · 26.3',
      'theme.label': 'Перемкнути оформлення', 'auth.busyLogin': 'Входимо…', 'auth.busyRegister': 'Створюємо…', 'auth.loginFallback': 'Вхід виконано. Онови сторінку, якщо картка не з’явилася.',
      'auth.registerFallback': 'Картку створено, але не вдалося відкрити профіль. Увійди до облікового запису.', 'auth.loggedOut': 'Ти вийшов з облікового запису.',
      'profile.player': 'Гравець', 'profile.admin': 'Адміністратор Hazelwood', 'profile.resident': 'Мешканець Hazelwood', 'profile.inWorld': 'Зараз у світі', 'profile.notPlaying': 'Не у грі',
      'profile.joined': 'У Hazelwood з', 'profile.lastVisit': 'Останній візит', 'profile.loading': 'Завантажуємо картку гравця…', 'profile.notFound': 'Гравця з таким ніком не знайдено.',
      'admin.inviteCreating': 'Створюємо код…', 'admin.inviteCreated': 'Код створено. Збережи його, перш ніж передати гравцеві.', 'admin.inviteMissing': 'Сервіс не повернув код запрошення.',
      'admin.inviteCopied': 'Код скопійовано. Збережи його — він одноразовий.', 'admin.inviteManual': 'Код виділено. Скопіюй його вручну.', 'admin.inviteCopyDone': 'Скопійовано',
      'admin.playersLoading': 'Завантажуємо список гравців…', 'admin.playersNotFound': 'Гравців не знайдено. Перевір нік або спробуй інший запит.', 'admin.adminRole': 'Адміністратор',
      'admin.playerJoined': 'У Hazelwood з {date}', 'admin.playerBanned': 'Заблокований', 'admin.playerActive': 'Активний', 'admin.unban': 'Зняти бан', 'admin.banReason': 'Причина блокування',
      'admin.banReasonFor': 'Причина блокування гравця {username}', 'admin.ban': 'Забанити', 'admin.reasonRequired': 'Вкажи причину блокування.',
      'admin.bannedToast': '{username} заблоковано.', 'admin.unbannedToast': 'Блокування {username} знято.',
      'error.generic': 'Не вдалося виконати запит. Спробуй ще раз.', 'error.authRequired': 'Потрібно увійти до облікового запису.', 'error.adminRequired': 'Недостатньо прав для цієї дії.',
      'error.invalidNickname': 'Ігровий нік має містити від 3 до 16 латинських літер, цифр або підкреслень.', 'error.invalidPassword': 'Пароль має містити від 12 до 1024 байтів.',
      'error.invalidInvite': 'Неправильний код запрошення.', 'error.usedInvite': 'Код запрошення недійсний або вже використаний.', 'error.nicknameTaken': 'Цей нік уже зареєстровано.',
      'error.invalidCredentials': 'Перевір ігровий нік і пароль.', 'error.wrongPassword': 'Неправильний ігровий нік або пароль.', 'error.banned': 'Цей обліковий запис заблоковано.',
      'error.accountCreate': 'Не вдалося створити обліковий запис.', 'error.accountCreated': 'Обліковий запис створено. Увійди, щоб продовжити.', 'error.signIn': 'Не вдалося увійти.',
      'error.invalidJson': 'Не вдалося обробити запит.', 'error.invalidPlayer': 'Некоректний ігровий нік.', 'error.playerMissing': 'Гравця не знайдено.', 'error.profileLoad': 'Не вдалося завантажити картку гравця.',
      'error.adminPlayersLoad': 'Не вдалося завантажити список гравців.', 'error.searchNickname': 'Вкажи частину ігрового ніку для пошуку.', 'error.inviteCreate': 'Не вдалося створити запрошення.',
      'error.banReasonLong': 'Причина блокування не має перевищувати 200 символів.', 'error.banReasonChars': 'Причина блокування містить неприпустимі символи.', 'error.banPlayer': 'Не вдалося заблокувати гравця.',
      'error.unbanPlayer': 'Не вдалося зняти блокування.', 'error.minecraftUnavailable': 'Сервер Minecraft зараз недоступний.', 'error.banSync': 'Гравця заблоковано на сервері, але картку не вдалося оновити.',
      'error.unbanSync': 'Блокування знято на сервері, але картку не вдалося оновити.', 'error.origin': 'Запит відхилено: неправильне джерело.',
    },
    en: {
      'page.title': 'Hazelwood — Minecraft world', 'page.description': 'Hazelwood: players online, BlueMap, and resident cards for a private Minecraft server.',
      'skip': 'Skip to content', 'brand.home': 'Hazelwood — home', 'nav.label': 'Main navigation',
      'nav.server': 'Server', 'nav.map': 'Map', 'nav.login': 'Sign in', 'nav.account': 'My profile',
      'nav.players': 'Players', 'nav.guide': 'Guide',
      'app.navLabel': 'Profile sections', 'app.settings': 'Settings', 'app.playersTitle': 'Players', 'app.guideTitle': 'Guide', 'app.preferences': 'PREFERENCES', 'app.loading': 'Loading profile…',
      'settings.system': 'Use system setting', 'auth.inviteOnly': 'INVITE ONLY', 'auth.loginTitle': 'Sign in', 'auth.registerTitle': 'Register',
      'account.inviteRule': 'One code — one registration.', 'map.title': 'WORLD MAP',
      'language.label': 'Site language',
      'theme.dark': 'Dark', 'theme.light': 'Light', 'theme.switchToDark': 'Switch to dark theme', 'theme.switchToLight': 'Switch to light theme',
      'hero.title': 'A world we build together.',
      'hero.intro': 'Build a home, explore new places, and meet friends in Minecraft.', 'hero.cta': 'Register',
      'hero.registeredPlayers': 'Registered players: {count}',
      'scene.carousel': 'Hazelwood world scenes', 'scene.previous': 'Previous scene', 'scene.next': 'Next scene',
      'scene.pause': 'Pause carousel', 'scene.resume': 'Resume carousel',
      'scene.dayControls': 'Day scenes', 'scene.nightControls': 'Night scenes',
      'scene.day1': 'Show day scene 1', 'scene.day2': 'Show day scene 2', 'scene.day3': 'Show day scene 3',
      'scene.night1': 'Show night scene 1', 'scene.night2': 'Show night scene 2', 'scene.night3': 'Show night scene 3',
      'world.eyebrow': 'HAZELWOOD WORLD', 'world.title': 'Activity',
      'leaderboard.title': 'Player leaderboard',
      'leaderboard.rank': 'Rank', 'leaderboard.player': 'Player', 'leaderboard.playtime': 'Playtime', 'leaderboard.advancements': 'Advancements',
      'leaderboard.online': 'Online', 'leaderboard.offline': 'Offline', 'leaderboard.statusUnknown': 'Status unavailable',
      'leaderboard.loading': 'Loading player stats…', 'leaderboard.empty': 'No players to rank yet.', 'leaderboard.error': 'Leaderboard is unavailable right now.',
      'leaderboard.noData': 'No data', 'leaderboard.hours': 'h', 'leaderboard.lessThanHour': 'under 1 h',
      'server.kicker': 'SERVER · JAVA', 'server.title': 'Server status', 'server.loading': 'Checking', 'server.offline': 'Unavailable', 'server.offlineMessage': 'The server is currently unavailable.', 'server.online': 'Online', 'server.quiet': 'Quiet now',
      'server.playersLabel': 'players\nin the world', 'server.playersUnavailable': 'List unavailable.', 'server.playersEmpty': 'No players online.', 'server.onlineList': 'Players online',
      'map.iframeTitle': 'Interactive Hazelwood world map', 'map.previewTitle': 'Hazelwood world map preview',
      'map.previewUnavailable': 'Map preview unavailable', 'map.modalTitle': 'Hazelwood · interactive map', 'map.close': 'Close map',
      'account.title': 'Sign in',
      'account.tabsLabel': 'Account actions', 'account.loginTab': 'Sign in', 'account.registerTab': 'Register', 'account.nickname': 'Minecraft username', 'account.nicknamePlaceholder': 'Your Minecraft username',
      'account.password': 'Password', 'account.passwordHint': '12 characters min.', 'account.inviteCode': 'Invitation code', 'account.loginSubmit': 'Continue', 'account.registerSubmit': 'Create',
      'member.title': 'Hazelwood resident', 'member.logout': 'Sign out', 'member.openMap': 'Open interactive map',
      'admin.eyebrow': 'CONTROL', 'admin.title': 'Administration', 'admin.badge': 'ADMIN', 'admin.inviteTitle': 'Invitations', 'admin.inviteMeta': 'ONE USE · SHOWN ONCE',
      'admin.inviteButton': 'Create code', 'admin.copy': 'Copy',
      'admin.playersTitle': 'Players', 'admin.searchLabel': 'Find a player', 'admin.searchPlaceholder': 'Player name', 'admin.searchButton': 'Search', 'admin.playersHint': 'Enter a username to search.',
      'footer': 'JAVA EDITION · 26.3',
      'theme.label': 'Switch appearance', 'auth.busyLogin': 'Signing in…', 'auth.busyRegister': 'Creating…', 'auth.loginFallback': 'Signed in. Refresh the page if your profile does not appear.',
      'auth.registerFallback': 'The card was created, but the profile did not open. Sign in to continue.', 'auth.loggedOut': 'You have signed out.',
      'profile.player': 'Player', 'profile.admin': 'Hazelwood admin', 'profile.resident': 'Hazelwood resident', 'profile.inWorld': 'In the world now', 'profile.notPlaying': 'Not in game',
      'profile.joined': 'In Hazelwood since', 'profile.lastVisit': 'Last visit', 'profile.loading': 'Loading player card…', 'profile.notFound': 'No player found with that username.',
      'admin.inviteCreating': 'Creating code…', 'admin.inviteCreated': 'Code created. Save it before sharing it with a player.', 'admin.inviteMissing': 'The service did not return an invitation code.',
      'admin.inviteCopied': 'Code copied. Save it — it can only be used once.', 'admin.inviteManual': 'Code selected. Copy it manually.', 'admin.inviteCopyDone': 'Copied',
      'admin.playersLoading': 'Loading player list…', 'admin.playersNotFound': 'No players found. Check the username or try another search.', 'admin.adminRole': 'Administrator',
      'admin.playerJoined': 'In Hazelwood since {date}', 'admin.playerBanned': 'Banned', 'admin.playerActive': 'Active', 'admin.unban': 'Unban', 'admin.banReason': 'Ban reason',
      'admin.banReasonFor': 'Ban reason for player {username}', 'admin.ban': 'Ban', 'admin.reasonRequired': 'Enter a ban reason.',
      'admin.bannedToast': '{username} has been banned.', 'admin.unbannedToast': '{username} has been unbanned.',
      'error.generic': 'The request failed. Please try again.', 'error.authRequired': 'Sign in to continue.', 'error.adminRequired': 'You do not have permission to do that.',
      'error.invalidNickname': 'Username must be 3–16 characters using Latin letters, numbers, or underscores.', 'error.invalidPassword': 'Password must be 12–1024 bytes.',
      'error.invalidInvite': 'Invalid invitation code.', 'error.usedInvite': 'This invitation code is invalid or has already been used.', 'error.nicknameTaken': 'That username is already registered.',
      'error.invalidCredentials': 'Check your Minecraft username and password.', 'error.wrongPassword': 'Incorrect Minecraft username or password.', 'error.banned': 'This account has been banned.',
      'error.accountCreate': 'Could not create the account.', 'error.accountCreated': 'Account created. Sign in to continue.', 'error.signIn': 'Could not sign in.',
      'error.invalidJson': 'Could not process the request.', 'error.invalidPlayer': 'Invalid Minecraft username.', 'error.playerMissing': 'Player not found.', 'error.profileLoad': 'Could not load the player card.',
      'error.adminPlayersLoad': 'Could not load the player list.', 'error.searchNickname': 'Enter part of a Minecraft username to search.', 'error.inviteCreate': 'Could not create the invitation.',
      'error.banReasonLong': 'Ban reason must be 200 characters or fewer.', 'error.banReasonChars': 'Ban reason contains invalid characters.', 'error.banPlayer': 'Could not ban the player.',
      'error.unbanPlayer': 'Could not unban the player.', 'error.minecraftUnavailable': 'The Minecraft server is unavailable right now.', 'error.banSync': 'The player was banned on the server, but the profile could not be updated.',
      'error.unbanSync': 'The player was unbanned on the server, but the profile could not be updated.', 'error.origin': 'Request rejected: invalid origin.',
    },
  };
  const apiErrorKeys = {
    'nickname must be 3-16 letters, digits, or underscores': 'error.invalidNickname',
    'password must be 12-1024 bytes': 'error.invalidPassword',
    'invalid invitation code': 'error.invalidInvite',
    'invitation code is invalid or already used': 'error.usedInvite',
    'nickname already registered': 'error.nicknameTaken',
    'invalid credentials': 'error.invalidCredentials',
    'invalid nickname or password': 'error.wrongPassword',
    'account is banned': 'error.banned',
    'could not create account': 'error.accountCreate',
    'account created; sign in to continue': 'error.accountCreated',
    'could not sign in': 'error.signIn',
    'invalid JSON request': 'error.invalidJson',
    'invalid Minecraft nickname': 'error.invalidPlayer',
    'player not found': 'error.playerMissing',
    'could not load player profile': 'error.profileLoad',
    'search must be a partial Minecraft nickname': 'error.searchNickname',
    'could not load players': 'error.adminPlayersLoad',
    'could not create invitation': 'error.inviteCreate',
    'ban reason must be at most 200 characters': 'error.banReasonLong',
    'ban reason contains invalid characters': 'error.banReasonChars',
    'could not ban player': 'error.banPlayer',
    'could not unban player': 'error.unbanPlayer',
    'Minecraft server is unavailable': 'error.minecraftUnavailable',
    'player banned on server; profile update failed': 'error.banSync',
    'player unbanned on server; profile update failed': 'error.unbanSync',
    'admin access required': 'error.adminRequired',
    'authentication required': 'error.authRequired',
    'invalid request origin': 'error.origin',
  };
  let heroCarouselController = null;
  const onlinePlayerNodes = new Map();
  const state = {
    user: null,
    inviteCode: null,
    adminSearch: '',
    adminPlayers: null,
    adminError: null,
    adminLoading: false,
    inviteMessageKey: '',
    inviteError: null,
    inviteCopied: false,
    authError: null,
    authMessageKey: null,
    lastStatus: null,
    profileData: null,
    profileError: null,
    profileLoading: false,
    language: 'ru',
    themeExplicit: false,
    toastTimer: null,
    toastSource: null,
    statusTimer: null,
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };

  function createPlayerHead(username, variant) {
    const frame = el('span', `player-head-frame ${variant}`);
    frame.setAttribute('aria-hidden', 'true');
    const fallback = el('span', 'player-head-glyph', username.slice(0, 1).toUpperCase());
    fallback.hidden = true;
    const head = el('img', 'player-head-image');
    head.alt = '';
    head.loading = 'eager';
    head.decoding = 'async';
    head.referrerPolicy = 'no-referrer';
    head.hidden = true;
    head.addEventListener('load', () => {
      fallback.hidden = true;
      head.hidden = false;
    }, { once: true });
    const source = `/api/players/${encodeURIComponent(username)}/head.png`;
    head.addEventListener('error', () => {
      fetch(source, { method: 'HEAD', cache: 'no-store', credentials: 'same-origin' })
        .then((response) => {
          if (response.status === 404) fallback.hidden = false;
        })
        .catch(() => {});
    }, { once: true });
    head.src = source;
    frame.append(fallback, head);
    return frame;
  }

  function t(key, values = {}) {
    const template = messages[state.language]?.[key] || messages.ru[key] || key;
    return String(template).replace(/\{(\w+)\}/g, (_match, name) => String(values[name] ?? ''));
  }

  function localizeError(error) {
    const message = typeof error === 'string' ? error : error && error.message;
    const key = error && error.translationKey || apiErrorKeys[message];
    if (key) return t(key);
    return state.language === 'en' && message ? message : t('error.generic');
  }

  function applyStaticTranslations() {
    const page = document.body.dataset.page;
    if (page === 'auth') {
      const mode = $('#auth-form')?.dataset.authMode === 'register' ? 'auth.registerTitle' : 'auth.loginTitle';
      document.title = `${t(mode)} — Hazelwood`;
    } else if (page === 'app') {
      const route = location.pathname.match(/^\/app\/(profile|world|map|settings|admin|players|guide)\/?$/);
      const titleKey = { profile: 'member.title', world: 'world.title', map: 'map.modalTitle', settings: 'app.settings', admin: 'admin.title', players: 'app.playersTitle', guide: 'app.guideTitle' }[route?.[1]] || 'member.title';
      document.title = `${t(titleKey)} — Hazelwood`;
    } else {
      document.title = t('page.title');
    }
    $('#page-description')?.setAttribute('content', t('page.description'));
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((node) => {
      node.setAttribute('aria-label', t(node.dataset.i18nAria));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder));
    });
    document.querySelectorAll('[data-i18n-title]').forEach((node) => {
      node.setAttribute('title', t(node.dataset.i18nTitle));
    });
    document.querySelectorAll('button[data-busy-key]').forEach((button) => {
      const label = $('span:first-child', button);
      if (label) {
        button.dataset.idleLabel = t(label.dataset.i18n || '');
        label.textContent = t(button.dataset.busyKey);
      }
    });
    if (!state.lastStatus && $('#server-state-text')) $('#server-state-text').textContent = t('server.loading');
    syncSettingsControls();
  }

  function syncSettingsControls() {
    const themeValue = state.themeExplicit ? (document.documentElement.dataset.theme || 'light') : 'system';
    const values = { theme: themeValue, language: state.language };
    Object.entries(values).forEach(([name, value]) => {
      const control = $(`[data-settings-select="${name}"]`);
      if (!control) return;
      const options = [...control.querySelectorAll('[role="option"]')];
      const selected = options.find((option) => option.dataset.value === value);
      if (!selected) return;
      control.querySelector('[data-settings-selected]').textContent = selected.textContent;
      options.forEach((option) => option.setAttribute('aria-selected', String(option === selected)));
    });
  }

  function syncLanguageControl() {
    const code = $('[data-language-code]');
    if (code) code.textContent = languageCodes[state.language];
    $('#language-menu')?.querySelectorAll('[data-language]').forEach((option) => {
      option.setAttribute('aria-selected', String(option.dataset.language === state.language));
    });
  }

  function closeLanguageMenu(returnFocus = false) {
    const trigger = $('#language-trigger');
    const menu = $('#language-menu');
    if (menu.hidden) return;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  }

  function openLanguageMenu(position = 'selected') {
    const trigger = $('#language-trigger');
    const menu = $('#language-menu');
    const options = [...menu.querySelectorAll('[role="option"]')];
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    const option = position === 'first' ? options[0]
      : position === 'last' ? options[options.length - 1]
        : options.find((item) => item.dataset.language === state.language);
    option?.focus();
  }

  function moveLanguageOption(current, direction) {
    const options = [...$('#language-menu').querySelectorAll('[role="option"]')];
    const index = options.indexOf(current);
    options[(index + direction + options.length) % options.length].focus();
  }

  function setLanguage(language, persist = false) {
    state.language = Object.hasOwn(messages, language) ? language : 'ru';
    document.documentElement.lang = state.language;
    syncLanguageControl();
    applyStaticTranslations();
    window.dispatchEvent(new CustomEvent('hazelwood:languagechange', { detail: { language: state.language } }));
    setTheme(document.documentElement.dataset.theme || 'light');
    if (state.lastStatus && $('#server-state')) renderStatus(state.lastStatus);
    else if (persist && $('#server-state')) refreshStatus();
    if (state.lastLeaderboard && $('#leaderboard-rows')) renderLeaderboard(state.lastLeaderboard);
    else if (state.leaderboardError && $('#leaderboard-state')) showLeaderboardMessage('leaderboard.error');
    const profileRoot = $('#member-profile');
    if (profileRoot && state.user) {
      if (state.profileLoading) profileRoot.replaceChildren(el('p', 'inline-message', t('profile.loading')));
      else if (state.profileError) profileRoot.replaceChildren(el('p', `inline-message${state.profileError.status === 404 ? '' : ' is-error'}`, state.profileError.status === 404 ? t('profile.notFound') : localizeError(state.profileError)));
      else if (state.profileData) renderProfile(state.profileData, profileRoot, true);
    }
    const adminPanel = $('#admin-panel');
    if (adminPanel && !adminPanel.hidden) {
      const target = $('#admin-players');
      if (state.adminLoading) target.replaceChildren(el('p', 'admin-message', t('admin.playersLoading')));
      else if (state.adminError) target.replaceChildren(el('p', 'admin-message is-error', localizeError(state.adminError)));
      else if (state.adminPlayers) renderAdminPlayers(state.adminPlayers);
      else target.replaceChildren(el('p', 'admin-message', t('admin.playersHint')));
    }
    const authMessage = $('#auth-message');
    if (authMessage && !authMessage.hidden && state.authMessageKey) setMessage(authMessage, t(state.authMessageKey), state.authError !== null);
    else if (authMessage && state.authError && !authMessage.hidden) setMessage(authMessage, localizeError(state.authError), true);
    const inviteMessage = $('#invite-message');
    if (inviteMessage && state.inviteError) inviteMessage.textContent = localizeError(state.inviteError);
    else if (inviteMessage && state.inviteMessageKey) inviteMessage.textContent = t(state.inviteMessageKey);
    const copyInviteButton = $('#copy-invite');
    if (copyInviteButton) copyInviteButton.textContent = t(state.inviteCopied ? 'admin.inviteCopyDone' : 'admin.copy');
    const toast = $('#toast');
    if (toast && !toast.hidden && state.toastSource) {
      const source = state.toastSource;
      toast.textContent = source instanceof Error ? localizeError(source) : t(source.key, source.values);
    }
    if (persist) {
      try { localStorage.setItem('hazelwood-language', state.language); } catch (_error) { /* Storage can be disabled. */ }
    }
  }

  function initLanguage() {
    let saved = null;
    try {
      const value = localStorage.getItem('hazelwood-language');
      if (Object.hasOwn(messages, value)) saved = value;
    } catch (_error) { /* Fall back to the browser language. */ }
    const browserLanguage = (navigator.language || '').toLowerCase().split('-')[0];
    setLanguage(saved || (browserLanguage === 'uk' || browserLanguage === 'en' ? browserLanguage : 'ru'));
    const control = $('#language-control');
    const trigger = $('#language-trigger');
    const menu = $('#language-menu');
    trigger.addEventListener('click', () => {
      if (menu.hidden) openLanguageMenu();
      else closeLanguageMenu();
    });
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        openLanguageMenu();
      } else if (event.key === 'Home') {
        event.preventDefault();
        openLanguageMenu('first');
      } else if (event.key === 'End') {
        event.preventDefault();
        openLanguageMenu('last');
      } else if (event.key === 'Escape') {
        closeLanguageMenu(true);
      }
    });
    menu.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        moveLanguageOption(event.target.closest('[role="option"]'), event.key === 'ArrowDown' ? 1 : -1);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        const options = menu.querySelectorAll('[role="option"]');
        options[event.key === 'Home' ? 0 : options.length - 1].focus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closeLanguageMenu(true);
      }
    });
    menu.addEventListener('click', (event) => {
      const option = event.target.closest('[data-language]');
      if (!option) return;
      setLanguage(option.dataset.language, true);
      closeLanguageMenu(true);
    });
    control.addEventListener('focusout', (event) => {
      if (!control.contains(event.relatedTarget)) closeLanguageMenu();
    });
    document.addEventListener('pointerdown', (event) => {
      if (!control.contains(event.target)) closeLanguageMenu();
    });
  }

  class ApiError extends Error {
    constructor(message, status, translationKey = null) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.translationKey = translationKey;
    }
  }

  async function api(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      credentials: 'same-origin',
      headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      ...options,
    });
    let payload = null;
    try {
      payload = await response.json();
    } catch (_error) {
      payload = null;
    }
    if (!response.ok) {
      if (payload && typeof payload.error === 'string') throw new ApiError(payload.error, response.status);
      const translationKey = response.status === 401 ? 'error.authRequired' : response.status === 403 ? 'error.adminRequired' : 'error.generic';
      throw new ApiError(t(translationKey), response.status, translationKey);
    }
    return payload;
  }

  function showToast(message, source = null) {
    const toast = $('#toast');
    state.toastSource = source;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => { toast.hidden = true; state.toastSource = null; }, 3600);
  }

  function setTheme(theme, persist = false) {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    if (heroCarouselController) heroCarouselController.setTheme(dark ? 'night' : 'day');
    const toggle = $('#theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', t(dark ? 'theme.switchToLight' : 'theme.switchToDark'));
    }
    const label = $('#theme-label');
    if (label) label.textContent = t(dark ? 'theme.light' : 'theme.dark');
    if (persist) {
      state.themeExplicit = true;
      try { localStorage.setItem('hazelwood-theme', dark ? 'dark' : 'light'); } catch (_error) { /* Storage can be disabled. */ }
    }
    syncSettingsControls();
  }

  function initTheme() {
    let savedTheme = null;
    try {
      const saved = localStorage.getItem('hazelwood-theme');
      if (saved === 'dark' || saved === 'light') savedTheme = saved;
    } catch (_error) { /* Use system preference when storage is unavailable. */ }
    state.themeExplicit = savedTheme !== null;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(savedTheme || (media.matches ? 'dark' : 'light'));
    $('#theme-toggle')?.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme;
      setTheme(current === 'dark' ? 'light' : 'dark', true);
    });
    media.addEventListener('change', (event) => {
      if (!state.themeExplicit) setTheme(event.matches ? 'dark' : 'light');
    });
  }

  function initSettingsControls() {
    document.querySelectorAll('[data-settings-select]').forEach((control) => {
      const name = control.dataset.settingsSelect;
      const trigger = control.querySelector('.settings-select-trigger');
      const menu = control.querySelector('[role="listbox"]');
      const getOptions = () => [...menu.querySelectorAll('[role="option"]')];

      function close(returnFocus = false) {
        if (menu.hidden) return;
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        if (returnFocus) trigger.focus();
      }

      function open(position = 'selected') {
        const options = getOptions();
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        const option = position === 'first' ? options[0]
          : position === 'last' ? options[options.length - 1]
            : options.find((item) => item.getAttribute('aria-selected') === 'true');
        option?.focus();
      }

      function moveOption(current, direction) {
        const options = getOptions();
        const index = options.indexOf(current);
        options[(index + direction + options.length) % options.length]?.focus();
      }

      function choose(value) {
        if (name === 'language') {
          setLanguage(value, true);
        } else if (value === 'system') {
          state.themeExplicit = false;
          try { localStorage.removeItem('hazelwood-theme'); } catch (_error) { /* Storage can be disabled. */ }
          setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        } else {
          setTheme(value, true);
        }
        close(true);
      }

      trigger.addEventListener('click', () => {
        if (menu.hidden) open();
        else close();
      });
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          open();
        } else if (event.key === 'Home') {
          event.preventDefault();
          open('first');
        } else if (event.key === 'End') {
          event.preventDefault();
          open('last');
        } else if (event.key === 'Escape') {
          close(true);
        }
      });
      menu.addEventListener('keydown', (event) => {
        const current = event.target.closest('[role="option"]');
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          moveOption(current, event.key === 'ArrowDown' ? 1 : -1);
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          const options = getOptions();
          options[event.key === 'Home' ? 0 : options.length - 1]?.focus();
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (current) choose(current.dataset.value);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          close(true);
        }
      });
      menu.addEventListener('click', (event) => {
        const option = event.target.closest('[role="option"]');
        if (option) choose(option.dataset.value);
      });
      control.addEventListener('focusout', (event) => {
        if (!control.contains(event.relatedTarget)) close();
      });
      document.addEventListener('pointerdown', (event) => {
        if (!control.contains(event.target)) close();
      });
    });
  }

  function initHeroCarousel() {
    const carousel = $('#hero-carousel');
    if (!carousel) return;

    const images = [...carousel.querySelectorAll('.hero-scene-image')];
    const groups = [...carousel.querySelectorAll('[data-scene-controls]')];
    const pauseButton = $('#scene-autoplay-toggle');
    const scenes = {
      day: ['/assets/scenes/day-reef.webp', '/assets/scenes/day-village.webp', '/assets/scenes/day-temple.webp'],
      night: ['/assets/scenes/night-forest.webp', '/assets/scenes/night-swamp.webp', '/assets/scenes/night-sanctuary.webp'],
    };
    const carouselState = {
      index: 0,
      theme: document.documentElement.dataset.theme === 'dark' ? 'night' : 'day',
    };
    const ambientLayers = [...document.querySelectorAll('.ambient-ray')];
    const ambientSources = [
      '/assets/ambient/day-reef.webp', '/assets/ambient/day-village.webp', '/assets/ambient/day-temple.webp',
      '/assets/ambient/night-forest.webp', '/assets/ambient/night-swamp.webp', '/assets/ambient/night-sanctuary.webp',
    ];
    const ambientAssets = new Map();
    let ambientRequest = 0;
    let sceneRequest = 0;
    let autoAdvanceTimer = 0;
    let carouselVisible = !('IntersectionObserver' in window);
    let autoplayEnabled = true;

    function loadAmbientAsset(source) {
      if (ambientAssets.has(source)) return ambientAssets.get(source);
      const image = new Image();
      image.decoding = 'async';
      image.src = source;
      const ready = typeof image.decode === 'function'
        ? image.decode().then(() => image, () => null)
        : new Promise((resolve) => {
          if (image.complete) resolve(image.naturalWidth ? image : null);
          else {
            image.addEventListener('load', () => resolve(image), { once: true });
            image.addEventListener('error', () => resolve(null), { once: true });
          }
        });
      ambientAssets.set(source, ready);
      return ready;
    }

    function loadSceneImage(image, source) {
      if (image.dataset.source === source && image.complete && image.naturalWidth > 0) {
        return typeof image.decode === 'function' ? image.decode().then(() => true, () => false) : Promise.resolve(true);
      }
      const mobileSource = source.replace(/\.webp$/, '-840.webp');
      const tabletSource = source.replace(/\.webp$/, '-1200.webp');
      image.sizes = '(max-width: 820px) 94vw, 60vw';
      image.srcset = `${mobileSource} 840w, ${tabletSource} 1200w, ${source} 1672w`;
      image.src = source;
      image.dataset.source = source;
      if (typeof image.decode === 'function') return image.decode().then(() => true, () => image.complete && image.naturalWidth > 0);
      return new Promise((resolve) => {
        if (image.complete) resolve(image.naturalWidth > 0);
        else {
          image.addEventListener('load', () => resolve(true), { once: true });
          image.addEventListener('error', () => resolve(false), { once: true });
        }
      });
    }

    function primeNextScene(image) {
      const request = sceneRequest;
      const source = scenes[carouselState.theme][(carouselState.index + 1) % 3];
      if (image.dataset.source === source && image.complete && image.naturalWidth > 0) return;
      loadSceneImage(image, source).then((loaded) => {
        if (!loaded || image.dataset.active === 'true' || request !== sceneRequest) return;
        const nextSource = scenes[carouselState.theme][(carouselState.index + 1) % 3];
        if (source !== nextSource) primeNextScene(image);
      });
    }

    function releaseSceneImage(image, source) {
      window.setTimeout(() => {
        if (image.dataset.active === 'true' || image.dataset.source !== source) return;
        image.removeAttribute('src');
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
        delete image.dataset.source;
        primeNextScene(image);
      }, 760);
    }

    function requestScene() {
      const request = ++sceneRequest;
      const source = scenes[carouselState.theme][carouselState.index];
      const active = images.find((image) => image.dataset.active === 'true');
      if (active?.dataset.source === source) return;
      const incoming = images.find((image) => image !== active);
      loadSceneImage(incoming, source).then((loaded) => {
        if (!loaded || request !== sceneRequest) return;
        const outgoing = images.find((image) => image.dataset.active === 'true');
        incoming.dataset.active = 'true';
        if (outgoing && outgoing !== incoming) {
          outgoing.dataset.active = 'false';
          releaseSceneImage(outgoing, outgoing.dataset.source || '');
        }
      });
    }

    function warmAmbientAssets() {
      const sources = ambientSources.filter((source) => source !== ambientLayers[0]?.dataset.source);
      const idle = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 350));
      const warmNext = () => {
        const source = sources.shift();
        if (!source) return;
        loadAmbientAsset(source).finally(() => idle(warmNext, { timeout: 1500 }));
      };
      idle(warmNext, { timeout: 1800 });
    }

    function setAmbientScene(theme, index) {
      if (ambientLayers.length < 2) return;
      const source = ambientSources[(theme === 'night' ? 3 : 0) + index];
      const request = ++ambientRequest;
      const outgoing = ambientLayers.find((layer) => layer.dataset.active === 'true');
      if (outgoing?.dataset.source === source) return;
      const incoming = ambientLayers.find((layer) => layer !== outgoing);
      loadAmbientAsset(source).then((image) => {
        if (!image || request !== ambientRequest) return;
        incoming.src = source;
        incoming.dataset.source = source;
        const decoded = typeof incoming.decode === 'function'
          ? incoming.decode().then(() => true, () => incoming.complete && incoming.naturalWidth > 0)
          : new Promise((resolve) => {
            if (incoming.complete) resolve(incoming.naturalWidth > 0);
            else {
              incoming.addEventListener('load', () => resolve(true), { once: true });
              incoming.addEventListener('error', () => resolve(false), { once: true });
            }
          });
        return decoded
          .then(() => {
            if (request !== ambientRequest || !incoming.naturalWidth) return;
            incoming.dataset.active = 'true';
            if (outgoing) outgoing.dataset.active = 'false';
          });
      });
    }

    warmAmbientAssets();

    function syncCarousel() {
      carousel.dataset.theme = carouselState.theme === 'night' ? 'dark' : 'light';
      requestScene();
      setAmbientScene(carouselState.theme, carouselState.index);
      groups.forEach((group) => {
        group.hidden = group.dataset.sceneControls !== carouselState.theme;
        group.querySelectorAll('.scene-indicator').forEach((button) => {
          button.setAttribute('aria-pressed', String(Number(button.dataset.sceneIndex) === carouselState.index));
        });
      });
    }

    function showSlide(index) {
      carouselState.index = (index + 3) % 3;
      syncCarousel();
      scheduleAutoAdvance();
    }

    function scheduleAutoAdvance() {
      window.clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = 0;
      if (!autoplayEnabled || !carouselVisible || document.visibilityState !== 'visible') return;
      autoAdvanceTimer = window.setTimeout(() => showSlide(carouselState.index + 1), 8000);
    }

    function syncAutoplayControl() {
      if (!pauseButton) return;
      const paused = !autoplayEnabled;
      pauseButton.setAttribute('aria-pressed', String(paused));
      const labelKey = paused ? 'scene.resume' : 'scene.pause';
      pauseButton.dataset.i18nAria = labelKey;
      pauseButton.setAttribute('aria-label', t(labelKey));
      pauseButton.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
    }

    carousel.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-scene-action], button.scene-indicator');
      if (!button || !carousel.contains(button)) return;
      if (button.classList.contains('scene-indicator')) {
        showSlide(Number(button.dataset.sceneIndex));
        return;
      }
      if (button.dataset.sceneAction === 'previous') showSlide(carouselState.index + 2);
      else if (button.dataset.sceneAction === 'next') showSlide(carouselState.index + 1);
      else if (button.dataset.sceneAction === 'toggle-autoplay') {
        autoplayEnabled = !autoplayEnabled;
        syncAutoplayControl();
        scheduleAutoAdvance();
      }
    });

    syncCarousel();
    if (images[0]?.dataset.active === 'true'
      && images[0].dataset.source === scenes[carouselState.theme][carouselState.index]) {
      primeNextScene(images[1]);
    }
    syncAutoplayControl();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        carouselVisible = entries.some((entry) => entry.isIntersecting);
        scheduleAutoAdvance();
      }, { threshold: 0.01 });
      observer.observe(carousel);
    }
    document.addEventListener('visibilitychange', scheduleAutoAdvance);
    scheduleAutoAdvance();
    heroCarouselController = {
      setTheme(theme) {
        if (theme !== 'day' && theme !== 'night') return;
        if (carouselState.theme === theme) return;
        carouselState.theme = theme;
        syncCarousel();
      },
    };
  }

  function initHeaderVines() {
    const vines = $('#header-vines');
    if (!vines) return;
    const length = 17;
    if (!vines.querySelector('.vine-strand--long')) {
      const template = vines.querySelector('.vine-strand:not(.vine-strand--mobile-hidden)');
      const motif = template && [...template.querySelectorAll('.vine-link')];
      if (template && motif?.length) {
        const longStrand = template.cloneNode(true);
        longStrand.classList.remove('vine-strand--mobile-hidden');
        longStrand.classList.add('vine-strand--long');
        longStrand.dataset.anchor = '.025';
        longStrand.dataset.mobileAnchor = '.025';
        longStrand.dataset.tipX = '0';
        longStrand.replaceChildren();
        for (let index = 0; index < 22; index += 1) {
          const link = motif[index % motif.length].cloneNode(true);
          const restX = Number(link.dataset.restX) || 0;
          link.dataset.joint = String(index + 1);
          link.setAttribute('transform', `translate(${restX} ${index * length})`);
          longStrand.appendChild(link);
        }
        template.after(longStrand);
      }
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const strands = [...vines.querySelectorAll('.vine-strand')].map((element, index) => ({
      element,
      phase: index * 0.65,
      anchor: Number(element.dataset.anchor),
      mobileAnchor: Number(element.dataset.mobileAnchor),
      links: [...element.querySelectorAll('.vine-link')].map((link) => ({
        element: link, stem: link.querySelector('.vine-stem'),
      })),
      nodes: Array.from({ length: element.children.length + 1 }, (_, index) => {
        const restX = Number(element.children[index]?.dataset.restX ?? element.dataset.tipX);
        return { restX, x: restX, y: index * length, previousX: restX, previousY: index * length };
      }),
    }));
    if (!strands.length) return;

    let visible = !('IntersectionObserver' in window);
    let timer = 0;
    let drag = null;
    const active = () => visible && document.visibilityState === 'visible' && !reducedMotion.matches;

    function render() {
      strands.forEach((strand) => {
        strand.links.forEach((link, index) => {
          const top = strand.nodes[index];
          const bottom = strand.nodes[index + 1];
          const dx = bottom.x - top.x;
          const dy = bottom.y - top.y;
          // Stems stay upright at rest, then bend with their own joint.
          const angle = Math.atan2(bottom.restX - top.restX, length) - Math.atan2(dx, dy);
          const localX = dx * Math.cos(angle) + dy * Math.sin(angle);
          const localY = -dx * Math.sin(angle) + dy * Math.cos(angle);
          link.element.setAttribute('transform', `translate(${top.x.toFixed(2)} ${top.y.toFixed(2)}) rotate(${(angle * 180 / Math.PI).toFixed(2)})`);
          // A stepped connector stretches; the square leaves keep their size.
          link.stem.setAttribute('d', `M0 0V${(localY * 0.5).toFixed(2)}H${localX.toFixed(2)}V${localY.toFixed(2)}`);
        });
      });
    }

    function reset() {
      strands.forEach((strand) => strand.nodes.forEach((node, index) => {
        node.x = node.previousX = node.restX;
        node.y = node.previousY = index * length;
      }));
      render();
    }

    function stop() {
      window.clearTimeout(timer);
      timer = 0;
    }

    function start() {
      if (!timer && active()) timer = window.setTimeout(tick, 40);
    }

    function tick() {
      timer = 0;
      if (!active()) return;
      const now = performance.now();
      strands.forEach((strand) => {
        const held = drag?.strand === strand ? drag : null;
        strand.nodes.forEach((node, index) => {
          if (!index) return;
          const vx = (node.x - node.previousX) * 0.89;
          const vy = (node.y - node.previousY) * 0.89;
          node.previousX = node.x;
          node.previousY = node.y;
          // A slow breeze reaches each joint slightly later and grows toward the tip.
          const depth = index / (strand.nodes.length - 1);
          const wind = (Math.sin(now * 0.00062 + strand.phase - depth * 0.8) * 0.35
            + Math.sin(now * 0.0013 + strand.phase) * 0.09) * depth;
          node.x += vx + (node.restX - node.x) * 0.012 + wind;
          node.y += vy + (index * length - node.y) * 0.016;
        });
        // Local springs transmit pulls through the chain, with a little stretch.
        for (let pass = 0; pass < 6; pass += 1) {
          for (let index = 1; index < strand.nodes.length; index += 1) {
            const top = strand.nodes[index - 1];
            const bottom = strand.nodes[index];
            const dx = bottom.x - top.x;
            const dy = bottom.y - top.y;
            const distance = Math.hypot(dx, dy) || 0.001;
            const restLength = Math.hypot(bottom.restX - top.restX, length);
            const correction = (distance - restLength) / distance * 0.48;
            const topFree = index > 1 && held?.joint !== index - 1;
            const bottomFree = held?.joint !== index;
            if (topFree) { top.x += dx * correction; top.y += dy * correction; }
            if (bottomFree) { bottom.x -= dx * correction; bottom.y -= dy * correction; }
          }
          if (held) {
            const node = strand.nodes[held.joint];
            node.x = held.x;
            node.y = held.y;
          }
        }
      });
      render();
      timer = window.setTimeout(tick, 40);
    }

    function resize() {
      const width = Math.max(vines.clientWidth, 1);
      // No viewBox: SVG units remain CSS pixels, even before initialization or during resize.
      strands.forEach((strand) => {
        const edge = Math.min(strand.element.classList.contains('vine-strand--long') ? 26 : 48, width / 2);
        const anchor = width <= 820 && Number.isFinite(strand.mobileAnchor)
          ? strand.mobileAnchor
          : strand.anchor;
        strand.x = Math.max(edge, Math.min(width - edge, width * anchor));
        strand.element.setAttribute('transform', `translate(${strand.x.toFixed(2)} 0)`);
      });
    }

    function pointerPosition(event) {
      const rect = vines.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function moveDrag(event) {
      const point = pointerPosition(event);
      const dx = point.x - drag.strand.x + drag.offsetX;
      const dy = Math.max(8, point.y + drag.offsetY);
      const reach = drag.joint * length * 1.3;
      const scale = Math.min(1, reach / (Math.hypot(dx, dy) || 1));
      drag.x = dx * scale;
      drag.y = dy * scale;
      start();
    }

    vines.addEventListener('pointerdown', (event) => {
      if (!active() || drag || (event.pointerType === 'mouse' && event.button !== 0)) return;
      const link = event.target.closest('.vine-link');
      if (!link) return;
      const strand = strands.find((item) => item.element === link.parentNode);
      const joint = Number(link.dataset.joint);
      const node = strand.nodes[joint];
      const point = pointerPosition(event);
      drag = { strand, joint, pointerId: event.pointerId, x: node.x, y: node.y,
        offsetX: node.x - (point.x - strand.x), offsetY: node.y - point.y };
      vines.setPointerCapture(event.pointerId);
      vines.classList.add('is-dragging');
      event.preventDefault();
      start();
    });

    vines.addEventListener('pointermove', (event) => {
      if (active() && drag?.pointerId === event.pointerId) moveDrag(event);
    }, { passive: true });

    function release(event) {
      if (!drag || (event && event.pointerId !== drag.pointerId)) return;
      const pointerId = drag.pointerId;
      drag = null;
      vines.classList.remove('is-dragging');
      if (vines.hasPointerCapture(pointerId)) vines.releasePointerCapture(pointerId);
      start();
    }

    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((name) => vines.addEventListener(name, release));
    const update = () => {
      vines.classList.toggle('is-interactive', active());
      if (active()) start();
      else {
        release();
        stop();
        reset();
      }
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        update();
      }, { threshold: 0.01 });
      observer.observe(vines);
    }
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', update);
    reducedMotion.addEventListener('change', update);
    resize();
    update();
  }

  function formatDate(value, withTime = false) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const options = withTime
      ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat(localeTags[state.language], options).format(date);
  }

  function scrollTo(node) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function setFormBusy(form, busy, busyLabelKey) {
    const button = $('button[type="submit"]', form);
    if (!button) return;
    const label = $('span:first-child', button);
    if (busy) {
      button.dataset.idleLabel = label ? label.textContent : button.textContent;
      button.dataset.busyKey = busyLabelKey;
      button.disabled = true;
      if (label && busyLabelKey) label.textContent = t(busyLabelKey);
    } else {
      button.disabled = false;
      if (label && button.dataset.idleLabel) label.textContent = button.dataset.idleLabel;
      delete button.dataset.busyKey;
    }
  }

  function setMessage(node, message, isError = false) {
    node.textContent = message;
    node.hidden = !message;
    node.classList.toggle('is-error', Boolean(message && isError));
  }

  function renderStatus(data) {
    state.lastStatus = data;
    const available = data && data.available === true;
    const count = data && Number.isFinite(data.onlineCount) ? data.onlineCount : null;
    const maximum = data && Number.isFinite(data.maxPlayers) ? data.maxPlayers : null;
    const players = Array.isArray(data && data.players) ? data.players : [];
    const statePill = $('#server-state');
    const stateText = $('#server-state-text');

    statePill.classList.remove('status-loading', 'status-online', 'status-offline');
    statePill.classList.add(available ? 'status-online' : 'status-offline');
    stateText.textContent = available ? t('server.online') : t('server.offline');
    const presenceCount = $('#presence-count');
    const unavailable = $('#server-unavailable');
    if (presenceCount) presenceCount.hidden = !available;
    if (unavailable) {
      unavailable.textContent = t('server.offlineMessage');
      unavailable.hidden = available;
    }
    $('#online-count').textContent = available && count !== null ? String(count) : '—';
    $('#max-players').textContent = available && maximum !== null ? String(maximum) : '—';
    const registeredPlayers = $('#registered-players');
    if (registeredPlayers) {
      if (Number.isSafeInteger(data && data.registeredPlayers) && data.registeredPlayers >= 0) {
        registeredPlayers.textContent = t('hero.registeredPlayers', {
          count: new Intl.NumberFormat(localeTags[state.language]).format(data.registeredPlayers),
        });
        registeredPlayers.hidden = false;
      } else {
        registeredPlayers.hidden = true;
      }
    }
    const list = $('#online-players');
    const names = available ? [...new Set(players
      .map((player) => typeof player === 'string' ? player : player && player.username)
      .filter((username) => typeof username === 'string' && /^[A-Za-z0-9_]{3,16}$/.test(username)))] : [];
    const presence = $('.player-presence');
    if (!names.length) {
      list.replaceChildren();
      presence.hidden = true;
      onlinePlayerNodes.clear();
    } else {
      presence.hidden = false;
      const nextPlayerNodes = new Map();
      list.replaceChildren(...names.map((username) => {
        let item = onlinePlayerNodes.get(username);
        if (!item) {
          item = el('li');
          const player = el('span', 'online-player');
          player.append(createPlayerHead(username, 'online-player-head'), el('span', '', username));
          item.append(player);
          onlinePlayerNodes.set(username, item);
        }
        nextPlayerNodes.set(username, item);
        return item;
      }));
      onlinePlayerNodes.clear();
      nextPlayerNodes.forEach((item, username) => onlinePlayerNodes.set(username, item));
    }
    const statusError = $('#status-error');
    if (statusError) statusError.hidden = true;
  }

  async function refreshStatus() {
    if (!$('#server-state')) return;
    if (document.visibilityState === 'hidden') return;
    try {
      const data = await api('/status', { cache: 'no-store' });
      renderStatus(data || {});
    } catch (error) {
      const lastKnownStatus = state.lastStatus || {};
      renderStatus({ ...lastKnownStatus, available: false, online: false, players: [] });
      const statusError = $('#status-error');
      if (statusError) {
        statusError.textContent = localizeError(error);
        statusError.hidden = false;
      }
    }
  }

  function makePresence(online) {
    const presence = el('span', `profile-presence ${online ? 'is-online' : 'is-offline'}`);
    presence.append(el('span', 'state-dot'), document.createTextNode(online ? t('profile.inWorld') : t('profile.notPlaying')));
    return presence;
  }

  function showLeaderboardMessage(key) {
    const table = $('#leaderboard-table-wrap');
    const rows = $('#leaderboard-rows');
    const message = $('#leaderboard-state');
    if (table) table.hidden = true;
    if (rows) rows.replaceChildren();
    if (message) {
      message.textContent = t(key);
      message.hidden = false;
    }
  }

  function formatLeaderboardPlaytime(seconds) {
    const hours = Math.floor(seconds / 3600);
    if (hours === 0 && seconds > 0) return t('leaderboard.lessThanHour');
    return `${new Intl.NumberFormat(localeTags[state.language]).format(hours)} ${t('leaderboard.hours')}`;
  }

  function renderLeaderboard(data) {
    const table = $('#leaderboard-table-wrap');
    const body = $('#leaderboard-rows');
    const message = $('#leaderboard-state');
    if (!table || !body || !message) return;

    state.lastLeaderboard = data || {};
    state.leaderboardError = false;
    const players = Array.isArray(data && data.players) ? data.players.filter((player) => (
      player && typeof player.username === 'string' && /^[A-Za-z0-9_]{3,16}$/.test(player.username)
    )) : [];
    if (!players.length) {
      showLeaderboardMessage('leaderboard.empty');
      return;
    }

    const hasStat = (value) => Number.isSafeInteger(value) && value >= 0;
    const rankedPlayers = players.slice().sort((left, right) => {
      const leftHasAdvancements = hasStat(left.advancementCount);
      const rightHasAdvancements = hasStat(right.advancementCount);
      if (leftHasAdvancements !== rightHasAdvancements) return leftHasAdvancements ? -1 : 1;
      if (leftHasAdvancements && left.advancementCount !== right.advancementCount) {
        return right.advancementCount - left.advancementCount;
      }
      const leftHasPlaytime = hasStat(left.playSeconds);
      const rightHasPlaytime = hasStat(right.playSeconds);
      if (leftHasPlaytime !== rightHasPlaytime) return leftHasPlaytime ? -1 : 1;
      if (leftHasPlaytime && left.playSeconds !== right.playSeconds) return right.playSeconds - left.playSeconds;
      return left.username.localeCompare(right.username, localeTags[state.language], { sensitivity: 'base' });
    });

    let rankNumber = 0;
    body.replaceChildren(...rankedPlayers.map((player) => {
      const row = el('tr');
      const hasPlaytime = hasStat(player.playSeconds);
      const hasAdvancements = hasStat(player.advancementCount);
      const rank = el('td', 'leaderboard-rank', hasAdvancements ? String(++rankNumber) : '—');
      if (!hasAdvancements) rank.setAttribute('aria-label', t('leaderboard.noData'));

      const playerCell = el('td');
      const playerName = el('span', 'leaderboard-player-name', player.username);
      const online = typeof player.online === 'boolean' ? player.online : null;
      const presenceText = online === null ? t('leaderboard.statusUnknown') : t(online ? 'leaderboard.online' : 'leaderboard.offline');
      const presenceClass = online === null ? 'is-unknown' : online ? 'is-online' : 'is-offline';
      const presence = el('span', `leaderboard-presence ${presenceClass}`, presenceText);
      const playerDetails = el('span', 'leaderboard-player');
      playerDetails.append(createPlayerHead(player.username, 'leaderboard-player-head'), playerName, presence);
      playerCell.append(playerDetails);

      const playtime = hasPlaytime ? formatLeaderboardPlaytime(player.playSeconds) : '—';
      const playtimeCell = el('td', 'leaderboard-metric', playtime);
      if (!hasPlaytime) playtimeCell.setAttribute('aria-label', t('leaderboard.noData'));
      const advancementCell = el('td', 'leaderboard-metric', hasAdvancements
        ? new Intl.NumberFormat(localeTags[state.language]).format(player.advancementCount)
        : '—');
      if (!hasAdvancements) advancementCell.setAttribute('aria-label', t('leaderboard.noData'));
      row.append(rank, playerCell, playtimeCell, advancementCell);
      return row;
    }));
    table.hidden = false;
    message.hidden = true;
  }

  async function refreshLeaderboard() {
    const message = $('#leaderboard-state');
    if (!message || document.visibilityState === 'hidden') return;
    try {
      const data = await api('/leaderboard', { cache: 'no-store' });
      renderLeaderboard(data || {});
    } catch (_error) {
      state.lastLeaderboard = null;
      state.leaderboardError = true;
      showLeaderboardMessage('leaderboard.error');
    }
  }

  function makeFact(label, value) {
    const fact = el('div', 'profile-fact');
    fact.append(el('span', '', label), el('strong', '', value || '—'));
    return fact;
  }

  function renderProfile(data, root, member = false) {
    if (member) state.profileData = data;
    const username = data && typeof data.username === 'string' ? data.username : t('profile.player');
    const online = data && data.online === true;
    root.replaceChildren();
    root.classList.add('profile-card');
    if (member) root.classList.add('member-card');

    const main = el('div', 'profile-main');
    const avatar = el('div', `profile-avatar${data && data.role === 'admin' ? ' admin-avatar' : ''}`, username.slice(0, 1).toUpperCase());
    avatar.setAttribute('aria-hidden', 'true');
    const identity = el('div');
    identity.append(el('h3', 'profile-nickname', username), el('p', 'profile-subline', data && data.role === 'admin' ? t('profile.admin') : t('profile.resident')));
    main.append(avatar, identity, makePresence(online));

    const facts = el('div', 'profile-facts');
    facts.append(makeFact(t('profile.joined'), formatDate(data && data.createdAt)), makeFact(t('profile.lastVisit'), online ? t('profile.inWorld') : formatDate(data && data.lastSeenAt, true)));
    root.append(main, facts);
  }

  async function loadPlayer(username, root, member = false) {
    if (member) {
      state.profileLoading = true;
      state.profileError = null;
    }
    root.hidden = false;
    root.replaceChildren(el('p', 'inline-message', t('profile.loading')));
    try {
      const data = await api(`/players/${encodeURIComponent(username)}`);
      const profile = data || { username };
      if (member && state.user) profile.role = state.user.role;
      if (member) {
        state.profileData = profile;
        state.profileError = null;
        state.profileLoading = false;
      }
      renderProfile(profile, root, member);
    } catch (error) {
      if (member) {
        state.profileData = null;
        state.profileLoading = false;
        state.profileError = error;
      }
      root.replaceChildren(el('p', `inline-message${error.status === 404 ? '' : ' is-error'}`, error.status === 404 ? t('profile.notFound') : localizeError(error)));
    }
  }

  async function loadMe() {
    try {
      const result = await api('/me');
      state.authError = null;
      state.authMessageKey = null;
      state.user = result && result.user ? result.user : null;
      return state.user;
    } catch (error) {
      if (error.status !== 401) {
        state.authError = error;
        state.authMessageKey = null;
      }
      state.user = null;
      return null;
    }
  }

  function renderLandingAccount(user) {
    const username = user && typeof user.username === 'string' ? user.username : '';
    const accountLink = $('#landing-account-link');
    if (!username.trim() || !accountLink || !accountLink.isConnected) return;
    if (document.body.dataset.page !== 'landing') return;

    accountLink.closest('.site-header')?.classList.add('has-auth-account');
    accountLink.href = '/app/profile/';
    accountLink.classList.add('header-account-link');
    accountLink.removeAttribute('data-i18n');
    accountLink.setAttribute('aria-label', username);
    accountLink.title = username;
    accountLink.replaceChildren(createPlayerHead(username, 'header-account-head'), el('span', 'header-account-name', username));
    $('#hero-register-link')?.remove();
  }

  function authReturnPath() {
    const next = new URLSearchParams(window.location.search).get('next') || '';
    return /^\/app\/(profile|world|map|settings|admin|players|guide)\/?$/.test(next) ? `${next.replace(/\/$/, '')}/` : '/app/profile/';
  }

  function initAuthPage() {
    const form = $('#auth-form');
    if (!form) return;
    const isRegister = location.pathname.replace(/\/+$/, '') === '/register';
    form.dataset.authMode = isRegister ? 'register' : 'login';
    const title = $('#auth-title');
    if (title) title.dataset.i18n = isRegister ? 'auth.registerTitle' : 'auth.loginTitle';
    const inviteField = $('#auth-invite-field');
    const invite = $('#auth-invite');
    if (inviteField) inviteField.hidden = !isRegister;
    if (invite) invite.disabled = !isRegister;
    const password = $('#auth-password');
    if (password) {
      password.minLength = isRegister ? 12 : 0;
      password.autocomplete = isRegister ? 'new-password' : 'current-password';
    }
    const passwordHint = $('#auth-password-hint');
    if (passwordHint) passwordHint.hidden = !isRegister;
    const inviteRule = $('.auth-footnote');
    if (inviteRule) inviteRule.hidden = !isRegister;
    const submitLabel = $('#auth-submit span:first-child');
    if (submitLabel) submitLabel.dataset.i18n = isRegister ? 'account.registerSubmit' : 'account.loginSubmit';
    const loginLink = $('#auth-login-link');
    const registerLink = $('#auth-register-link');
    const navLogin = $('#nav-login');
    const navRegister = $('#nav-register');
    [loginLink, navLogin].forEach((link) => link?.toggleAttribute('aria-current', !isRegister));
    [registerLink, navRegister].forEach((link) => link?.toggleAttribute('aria-current', isRegister));
    applyStaticTranslations();
  }

  async function initAppPage() {
    const route = location.pathname.match(/^\/app\/(profile|world|map|settings|admin|players|guide)\/?$/);
    const page = route ? route[1] : 'profile';
    const loading = $('#app-loading');
    const user = await loadMe();
    if (!user) {
      if (state.authError) {
        if (loading) loading.textContent = localizeError(state.authError);
        return;
      }
      location.replace(`/login/?next=${encodeURIComponent(`${location.pathname}${location.search}`)}`);
      return;
    }
    if (loading) loading.hidden = true;
    const isAdmin = user.role === 'admin';
    const adminNav = $('#admin-nav');
    if (adminNav) adminNav.hidden = !isAdmin;
    if (page === 'admin' && !isAdmin) {
      location.replace('/app/profile/');
      return;
    }
    document.querySelectorAll('[data-app-view]').forEach((view) => { view.hidden = view.dataset.appView !== page; });
    document.querySelectorAll('[data-app-link]').forEach((link) => {
      if (link.dataset.appLink === page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    let profileTarget = null;
    let viewingOwnProfile = false;
    if (page === 'profile' && typeof user.username === 'string') {
      const root = $('#member-profile');
      const requested = new URLSearchParams(location.search).get('player');
      const valid = !requested || /^[A-Za-z0-9_]{3,16}$/.test(requested);
      profileTarget = valid ? requested || user.username : null;
      viewingOwnProfile = valid && profileTarget.toLowerCase() === user.username.toLowerCase();
      if (!valid) {
        root.replaceChildren(el('p', 'inline-message', t('profile.notFound')));
      } else {
        root.replaceChildren(el('p', 'inline-message', t('profile.loading')));
      }
    } else if (page === 'world') {
      refreshStatus();
      state.statusTimer = setInterval(refreshStatus, 45_000);
    } else if (page === 'map') {
      $('#interactive-map').src = '/map/';
    } else if (page === 'admin') {
      $('#admin-players').replaceChildren(el('p', 'admin-message', t('admin.playersHint')));
    }
    const profilePagesInit = { page, user, target: profileTarget, isOwn: viewingOwnProfile };
    if (window.HazelwoodProfilePages) window.HazelwoodProfilePages.init(profilePagesInit);
    else window.HazelwoodPendingAppInit = profilePagesInit;
  }

  async function submitAuth(form) {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const message = $('#auth-message');
    const endpoint = form.dataset.authMode === 'register' ? '/register' : '/login';
    const isRegister = endpoint === '/register';
    state.authError = null;
    state.authMessageKey = null;
    setMessage(message, '');
    setFormBusy(form, true, isRegister ? 'auth.busyRegister' : 'auth.busyLogin');
    try {
      await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      const user = await loadMe();
      if (user) {
        form.reset();
        location.assign(authReturnPath());
        return;
      }
      state.authError = null;
      state.authMessageKey = isRegister ? 'error.accountCreated' : 'auth.loginFallback';
      setMessage(message, t(state.authMessageKey), !isRegister);
    } catch (error) {
      state.authError = error;
      state.authMessageKey = null;
      setMessage(message, localizeError(error), true);
    } finally {
      setFormBusy(form, false);
    }
  }

  async function logout() {
    const button = $('#logout-button');
    button.disabled = true;
    try {
      await api('/logout', { method: 'POST' });
      location.assign('/');
    } catch (error) {
      showToast(localizeError(error), error);
    } finally {
      button.disabled = false;
    }
  }

  async function createInvite() {
    const button = $('#create-invite');
    const message = $('#invite-message');
    button.disabled = true;
    state.inviteMessageKey = 'admin.inviteCreating';
    state.inviteError = null;
    state.inviteCopied = false;
    message.textContent = t(state.inviteMessageKey);
    $('#invite-result').hidden = true;
    state.inviteCode = null;
    try {
      const result = await api('/admin/invites', { method: 'POST' });
      if (!result || typeof result.code !== 'string' || !result.code) {
        state.inviteMessageKey = 'admin.inviteMissing';
        message.textContent = t(state.inviteMessageKey);
        return;
      }
      state.inviteCode = result.code;
      $('#invite-code-result').textContent = result.code;
      $('#invite-result').hidden = false;
      state.inviteMessageKey = 'admin.inviteCreated';
      message.textContent = t(state.inviteMessageKey);
    } catch (error) {
      state.inviteMessageKey = '';
      state.inviteError = error;
      message.textContent = localizeError(error);
    } finally {
      button.disabled = false;
    }
  }

  async function copyInvite() {
    if (!state.inviteCode) return;
    try {
      await navigator.clipboard.writeText(state.inviteCode);
      state.inviteCopied = true;
      $('#copy-invite').textContent = t('admin.inviteCopyDone');
      showToast(t('admin.inviteCopied'), { key: 'admin.inviteCopied' });
    } catch (_error) {
      const range = document.createRange();
      range.selectNodeContents($('#invite-code-result'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      showToast(t('admin.inviteManual'), { key: 'admin.inviteManual' });
    }
  }

  function renderAdminPlayers(players) {
    const target = $('#admin-players');
    state.adminPlayers = Array.isArray(players) ? players : [];
    state.adminError = null;
    state.adminLoading = false;
    target.replaceChildren();
    if (state.adminPlayers.length === 0) {
      target.append(el('p', 'admin-message', t('admin.playersNotFound')));
      return;
    }
    state.adminPlayers.forEach((player) => {
      if (!player || typeof player.username !== 'string') return;
      const row = el('div', 'admin-player');
      row.dataset.username = player.username;
      const identity = el('div');
      identity.append(el('span', 'admin-player-name', player.username), el('span', 'admin-player-meta', player.role === 'admin' ? t('admin.adminRole') : t('admin.playerJoined', { date: formatDate(player.createdAt) })));
      const status = el('span', `ban-state${player.banned ? ' is-banned' : ''}`, player.banned ? t('admin.playerBanned') : t('admin.playerActive'));
      const actions = el('div', 'admin-player-actions');
      if (player.banned) {
        const unban = el('button', 'small-action', t('admin.unban'));
        unban.type = 'button';
        unban.dataset.action = 'unban';
        actions.append(unban);
      } else {
        const reason = el('input', 'ban-reason');
        reason.name = 'reason';
        reason.maxLength = 200;
        reason.placeholder = t('admin.banReason');
        reason.setAttribute('aria-label', t('admin.banReasonFor', { username: player.username }));
        const ban = el('button', 'small-action is-danger', t('admin.ban'));
        ban.type = 'button';
        ban.dataset.action = 'ban';
        actions.append(reason, ban);
      }
      row.append(identity, status, actions);
      target.append(row);
    });
  }

  async function searchAdminPlayers(search = '') {
    const target = $('#admin-players');
    state.adminSearch = search;
    state.adminLoading = true;
    state.adminError = null;
    target.replaceChildren(el('p', 'admin-message', t('admin.playersLoading')));
    const query = new URLSearchParams({ search });
    try {
      const result = await api(`/admin/players?${query.toString()}`);
      renderAdminPlayers(result && result.players);
    } catch (error) {
      state.adminLoading = false;
      state.adminError = error;
      target.replaceChildren(el('p', 'admin-message is-error', localizeError(error)));
    }
  }

  async function changeBan(button) {
    const row = button.closest('.admin-player');
    const username = row && row.dataset.username;
    if (!username) return;
    const action = button.dataset.action;
    const reasonInput = $('.ban-reason', row);
    const reason = reasonInput ? reasonInput.value.trim() : '';
    if (action === 'ban' && !reason) {
      reasonInput.setCustomValidity(t('admin.reasonRequired'));
      reasonInput.reportValidity();
      reasonInput.addEventListener('input', () => reasonInput.setCustomValidity(''), { once: true });
      return;
    }
    button.disabled = true;
    try {
      const path = `/admin/players/${encodeURIComponent(username)}/${action}`;
      const options = { method: 'POST' };
      if (action === 'ban') options.body = JSON.stringify({ reason });
      await api(path, options);
      const toastKey = action === 'ban' ? 'admin.bannedToast' : 'admin.unbannedToast';
      showToast(t(toastKey, { username }), { key: toastKey, values: { username } });
      await searchAdminPlayers(state.adminSearch);
    } catch (error) {
      button.disabled = false;
      showToast(localizeError(error), error);
    }
  }

  function initHeroFlora() {
    const hero = $('#top');
    const plants = Array.from(hero?.querySelectorAll('[data-flora]') || [], (anchor) => ({
      anchor,
      sprite: anchor.querySelector('.flora-sprite'),
    }));
    if (!plants.length) return;

    const motion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let pointer = null;
    let frame = 0;
    let lastPointer = null;
    let fastStart = null;
    let fastDistance = 0;
    let sweepSegment = null;
    let lastFloraBurst = 0;
    let particleLayer = null;

    function segmentBoundsEntry(start, end, bounds, padding = 18) {
      let entry = 0;
      let exit = 1;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const clip = (p, q) => {
        if (p === 0) return q >= 0;
        const ratio = q / p;
        if (p < 0) {
          if (ratio > exit) return false;
          entry = Math.max(entry, ratio);
        } else {
          if (ratio < entry) return false;
          exit = Math.min(exit, ratio);
        }
        return true;
      };
      const minX = bounds.left - padding;
      const maxX = bounds.right + padding;
      const minY = bounds.top - padding;
      const maxY = bounds.bottom + padding;
      if (!clip(-dx, start.x - minX)
        || !clip(dx, maxX - start.x)
        || !clip(-dy, start.y - minY)
        || !clip(dy, maxY - start.y)) return null;
      return entry;
    }

    function getParticleLayer() {
      if (!particleLayer) {
        particleLayer = document.createElement('div');
        particleLayer.className = 'flora-particle-layer';
        particleLayer.setAttribute('aria-hidden', 'true');
        document.body.append(particleLayer);
      }
      return particleLayer;
    }

    function beginParticleBurst(limit) {
      const now = performance.now();
      if (now - lastFloraBurst < 520) return null;

      const layer = getParticleLayer();
      const count = Math.min(limit, 18 - layer.childElementCount);
      if (count <= 0) return null;
      lastFloraBurst = now;
      return { layer, count };
    }

    function spawnFireflies(x, y) {
      if (document.documentElement.dataset.theme !== 'dark') return;
      const burst = beginParticleBurst(5);
      if (!burst) return;

      for (let index = 0; index < burst.count; index += 1) {
        const firefly = document.createElement('i');
        const angle = -Math.PI + Math.random() * Math.PI;
        const distance = 28 + Math.random() * 36;
        firefly.className = 'flora-firefly';
        firefly.style.left = `${x}px`;
        firefly.style.top = `${y}px`;
        firefly.style.setProperty('--firefly-x', `${(Math.cos(angle) * distance).toFixed(1)}px`);
        firefly.style.setProperty('--firefly-y', `${(Math.sin(angle) * distance).toFixed(1)}px`);
        firefly.style.setProperty('--firefly-mid-x', `${(Math.cos(angle) * distance * 0.55).toFixed(1)}px`);
        firefly.style.setProperty('--firefly-mid-y', `${(Math.sin(angle) * distance * 0.55).toFixed(1)}px`);
        firefly.style.setProperty('--firefly-duration', `${(900 + Math.random() * 350).toFixed(0)}ms`);
        firefly.style.setProperty('--firefly-delay', `${(Math.random() * 80).toFixed(0)}ms`);
        burst.layer.append(firefly);
        window.setTimeout(() => firefly.remove(), 1500);
      }
    }

    function spawnButterflies(x, y) {
      if (document.documentElement.dataset.theme !== 'light') return;
      const burst = beginParticleBurst(4);
      if (!burst) return;
      const pixel = (value) => `${Math.round(value / 2) * 2}px`;

      for (let index = 0; index < burst.count; index += 1) {
        const butterfly = document.createElement('i');
        const angle = -Math.PI + Math.random() * Math.PI;
        const distance = 46 + Math.random() * 30;
        const destinationX = Math.round(Math.cos(angle) * distance / 2) * 2;
        const destinationY = Math.round(Math.sin(angle) * distance / 2) * 2;
        butterfly.className = 'flora-butterfly';
        butterfly.style.left = pixel(x);
        butterfly.style.top = pixel(y);
        butterfly.style.setProperty('--butterfly-x', `${destinationX}px`);
        butterfly.style.setProperty('--butterfly-y', `${destinationY}px`);
        butterfly.style.setProperty('--butterfly-mid-x', `${Math.round(destinationX * 0.55 / 2) * 2}px`);
        butterfly.style.setProperty('--butterfly-mid-y', `${Math.round(destinationY * 0.55 / 2) * 2}px`);
        butterfly.style.setProperty('--butterfly-duration', `${Math.round(1100 + Math.random() * 350)}ms`);
        butterfly.style.setProperty('--butterfly-delay', `${Math.round(Math.random() * 70)}ms`);
        burst.layer.append(butterfly);
        window.setTimeout(() => butterfly.remove(), 1650);
      }
    }

    function reset() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      pointer = null;
      lastPointer = null;
      fastStart = null;
      fastDistance = 0;
      sweepSegment = null;
      plants.forEach(({ sprite }) => sprite.style.removeProperty('transform'));
    }

    function update() {
      frame = 0;
      if (!pointer || !motion.matches) return;
      // Measure the stationary anchors so transformed leaves never move their own hit area.
      const measurements = plants.map(({ anchor }) => {
        const bounds = anchor.getBoundingClientRect();
        const dx = pointer.x - (bounds.left + bounds.width / 2);
        const dy = pointer.y - (bounds.top + bounds.height / 2);
        const influence = Math.max(0, 1 - Math.hypot(dx, dy) / 160);
        const bend = Math.max(-1, Math.min(1, dx / 60)) * influence;
        return {
          bounds,
          transform: `translateX(${(bend * 3).toFixed(2)}px) rotate(${(bend * 6).toFixed(2)}deg)`,
        };
      });
      plants.forEach(({ sprite }, index) => sprite.style.transform = measurements[index].transform);

      const sweep = sweepSegment;
      sweepSegment = null;
      if (sweep) {
        let crossing = null;
        for (const { bounds } of measurements) {
          const entry = segmentBoundsEntry(sweep.start, sweep.end, bounds);
          if (entry === null) continue;
          crossing = {
            x: sweep.start.x + (sweep.end.x - sweep.start.x) * entry,
            y: sweep.start.y + (sweep.end.y - sweep.start.y) * entry,
          };
          break;
        }
        if (crossing) {
          if (document.documentElement.dataset.theme === 'dark') {
            spawnFireflies(crossing.x, crossing.y);
          } else {
            spawnButterflies(crossing.x, crossing.y);
          }
        }
      }
    }

    hero.addEventListener('pointermove', (event) => {
      if (!motion.matches || event.pointerType === 'touch') return;
      const now = performance.now();
      const nextPointer = { x: event.clientX, y: event.clientY, time: now };
      if (lastPointer) {
        const elapsed = now - lastPointer.time;
        const distance = Math.hypot(nextPointer.x - lastPointer.x, nextPointer.y - lastPointer.y);
        if (elapsed > 0 && elapsed <= 120 && distance / elapsed >= 0.7) {
          if (!fastStart) fastStart = lastPointer;
          fastDistance += distance;
        } else {
          fastStart = null;
          fastDistance = 0;
        }
        if (fastDistance >= 20) {
          sweepSegment = { start: fastStart, end: nextPointer };
          fastStart = nextPointer;
          fastDistance = 0;
        }
      }
      lastPointer = nextPointer;
      pointer = nextPointer;
      if (!frame) frame = requestAnimationFrame(update);
    }, { passive: true });
    hero.addEventListener('pointerleave', reset);
    hero.addEventListener('pointercancel', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('scroll', reset, { passive: true });
    window.addEventListener('resize', reset, { passive: true });
    motion.addEventListener('change', reset);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) reset();
    });
  }

  function initMapPreview() {
    const previewFrame = $('#map-preview');
    const preview = $('#map-preview-image');
    const unavailable = $('#map-preview-unavailable');
    if (!previewFrame || !preview || !unavailable) return;

    preview.addEventListener('error', () => {
      unavailable.hidden = false;
      previewFrame.classList.add('is-unavailable');
    });
    preview.addEventListener('load', () => {
      unavailable.hidden = true;
      previewFrame.classList.remove('is-unavailable');
    });
  }

  function bindEvents() {
    $('#auth-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      submitAuth(event.currentTarget);
    });
    $('#logout-button')?.addEventListener('click', logout);
    $('#create-invite')?.addEventListener('click', createInvite);
    $('#copy-invite')?.addEventListener('click', copyInvite);

    $('#admin-search-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const search = String(new FormData(event.currentTarget).get('search') || '').trim();
      searchAdminPlayers(search);
    });
    $('#admin-players')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (button) changeBan(button);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && $('#server-state')) {
        refreshStatus();
        refreshLeaderboard();
      }
    });
  }

  function boot() {
    initLanguage();
    initTheme();
    initHeroCarousel();
    initHeaderVines();
    initHeroFlora();
    initMapPreview();
    initSettingsControls();
    bindEvents();
    const page = document.body.dataset.page || 'landing';
    if (page === 'landing') {
      refreshStatus();
      refreshLeaderboard();
      state.statusTimer = setInterval(() => {
        refreshStatus();
        refreshLeaderboard();
      }, 45_000);
      loadMe().then((user) => {
        if (user) renderLandingAccount(user);
      });
    } else if (page === 'auth') {
      initAuthPage();
      loadMe().then((user) => {
        if (user) location.replace(authReturnPath());
        else if (state.authError && $('#auth-message')) setMessage($('#auth-message'), localizeError(state.authError), true);
      });
    } else if (page === 'app') {
      initAppPage();
    }
  }

  boot();
})();
