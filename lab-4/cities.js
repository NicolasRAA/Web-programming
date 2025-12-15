(function () {
    "use strict";
  
    var CITY_CATALOG = [
      // Russia
      { id: "anadyr", name: "Анадырь", country: "Россия", lat: 64.7333, lon: 177.5167 },
      { id: "arkhangelsk", name: "Архангельск", country: "Россия", lat: 64.5393, lon: 40.5157 },
      { id: "astrakhan", name: "Астрахань", country: "Россия", lat: 46.3497, lon: 48.0408 },
      { id: "barnaul", name: "Барнаул", country: "Россия", lat: 53.3474, lon: 83.7788 },
      { id: "belgorod", name: "Белгород", country: "Россия", lat: 50.5957, lon: 36.5872 },
      { id: "bryansk", name: "Брянск", country: "Россия", lat: 53.2521, lon: 34.3717 },
      { id: "vladivostok", name: "Владивосток", country: "Россия", lat: 43.1155, lon: 131.8855 },
      { id: "vladimir", name: "Владимир", country: "Россия", lat: 56.1291, lon: 40.407 },
      { id: "volgograd", name: "Волгоград", country: "Россия", lat: 48.708, lon: 44.5133 },
      { id: "voronezh", name: "Воронеж", country: "Россия", lat: 51.6608, lon: 39.2003 },
      { id: "yekaterinburg", name: "Екатеринбург", country: "Россия", lat: 56.8389, lon: 60.6057 },
      { id: "ivanovo", name: "Иваново", country: "Россия", lat: 56.9994, lon: 40.9728 },
      { id: "izhevsk", name: "Ижевск", country: "Россия", lat: 56.8526, lon: 53.2048 },
      { id: "irkutsk", name: "Иркутск", country: "Россия", lat: 52.2864, lon: 104.305 },
      { id: "kazan", name: "Казань", country: "Россия", lat: 55.7903, lon: 49.1125 },
      { id: "kaliningrad", name: "Калининград", country: "Россия", lat: 54.7104, lon: 20.4522 },
      { id: "kemerovo", name: "Кемерово", country: "Россия", lat: 55.3552, lon: 86.0873 },
      { id: "kirov", name: "Киров", country: "Россия", lat: 58.6035, lon: 49.6679 },
      { id: "krasnodar", name: "Краснодар", country: "Россия", lat: 45.0355, lon: 38.9753 },
      { id: "krasnoyarsk", name: "Красноярск", country: "Россия", lat: 56.0153, lon: 92.8932 },
      { id: "kursk", name: "Курск", country: "Россия", lat: 51.7304, lon: 36.193 },
      { id: "lipetsk", name: "Липецк", country: "Россия", lat: 52.6102, lon: 39.5942 },
      { id: "magadan", name: "Магадан", country: "Россия", lat: 59.5681, lon: 150.8085 },
      { id: "makhachkala", name: "Махачкала", country: "Россия", lat: 42.9849, lon: 47.5047 },
      { id: "moscow", name: "Москва", country: "Россия", lat: 55.7558, lon: 37.6176 },
      { id: "murmansk", name: "Мурманск", country: "Россия", lat: 68.9585, lon: 33.0827 },
      { id: "naberezhnye_chelny", name: "Набережные Челны", country: "Россия", lat: 55.7436, lon: 52.3958 },
      { id: "nizhny_novgorod", name: "Нижний Новгород", country: "Россия", lat: 56.2965, lon: 43.9361 },
      { id: "novosibirsk", name: "Новосибирск", country: "Россия", lat: 55.0084, lon: 82.9357 },
      { id: "omsk", name: "Омск", country: "Россия", lat: 54.9885, lon: 73.3242 },
      { id: "orenburg", name: "Оренбург", country: "Россия", lat: 51.7682, lon: 55.0969 },
      { id: "perm", name: "Пермь", country: "Россия", lat: 58.0105, lon: 56.2502 },
      { id: "petrozavodsk", name: "Петрозаводск", country: "Россия", lat: 61.7849, lon: 34.3469 },
      { id: "rostov_on_don", name: "Ростов-на-Дону", country: "Россия", lat: 47.2357, lon: 39.7015 },
      { id: "ryazan", name: "Рязань", country: "Россия", lat: 54.6095, lon: 39.7126 },
      { id: "samara", name: "Самара", country: "Россия", lat: 53.1959, lon: 50.1002 },
      { id: "spb", name: "Санкт-Петербург", country: "Россия", lat: 59.9375, lon: 30.3086 },
      { id: "saransk", name: "Саранск", country: "Россия", lat: 54.1809, lon: 45.1862 },
      { id: "saratov", name: "Саратов", country: "Россия", lat: 51.5336, lon: 46.0343 },
      { id: "smolensk", name: "Смоленск", country: "Россия", lat: 54.7826, lon: 32.0453 },
      { id: "sochi", name: "Сочи", country: "Россия", lat: 43.5855, lon: 39.7231 },
      { id: "stavropol", name: "Ставрополь", country: "Россия", lat: 45.0428, lon: 41.9734 },
      { id: "surgut", name: "Сургут", country: "Россия", lat: 61.255, lon: 73.3962 },
      { id: "tambov", name: "Тамбов", country: "Россия", lat: 52.7213, lon: 41.4523 },
      { id: "tver", name: "Тверь", country: "Россия", lat: 56.8587, lon: 35.9176 },
      { id: "tolyatti", name: "Тольятти", country: "Россия", lat: 53.5078, lon: 49.4204 },
      { id: "tomsk", name: "Томск", country: "Россия", lat: 56.501, lon: 84.9925 },
      { id: "tula", name: "Тула", country: "Россия", lat: 54.193, lon: 37.6178 },
      { id: "tyumen", name: "Тюмень", country: "Россия", lat: 57.1522, lon: 65.5272 },
      { id: "ulan_ude", name: "Улан-Удэ", country: "Россия", lat: 51.8335, lon: 107.584 },
      { id: "ufa", name: "Уфа", country: "Россия", lat: 54.7388, lon: 55.9721 },
      { id: "khabarovsk", name: "Хабаровск", country: "Россия", lat: 48.4814, lon: 135.0719 },
      { id: "chelyabinsk", name: "Челябинск", country: "Россия", lat: 55.1644, lon: 61.4368 },
      { id: "yakutsk", name: "Якутск", country: "Россия", lat: 62.0355, lon: 129.6755 },
      { id: "yaroslavl", name: "Ярославль", country: "Россия", lat: 57.6261, lon: 39.8845 },
      
      // Latam and north america
      { id: "anchorage", name: "Анкоридж", country: "США", lat: 61.2181, lon: -149.9003 },
      { id: "asuncion", name: "Асунсьон", country: "Парагвай", lat: -25.2637, lon: -57.5759 },
      { id: "belo_horizonte", name: "Белу-Оризонти", country: "Бразилия", lat: -19.9167, lon: -43.9345 },
      { id: "bogota", name: "Богота", country: "Колумбия", lat: 4.711, lon: -74.0721 },
      { id: "brasilia", name: "Бразилиа", country: "Бразилия", lat: -15.7939, lon: -47.8828 },
      { id: "buenos_aires", name: "Буэнос-Айрес", country: "Аргентина", lat: -34.6037, lon: -58.3816 },
      { id: "valparaiso", name: "Вальпараисо", country: "Чили", lat: -33.0472, lon: -71.6127 },
      { id: "vancouver", name: "Ванкувер", country: "Канада", lat: 49.2827, lon: -123.1207 },
      { id: "washington_dc", name: "Вашингтон", country: "США", lat: 38.9072, lon: -77.0369 },
      { id: "havana", name: "Гавана", country: "Куба", lat: 23.1136, lon: -82.3666 },
      { id: "guadalajara", name: "Гвадалахара", country: "Мексика", lat: 20.6597, lon: -103.3496 },
      { id: "honolulu", name: "Гонолулу", country: "США", lat: 21.3069, lon: -157.8583 },
      { id: "guayaquil", name: "Гуаякиль", country: "Эквадор", lat: -2.17, lon: -79.9224 },
      { id: "caracas", name: "Каракас", country: "Венесуэла", lat: 10.4806, lon: -66.9036 },
      { id: "cartagena_co", name: "Картахена", country: "Колумбия", lat: 10.391, lon: -75.4794 },
      { id: "quito", name: "Кито", country: "Эквадор", lat: -0.1807, lon: -78.4678 },
      { id: "cordoba_ar", name: "Кордова", country: "Аргентина", lat: -31.4201, lon: -64.1888 },
      { id: "cusco", name: "Куско", country: "Перу", lat: -13.5319, lon: -71.9675 },
      { id: "la_paz", name: "Ла-Пас", country: "Боливия", lat: -16.4897, lon: -68.1193 },
      { id: "lima", name: "Лима", country: "Перу", lat: -12.0464, lon: -77.0428 },
      { id: "los_angeles", name: "Лос-Анджелес", country: "США", lat: 34.0522, lon: -118.2437 },
      { id: "miami", name: "Майами", country: "США", lat: 25.7617, lon: -80.1918 },
      { id: "maracaibo", name: "Маракайбо", country: "Венесуэла", lat: 10.6427, lon: -71.6125 },
      { id: "medellin", name: "Медельин", country: "Колумбия", lat: 6.2442, lon: -75.5812 },
      { id: "mexico_city", name: "Мехико", country: "Мексика", lat: 19.4326, lon: -99.1332 },
      { id: "montreal", name: "Монреаль", country: "Канада", lat: 45.5019, lon: -73.5674 },
      { id: "montevideo", name: "Монтевидео", country: "Уругвай", lat: -34.9011, lon: -56.1645 },
      { id: "monterrey", name: "Монтеррей", country: "Мексика", lat: 25.6866, lon: -100.3161 },
      { id: "new_york", name: "Нью-Йорк", country: "США", lat: 40.7128, lon: -74.006 },
      { id: "ottawa", name: "Оттава", country: "Канада", lat: 45.4215, lon: -75.6972 },
      { id: "panama_city", name: "Панама", country: "Панама", lat: 8.9824, lon: -79.5199 },
      { id: "puerto_ayora", name: "Пуэрто-Айора", country: "Эквадор", lat: -0.74, lon: -90.313 },
      { id: "puerto_baquerizo", name: "Пуэрто-Бакерисо-Морено", country: "Эквадор", lat: -0.9011, lon: -89.6102 },
      { id: "rio", name: "Рио-де-Жанейро", country: "Бразилия", lat: -22.9068, lon: -43.1729 },
      { id: "salvador", name: "Салвадор", country: "Бразилия", lat: -12.9777, lon: -38.5016 },
      { id: "sao_paulo", name: "Сан-Паулу", country: "Бразилия", lat: -23.5505, lon: -46.6333 },
      { id: "san_francisco", name: "Сан-Франциско", country: "США", lat: 37.7749, lon: -122.4194 },
      { id: "san_jose_cr", name: "Сан-Хосе", country: "Коста-Рика", lat: 9.9281, lon: -84.0907 },
      { id: "san_juan", name: "Сан-Хуан", country: "Пуэрто-Рико", lat: 18.4655, lon: -66.1057 },
      { id: "santa_cruz", name: "Санта-Крус-де-ла-Сьерра", country: "Боливия", lat: -17.7833, lon: -63.1821 },
      { id: "santo_domingo", name: "Санто-Доминго", country: "Доминиканская Республика", lat: 18.4861, lon: -69.9312 },
      { id: "santiago", name: "Сантьяго", country: "Чили", lat: -33.4489, lon: -70.6693 },
      { id: "toronto", name: "Торонто", country: "Канада", lat: 43.6532, lon: -79.3832 },
      { id: "chicago", name: "Чикаго", country: "США", lat: 41.8781, lon: -87.6298 },
    
      // Evropa
      { id: "amsterdam", name: "Амстердам", country: "Нидерланды", lat: 52.3676, lon: 4.9041 },
      { id: "athens", name: "Афины", country: "Греция", lat: 37.9838, lon: 23.7275 },
      { id: "barcelona", name: "Барселона", country: "Испания", lat: 41.3851, lon: 2.1734 },
      { id: "belgrade", name: "Белград", country: "Сербия", lat: 44.7866, lon: 20.4489 },
      { id: "berlin", name: "Берлин", country: "Германия", lat: 52.52, lon: 13.405 },
      { id: "bern", name: "Берн", country: "Швейцария", lat: 46.948, lon: 7.4474 },
      { id: "bratislava", name: "Братислава", country: "Словакия", lat: 48.1486, lon: 17.1077 },
      { id: "brussels", name: "Брюссель", country: "Бельгия", lat: 50.8503, lon: 4.3517 },
      { id: "budapest", name: "Будапешт", country: "Венгрия", lat: 47.4979, lon: 19.0402 },
      { id: "bucharest", name: "Бухарест", country: "Румыния", lat: 44.4268, lon: 26.1025 },
      { id: "warsaw", name: "Варшава", country: "Польша", lat: 52.2297, lon: 21.0122 },
      { id: "vienna", name: "Вена", country: "Австрия", lat: 48.2082, lon: 16.3738 },
      { id: "vilnius", name: "Вильнюс", country: "Литва", lat: 54.6872, lon: 25.2797 },
      { id: "hamburg", name: "Гамбург", country: "Германия", lat: 53.5511, lon: 9.9937 },
      { id: "dublin", name: "Дублин", country: "Ирландия", lat: 53.3498, lon: -6.2603 },
      { id: "geneva", name: "Женева", country: "Швейцария", lat: 46.2044, lon: 6.1432 },
      { id: "kyiv", name: "Киев", country: "Украина", lat: 50.4501, lon: 30.5234 },
      { id: "copenhagen", name: "Копенгаген", country: "Дания", lat: 55.6761, lon: 12.5683 },
      { id: "lisbon", name: "Лиссабон", country: "Португалия", lat: 38.7223, lon: -9.1393 },
      { id: "london", name: "Лондон", country: "Великобритания", lat: 51.5074, lon: -0.1278 },
      { id: "madrid", name: "Мадрид", country: "Испания", lat: 40.4168, lon: -3.7038 },
      { id: "milan", name: "Милан", country: "Италия", lat: 45.4642, lon: 9.19 },
      { id: "munich", name: "Мюнхен", country: "Германия", lat: 48.1351, lon: 11.582 },
      { id: "oslo", name: "Осло", country: "Норвегия", lat: 59.9139, lon: 10.7522 },
      { id: "paris", name: "Париж", country: "Франция", lat: 48.8566, lon: 2.3522 },
      { id: "prague", name: "Прага", country: "Чехия", lat: 50.0755, lon: 14.4378 },
      { id: "reykjavik", name: "Рейкьявик", country: "Исландия", lat: 64.1466, lon: -21.9426 },
      { id: "riga", name: "Рига", country: "Латвия", lat: 56.9496, lon: 24.1052 },
      { id: "rome", name: "Рим", country: "Италия", lat: 41.9028, lon: 12.4964 },
      { id: "istanbul", name: "Стамбул", country: "Турция", lat: 41.0082, lon: 28.9784 },
      { id: "stockholm", name: "Стокгольм", country: "Швеция", lat: 59.3293, lon: 18.0686 },
      { id: "tallinn", name: "Таллин", country: "Эстония", lat: 59.437, lon: 24.7536 },
      { id: "frankfurt", name: "Франкфурт-на-Майне", country: "Германия", lat: 50.1109, lon: 8.6821 },
      { id: "helsinki", name: "Хельсинки", country: "Финляндия", lat: 60.1699, lon: 24.9384 },
      { id: "zurich", name: "Цюрих", country: "Швейцария", lat: 47.3769, lon: 8.5417 },
      { id: "edinburgh", name: "Эдинбург", country: "Великобритания", lat: 55.9533, lon: -3.1883 },
      
      // Asia
      { id: "abu_dhabi", name: "Абу-Даби", country: "ОАЭ", lat: 24.4539, lon: 54.3773 },
      { id: "almaty", name: "Алматы", country: "Казахстан", lat: 43.222, lon: 76.8512 },
      { id: "astana", name: "Астана", country: "Казахстан", lat: 51.1694, lon: 71.4491 },
      { id: "baghdad", name: "Багдад", country: "Ирак", lat: 33.3152, lon: 44.3661 },
      { id: "baku", name: "Баку", country: "Азербайджан", lat: 40.4093, lon: 49.8671 },
      { id: "bangkok", name: "Бангкок", country: "Таиланд", lat: 13.7563, lon: 100.5018 },
      { id: "bengaluru", name: "Бенгалуру", country: "Индия", lat: 12.9716, lon: 77.5946 },
      { id: "hong_kong", name: "Гонконг", country: "Китай", lat: 22.3193, lon: 114.1694 },
      { id: "dhaka", name: "Дакка", country: "Бангладеш", lat: 23.8103, lon: 90.4125 },
      { id: "delhi", name: "Дели", country: "Индия", lat: 28.6139, lon: 77.209 },
      { id: "jakarta", name: "Джакарта", country: "Индонезия", lat: -6.2088, lon: 106.8456 },
      { id: "jeddah", name: "Джидда", country: "Саудовская Аравия", lat: 21.4858, lon: 39.1925 },
      { id: "doha", name: "Доха", country: "Катар", lat: 25.2854, lon: 51.531 },
      { id: "dubai", name: "Дубай", country: "ОАЭ", lat: 25.2048, lon: 55.2708 },
      { id: "yerevan", name: "Ереван", country: "Армения", lat: 40.1872, lon: 44.5152 },
      { id: "jerusalem", name: "Иерусалим", country: "Израиль", lat: 31.7683, lon: 35.2137 },
      { id: "islamabad", name: "Исламабад", country: "Пакистан", lat: 33.6844, lon: 73.0479 },
      { id: "karachi", name: "Карачи", country: "Пакистан", lat: 24.8607, lon: 67.0011 },
      { id: "kathmandu", name: "Катманду", country: "Непал", lat: 27.7172, lon: 85.324 },
      { id: "colombo", name: "Коломбо", country: "Шри-Ланка", lat: 6.9271, lon: 79.8612 },
      { id: "kuala_lumpur", name: "Куала-Лумпур", country: "Малайзия", lat: 3.139, lon: 101.6869 },
      { id: "lahore", name: "Лахор", country: "Пакистан", lat: 31.5204, lon: 74.3587 },
      { id: "manila", name: "Манила", country: "Филиппины", lat: 14.5995, lon: 120.9842 },
      { id: "muscat", name: "Маскат", country: "Оман", lat: 23.588, lon: 58.3829 },
      { id: "mumbai", name: "Мумбаи", country: "Индия", lat: 19.076, lon: 72.8777 },
      { id: "osaka", name: "Осака", country: "Япония", lat: 34.6937, lon: 135.5023 },
      { id: "beijing", name: "Пекин", country: "Китай", lat: 39.9042, lon: 116.4074 },
      { id: "seoul", name: "Сеул", country: "Южная Корея", lat: 37.5665, lon: 126.978 },
      { id: "singapore", name: "Сингапур", country: "Сингапур", lat: 1.3521, lon: 103.8198 },
      { id: "taipei", name: "Тайбэй", country: "Тайвань", lat: 25.033, lon: 121.5654 },
      { id: "tashkent", name: "Ташкент", country: "Узбекистан", lat: 41.2995, lon: 69.2401 },
      { id: "tbilisi", name: "Тбилиси", country: "Грузия", lat: 41.7151, lon: 44.8271 },
      { id: "tehran", name: "Тегеран", country: "Иран", lat: 35.6892, lon: 51.389 },
      { id: "tel_aviv", name: "Тель-Авив", country: "Израиль", lat: 32.0853, lon: 34.7818 },
      { id: "tokyo", name: "Токио", country: "Япония", lat: 35.6762, lon: 139.6503 },
      { id: "ulaanbaatar", name: "Улан-Батор", country: "Монголия", lat: 47.8864, lon: 106.9057 },
      { id: "hanoi", name: "Ханой", country: "Вьетнам", lat: 21.0278, lon: 105.8342 },
      { id: "ho_chi_minh", name: "Хошимин", country: "Вьетнам", lat: 10.8231, lon: 106.6297 },
      { id: "shanghai", name: "Шанхай", country: "Китай", lat: 31.2304, lon: 121.4737 },
      { id: "kuwait_city", name: "Эль-Кувейт", country: "Кувейт", lat: 29.3759, lon: 47.9774 },
      { id: "riyadh", name: "Эр-Рияд", country: "Саудовская Аравия", lat: 24.7136, lon: 46.6753 },
      
      // Africa
      { id: "abuja", name: "Абуджа", country: "Нигерия", lat: 9.0765, lon: 7.3986 },
      { id: "addis_ababa", name: "Аддис-Абеба", country: "Эфиопия", lat: 8.9806, lon: 38.7578 },
      { id: "accra", name: "Аккра", country: "Гана", lat: 5.6037, lon: -0.187 },
      { id: "alexandria", name: "Александрия", country: "Египет", lat: 31.2001, lon: 29.9187 },
      { id: "algiers", name: "Алжир", country: "Алжир", lat: 36.7538, lon: 3.0588 },
      { id: "dakar", name: "Дакар", country: "Сенегал", lat: 14.7167, lon: -17.4677 },
      { id: "dar_es_salaam", name: "Дар-эс-Салам", country: "Танзания", lat: -6.7924, lon: 39.2083 },
      { id: "johannesburg", name: "Йоханнесбург", country: "ЮАР", lat: -26.2041, lon: 28.0473 },
      { id: "cairo", name: "Каир", country: "Египет", lat: 30.0444, lon: 31.2357 },
      { id: "kampala", name: "Кампала", country: "Уганда", lat: 0.3476, lon: 32.5825 },
      { id: "casablanca", name: "Касабланка", country: "Марокко", lat: 33.5731, lon: -7.5898 },
      { id: "cape_town", name: "Кейптаун", country: "ЮАР", lat: -33.9249, lon: 18.4241 },
      { id: "lagos", name: "Лагос", country: "Нигерия", lat: 6.5244, lon: 3.3792 },
      { id: "nairobi", name: "Найроби", country: "Кения", lat: -1.2921, lon: 36.8219 },
      { id: "rabat", name: "Рабат", country: "Марокко", lat: 34.0209, lon: -6.8416 },
      { id: "tunis", name: "Тунис", country: "Тунис", lat: 36.8065, lon: 10.1815 },
      
      // Oceania
      { id: "brisbane", name: "Брисбен", country: "Австралия", lat: -27.4698, lon: 153.0251 },
      { id: "wellington", name: "Веллингтон", country: "Новая Зеландия", lat: -41.2865, lon: 174.7762 },
      { id: "melbourne", name: "Мельбурн", country: "Австралия", lat: -37.8136, lon: 144.9631 },
      { id: "auckland", name: "Окленд", country: "Новая Зеландия", lat: -36.8485, lon: 174.7633 },
      { id: "perth", name: "Перт", country: "Австралия", lat: -31.9505, lon: 115.8605 },
      { id: "sydney", name: "Сидней", country: "Австралия", lat: -33.8688, lon: 151.2093 },
      { id: "suva", name: "Сува", country: "Фиджи", lat: -18.1248, lon: 178.4501 }
  ];
    /**
     * Returns shallow copy of the full catalog
     */
    function getCityCatalog() {
      return CITY_CATALOG.slice();
    }
  
    /**
     * Find city by internal string id
     */
    function findCityById(id) {
      if (!id) return null;
      for (var i = 0; i < CITY_CATALOG.length; i++) {
        if (CITY_CATALOG[i].id === id) return CITY_CATALOG[i];
      }
      return null;
    }
  
    /**
     * Find city by display name (case-insensitive)
     */
    function findCityByName(name) {
      if (!name) return null;
      var norm = String(name).toLowerCase();
      for (var i = 0; i < CITY_CATALOG.length; i++) {
        if (CITY_CATALOG[i].name.toLowerCase() === norm) {
          return CITY_CATALOG[i];
        }
      }
      return null;
    }
  
    /**
     * prefix-based suggestion search by name
     * Returns up to maxResults items
     */
    function findCitySuggestions(query, maxResults) {
      if (!query) return [];
      var norm = String(query).toLowerCase();
      var out = [];
      var i;
  
      // First pass: prefix match
      for (i = 0; i < CITY_CATALOG.length; i++) {
        var city = CITY_CATALOG[i];
        if (city.name.toLowerCase().indexOf(norm) === 0) {
          out.push(city);
        }
      }
  
      // Second pass: substring match if nothing found
      if (out.length === 0) {
        for (i = 0; i < CITY_CATALOG.length; i++) {
          var city2 = CITY_CATALOG[i];
          if (city2.name.toLowerCase().indexOf(norm) !== -1) {
            out.push(city2);
          }
        }
      }
  
      if (typeof maxResults === "number" && out.length > maxResults) {
        out = out.slice(0, maxResults);
      }
      return out;
    }
  
    // Exposing minimal API on window for app.js
    window.WEATHER_CITY_CATALOG = {
      getAll: getCityCatalog,
      findById: findCityById,
      findByName: findCityByName,
      suggest: findCitySuggestions
    };
  })();
  