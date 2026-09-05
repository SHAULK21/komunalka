"""
Калькулятор комунальних платежів м. Києва
Актуальні тарифи станом на 1 вересня 2026 року
Для хостингу на Streamlit (Streamlit Community Cloud / Server)
"""

import streamlit as st
import pandas as pd
import json
from datetime import datetime

# Налаштування сторінки
st.set_page_config(
    page_title="Калькулятор комуналки Київ (2026)",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded",
)

MONTH_NAMES_UA = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
]

# Тарифи керуючих компаній за 10 районами Києва (на 2025–2026 рр.)
KYIV_DISTRICTS = [
    {
        "id": "obolonskyi",
        "name": "Оболонський район",
        "short_name": "Оболонь",
        "managing_company": "КП «Керуюча компанія Оболонського району»",
        "rate": 12.84,
        "rate_range": "12.50 – 13.08 грн/м²",
        "notes": "Типові панельні та цегляні будинки Оболоні, Мінського масиву та Пріорки",
    },
    {
        "id": "pecherskyi",
        "name": "Печерський район",
        "short_name": "Печерськ",
        "managing_company": "КП «Керуюча компанія Печерського району»",
        "rate": 13.80,
        "rate_range": "13.20 – 14.50 грн/м²",
        "notes": "Центр столиці, висока частка історичного житлофонду та вищі експлуатаційні витрати",
    },
    {
        "id": "shevchenkivskyi",
        "name": "Шевченківський район",
        "short_name": "Шевченківський",
        "managing_company": "КП «Керуюча компанія Шевченківського району»",
        "rate": 13.60,
        "rate_range": "13.00 – 13.94 грн/м²",
        "notes": "Центр, Лук’янівка, Сирець, Нивки: дореволюційні та сталінські будинки",
    },
    {
        "id": "holosiivskyi",
        "name": "Голосіївський район",
        "short_name": "Голосієво",
        "managing_company": "КП «Керуюча компанія Голосіївського району»",
        "rate": 12.75,
        "rate_range": "12.50 – 13.10 грн/м²",
        "notes": "Голосіїв, Деміївка, Теремки-1 та Теремки-2",
    },
    {
        "id": "darnytskyi",
        "name": "Дарницький район",
        "short_name": "Дарниця",
        "managing_company": "КП «Керуюча компанія Дарницького району»",
        "rate": 12.60,
        "rate_range": "12.40 – 12.95 грн/м²",
        "notes": "Позняки, Осокорки, Харківський: великі багатоповерхові масиви",
    },
    {
        "id": "desnianskyi",
        "name": "Деснянський район",
        "short_name": "Троєщина / Лісовий",
        "managing_company": "КП «Керуюча компанія Деснянського району»",
        "rate": 12.20,
        "rate_range": "11.80 – 12.60 грн/м²",
        "notes": "Троєщина та Лісовий масив: типова багатоповерхова забудова з оптимізованими витратами",
    },
    {
        "id": "dniprovskyi",
        "name": "Дніпровський район",
        "short_name": "Дніпровський",
        "managing_company": "КП «Керуюча компанія Дніпровського району»",
        "rate": 12.50,
        "rate_range": "12.20 – 12.80 грн/м²",
        "notes": "Русанівка, Березняки, Воскресенка, Дарниця, Райдужний",
    },
    {
        "id": "podilskyi",
        "name": "Подільський район",
        "short_name": "Поділ / Виноградар",
        "managing_company": "КП «Керуюча компанія Подільського району»",
        "rate": 13.10,
        "rate_range": "12.80 – 13.50 грн/м²",
        "notes": "Історичний Поділ, Куренівка, Мостицький масив, Виноградар",
    },
    {
        "id": "sviatoshynskyi",
        "name": "Святошинський район",
        "short_name": "Святошин / Борщагівка",
        "managing_company": "КП «Керуюча компанія Святошинського району»",
        "rate": 12.45,
        "rate_range": "12.10 – 12.75 грн/м²",
        "notes": "Борщагівка, Святошин, Академмістечко, Біличі",
    },
    {
        "id": "solomianskyi",
        "name": "Солом'янський район",
        "short_name": "Солом'янка",
        "managing_company": "КП «Керуюча компанія Солом'янського району»",
        "rate": 12.65,
        "rate_range": "12.30 – 12.90 грн/м²",
        "notes": "Солом'янка, Чоколівка, Відрадний, Караваєві Дачі",
    },
    {
        "id": "osbb",
        "name": "ОСББ / ЖБК (середній внесок)",
        "short_name": "ОСББ / ЖБК",
        "managing_company": "Об’єднання співвласників багатоквартирного будинку",
        "rate": 18.00,
        "rate_range": "15.00 – 22.00 грн/м²",
        "notes": "Внесок на утримання будинку, консьєржа, відеоспостереження та ремонтний фонд ОСББ",
    },
    {
        "id": "private",
        "name": "Приватна КК / Новобудова",
        "short_name": "Приватна компанія",
        "managing_company": "Приватна керуюча компанія",
        "rate": 22.50,
        "rate_range": "18.00 – 30.00 грн/м²",
        "notes": "ЖК комфорт-, бізнес- та преміум-класу (охорона, закрита територія, прибирання)",
    },
    {
        "id": "custom",
        "name": "Власний тариф з платіжки",
        "short_name": "Індивідуальний",
        "managing_company": "Управитель вашого будинку",
        "rate": 12.50,
        "rate_range": "Встановлюється індивідуально",
        "notes": "Введіть точну ставку вашого будинку вручну",
    },
]

def get_kyiv_district(district_id):
    for d in KYIV_DISTRICTS:
        if d["id"] == district_id:
            return d
    return KYIV_DISTRICTS[0]

KYIV_OFFICIAL_TARIFFS = [
    {
        "category": "Електроенергія",
        "name": "Єдиний тариф для населення",
        "provider": "YASNO (ТОВ «Київські енергетичні послуги») / ДТЕК",
        "rate": 4.32,
        "unit": "грн / кВт⋅год",
        "details": "Діє єдина фіксована ціна 4,32 грн/кВт⋅год (продовжено урядом до 31 жовтня 2026 р.). Двозонні лічильники: ніч (23:00-07:00) 2,16 грн/кВт⋅год (-50%).",
        "legal": "Постанова КМУ №632 (продовжено до 31.10.2026)",
    },
    {
        "category": "Холодна вода та стоки",
        "name": "Централізоване водопостачання та водовідведення",
        "provider": "ПрАТ «АК «Київводоканал»",
        "rate": 63.79,
        "unit": "грн / м³",
        "details": "Водопостачання 35,88 грн/м³ + водовідведення 27,91 грн/м³ = 63,79 грн/м³ (підтримано Київрадою у вересні 2026). Абонплата ~40,00 грн.",
        "legal": "Рішення Київради від вересня 2026 р. / Тариф НКРЕКП",
    },
    {
        "category": "Гаряча вода",
        "name": "Централізоване гаряче водопостачання",
        "provider": "КП «Київтеплоенерго»",
        "rate": 97.89,
        "unit": "грн / м³",
        "details": "Мораторій на період воєнного стану та 6 міс. після нього фіксує пільговий тариф 97,89 грн/м³.",
        "legal": "Закон України про мораторій на підвищення тарифів",
    },
    {
        "category": "Опалення",
        "name": "Централізоване опалення",
        "provider": "КП «Київтеплоенерго»",
        "rate": 1654.41,
        "unit": "грн / Гкал (~38.50 грн/м²)",
        "details": "Фіксований тариф 1654,41 грн/Гкал або розрахунковий 38,50 грн/м² під час опалювального сезону (з середини жовтня по квітень).",
        "legal": "Фіксований тариф КП Київтеплоенерго (мораторій)",
    },
    {
        "category": "Газ",
        "name": "Постачання природного газу",
        "provider": "ТОВ «ГК «Нафтогаз України»",
        "rate": 7.96,
        "unit": "грн / м³",
        "details": "Фіксований тариф 7,96 грн/м³ зафіксовано в межах тарифу «Фіксований» щонайменше до 30 квітня 2027 року.",
        "legal": "Тариф ГК Нафтогаз України (до 30.04.2027)",
    },
    {
        "category": "Доставка газу",
        "name": "Розподіл природного газу",
        "provider": "АТ «Київгаз»",
        "rate": 0.384,
        "unit": "грн / м³ (або фікс. абонплата)",
        "details": "Оплата за розподіл газу зафіксована мораторієм (зазвичай 18–35 грн/міс. залежно від споживання за минулий газовий рік).",
        "legal": "Тариф АТ Київгаз (мораторій НКРЕКП)",
    },
    {
        "category": "Квартплата",
        "name": "Утримання будинку та прибудинкової території (за районами)",
        "provider": "Комунальні керуючі компанії 10 районів / ОСББ",
        "rate": 12.84,
        "unit": "грн / м² (сер. 12.20 – 13.80)",
        "details": "Тарифи на послуги з утримання будинків встановлені індивідуально для кожного будинку (конкурси управителів КМДА). Середній діапазон по 10 районах Києва становить 12.20 – 13.80 грн/м² (Оболонський: 12.84, Печерський: 13.80, Деснянський: 12.20).",
        "legal": "Розпорядження КМДА / результати міських конкурсів управителів",
    },
    {
        "category": "Вивіз сміття",
        "name": "Поводження з побутовими відходами",
        "provider": "КП «Київкомунсервіс»",
        "rate": 46.37,
        "unit": "грн / ос. на місяць",
        "details": "Нараховується на кожну зареєстровану особу в квартирі (46,37 грн/люд.).",
        "legal": "Розпорядження КМДА / КП Київкомунсервіс",
    },
]

def get_initial_services():
    return [
        {
            "id": "electricity",
            "name": "Електроенергія",
            "category": "Електроенергія",
            "provider": "YASNO / ДТЕК",
            "is_enabled": True,
            "calc_mode": "meters",
            "prev_reading": 1240.0,
            "curr_reading": 1385.0,
            "has_two_zones": False,
            "prev_reading_night": 410.0,
            "curr_reading_night": 460.0,
            "tariff": 4.32,
            "tariff_night": 2.16,
            "abonplata": 0.0,
            "unit": "кВт⋅год",
        },
        {
            "id": "cold_water",
            "name": "Холодна вода та водовідведення",
            "category": "Водопостачання",
            "provider": "Київводоканал",
            "is_enabled": True,
            "calc_mode": "meters",
            "prev_reading": 182.0,
            "curr_reading": 188.0,
            "has_two_zones": False,
            "tariff": 63.79,
            "tariff_night": 0.0,
            "abonplata": 40.0,
            "unit": "м³",
        },
        {
            "id": "hot_water",
            "name": "Гаряча вода",
            "category": "Водопостачання",
            "provider": "Київтеплоенерго",
            "is_enabled": True,
            "calc_mode": "meters",
            "prev_reading": 95.0,
            "curr_reading": 98.0,
            "has_two_zones": False,
            "tariff": 97.89,
            "tariff_night": 0.0,
            "abonplata": 25.0,
            "unit": "м³",
        },
        {
            "id": "heating",
            "name": "Централізоване опалення",
            "category": "Опалення",
            "provider": "Київтеплоенерго",
            "is_enabled": True,
            "calc_mode": "norm_sqm",
            "prev_reading": 0.0,
            "curr_reading": 0.0,
            "has_two_zones": False,
            "tariff": 38.50,
            "tariff_night": 0.0,
            "abonplata": 20.0,
            "unit": "м²",
        },
        {
            "id": "gas",
            "name": "Газ (споживання)",
            "category": "Газ та доставка",
            "provider": "Нафтогаз України",
            "is_enabled": True,
            "calc_mode": "meters",
            "prev_reading": 312.0,
            "curr_reading": 320.0,
            "has_two_zones": False,
            "tariff": 7.96,
            "tariff_night": 0.0,
            "abonplata": 0.0,
            "unit": "м³",
        },
        {
            "id": "gas_delivery",
            "name": "Доставка / розподіл газу",
            "category": "Газ та доставка",
            "provider": "Київгаз",
            "is_enabled": True,
            "calc_mode": "fixed",
            "prev_reading": 0.0,
            "curr_reading": 0.0,
            "has_two_zones": False,
            "tariff": 24.50,
            "tariff_night": 0.0,
            "abonplata": 0.0,
            "unit": "міс.",
        },
        {
            "id": "maintenance",
            "name": "Квартплата (утримання будинку/ОСББ)",
            "category": "Квартплата (ОСББ)",
            "provider": "КП «Керуюча компанія Оболонського району»",
            "is_enabled": True,
            "calc_mode": "norm_sqm",
            "prev_reading": 0.0,
            "curr_reading": 0.0,
            "has_two_zones": False,
            "tariff": 12.84,
            "tariff_night": 0.0,
            "abonplata": 0.0,
            "unit": "м²",
        },
        {
            "id": "garbage",
            "name": "Вивіз сміття (ТПВ)",
            "category": "Вивіз сміття",
            "provider": "Київкомунсервіс",
            "is_enabled": True,
            "calc_mode": "norm_person",
            "prev_reading": 0.0,
            "curr_reading": 0.0,
            "has_two_zones": False,
            "tariff": 46.37,
            "tariff_night": 0.0,
            "abonplata": 0.0,
            "unit": "ос.",
        },
    ]

# Ініціалізація session_state
if "services" not in st.session_state:
    st.session_state.services = get_initial_services()

if "address" not in st.session_state:
    st.session_state.address = "м. Київ, вул. Хрещатик, 24, кв. 15"

if "residents" not in st.session_state:
    st.session_state.residents = 2

if "area" not in st.session_state:
    st.session_state.area = 52.0

if "district" not in st.session_state:
    st.session_state.district = "obolonskyi"

if "is_heating_season" not in st.session_state:
    st.session_state.is_heating_season = False

if "period_month" not in st.session_state:
    st.session_state.period_month = 8  # Вересень (0-indexed: 8)

if "period_year" not in st.session_state:
    st.session_state.period_year = 2026

if "history" not in st.session_state:
    st.session_state.history = []

# Розрахунок вартості для послуги
def calculate_service(srv, residents, area, is_heating_season):
    if not srv["is_enabled"]:
        return {
            "consumption": 0.0,
            "consumption_night": 0.0,
            "cost": 0.0,
            "abonplata": 0.0,
            "total": 0.0,
        }

    mode = srv["calc_mode"]
    tariff = float(srv.get("tariff", 0.0))
    abonplata = float(srv.get("abonplata", 0.0))

    if mode == "meters":
        prev = float(srv.get("prev_reading", 0.0))
        curr = float(srv.get("curr_reading", 0.0))
        diff = max(0.0, curr - prev)

        if srv.get("has_two_zones", False):
            prev_night = float(srv.get("prev_reading_night", 0.0))
            curr_night = float(srv.get("curr_reading_night", 0.0))
            diff_night = max(0.0, curr_night - prev_night)
            tariff_night = float(srv.get("tariff_night", tariff / 2))
            cost = (diff * tariff) + (diff_night * tariff_night)
            return {
                "consumption": diff,
                "consumption_night": diff_night,
                "cost": round(cost, 2),
                "abonplata": abonplata,
                "total": round(cost + abonplata, 2),
            }
        else:
            cost = diff * tariff
            return {
                "consumption": diff,
                "consumption_night": 0.0,
                "cost": round(cost, 2),
                "abonplata": abonplata,
                "total": round(cost + abonplata, 2),
            }

    elif mode == "norm_sqm":
        # Опалення діє тільки під час опалювального сезону
        if srv["id"] == "heating" and not is_heating_season:
            return {
                "consumption": area,
                "consumption_night": 0.0,
                "cost": 0.0,
                "abonplata": 0.0,
                "total": 0.0,
            }
        cost = area * tariff
        return {
            "consumption": area,
            "consumption_night": 0.0,
            "cost": round(cost, 2),
            "abonplata": abonplata,
            "total": round(cost + abonplata, 2),
        }

    elif mode == "norm_person":
        cost = residents * tariff
        return {
            "consumption": float(residents),
            "consumption_night": 0.0,
            "cost": round(cost, 2),
            "abonplata": abonplata,
            "total": round(cost + abonplata, 2),
        }

    else:  # fixed
        cost = tariff
        return {
            "consumption": 1.0,
            "consumption_night": 0.0,
            "cost": round(cost, 2),
            "abonplata": abonplata,
            "total": round(cost + abonplata, 2),
        }

# --- Сайдбар: Параметри та налаштування ---
with st.sidebar:
    st.image("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80", use_container_width=True)
    st.title("🏛️ Калькулятор Києва")
    st.caption("Актуальні тарифи станом на 1 вересня 2026 року")

    st.subheader("📍 Параметри помешкання")
    st.session_state.address = st.text_input("Адреса квартири", st.session_state.address)

    # Вибір району Києва для розрахунку квартплати
    district_ids = [d["id"] for d in KYIV_DISTRICTS]
    curr_dist_id = st.session_state.district if st.session_state.district in district_ids else "obolonskyi"
    curr_dist_idx = district_ids.index(curr_dist_id)

    selected_dist = st.selectbox(
        "🏛️ Район Києва (квартплата)",
        options=district_ids,
        index=curr_dist_idx,
        format_func=lambda did: f"{get_kyiv_district(did)['name']} ({get_kyiv_district(did)['rate']} ₴/м²)",
        help="Тариф на утримання будинків різниться залежно від району та управителя будинку"
    )

    if selected_dist != st.session_state.district:
        st.session_state.district = selected_dist
        new_d = get_kyiv_district(selected_dist)
        # Оновлюємо послугу квартплати
        for s in st.session_state.services:
            if s["id"] == "maintenance":
                s["tariff"] = new_d["rate"]
                s["provider"] = new_d["managing_company"]
        st.toast(f"Обрано {new_d['name']}! Тариф: {new_d['rate']} ₴/м²", icon="🏢")
        st.rerun()

    active_dist_info = get_kyiv_district(st.session_state.district)
    st.caption(f"🏢 **Управитель:** {active_dist_info['managing_company']}  \n📊 **Діапазон у районі:** {active_dist_info['rate_range']}")

    col_res, col_area = st.columns(2)
    with col_res:
        st.session_state.residents = st.number_input("Прописано осіб", min_value=1, max_value=20, value=st.session_state.residents, step=1)
    with col_area:
        st.session_state.area = st.number_input("Площа, м²", min_value=10.0, max_value=500.0, value=float(st.session_state.area), step=1.0)

    st.session_state.is_heating_season = st.toggle(
        "🔥 Опалювальний сезон увімкнено",
        value=st.session_state.is_heating_season,
        help="Зазвичай діє з середини жовтня по квітень. На 1 вересня опалення вимкнено."
    )

    st.divider()

    st.subheader("📅 Розрахунковий період")
    col_m, col_y = st.columns(2)
    with col_m:
        st.session_state.period_month = st.selectbox(
            "Місяць",
            options=list(range(12)),
            format_func=lambda i: MONTH_NAMES_UA[i],
            index=st.session_state.period_month,
        )
    with col_y:
        st.session_state.period_year = st.number_input("Рік", min_value=2024, max_value=2030, value=st.session_state.period_year, step=1)

    st.divider()

    st.subheader("⚡ Швидкі шаблони")
    col_p1, col_p2, col_p3 = st.columns(3)
    if col_p1.button("1-кімн.\n(36 м²)", use_container_width=True):
        st.session_state.residents = 1
        st.session_state.area = 36.0
        st.rerun()
    if col_p2.button("2-кімн.\n(52 м²)", use_container_width=True):
        st.session_state.residents = 2
        st.session_state.area = 52.0
        st.rerun()
    if col_p3.button("3-кімн.\n(74 м²)", use_container_width=True):
        st.session_state.residents = 3
        st.session_state.area = 74.0
        st.rerun()

    st.divider()

    # Перенесення показників на наступний місяць
    if st.button("🔄 Перенести показники на наст. місяць", use_container_width=True):
        for srv in st.session_state.services:
            if srv["calc_mode"] == "meters":
                srv["prev_reading"] = srv.get("curr_reading", 0.0)
                if srv.get("has_two_zones", False):
                    srv["prev_reading_night"] = srv.get("curr_reading_night", 0.0)
        
        # Перемикання місяця
        next_month = (st.session_state.period_month + 1) % 12
        if st.session_state.period_month == 11:
            st.session_state.period_year += 1
        st.session_state.period_month = next_month

        st.toast(f"Показники зафіксовано! Період перемкнуто на {MONTH_NAMES_UA[next_month]} {st.session_state.period_year} р.", icon="✅")
        st.rerun()

    if st.button("🔄 Скинути до стандартних значень", use_container_width=True):
        st.session_state.services = get_initial_services()
        st.session_state.address = "м. Київ, вул. Хрещатик, 24, кв. 15"
        st.session_state.residents = 2
        st.session_state.area = 52.0
        st.session_state.is_heating_season = False
        st.session_state.period_month = 8
        st.session_state.period_year = 2026
        st.rerun()

    st.divider()

    with st.expander("💾 Збереження та відновлення моїх даних", expanded=False):
        st.caption(
            "🔒 **Повна конфіденційність:** на сервері Streamlit у кожного відвідувача своя ізольована сесія. "
            "Дані інших людей ви не бачите, а вони не бачать ваші. "
            "Щоб зберегти свої показники між сесіями (після закриття вкладки), збережіть файл профілю."
        )

        backup_payload = {
            "version": "2026.1",
            "saved_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "address": st.session_state.address,
            "district": st.session_state.district,
            "residents": st.session_state.residents,
            "area": st.session_state.area,
            "is_heating_season": st.session_state.is_heating_season,
            "period_month": st.session_state.period_month,
            "period_year": st.session_state.period_year,
            "services": st.session_state.services,
            "history": st.session_state.history,
        }
        json_backup_bytes = json.dumps(backup_payload, ensure_ascii=False, indent=2).encode("utf-8")

        st.download_button(
            label="📥 Зберегти мій профіль (JSON)",
            data=json_backup_bytes,
            file_name="komunalka_kyiv_profile.json",
            mime="application/json",
            use_container_width=True,
            help="Завантажити файл із вашими адресою, лічильниками та історією",
            key="btn_download_profile_json"
        )

        uploaded_profile = st.file_uploader(
            "📂 Завантажити мій профіль",
            type=["json"],
            key="uploader_profile_json",
            help="Відновити показники з раніше збереженого файлу"
        )
        if uploaded_profile is not None:
            try:
                data = json.loads(uploaded_profile.getvalue().decode("utf-8"))
                if "services" in data and isinstance(data["services"], list):
                    st.session_state.services = data["services"]
                if "address" in data:
                    st.session_state.address = str(data["address"])
                if "district" in data and any(d["id"] == data["district"] for d in KYIV_DISTRICTS):
                    st.session_state.district = str(data["district"])
                if "residents" in data:
                    st.session_state.residents = int(data["residents"])
                if "area" in data:
                    st.session_state.area = float(data["area"])
                if "is_heating_season" in data:
                    st.session_state.is_heating_season = bool(data["is_heating_season"])
                if "period_month" in data:
                    st.session_state.period_month = int(data["period_month"])
                if "period_year" in data:
                    st.session_state.period_year = int(data["period_year"])
                if "history" in data and isinstance(data["history"], list):
                    st.session_state.history = data["history"]
                st.success("✅ Ваші показники та історію успішно відновлено!")
                st.rerun()
            except Exception as err:
                st.error(f"Помилка відкриття файлу: {err}")

# --- Головний екран ---
current_period_label = f"{MONTH_NAMES_UA[st.session_state.period_month]} {st.session_state.period_year}"

st.markdown(f"""
### 🇺🇦 Калькулятор комунальних платежів м. Києва
**Розрахунок за {current_period_label} року** • Адреса: *{st.session_state.address}* ({st.session_state.residents} ос., {st.session_state.area} м²)
""")

# Розрахунок сум
calculated_data = []
total_sum = 0.0
category_totals = {}

for srv in st.session_state.services:
    res = calculate_service(
        srv,
        st.session_state.residents,
        st.session_state.area,
        st.session_state.is_heating_season
    )
    total_sum += res["total"]
    cat = srv.get("category", "Інше")
    category_totals[cat] = category_totals.get(cat, 0.0) + res["total"]

    calculated_data.append({
        "Послуга": srv["name"],
        "Постачальник": srv["provider"],
        "Категорія": cat,
        "Активна": srv["is_enabled"],
        "Спосіб": srv["calc_mode"],
        "Попер. показник": srv.get("prev_reading", 0.0) if srv["calc_mode"] == "meters" else "—",
        "Поточн. показник": srv.get("curr_reading", 0.0) if srv["calc_mode"] == "meters" else "—",
        "Обсяг споживання": f"{res['consumption']} {srv['unit']}" + (f" (+{res['consumption_night']} ніч)" if res["consumption_night"] > 0 else ""),
        "Тариф": f"{srv['tariff']} ₴/{srv['unit']}",
        "Абонплата": f"{srv.get('abonplata', 0.0)} ₴" if srv.get("abonplata", 0.0) > 0 else "—",
        "Сума (грн)": res["total"],
    })

# Верхня інфо-панель (KPI)
col_kpi1, col_kpi2, col_kpi3, col_kpi4 = st.columns([2, 1, 1, 1])
with col_kpi1:
    st.metric(
        label=f"Разом до сплати за {current_period_label}",
        value=f"{total_sum:,.2f} ₴".replace(",", " ")
    )
with col_kpi2:
    st.metric(
        label="Активних послуг",
        value=f"{sum(1 for s in st.session_state.services if s['is_enabled'])} / {len(st.session_state.services)}"
    )
with col_kpi3:
    st.metric(
        label="Опалення",
        value="Увімкнено 🔥" if st.session_state.is_heating_season else "Вимкнено ❄️"
    )
with col_kpi4:
    if st.button("💾 Зберегти в історію", use_container_width=True, type="primary"):
        history_record = {
            "id": f"calc-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "period": current_period_label,
            "created_at": datetime.now().strftime("%d.%m.%Y %H:%M"),
            "address": st.session_state.address,
            "total": total_sum,
            "is_paid": False,
            "details": calculated_data,
        }
        st.session_state.history.insert(0, history_record)
        st.toast(f"Розрахунок за {current_period_label} успішно збережено в історію!", icon="🎉")

# Вкладки застосунку
tab_calc, tab_receipt, tab_add_service, tab_tariffs, tab_history = st.tabs([
    "📝 Лічильники та послуги",
    "🧾 Підсумкова квитанція",
    "➕ Додати послугу",
    "ℹ️ Офіційні тарифи (довідник)",
    "📜 Історія розрахунків",
])

# --- Вкладка 1: Лічильники та послуги ---
with tab_calc:
    st.caption("Вкажіть початковий (попередній) та новий (поточний) показники лічильників. Різниця та сума обчислюються автоматично.")

    for idx, srv in enumerate(st.session_state.services):
        with st.expander(f"**{srv['name']}** — {srv['provider']}", expanded=True):
            cols = st.columns([1, 2, 2, 2, 2])
            
            with cols[0]:
                srv["is_enabled"] = st.checkbox("Включено", value=srv["is_enabled"], key=f"en_{srv['id']}_{idx}")
            
            with cols[1]:
                srv["tariff"] = st.number_input(
                    f"Тариф ({srv['unit']})",
                    min_value=0.0,
                    value=float(srv["tariff"]),
                    step=0.01,
                    key=f"tar_{srv['id']}_{idx}",
                    disabled=not srv["is_enabled"],
                )

            with cols[2]:
                srv["abonplata"] = st.number_input(
                    "Абонплата (грн)",
                    min_value=0.0,
                    value=float(srv.get("abonplata", 0.0)),
                    step=1.0,
                    key=f"abon_{srv['id']}_{idx}",
                    disabled=not srv["is_enabled"],
                )

            if srv["calc_mode"] == "meters":
                with cols[3]:
                    srv["prev_reading"] = st.number_input(
                        "Попередній показник",
                        min_value=0.0,
                        value=float(srv.get("prev_reading", 0.0)),
                        step=1.0,
                        key=f"prev_{srv['id']}_{idx}",
                        disabled=not srv["is_enabled"],
                    )
                with cols[4]:
                    srv["curr_reading"] = st.number_input(
                        "Поточний показник",
                        min_value=0.0,
                        value=float(srv.get("curr_reading", 0.0)),
                        step=1.0,
                        key=f"curr_{srv['id']}_{idx}",
                        disabled=not srv["is_enabled"],
                    )

                # Для електроенергії: двозонний лічильник
                if srv["id"] == "electricity":
                    srv["has_two_zones"] = st.checkbox(
                        "Двозонний лічильник (день / ніч з 23:00 до 07:00 зі знижкою 50%)",
                        value=srv.get("has_two_zones", False),
                        key=f"two_zones_{srv['id']}_{idx}"
                    )
                    if srv["has_two_zones"]:
                        c_n1, c_n2, c_n3 = st.columns(3)
                        with c_n1:
                            srv["tariff_night"] = st.number_input(
                                "Тариф ніч (грн/кВт⋅год)",
                                value=float(srv.get("tariff_night", 2.16)),
                                step=0.01,
                                key=f"tar_night_{srv['id']}_{idx}"
                            )
                        with c_n2:
                            srv["prev_reading_night"] = st.number_input(
                                "Ніч: попередній показник",
                                value=float(srv.get("prev_reading_night", 0.0)),
                                step=1.0,
                                key=f"prev_night_{srv['id']}_{idx}"
                            )
                        with c_n3:
                            srv["curr_reading_night"] = st.number_input(
                                "Ніч: поточний показник",
                                value=float(srv.get("curr_reading_night", 0.0)),
                                step=1.0,
                                key=f"curr_night_{srv['id']}_{idx}"
                            )
            elif srv["calc_mode"] == "norm_sqm":
                with cols[3]:
                    st.text_input(
                        "База нарахування",
                        f"{st.session_state.area} м²",
                        disabled=True,
                        key=f"base_sqm_{srv['id']}_{idx}"
                    )
                with cols[4]:
                    if srv["id"] == "heating" and not st.session_state.is_heating_season:
                        st.info("Вимкнено (не сезон)")
                    else:
                        st.success(f"До сплати: {(st.session_state.area * srv['tariff'] + srv['abonplata']):.2f} ₴")
            elif srv["calc_mode"] == "norm_person":
                with cols[3]:
                    st.text_input(
                        "База нарахування",
                        f"{st.session_state.residents} ос.",
                        disabled=True,
                        key=f"base_pers_{srv['id']}_{idx}"
                    )
                with cols[4]:
                    st.success(f"До сплати: {(st.session_state.residents * srv['tariff'] + srv['abonplata']):.2f} ₴")
            else:
                with cols[3]:
                    st.text_input(
                        "Тип послуги",
                        "Фіксована ставка",
                        disabled=True,
                        key=f"base_fix_{srv['id']}_{idx}"
                    )
                with cols[4]:
                    st.success(f"До сплати: {(srv['tariff'] + srv['abonplata']):.2f} ₴")

# --- Вкладка 2: Підсумкова квитанція ---
with tab_receipt:
    st.subheader(f"🧾 Розрахункова квитанція за {current_period_label} року")
    st.markdown(f"**Адреса об’єкта:** {st.session_state.address} | **Зареєстровано осіб:** {st.session_state.residents} | **Опалювальна площа:** {st.session_state.area} м²")

    # Деталізована таблиця
    df_receipt = pd.DataFrame(calculated_data)
    # Відображення тільки активних послуг
    df_active = df_receipt[df_receipt["Активна"] == True].drop(columns=["Активна", "Спосіб"])
    
    st.dataframe(
        df_active,
        use_container_width=True,
        hide_index=True,
    )

    col_sum1, col_sum2 = st.columns([1, 1])
    with col_sum1:
        st.subheader("📊 Розподіл витрат за категоріями:")
        for cat, val in category_totals.items():
            if val > 0:
                pct = (val / total_sum * 100) if total_sum > 0 else 0
                st.write(f"**{cat}:** {val:,.2f} ₴ ({pct:.1f}%)")
                st.progress(min(1.0, pct / 100))

    with col_sum2:
        st.subheader("💳 Способи оплати в Києві:")
        st.markdown("""
        - 📱 **«Київ Цифровий»** — міський мобільний додаток (за кодом адреси)
        - 🌐 **КП «ЦКС»** — Центр комунального сервісу (cks.com.ua)
        - 🏦 **Онлайн-банкінг:** Приват24, Монобанк, Ощад 24/7 (розділ Комунальні платежі)
        - ⚡ **YASNO:** yasno.com.ua (електроенергія)
        """)

    st.divider()

    # Завантаження квитанції у CSV
    csv_data = df_active.to_csv(index=False).encode('utf-8-sig')
    st.download_button(
        label="📥 Завантажити квитанцію (CSV / Excel)",
        data=csv_data,
        file_name=f"Квитанція_Київ_{MONTH_NAMES_UA[st.session_state.period_month]}_{st.session_state.period_year}.csv",
        mime="text/csv",
    )

# --- Вкладка 3: Додати власну послугу ---
with tab_add_service:
    st.subheader("➕ Додавання власної послуги")
    st.caption("Додайте паркінг, охорону, консьєржа, інтернет, домофон або членські внески ОСББ")

    # Швидкі шаблони послуг
    col_t1, col_t2, col_t3, col_t4 = st.columns(4)
    with col_t1:
        if st.button("🅿️ Паркінг (1 200 ₴)", use_container_width=True):
            st.session_state.services.append({
                "id": f"custom_{datetime.now().timestamp()}",
                "name": "Оренда паркомісця",
                "category": "Паркінг",
                "provider": "ОСББ / Паркінг",
                "is_enabled": True,
                "calc_mode": "fixed",
                "tariff": 1200.0,
                "abonplata": 0.0,
                "unit": "міс.",
            })
            st.rerun()
    with col_t2:
        if st.button("👮 Охорона (250 ₴)", use_container_width=True):
            st.session_state.services.append({
                "id": f"custom_{datetime.now().timestamp()}",
                "name": "Охорона будинку та шлагбаум",
                "category": "Безпека",
                "provider": "Охоронна компанія",
                "is_enabled": True,
                "calc_mode": "fixed",
                "tariff": 250.0,
                "abonplata": 0.0,
                "unit": "міс.",
            })
            st.rerun()
    with col_t3:
        if st.button("🔔 Домофон (45 ₴)", use_container_width=True):
            st.session_state.services.append({
                "id": f"custom_{datetime.now().timestamp()}",
                "name": "Обслуговування домофону",
                "category": "Зв'язок",
                "provider": "Домофонний сервіс",
                "is_enabled": True,
                "calc_mode": "fixed",
                "tariff": 45.0,
                "abonplata": 0.0,
                "unit": "міс.",
            })
            st.rerun()
    with col_t4:
        if st.button("🌐 Інтернет (220 ₴)", use_container_width=True):
            st.session_state.services.append({
                "id": f"custom_{datetime.now().timestamp()}",
                "name": "Оптоволоконний інтернет",
                "category": "Зв'язок",
                "provider": "Провайдер",
                "is_enabled": True,
                "calc_mode": "fixed",
                "tariff": 220.0,
                "abonplata": 0.0,
                "unit": "міс.",
            })
            st.rerun()

    st.divider()

    with st.form("add_custom_service_form"):
        st.write("**Або створіть власну послугу вручну:**")
        col_n1, col_n2 = st.columns(2)
        with col_n1:
            custom_name = st.text_input("Назва послуги", placeholder="Наприклад: Відеоспостереження")
        with col_n2:
            custom_provider = st.text_input("Постачальник / Організація", placeholder="Наприклад: ОСББ «Затишок»")

        col_m1, col_m2, col_m3 = st.columns(3)
        with col_m1:
            custom_mode = st.selectbox(
                "Спосіб нарахування",
                options=["fixed", "norm_sqm", "norm_person", "meters"],
                format_func=lambda x: {
                    "fixed": "Фіксована сума на місяць",
                    "norm_sqm": "За 1 м² площі квартири",
                    "norm_person": "За кількістю зареєстрованих осіб",
                    "meters": "За власним лічильником",
                }[x]
            )
        with col_m2:
            custom_tariff = st.number_input("Тариф / Вартість (грн)", min_value=0.0, value=100.0, step=5.0)
        with col_m3:
            custom_unit = st.text_input("Одиниця виміру", value="міс.")

        submitted = st.form_submit_button("Додати до списку послуг", use_container_width=True)
        if submitted:
            if custom_name.strip():
                new_service = {
                    "id": f"custom_{datetime.now().timestamp()}",
                    "name": custom_name.strip(),
                    "category": "Власні послуги",
                    "provider": custom_provider.strip() or "ОСББ / Індивідуально",
                    "is_enabled": True,
                    "calc_mode": custom_mode,
                    "tariff": custom_tariff,
                    "tariff_night": 0.0,
                    "abonplata": 0.0,
                    "unit": custom_unit.strip() or "міс.",
                    "prev_reading": 0.0,
                    "curr_reading": 0.0,
                }
                st.session_state.services.append(new_service)
                st.success(f"Послугу «{custom_name}» успішно додано!")
                st.rerun()
            else:
                st.error("Будь ласка, вкажіть назву послуги.")

# --- Вкладка 4: Офіційні тарифи Києва ---
with tab_tariffs:
    st.subheader("🏛️ Офіційні тарифи ЖКГ м. Києва на 1 вересня 2026 року")
    st.info("📌 **Довідка:** Кабмін продовжив дію єдиного фіксованого тарифу на електроенергію (4,32 грн/кВт⋅год, ніч 2,16 грн) до 31 жовтня 2026 р. «Нафтогаз» зафіксував ціну газу 7,96 грн/м³ до 30 квітня 2027 р. На гарячу воду та опалення діє законодавчий мораторій воєнного стану. Тариф на холодну воду та стоки підтримано Київрадою у розмірі 63,79 грн/м³.")

    df_tariffs = pd.DataFrame(KYIV_OFFICIAL_TARIFFS)
    st.dataframe(
        df_tariffs.rename(columns={
            "category": "Категорія",
            "name": "Назва послуги",
            "provider": "Офіційний постачальник",
            "rate": "Тариф",
            "unit": "Од. виміру",
            "details": "Опис та особливості",
            "legal": "Нормативна база",
        }),
        use_container_width=True,
        hide_index=True,
    )

    st.subheader("🏢 Вартість квартплати за 10 районами Києва (керуючі компанії)")
    st.caption("Тарифи встановлені за результатами конкурсів управителів житла та рішень КМДА. Середній діапазон: 12.20 – 13.80 грн/м².")
    df_districts = pd.DataFrame(KYIV_DISTRICTS)
    st.dataframe(
        df_districts.rename(columns={
            "name": "Район Києва",
            "rate": "Базовий тариф (₴/м²)",
            "rate_range": "Діапазон у будинках",
            "managing_company": "Керуюча компанія / Управитель",
            "notes": "Опис мікрорайонів та житлового фонду",
        })[["Район Києва", "Базовий тариф (₴/м²)", "Діапазон у будинках", "Керуюча компанія / Управитель", "Опис мікрорайонів та житлового фонду"]],
        use_container_width=True,
        hide_index=True,
    )

# --- Вкладка 5: Історія розрахунків ---
with tab_history:
    st.subheader("📜 Історія збережених розрахунків")

    if not st.session_state.history:
        st.write("Історія порожня. Натисніть кнопку **«💾 Зберегти в історію»** у верхній частині екрана, щоб додати розрахунок за поточний місяць.")
    else:
        for idx, rec in enumerate(st.session_state.history):
            with st.container(border=True):
                col_h1, col_h2, col_h3, col_h4 = st.columns([3, 2, 2, 1])
                with col_h1:
                    st.markdown(f"**{rec['period']}** — {rec['total']:,.2f} ₴")
                    st.caption(f"Створено: {rec['created_at']} • {rec['address']}")
                with col_h2:
                    is_paid = st.checkbox("Сплачено", value=rec["is_paid"], key=f"paid_{rec['id']}")
                    rec["is_paid"] = is_paid
                with col_h3:
                    df_h = pd.DataFrame(rec["details"])
                    csv_h = df_h.to_csv(index=False).encode('utf-8-sig')
                    st.download_button(
                        label="📥 Завантажити CSV",
                        data=csv_h,
                        file_name=f"Розрахунок_{rec['period']}.csv",
                        mime="text/csv",
                        key=f"dl_csv_{rec['id']}_{idx}"
                    )
                with col_h4:
                    if st.button("🗑️", key=f"del_{rec['id']}", help="Видалити запис"):
                        st.session_state.history.pop(idx)
                        st.rerun()

# Футер
st.markdown("---")
st.markdown("<div style='text-align: center; color: #64748b; font-size: 13px;'>Калькулятор комунальних платежів м. Києва • Streamlit Edition • 2026 р.</div>", unsafe_allow_html=True)
