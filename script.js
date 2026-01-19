const DB_KEY_USER = 'scootrent_user';
const DB_KEY_HISTORY = 'scootrent_history';
const DB_KEY_SESSION = 'scootrent_session';

const scootersDB = [
    { id: 101, model: 'Model X1', status: 'free', price: 50 },
    { id: 102, model: 'Model X1', status: 'free', price: 50 },
    { id: 105, model: 'Model X1', status: 'maint', price: 50 }, 
    { id: 201, model: 'Model Pro', status: 'free', price: 70 },
    { id: 202, model: 'Model Pro', status: 'rent', price: 70 },
    { id: 301, model: 'City Ride', status: 'off', price: 45 }   
];

// Состояние приложения
let currentUser = null;
let activeSession = null;
let timerInterval = null;
let historyData = [];

const DB_KEY_LANG = 'scootrent_lang';
let currentLang = localStorage.getItem(DB_KEY_LANG) || 'ru';

const translations = {
    ru: {
        app_desc: "Аренда электросамокатов",
        label_name: "Ваше Имя",
        label_phone: "Телефон",
        btn_login: "Войти в систему",
        nav_scooters: "Самокаты",
        nav_history: "История",
        nav_profile: "Профиль",
        active_rent_title: "Активная аренда",
        rate: "Тариф",
        min_short: "мин",
        btn_finish: "Завершить аренду",
        confirm_title: "Начать аренду?",
        prepayment: "Предоплата",
        prepayment_desc: "Сумма будет заморожена перед началом",
        btn_confirm: "Подтвердить",
        btn_cancel: "Отмена",
        history_title: "История поездок",
        history_empty: "История пока пуста",
        spent_total: "Потрачено всего",
        link_card: "Привязать карту",
        unlink: "Отвязать",
        btn_support: "Поддержка",
        btn_logout: "Выйти из профиля",
        finish_title: "Завершить аренду?",
        finish_desc: "Поездка будет остановлена, и сформируется чек.",
        btn_yes_finish: "Да, завершить",
        receipt_title: "Поездка завершена",
        receipt_desc: "Спасибо, что выбрали нас!",
        receipt_time_cost: "Стоимость времени",
        to_pay: "К доплате",
        btn_great: "Отлично",
        support_title: "Служба поддержки",
        support_wa_time: "Среднее время ответа: 2 мин",
        support_call: "Позвонить оператору",
        btn_close: "Закрыть",
        
        // Статусы
        status_free: "Свободен",
        status_rent: "В аренде",
        status_maint: "Сервис",
        status_off: "Отключен",
        btn_rent: "Арендовать",
        btn_busy: "Занят",
        msg_active_rent: "У вас активная аренда",
        my_scooter: "Ваш самокат",
        no_scooters: "Нет доступных самокатов",
        
        // Алерты
        alert_fill: "Заполните данные корректно",
        alert_logout: "Нельзя выйти во время активной аренды!",
        alert_exit_confirm: "Выйти из аккаунта?",
        alert_card_needed: "Для начала аренды необходимо привязать карту в профиле!",
        alert_prepay_confirm: "С карты будет списана предоплата 500 ₸. Продолжить?",
        alert_card_success: "Карта успешно привязана!",
        alert_unlink_confirm: "Отвязать карту?",
        msg_refund: "Разница {amount} ₸ возвращена на карту"
    },
    kk: {
        app_desc: "Электр самокаттарын жалға алу",
        label_name: "Сіздің атыңыз",
        label_phone: "Телефон нөмірі",
        btn_login: "Жүйеге кіру",
        nav_scooters: "Самокаттар",
        nav_history: "Тарих",
        nav_profile: "Профиль",
        active_rent_title: "Белсенді жалға алу",
        rate: "Тариф",
        min_short: "мин",
        btn_finish: "Аяқтау",
        confirm_title: "Жалға алуды бастау?",
        prepayment: "Алдын ала төлем",
        prepayment_desc: "Сома сапар алдында бұғатталады",
        btn_confirm: "Растау",
        btn_cancel: "Болдырмау",
        history_title: "Сапарлар тарихы",
        history_empty: "Тарих әзірге бос",
        spent_total: "Барлығы жұмсалды",
        link_card: "Картаны тіркеу",
        unlink: "Ажырату",
        btn_support: "Қолдау қызметі",
        btn_logout: "Профильден шығу",
        finish_title: "Жалға алуды аяқтау?",
        finish_desc: "Сапар тоқтатылып, чек жасалады.",
        btn_yes_finish: "Иә, аяқтау",
        receipt_title: "Сапар аяқталды",
        receipt_desc: "Бізді таңдағаныңызға рақмет!",
        receipt_time_cost: "Уақыт құны",
        to_pay: "Төлеу керек",
        btn_great: "Тамаша",
        support_title: "Қолдау қызметі",
        support_wa_time: "Жауап беру уақыты: 2 мин",
        support_call: "Операторға қоңырау шалу",
        btn_close: "Жабу",
        
        status_free: "Бос",
        status_rent: "Жалға алынған",
        status_maint: "Қызмет көрсету",
        status_off: "Өшірулі",
        btn_rent: "Жалға алу",
        btn_busy: "Бос емес",
        msg_active_rent: "Сізде белсенді жалға алу бар",
        my_scooter: "Сіздің самокатыңыз",
        no_scooters: "Қолжетімді самокаттар жоқ",
        
        alert_fill: "Деректерді дұрыс толтырыңыз",
        alert_logout: "Белсенді жалға алу кезінде шығуға болмайды!",
        alert_exit_confirm: "Аккаунттан шығу?",
        alert_card_needed: "Жалға алуды бастау үшін картаны профильде тіркеу қажет!",
        alert_prepay_confirm: "Картадан 500 ₸ алдын ала төлем алынады. Жалғастыру?",
        alert_card_success: "Карта сәтті тіркелді!",
        alert_unlink_confirm: "Картаны ажырату?",
        msg_refund: "Айырмашылық {amount} ₸ картаға қайтарылды"
    }
};

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initEventListeners();
    updateStaticText();
    
    if (currentUser) {
        showApp();
    } else {
        showAuth();
    }
});

function loadData() {
    const storedUser = localStorage.getItem(DB_KEY_USER);
    if (storedUser) currentUser = JSON.parse(storedUser);

    const storedHistory = localStorage.getItem(DB_KEY_HISTORY);
    if (storedHistory) historyData = JSON.parse(storedHistory);

    // Загрузка активной сессии
    const storedSession = localStorage.getItem(DB_KEY_SESSION);
    if (storedSession) {
        activeSession = JSON.parse(storedSession);
        activeSession.startTime = new Date(activeSession.startTime);
    }
}

function t(key) {
    return translations[currentLang][key] || key;
}

function updateStaticText() {
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.placeholder = currentLang === 'ru' 
            ? "Поиск по ID или модели..." 
            : "ID немесе модель бойынша іздеу...";
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.innerText.toLowerCase() === currentLang) {
            btn.classList.remove('text-gray-400');
            btn.classList.add('text-blue-600');
        } else {
            btn.classList.add('text-gray-400');
            btn.classList.remove('text-blue-600');
        }
    });
}

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem(DB_KEY_LANG, lang);
    updateStaticText();

    if (!document.getElementById('view-scooters').classList.contains('hide')) renderScooters();
}

function initEventListeners() {
    document.getElementById('nav-scooters').addEventListener('click', () => nav('scooters'));
    document.getElementById('nav-history').addEventListener('click', () => nav('history'));
    document.getElementById('nav-profile').addEventListener('click', () => nav('profile'));

    document.getElementById('auth-form').addEventListener('submit', handleLogin);
    document.getElementById('auth-phone').addEventListener('input', phoneMask);

    document.getElementById('search-input').addEventListener('input', handleSearch);
}

function showAuth() {
    document.getElementById('view-auth').classList.remove('hide');
    document.getElementById('app-header').classList.add('hide');
    document.getElementById('main-content').classList.add('hide');
}

function showApp() {
    document.getElementById('view-auth').classList.add('hide');
    document.getElementById('app-header').classList.remove('hide');
    document.getElementById('main-content').classList.remove('hide');
    
    if(activeSession) {
        resumeActiveRentUI();
    }
    
    nav('scooters');
}

function handleLogin(e) {
    e.preventDefault();
    const name = document.getElementById('auth-name').value;
    const phone = document.getElementById('auth-phone').value;
    if(name.length < 2 || phone.length < 10) {
        alert(t('alert_fill')); // <---
        return;
    }
    currentUser = { name, phone, hasCard: false };
    localStorage.setItem(DB_KEY_USER, JSON.stringify(currentUser));
    showApp();
}

function logout() {
    if(activeSession) {
        alert(t('alert_logout')); // <---
        return;
    }
    if(confirm(t('alert_exit_confirm'))) { // <---
        localStorage.removeItem(DB_KEY_USER);
        currentUser = null;
        window.location.reload();
    }
}

// --- НАВИГАЦИЯ ---
function nav(screenName) {
    document.getElementById('view-scooters').classList.add('hide');
    document.getElementById('view-history').classList.add('hide');
    document.getElementById('view-profile').classList.add('hide');
    document.getElementById('view-rent-confirm').classList.add('hide');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    if(screenName === 'scooters') {
        document.getElementById('view-scooters').classList.remove('hide');
        document.getElementById('nav-scooters').classList.add('active');
        renderScooters();
    } else if(screenName === 'history') {
        document.getElementById('view-history').classList.remove('hide');
        document.getElementById('nav-history').classList.add('active');
        renderHistory();
    } else if(screenName === 'profile') {
        document.getElementById('view-profile').classList.remove('hide');
        document.getElementById('nav-profile').classList.add('active');
        renderProfile();
    }
}

function renderProfile() {
    if(!currentUser) return;
    document.getElementById('profile-name').innerText = currentUser.name;
    document.getElementById('profile-phone').innerText = currentUser.phone;

    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);
    document.getElementById('profile-avatar').innerText = initials;

    const totalEarned = historyData.reduce((sum, item) => sum + item.cost, 0);
    document.getElementById('profile-balance').innerText = totalEarned.toLocaleString('ru-RU');

    if (currentUser.hasCard) {
        document.getElementById('card-placeholder').classList.add('hide');
        document.getElementById('card-linked').classList.remove('hide');
        document.getElementById('card-holder-name').innerText = currentUser.name.toUpperCase();
    } else {
        document.getElementById('card-placeholder').classList.remove('hide');
        document.getElementById('card-linked').classList.add('hide');
    }
}

function linkCard() {
    const cardNumber = prompt("Card Number:", "4242 4242 4242 4242");
    if(cardNumber) {
        currentUser.hasCard = true;
        localStorage.setItem(DB_KEY_USER, JSON.stringify(currentUser));
        renderProfile();
        alert(t('alert_card_success')); 
    }
}

function unlinkCard() {
    if(confirm(t('alert_unlink_confirm'))) { 
        currentUser.hasCard = false;
        localStorage.setItem(DB_KEY_USER, JSON.stringify(currentUser));
        renderProfile();
    }
}

function renderScooters(filterText = '') {
    const list = document.getElementById('scooter-list');
    list.innerHTML = '';
    const query = filterText.toLowerCase();

    scootersDB.forEach(scooter => {
        if (scooter.status === 'maint' || scooter.status === 'off') return;
        if (!scooter.model.toLowerCase().includes(query) && !scooter.id.toString().includes(query)) return;

        const isMyRent = activeSession && activeSession.scooterId === scooter.id;
        let displayStatus = isMyRent ? 'rent' : scooter.status;
        let statusHtml = '', btnHtml = '';

        // ИСПОЛЬЗУЕМ t() ДЛЯ ПЕРЕВОДА
        if(displayStatus === 'free') {
            statusHtml = `<span class="status-badge status-free">${t('status_free')}</span>`;
            if(!activeSession) {
                btnHtml = `<button onclick="openRentConfirm(${scooter.id})" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-blue-700 transition-colors">${t('btn_rent')}</button>`;
            } else {
                btnHtml = `<span class="text-xs text-gray-400">${t('msg_active_rent')}</span>`;
            }
        } else {
            statusHtml = `<span class="status-badge status-rent">${t('status_rent')}</span>`;
            btnHtml = isMyRent ? `<span class="text-xs text-blue-600 font-bold">${t('my_scooter')}</span>` : `<span class="text-xs text-gray-400">${t('btn_busy')}</span>`;
        }

        const card = `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:shadow-md">
                <div>
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="font-bold text-gray-800">${scooter.model}</span>
                        <span class="text-xs text-gray-400 bg-gray-100 px-1.5 rounded">#${scooter.id}</span>
                    </div>
                    <div>${statusHtml}</div>
                </div>
                <div class="flex flex-col items-end">
                    ${btnHtml}
                    ${displayStatus === 'free' ? `<div class="mt-1 text-xs text-gray-500">${scooter.price} ₸/${t('min_short')}</div>` : ''}
                </div>
            </div>
        `;
        list.innerHTML += card;
    });

    if(list.innerHTML === '') list.innerHTML = `<div class="text-center text-gray-400 mt-10">${t('no_scooters')}</div>`;
}

function handleSearch(e) {
    renderScooters(e.target.value);
}

// --- АРЕНДА ---
function openRentConfirm(id) {
    const scooter = scootersDB.find(s => s.id === id);
    if(!scooter) return;

    const view = document.getElementById('view-rent-confirm');
    view.setAttribute('data-target-id', id);
    
    document.getElementById('confirm-model').innerText = scooter.model;
    document.getElementById('confirm-id').innerText = scooter.id;
    document.getElementById('confirm-price').innerText = `${scooter.price} ₸/мин`;

    document.getElementById('view-scooters').classList.add('hide');
    view.classList.remove('hide');
}

function cancelRent() {
    nav('scooters');
}

function startRent() {
    if (!currentUser || !currentUser.hasCard) {
        alert(t('alert_card_needed'));
        nav('profile');
        return;
    }
    if(!confirm(t('alert_prepay_confirm'))) return; 

    const view = document.getElementById('view-rent-confirm');
    const id = parseInt(view.getAttribute('data-target-id'));
    const scooter = scootersDB.find(s => s.id === id);

    activeSession = {
        scooterId: scooter.id,
        model: scooter.model,
        price: scooter.price,
        startTime: new Date(),
        elapsedSeconds: 0,
        prepayment: 500
    };
    localStorage.setItem(DB_KEY_SESSION, JSON.stringify(activeSession));
    view.classList.add('hide');
    nav('scooters');
    resumeActiveRentUI();
}

function resumeActiveRentUI() {
    document.getElementById('active-rent-widget').classList.remove('hide');

    document.getElementById('widget-model').innerText = activeSession.model;
    document.getElementById('widget-rate').innerText = activeSession.price; 

    renderScooters(); 

    if(timerInterval) clearInterval(timerInterval);
    updateTimer();
    timerInterval = setInterval(() => {
        activeSession.elapsedSeconds++;
        localStorage.setItem(DB_KEY_SESSION, JSON.stringify(activeSession));
        updateTimer();
    }, 1000);
}

function updateTimer() {
    const m = Math.floor(activeSession.elapsedSeconds / 60);
    const s = activeSession.elapsedSeconds % 60;

    document.getElementById('timer').innerText = 
        `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    
    const exactCost = (activeSession.price / 60) * activeSession.elapsedSeconds;

    document.getElementById('widget-total').innerText = Math.floor(exactCost);
}

// 4. Завершение 
function finishRent() {
    document.getElementById('modal-finish').classList.remove('hide');
}

function closeModal() {
    document.getElementById('modal-finish').classList.add('hide');
}

function confirmFinishRent() {
    closeModal();
    clearInterval(timerInterval);
    const endTime = new Date();
    
    const exactCost = (activeSession.price / 60) * activeSession.elapsedSeconds;
    const totalTimeCost = Math.floor(exactCost);
    const prepayment = activeSession.prepayment || 0;
    let finalToPay = totalTimeCost - prepayment;
    
    let refundMsg = "";
    if (finalToPay < 0) {
        const refundAmount = Math.abs(totalTimeCost - prepayment);
        finalToPay = 0;
        refundMsg = t('msg_refund').replace('{amount}', refundAmount); // <---
    }

    const historyItem = {
        date: new Date().toLocaleDateString('ru-RU'),
        timeStart: new Date(activeSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        timeEnd: endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        model: activeSession.model,
        cost: totalTimeCost
    };

    historyData.unshift(historyItem);
    localStorage.setItem(DB_KEY_HISTORY, JSON.stringify(historyData));
    localStorage.removeItem(DB_KEY_SESSION);
    activeSession = null;

    document.getElementById('active-rent-widget').classList.add('hide');
    document.getElementById('receipt-total-time').innerText = `${totalTimeCost} ₸`;
    document.getElementById('receipt-final').innerText = `${finalToPay} ₸`;
    document.getElementById('receipt-refund-msg').innerText = refundMsg;
    document.getElementById('modal-receipt').classList.remove('hide');
    
    renderScooters();
}


function closeReceipt() {
    document.getElementById('modal-receipt').classList.add('hide');
}

// --- ИСТОРИЯ ---
function renderHistory() {
    const list = document.getElementById('history-list');
    const msg = document.getElementById('empty-history-msg');
    
    const items = list.querySelectorAll('.history-item');
    items.forEach(el => el.remove());

    if(historyData.length === 0) {
        msg.classList.remove('hide');
        return;
    }
    msg.classList.add('hide');

    historyData.forEach(item => {
        const el = document.createElement('div');
        el.className = 'history-item bg-white p-4 rounded-2xl shadow-sm border border-gray-100';
        el.innerHTML = `
            <div class="flex justify-between mb-1">
                <span class="font-bold text-gray-800">${item.model}</span>
                <span class="text-gray-400 text-xs">${item.date}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">${item.timeStart} - ${item.timeEnd}</span>
                <span class="text-blue-600 font-bold text-lg">${item.cost} ₸</span>
            </div>
        `;
        list.appendChild(el);
    });
}

function phoneMask(e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
    if (!x[1]) x[1] = '7'; 
    e.target.value = !x[2] ? '+7' : '+7 (' + x[2] + (x[3] ? ') ' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
}

function openSupport() {
    document.getElementById('modal-support').classList.remove('hide');
}

function closeSupport() {
    document.getElementById('modal-support').classList.add('hide');
}