const DB_KEY_USER = 'scootrent_user';
const DB_KEY_HISTORY = 'scootrent_history';
const DB_KEY_SESSION = 'scootrent_session';

const scootersDB = [
    { id: 101, model: 'Model X1', status: 'free', price: 50 },
    { id: 102, model: 'Model X1', status: 'free', price: 50 },
    { id: 105, model: 'Model X1', status: 'maint', price: 50 }, // Должен быть скрыт
    { id: 201, model: 'Model Pro', status: 'free', price: 70 },
    { id: 202, model: 'Model Pro', status: 'rent', price: 70 },
    { id: 301, model: 'City Ride', status: 'off', price: 45 }   // Должен быть скрыт
];

// Состояние приложения
let currentUser = null;
let activeSession = null;
let timerInterval = null;
let historyData = [];

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initEventListeners();
    
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
        alert("Заполните данные корректно");
        return;
    }

    currentUser = { name, phone };
    localStorage.setItem(DB_KEY_USER, JSON.stringify(currentUser));
    showApp();
}

function logout() {
    if(activeSession) {
        alert("Нельзя выйти во время активной аренды!");
        return;
    }
    if(confirm("Выйти из аккаунта?")) {
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

// --- ПРОФИЛЬ ---
function renderProfile() {
    if(!currentUser) return;
    document.getElementById('profile-name').innerText = currentUser.name;
    document.getElementById('profile-phone').innerText = currentUser.phone;

    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);
    document.getElementById('profile-avatar').innerText = initials;

    const totalEarned = historyData.reduce((sum, item) => sum + item.cost, 0);

    document.getElementById('profile-balance').innerText = totalEarned.toLocaleString('ru-RU');
}

// --- СПИСОК САМОКАТОВ ---
function renderScooters(filterText = '') {
    const list = document.getElementById('scooter-list');
    list.innerHTML = '';

    const query = filterText.toLowerCase();

    scootersDB.forEach(scooter => {
        if (scooter.status === 'maint' || scooter.status === 'off') return;

        if (!scooter.model.toLowerCase().includes(query) && !scooter.id.toString().includes(query)) {
            return;
        }

        const isMyRent = activeSession && activeSession.scooterId === scooter.id;
        let displayStatus = isMyRent ? 'rent' : scooter.status;
        
        let statusHtml = '';
        let btnHtml = '';

        if(displayStatus === 'free') {
            statusHtml = `<span class="status-badge status-free">Свободен</span>`;
            if(!activeSession) {
                btnHtml = `<button onclick="openRentConfirm(${scooter.id})" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-blue-700 transition-colors">Арендовать</button>`;
            } else {
                btnHtml = `<span class="text-xs text-gray-400">У вас активная аренда</span>`;
            }
        } else {
            statusHtml = `<span class="status-badge status-rent">В аренде</span>`;
            btnHtml = isMyRent ? `<span class="text-xs text-blue-600 font-bold">Ваш самокат</span>` : `<span class="text-xs text-gray-400">Занят</span>`;
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
                    ${displayStatus === 'free' ? `<div class="mt-1 text-xs text-gray-500">${scooter.price} ₸/мин</div>` : ''}
                </div>
            </div>
        `;
        list.innerHTML += card;
    });

    if(list.innerHTML === '') {
        list.innerHTML = `<div class="text-center text-gray-400 mt-10">Нет доступных самокатов</div>`;
    }
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

// 2. Старт
function startRent() {
    const view = document.getElementById('view-rent-confirm');
    const id = parseInt(view.getAttribute('data-target-id'));
    const scooter = scootersDB.find(s => s.id === id);

    activeSession = {
        scooterId: scooter.id,
        model: scooter.model,
        price: scooter.price,
        startTime: new Date(),
        elapsedSeconds: 0
    };

    localStorage.setItem(DB_KEY_SESSION, JSON.stringify(activeSession));

    view.classList.add('hide');
    nav('scooters');
    resumeActiveRentUI();
}

// 3. UI Активной аренды
function resumeActiveRentUI() {
    document.getElementById('active-rent-widget').classList.remove('hide');

    document.getElementById('widget-model').innerText = activeSession.model;
    document.getElementById('widget-rate').innerText = activeSession.price; // Показываем тариф
    
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
    const cost = Math.floor(exactCost); 

    const historyItem = {
        date: new Date().toLocaleDateString('ru-RU'),
        timeStart: new Date(activeSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        timeEnd: endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        model: activeSession.model,
        cost: cost
    };

    historyData.unshift(historyItem);
    localStorage.setItem(DB_KEY_HISTORY, JSON.stringify(historyData));

    localStorage.removeItem(DB_KEY_SESSION);
    activeSession = null;

    document.getElementById('active-rent-widget').classList.add('hide');

    document.getElementById('receipt-cost').innerText = `${cost} ₸`;
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