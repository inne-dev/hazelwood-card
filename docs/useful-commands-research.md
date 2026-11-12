# Проверенные команды и клавиши Hazelwood

Состояние проверено 10 октября 2026 по startup log сервера, активным JAR-дескрипторам и конфигам в `~/Projects/minecraft-server/data/plugins`. Запущен Paper 26.3.0. В startup log включены HazelwoodAuth 1.0.1, TPA 3.0, TradeCycle 2.0.1, SkinsRestorer 15.12.6, Simple Voice Chat 2.6.24, Emotecraft 3.3.0-a.build.150 и BlueMap 5.28. FlectonePulse 1.9.3, AutoTreeChop 1.7.4 и SimpleLogin находятся только в `plugins-disabled/`; их старые конфиги не включают функции.

## Для обычного игрока

| Что сделать | Команда или клавиша | Условия и оговорки |
| --- | --- | --- |
| Открыть чат/ввести команду | `T`, затем текст; команды начинаются с `/` | Клавиша `T` — настройка Java-клиента по умолчанию; её можно переназначить. Tab подсказывает доступные команды и аргументы. |
| Написать лично | `/msg <игрок> <текст>`; также `/tell` и `/w` | Это встроенные vanilla-команды. FlectonePulse сейчас отключён, поэтому его `/reply` и каналы чата недоступны. |
| Войти | `/login <пароль сайта>`; короткий алиас `/l` | Вход обязателен после подключения. До входа сервер блокирует игровые действия. |
| Зарегистрировать аккаунт | Откройте страницу регистрации на сайте | `/register` и `/reg` перехватываются HazelwoodAuth и не регистрируют игрока в игре; они направляют на сайт. |
| Попросить телепорт | `/tpa <игрок>`; алиас `/teleportask` | Запрос живёт 60 секунд. Можно отправлять запрос раз в 30 секунд; после телепорта действует 60-секундная задержка. |
| Принять запрос | `/tpaaccept`; алиасы `/tpaccept`, `/tpyes` | После принятия телепортация начинается через 3 секунды. |
| Отклонить запрос | `/tpadeny`; алиасы `/tpdeny`, `/tpno` | Если игрок двигается во время 3-секундного отсчёта, телепортация отменяется. |
| Поменять скин | `/skin set <имя>` или коротко `/skin <имя>` | SkinsRestorer 15.12.6; смена скина ограничена 30-секундным cooldown. |
| Вернуть скин аккаунта/сервера | `/skin clear` | Удаляет сохранённый выбор; сервер снова разрешает скин аккаунта или настроенный скин по умолчанию. |
| Открыть меню скинов | `/skins` | SR конфиг устанавливает `forceDefaultPermissions: true`; команда меню входит в группу пользовательских команд. `/skin help` показывает команды, доступные аккаунту. |
| Дополнительные действия со скином | `/skin random`, `/skin search <текст>`, `/skin update`, `/skin undo`, `/skin history`, `/skin favourites`, `/skin url <URL> [classic|slim]`, `/skin upload`, `/skin edit` | Это пользовательские команды SR 15.12.6. Upload/edit открывают веб-процесс; URL-команда принимает URL текстуры, не локальный файл. Скин другого игрока требует отдельного staff-разрешения. |
| Сменить сделки жителя | В окне торговли нажать клавишу обмена предметом со второй рукой — обычно `F` | TradeCycle работает на сервере без клиентского мода. Конфиг включает только `KEYBOARD`; курсор должен находиться в области инвентаря. Нельзя переключать сделки у жителя без профессии или после совершённой сделки. |
| Голосовой чат | См. ниже: Simple Voice Chat | Нужен установленный на клиент мод Simple Voice Chat. Сервер не принуждает ставить мод; группы включены. |
| Эмоции | См. ниже: Emotecraft | Наличие серверного плагина само по себе не подтверждает клиентский мод или выбранный клиентский пак. |

Для TPA JAR объявляет `tpa.use` с default=true; проверка установленного bytecode не нашла отдельной проверки этого разрешения в `/tpa`, `/tpaaccept` или `/tpadeny`. `/tpareload` требует `tpa.reload` (default OP). Синтаксис и параметры взяты из активного `TPA-3.0.jar` и его `Tpa/config.yml`.

TradeCycle JAR запущен, но релиз 2.0.1 опубликован с диапазоном совместимости до Minecraft 26.1.2, тогда как сервер сейчас 26.3.0. Startup подтверждает включение плагина, но пользовательское руководство должно считать его функцию условной до проверки в игре на текущей версии.

### Голосовой чат и эмоции

Simple Voice Chat 2.6.24 загружен; в серверном конфиге `enable_groups=true`, `force_voice_chat=false`, UDP-порт `24454`. `/voicechat help`, `/voicechat invite <игрок>`, `/voicechat join <имя группы>` и `/voicechat leave` требуют клиентский мод. Для неоднозначного имени группы нужно принять приглашение либо использовать ID, который команда join получает из приглашения. Пользовательские permissions `voicechat.listen`, `voicechat.speak` и `voicechat.groups` по документации выдаются всем; `/voicechat test <игрок>` — операторская команда.

Если Simple Voice Chat установлен в клиент: `V` открывает меню, `M` выключает микрофон при Voice activation, `N` отключает голосовой чат, `H` скрывает индикаторы. Push-to-talk по умолчанию не назначен: его выбирают в первом мастере настройки. Меню групп на версиях 1.21.6+ по умолчанию не привязано к клавише.

Emotecraft 3.3.0-a.build.150 включён на сервере. Документация клиента указывает `B` как стандартную клавишу колеса эмоций; её можно изменить в настройках управления. Для клиента доступны `/emotes-client play <эмоция>` и `/emotes-client stop`, но команды исполняются локально и не отправляются серверу. Серверные `/emotes play <эмоция> <игрок> <forced>` и `/emotes stop <игрок>` требуют отдельные permissions; их выдачу обычным игрокам в этой сборке подтвердить не удалось. Поэтому не обещать колесо или эти команды до сборки и теста клиентского пака.

## Не включать в пользовательский справочник

- FlectonePulse отключён: его PM/reply/каналы не работают. Доступны встроенные `/msg`, `/tell`, `/w`; отдельной команды ответа нет.
- AutoTreeChop отключён: `/atc` и автоматическая рубка недоступны, несмотря на сохранённый конфиг.
- `/hwskin <requestId>` доступна только серверной консоли/RCON.
- `/tpareload` — администраторская команда. `/voicechat test`, команды `/sr ...` и `/emotes reload` также требуют staff/operator permissions.
- BlueMap является веб-картой и не добавляет здесь подтверждённых команд обычного игрока.

Vanilla `/help` можно использовать для проверки доступных серверных команд. `/teammsg` зависит от того, состоит ли игрок в команде; `/trigger` — от наличия созданной scoreboard-цели типа `trigger`, поэтому не описывать их как гарантированные возможности мира.

## Клиентская сборка

В `~/Projects/minecraft-server` клиентского modpack нет. На эту дату подготовлена только папка `client-pack/` с README и пустым manifest-шаблоном. Пока не выбраны клиентские моды, версии, конфиги и keybind presets. Версии серверных Simple Voice Chat и Emotecraft не считать подтверждением клиентского набора: совместимый клиентский мод и его настройки нужно выбрать и проверить отдельно.

## Проверенные источники

- Активность/версии: `~/Projects/minecraft-server/data/logs/latest.log`; plugin descriptors внутри активных JAR; `TradeCycle/config.yml`, `Tpa/config.yml`, `SkinsRestorer/config.yml`, `voicechat/voicechat-server.properties`; исходник HazelwoodAuth в `minecraft-auth-plugin/src/main/java/space/inne/hazelwood/auth/HazelwoodAuth.java`.
- Mojang: [Controls](https://www.minecraft.net/en-us/article/minecraft-controls), [Commands](https://www.minecraft.net/en-us/article/minecraft-commands).
- TradeCycle: [описание и KEYBOARD-схема](https://hangar.papermc.io/S42yt/TradeCycle), [релиз 2.0.1 и диапазон поддержки](https://hangar.papermc.io/S42yt/TradeCycle/versions/2.0.1).
- SkinsRestorer 15.12.6: [commands and permissions](https://skinsrestorer.net/docs/configuration/commands-permissions), [player access](https://skinsrestorer.net/docs/configuration/player-access), [change or reset a skin](https://skinsrestorer.net/docs/features/change-skin).
- Simple Voice Chat: [commands](https://modrepo.de/minecraft/voicechat/wiki/commands), [permissions](https://modrepo.de/minecraft/voicechat/wiki/permissions), [client setup](https://modrepo.de/minecraft/voicechat/wiki/client_setup), [key bindings](https://modrepo.de/minecraft/voicechat/wiki/key_bindings), [server config](https://modrepo.de/minecraft/voicechat/wiki/server_config).
- Emotecraft: [using emotes and default key](https://docs.zigythebird.com/emotecraft/gettingstarted/using/), [client/server commands and permissions](https://docs.zigythebird.com/emotecraft/gettingstarted/commands/).
