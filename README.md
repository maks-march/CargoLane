# CargoLane
**CargoLane** — это высокопроизводительная логистическая платформа на базе .NET 8, построенная по принципам Clean Architecture и CQRS. Система предназначена для управления грузоперевозками, мониторинга заказов и коммуникации в реальном времени.

# ИНСТРУКЦИЯ как запустить наш проект

1. Скачай docker engine в любом виде ( м.б. docker desktop )
2. Склонируй этот репозиторий ( https://github.com/maks-march/EuroRoute )
3. Найди docker-compose.yaml
4. В консоли передите в директурию docker-compose.yaml, например PS D:\progs\EuroRoute> ( можно в консоли docker desktop)
5. Выполните docker compose up -d
6. Ждите когда скачаются images (nginx, postgres, asp.net)
7. Готово!

# Что дальше?
Можно перейти по http://localhost:8080 и откроется главная страница фронтенда, 
можно перейти на https://localhost:8080/swagger чтобы увидеть API

ИЛИ запуск backend без docker
Перейдите в папку backend:
PS D:\progs\C#\EuroRoute\backend> cd .\Presentation\WebApi\
PS D:\progs\C#\EuroRoute\backend\Presentation\WebApi> dotnet run

Бэк запустится в памяти на порте 5024