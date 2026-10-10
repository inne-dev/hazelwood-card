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
      'language.label': 'Язык сайта', 'server.address': 'Адрес сайта Hazelwood',
      'theme.dark': 'Тёмная', 'theme.light': 'Светлая', 'theme.switchToDark': 'Переключить на тёмную тему', 'theme.switchToLight': 'Переключить на светлую тему',
      'hero.line1': 'HAZELWOOD', 'hero.line2': 'МИР / 01', 'hero.line3': 'JAVA EDITION',
      'hero.intro': 'JAVA · 26.3', 'hero.cta': 'Состояние сервера', 'hero.motd': 'WHITELIST · ПО ПРИГЛАШЕНИЮ',
      'scene.carousel': 'Сцены мира Hazelwood', 'scene.previous': 'Предыдущая сцена', 'scene.next': 'Следующая сцена',
      'scene.pause': 'Поставить карусель на паузу', 'scene.resume': 'Продолжить карусель',
      'scene.dayControls': 'Дневные сцены', 'scene.nightControls': 'Ночные сцены',
      'scene.day1': 'Показать дневную сцену 1', 'scene.day2': 'Показать дневную сцену 2', 'scene.day3': 'Показать дневную сцену 3',
      'scene.night1': 'Показать ночную сцену 1', 'scene.night2': 'Показать ночную сцену 2', 'scene.night3': 'Показать ночную сцену 3',
      'world.eyebrow': 'МИР HAZELWOOD', 'world.title': 'Активность',
      'server.kicker': 'СЕРВЕР · JAVA', 'server.title': 'Состояние сервера', 'server.loading': 'Проверяем', 'server.offline': 'Нет связи', 'server.online': 'В сети', 'server.quiet': 'Сейчас тихо',
      'server.playersLabel': 'игроков\nв мире', 'server.playersUnavailable': 'Список недоступен.', 'server.playersEmpty': 'Игроков нет.', 'server.onlineList': 'Игроки онлайн',
      'map.iframeTitle': 'Интерактивная карта мира Hazelwood', 'map.previewTitle': 'Снимок карты мира Hazelwood',
      'map.previewUnavailable': 'Снимок карты недоступен', 'map.modalTitle': 'Hazelwood · интерактивная карта', 'map.close': 'Закрыть карту',
      'account.title': 'Вход',
      'account.tabsLabel': 'Действия с аккаунтом', 'account.loginTab': 'Войти', 'account.registerTab': 'Регистрация', 'account.nickname': 'Игровой ник', 'account.nicknamePlaceholder': 'Твой ник в Minecraft',
      'account.password': 'Пароль', 'account.passwordHint': 'От 12 символов.', 'account.inviteCode': 'Код приглашения', 'account.loginSubmit': 'Продолжить', 'account.registerSubmit': 'Создать',
      'member.eyebrow': 'ТВОЯ КАРТОЧКА', 'member.title': 'Житель Hazelwood', 'member.logout': 'Выйти', 'member.openMap': 'Открыть интерактивную карту',
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
      'language.label': 'Мова сайту', 'server.address': 'Адреса сайту Hazelwood',
      'theme.dark': 'Темна', 'theme.light': 'Світла', 'theme.switchToDark': 'Перемкнути на темну тему', 'theme.switchToLight': 'Перемкнути на світлу тему',
      'hero.line1': 'HAZELWOOD', 'hero.line2': 'СВІТ / 01', 'hero.line3': 'JAVA EDITION',
      'hero.intro': 'JAVA · 26.3', 'hero.cta': 'Стан сервера', 'hero.motd': 'WHITELIST · ЗА ЗАПРОШЕННЯМ',
      'scene.carousel': 'Сцени світу Hazelwood', 'scene.previous': 'Попередня сцена', 'scene.next': 'Наступна сцена',
      'scene.pause': 'Призупинити карусель', 'scene.resume': 'Продовжити карусель',
      'scene.dayControls': 'Денні сцени', 'scene.nightControls': 'Нічні сцени',
      'scene.day1': 'Показати денну сцену 1', 'scene.day2': 'Показати денну сцену 2', 'scene.day3': 'Показати денну сцену 3',
      'scene.night1': 'Показати нічну сцену 1', 'scene.night2': 'Показати нічну сцену 2', 'scene.night3': 'Показати нічну сцену 3',
      'world.eyebrow': 'СВІТ HAZELWOOD', 'world.title': 'Активність',
      'server.kicker': 'СЕРВЕР · JAVA', 'server.title': 'Стан сервера', 'server.loading': 'Перевіряємо', 'server.offline': 'Немає зв’язку', 'server.online': 'У мережі', 'server.quiet': 'Зараз тихо',
      'server.playersLabel': 'гравців\nу світі', 'server.playersUnavailable': 'Список недоступний.', 'server.playersEmpty': 'Гравців немає.', 'server.onlineList': 'Гравці онлайн',
      'map.iframeTitle': 'Інтерактивна мапа світу Hazelwood', 'map.previewTitle': 'Знімок мапи світу Hazelwood',
      'map.previewUnavailable': 'Знімок мапи недоступний', 'map.modalTitle': 'Hazelwood · інтерактивна мапа', 'map.close': 'Закрити мапу',
      'account.title': 'Вхід',
      'account.tabsLabel': 'Дії з обліковим записом', 'account.loginTab': 'Увійти', 'account.registerTab': 'Реєстрація', 'account.nickname': 'Ігровий нік', 'account.nicknamePlaceholder': 'Твій нік у Minecraft',
      'account.password': 'Пароль', 'account.passwordHint': 'Від 12 символів.', 'account.inviteCode': 'Код запрошення', 'account.loginSubmit': 'Продовжити', 'account.registerSubmit': 'Створити',
      'member.eyebrow': 'ТВОЯ КАРТКА', 'member.title': 'Мешканець Hazelwood', 'member.logout': 'Вийти', 'member.openMap': 'Відкрити інтерактивну мапу',
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
      'language.label': 'Site language', 'server.address': 'Hazelwood website address',
      'theme.dark': 'Dark', 'theme.light': 'Light', 'theme.switchToDark': 'Switch to dark theme', 'theme.switchToLight': 'Switch to light theme',
      'hero.line1': 'HAZELWOOD', 'hero.line2': 'WORLD / 01', 'hero.line3': 'JAVA EDITION',
      'hero.intro': 'JAVA · 26.3', 'hero.cta': 'Server status', 'hero.motd': 'WHITELIST · INVITE ONLY',
      'scene.carousel': 'Hazelwood world scenes', 'scene.previous': 'Previous scene', 'scene.next': 'Next scene',
      'scene.pause': 'Pause carousel', 'scene.resume': 'Resume carousel',
      'scene.dayControls': 'Day scenes', 'scene.nightControls': 'Night scenes',
      'scene.day1': 'Show day scene 1', 'scene.day2': 'Show day scene 2', 'scene.day3': 'Show day scene 3',
      'scene.night1': 'Show night scene 1', 'scene.night2': 'Show night scene 2', 'scene.night3': 'Show night scene 3',
      'world.eyebrow': 'HAZELWOOD WORLD', 'world.title': 'Activity',
      'server.kicker': 'SERVER · JAVA', 'server.title': 'Server status', 'server.loading': 'Checking', 'server.offline': 'No connection', 'server.online': 'Online', 'server.quiet': 'Quiet now',
      'server.playersLabel': 'players\nin the world', 'server.playersUnavailable': 'List unavailable.', 'server.playersEmpty': 'No players online.', 'server.onlineList': 'Players online',
      'map.iframeTitle': 'Interactive Hazelwood world map', 'map.previewTitle': 'Hazelwood world map preview',
      'map.previewUnavailable': 'Map preview unavailable', 'map.modalTitle': 'Hazelwood · interactive map', 'map.close': 'Close map',
      'account.title': 'Sign in',
      'account.tabsLabel': 'Account actions', 'account.loginTab': 'Sign in', 'account.registerTab': 'Register', 'account.nickname': 'Minecraft username', 'account.nicknamePlaceholder': 'Your Minecraft username',
      'account.password': 'Password', 'account.passwordHint': '12 characters min.', 'account.inviteCode': 'Invitation code', 'account.loginSubmit': 'Continue', 'account.registerSubmit': 'Create',
      'member.eyebrow': 'YOUR PROFILE', 'member.title': 'Hazelwood resident', 'member.logout': 'Sign out', 'member.openMap': 'Open interactive map',
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
    document.title = t('page.title');
    $('#page-description').setAttribute('content', t('page.description'));
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
    if (!state.lastStatus) {
      $('#server-state-text').textContent = t('server.loading');
    }
  }

  function syncLanguageControl() {
    $('[data-language-code]').textContent = languageCodes[state.language];
    $('#language-menu').querySelectorAll('[data-language]').forEach((option) => {
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
    setTheme(document.documentElement.dataset.theme || 'light');
    $('#account-nav').textContent = state.user ? t('nav.account') : t('nav.login');

    if (state.lastStatus) renderStatus(state.lastStatus);
    else if (persist) refreshStatus();
    if (!$('#member').hidden) {
      const profileRoot = $('#member-profile');
      if (state.profileLoading) profileRoot.replaceChildren(el('p', 'inline-message', t('profile.loading')));
      else if (state.profileError) profileRoot.replaceChildren(el('p', `inline-message${state.profileError.status === 404 ? '' : ' is-error'}`, state.profileError.status === 404 ? t('profile.notFound') : localizeError(state.profileError)));
      else if (state.profileData) renderProfile(state.profileData, profileRoot, true);
    }
    if (!$('#admin-panel').hidden) {
      const target = $('#admin-players');
      if (state.adminLoading) target.replaceChildren(el('p', 'admin-message', t('admin.playersLoading')));
      else if (state.adminError) target.replaceChildren(el('p', 'admin-message is-error', localizeError(state.adminError)));
      else if (state.adminPlayers) renderAdminPlayers(state.adminPlayers);
      else target.replaceChildren(el('p', 'admin-message', t('admin.playersHint')));
    }
    if (!$('#auth-message').hidden && state.authMessageKey) setMessage($('#auth-message'), t(state.authMessageKey), true);
    else if (state.authError && !$('#auth-message').hidden) setMessage($('#auth-message'), localizeError(state.authError), true);
    if (state.inviteError) $('#invite-message').textContent = localizeError(state.inviteError);
    else if (state.inviteMessageKey) $('#invite-message').textContent = t(state.inviteMessageKey);
    $('#copy-invite').textContent = t(state.inviteCopied ? 'admin.inviteCopyDone' : 'admin.copy');
    if (!$('#toast').hidden && state.toastSource) {
      const source = state.toastSource;
      $('#toast').textContent = source instanceof Error ? localizeError(source) : t(source.key, source.values);
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
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', t(dark ? 'theme.switchToLight' : 'theme.switchToDark'));
    $('#theme-label').textContent = t(dark ? 'theme.light' : 'theme.dark');
    if (persist) {
      state.themeExplicit = true;
      try { localStorage.setItem('hazelwood-theme', dark ? 'dark' : 'light'); } catch (_error) { /* Storage can be disabled. */ }
    }
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
    $('#theme-toggle').addEventListener('click', () => {
      const current = document.documentElement.dataset.theme;
      setTheme(current === 'dark' ? 'light' : 'dark', true);
    });
    media.addEventListener('change', (event) => {
      if (!state.themeExplicit) setTheme(event.matches ? 'dark' : 'light');
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
    const hero = $('#top');
    if (!vines || !hero) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const strands = [...vines.querySelectorAll('.vine-sway')].map((element, index) => ({
      element,
      center: [0.06, 0.70, 0.96][index] ?? (index + 1) / 4,
      phase: index * 2.1,
      angle: 0,
      velocity: 0,
      impulse: 0,
    }));
    if (strands.length === 0) return;

    let heroVisible = !('IntersectionObserver' in window);
    let timer = 0;
    let lastPointerX = null;
    const stepSeconds = 1 / 25;
    const maxAngle = 0.115;

    function tick() {
      timer = 0;
      if (!heroVisible || document.visibilityState !== 'visible' || reducedMotion.matches) return;

      const now = performance.now();
      strands.forEach((strand) => {
        const wind = Math.sin(now * 0.00048 + strand.phase) * 0.22;
        const acceleration = wind - strand.angle * 4.6 - strand.velocity * 2.1;
        strand.velocity += acceleration * stepSeconds + strand.impulse;
        strand.impulse = 0;
        strand.angle += strand.velocity * stepSeconds;
        if (strand.angle > maxAngle || strand.angle < -maxAngle) {
          strand.angle = Math.max(-maxAngle, Math.min(maxAngle, strand.angle));
          strand.velocity *= -0.34;
        }
        strand.element.style.transform = `rotate(${(strand.angle * 180 / Math.PI).toFixed(2)}deg)`;
      });
      timer = window.setTimeout(tick, stepSeconds * 1000);
    }

    function stop() {
      window.clearTimeout(timer);
      timer = 0;
      lastPointerX = null;
      strands.forEach((strand) => { strand.impulse = 0; });
    }

    function start() {
      if (!timer && heroVisible && document.visibilityState === 'visible' && !reducedMotion.matches) {
        timer = window.setTimeout(tick, stepSeconds * 1000);
      }
    }

    const update = () => {
      const active = heroVisible && document.visibilityState === 'visible' && !reducedMotion.matches;
      vines.classList.toggle('is-active', active);
      if (active) start();
      else stop();
      if (reducedMotion.matches) {
        strands.forEach((strand) => {
          strand.angle = 0;
          strand.velocity = 0;
          strand.impulse = 0;
          strand.element.style.removeProperty('transform');
        });
      }
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        heroVisible = entries.some((entry) => entry.isIntersecting);
        update();
      }, { threshold: 0.01 });
      observer.observe(hero);
    }
    window.addEventListener('pointermove', (event) => {
      if (!heroVisible || document.visibilityState !== 'visible' || reducedMotion.matches) return;
      const x = event.clientX / Math.max(window.innerWidth, 1);
      const movement = lastPointerX === null ? 0 : Math.max(-0.5, Math.min(0.5, x - lastPointerX));
      lastPointerX = x;
      if (!movement) return;
      strands.forEach((strand) => {
        const proximity = Math.max(0, 1 - Math.abs(x - strand.center) / 0.34);
        strand.impulse = Math.max(-0.6, Math.min(0.6, strand.impulse + movement * 1.1 * proximity));
      });
    }, { passive: true });
    document.addEventListener('visibilitychange', update);
    reducedMotion.addEventListener('change', update);
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
    const online = data && data.online === true;
    const count = data && Number.isFinite(data.onlineCount) ? data.onlineCount : null;
    const maximum = data && Number.isFinite(data.maxPlayers) ? data.maxPlayers : null;
    const players = Array.isArray(data && data.players) ? data.players : [];
    const statePill = $('#server-state');
    const stateText = $('#server-state-text');

    statePill.classList.remove('status-loading', 'status-online', 'status-offline');
    statePill.classList.add(!available ? 'status-loading' : online ? 'status-online' : 'status-offline');
    stateText.textContent = !available ? t('server.offline') : online ? t('server.online') : t('server.quiet');
    $('#online-count').textContent = available && count !== null ? String(count) : '—';
    $('#max-players').textContent = available && maximum !== null ? String(maximum) : '—';
    const list = $('#online-players');
    const names = [...new Set(players
      .map((player) => typeof player === 'string' ? player : player && player.username)
      .filter((username) => typeof username === 'string' && /^[A-Za-z0-9_]{3,16}$/.test(username)))];
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
          const glyph = el('span', 'player-glyph', username.slice(0, 1).toUpperCase());
          glyph.setAttribute('aria-hidden', 'true');
          const head = el('img', 'player-head');
          head.alt = '';
          head.setAttribute('aria-hidden', 'true');
          head.loading = 'lazy';
          head.decoding = 'async';
          head.referrerPolicy = 'no-referrer';
          head.hidden = true;
          head.addEventListener('load', () => {
            glyph.hidden = true;
            head.hidden = false;
          }, { once: true });
          head.addEventListener('error', () => {
            head.hidden = true;
            glyph.hidden = false;
          }, { once: true });
          head.src = `https://mc-heads.net/avatar/${encodeURIComponent(username)}/24`;
          player.append(glyph, head, el('span', '', username));
          item.append(player);
          onlinePlayerNodes.set(username, item);
        }
        nextPlayerNodes.set(username, item);
        return item;
      }));
      onlinePlayerNodes.clear();
      nextPlayerNodes.forEach((item, username) => onlinePlayerNodes.set(username, item));
    }
    $('#status-error').hidden = true;
  }

  async function refreshStatus() {
    if (document.visibilityState === 'hidden') return;
    try {
      const data = await api('/status', { cache: 'no-store' });
      renderStatus(data || {});
    } catch (error) {
      state.lastStatus = null;
      const pill = $('#server-state');
      pill.classList.remove('status-online', 'status-offline');
      pill.classList.add('status-loading');
      $('#server-state-text').textContent = t('server.offline');
      $('#online-count').textContent = '—';
      $('#max-players').textContent = '—';
      $('.player-presence').hidden = false;
      $('#online-players').replaceChildren(el('li', 'empty-online', t('server.playersUnavailable')));
      onlinePlayerNodes.clear();
      const statusError = $('#status-error');
      statusError.textContent = localizeError(error);
      statusError.hidden = false;
    }
  }

  function makePresence(online) {
    const presence = el('span', `profile-presence ${online ? 'is-online' : 'is-offline'}`);
    presence.append(el('span', 'state-dot'), document.createTextNode(online ? t('profile.inWorld') : t('profile.notPlaying')));
    return presence;
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

  function setAccountTab(tabName) {
    const isRegister = tabName === 'register';
    $('#tab-login').classList.toggle('is-active', !isRegister);
    $('#tab-login').setAttribute('aria-selected', String(!isRegister));
    $('#tab-register').classList.toggle('is-active', isRegister);
    $('#tab-register').setAttribute('aria-selected', String(isRegister));
    $('#login-pane').hidden = isRegister;
    $('#register-pane').hidden = !isRegister;
    state.authError = null;
    state.authMessageKey = null;
    setMessage($('#auth-message'), '');
  }

  function showAccount(user) {
    state.user = user;
    const signedIn = Boolean(user);
    if (!signedIn && $('#map-dialog').open) $('#map-dialog').close();
    if (!signedIn) {
      state.profileData = null;
      state.profileError = null;
      state.profileLoading = false;
    }
    $('#account').hidden = signedIn;
    $('#member').hidden = !signedIn;
    $('#account-nav').href = signedIn ? '#member' : '#account';
    $('#account-nav').textContent = signedIn ? t('nav.account') : t('nav.login');
    if (!signedIn) {
      $('#admin-panel').hidden = true;
      return;
    }
    const username = typeof user.username === 'string' ? user.username : '';
    if (!username) {
      showAccount(null);
      return;
    }
    const profile = { username, role: user.role, createdAt: user.createdAt, online: false, lastSeenAt: null };
    renderProfile(profile, $('#member-profile'), true);
    loadPlayer(username, $('#member-profile'), true);
    const admin = user.role === 'admin';
    $('#admin-panel').hidden = !admin;
    if (admin) {
      state.adminPlayers = null;
      state.adminError = null;
      $('#admin-players').replaceChildren(el('p', 'admin-message', t('admin.playersHint')));
    }
  }

  async function loadMe() {
    try {
      const result = await api('/me');
      state.authError = null;
      state.authMessageKey = null;
      showAccount(result && result.user ? result.user : null);
      return result && result.user ? result.user : null;
    } catch (error) {
      if (error.status !== 401) {
        state.authError = error;
        state.authMessageKey = null;
        $('#auth-message').textContent = localizeError(error);
        $('#auth-message').hidden = false;
      }
      showAccount(null);
      return null;
    }
  }

  async function submitAuth(form, endpoint, successText) {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const message = $('#auth-message');
    state.authError = null;
    state.authMessageKey = null;
    setMessage(message, '');
    setFormBusy(form, true, endpoint === '/login' ? 'auth.busyLogin' : 'auth.busyRegister');
    try {
      await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      const user = await loadMe();
      if (user) {
        form.reset();
        scrollTo($('#member'));
        return;
      }
      state.authError = null;
      state.authMessageKey = endpoint === '/register' ? successText : 'auth.loginFallback';
      setMessage(message, t(state.authMessageKey), true);
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
      showAccount(null);
      setAccountTab('login');
      showToast(t('auth.loggedOut'), { key: 'auth.loggedOut' });
      scrollTo($('#account'));
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

  function initMapPreview() {
    const trigger = $('#member-map-open');
    const previewFrame = $('#map-preview');
    const preview = $('#map-preview-image');
    const unavailable = $('#map-preview-unavailable');
    const dialog = $('#map-dialog');
    const closeButton = $('#map-dialog-close');
    const iframe = $('#interactive-map');
    let returnFocus = null;

    preview.addEventListener('error', () => {
      unavailable.hidden = false;
      previewFrame.classList.add('is-unavailable');
    });
    preview.addEventListener('load', () => {
      unavailable.hidden = true;
      previewFrame.classList.remove('is-unavailable');
    });
    trigger.addEventListener('click', () => {
      if (!state.user) return;
      returnFocus = document.activeElement;
      dialog.showModal();
      iframe.src = '/map/';
      closeButton.focus();
    });
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      iframe.removeAttribute('src');
      if (returnFocus instanceof HTMLElement && returnFocus.isConnected && !$('#member').hidden) returnFocus.focus();
      returnFocus = null;
    });
  }

  function bindEvents() {
    $('#tab-login').addEventListener('click', () => setAccountTab('login'));
    $('#tab-register').addEventListener('click', () => setAccountTab('register'));
    $('.account-tabs').addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const register = event.key === 'ArrowRight' || event.key === 'End';
      const tab = register ? $('#tab-register') : $('#tab-login');
      setAccountTab(register ? 'register' : 'login');
      tab.focus();
    });
    $('#login-form').addEventListener('submit', (event) => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      submitAuth(event.currentTarget, '/login', '');
    });
    $('#register-form').addEventListener('submit', (event) => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      submitAuth(event.currentTarget, '/register', 'auth.registerFallback');
    });
    $('#logout-button').addEventListener('click', logout);
    $('#create-invite').addEventListener('click', createInvite);
    $('#copy-invite').addEventListener('click', copyInvite);

    $('#admin-search-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const search = new FormData(event.currentTarget).get('search').trim();
      searchAdminPlayers(search);
    });
    $('#admin-players').addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (button) changeBan(button);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refreshStatus();
    });
  }

  function boot() {
    initLanguage();
    initTheme();
    initHeroCarousel();
    initHeaderVines();
    initMapPreview();
    bindEvents();
    refreshStatus();
    state.statusTimer = setInterval(refreshStatus, 45_000);
    loadMe();
  }

  boot();
})();
