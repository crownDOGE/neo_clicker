// Игровые переменные
let clicks = 0;
let totalClicks = 0;
let cps = 0;
let lastUpdate = Date.now();
let upgrades = [
    { id: 1, name: "Автокликер", cost: 10, baseCost: 10, owned: 0, cps: 0.1 },
    { id: 2, name: "Улучшенный автокликер", cost: 50, baseCost: 50, owned: 0, cps: 0.5 },
    { id: 3, name: "Робот-кликер", cost: 200, baseCost: 200, owned: 0, cps: 2 },
    { id: 4, name: "Кликерная ферма", cost: 1000, baseCost: 1000, owned: 0, cps: 10 },
    { id: 5, name: "Кликерный завод", cost: 5000, baseCost: 5000, owned: 0, cps: 50 }
];

// Элементы DOM
const clickerElement = document.getElementById('clicker');
const clicksElement = document.getElementById('clicks');
const cpsElement = document.getElementById('cps');
const totalClicksElement = document.getElementById('total-clicks');
const upgradesElement = document.getElementById('upgrades');
const saveNotification = document.getElementById('save-notification');
const resetBtn = document.getElementById('reset-btn');
const donateBtn = document.getElementById('donate-btn');

// Сохранение игры
function saveGame() {
    const gameData = {
        clicks: clicks,
        totalClicks: totalClicks,
        cps: cps,
        lastUpdate: Date.now(),
        upgrades: upgrades.map(upgrade => ({
            id: upgrade.id,
            owned: upgrade.owned,
            cost: upgrade.cost
        }))
    };
    
    localStorage.setItem('neoClickerSave', JSON.stringify(gameData));
    showSaveNotification();
}

// Загрузка игры
function loadGame() {
    const savedData = localStorage.getItem('neoClickerSave');
    if (savedData) {
        const gameData = JSON.parse(savedData);
        clicks = gameData.clicks || 0;
        totalClicks = gameData.totalClicks || 0;
        cps = gameData.cps || 0;
        lastUpdate = gameData.lastUpdate || Date.now();
        
        // Восстановление улучшений
        if (gameData.upgrades) {
            upgrades.forEach(upgrade => {
                const savedUpgrade = gameData.upgrades.find(u => u.id === upgrade.id);
                if (savedUpgrade) {
                    upgrade.owned = savedUpgrade.owned || 0;
                    upgrade.cost = savedUpgrade.cost || upgrade.baseCost;
                }
            });
        }
        
        // Рассчитываем оффлайн-доход
        const offlineTime = Date.now() - lastUpdate;
        if (offlineTime > 1000) {
            const offlineSeconds = offlineTime / 1000;
            const offlineEarnings = cps * offlineSeconds;
            clicks += offlineEarnings;
            totalClicks += offlineEarnings;
            
            // Показываем уведомление о оффлайн-доходе
            if (offlineEarnings > 0) {
                const notification = document.createElement('div');
                notification.className = 'save-notification show';
                notification.textContent = `Вы заработали ${Math.floor(offlineEarnings)} кликов пока были оффлайн!`;
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
            }
        }
        
        updateUI();
        initUpgrades();
    }
}

// Показать уведомление о сохранении
function showSaveNotification() {
    saveNotification.classList.add('show');
    setTimeout(() => {
        saveNotification.classList.remove('show');
    }, 2000);
}

// Сброс игры
function resetGame() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
        localStorage.removeItem('neoClickerSave');
        clicks = 0;
        totalClicks = 0;
        cps = 0;
        lastUpdate = Date.now();
        
        upgrades.forEach(upgrade => {
            upgrade.owned = 0;
            upgrade.cost = upgrade.baseCost;
        });
        
        updateUI();
        initUpgrades();
        showSaveNotification();
    }
}

// Инициализация улучшений
function initUpgrades() {
    upgradesElement.innerHTML = '';
    upgrades.forEach(upgrade => {
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'upgrade';
        upgradeElement.innerHTML = `
            <div>${upgrade.name}</div>
            <div>+${upgrade.cps} кликов/сек</div>
            <div class="upgrade-cost">${Math.floor(upgrade.cost)} кликов</div>
            <div>Куплено: ${upgrade.owned}</div>
        `;
        upgradeElement.addEventListener('click', () => buyUpgrade(upgrade.id));
        upgradesElement.appendChild(upgradeElement);
    });
}

// Покупка улучшения
function buyUpgrade(id) {
    const upgrade = upgrades.find(u => u.id === id);
    if (clicks >= upgrade.cost) {
        clicks -= upgrade.cost;
        upgrade.owned++;
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.owned));
        updateCPS();
        updateUI();
        initUpgrades();
        saveGame();
        
        // Эффект при покупке
        createParticles(upgradesElement.children[id-1], 10);
    }
}

// Обновление CPS
function updateCPS() {
    cps = upgrades.reduce((total, upgrade) => total + upgrade.cps * upgrade.owned, 0);
}

// Создание частиц для эффекта клика
function createParticles(element, count) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 10 + 5;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 30;
        const duration = Math.random() * 1 + 0.5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            particle.style.opacity = '0';
            particle.style.transition = `all ${duration}s ease-out`;
        }, 10);
        
        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    }
}

// Обновление интерфейса
function updateUI() {
    clicksElement.textContent = Math.floor(clicks);
    cpsElement.textContent = cps.toFixed(1);
    totalClicksElement.textContent = Math.floor(totalClicks);
}

// Автокликер
setInterval(() => {
    clicks += cps / 10;
    totalClicks += cps / 10;
    updateUI();
    
    // Автосохранение каждые 30 секунд
    if (Date.now() - lastUpdate > 30000) {
        saveGame();
        lastUpdate = Date.now();
    }
}, 100);

// Обработчик клика
clickerElement.addEventListener('click', () => {
    clicks++;
    totalClicks++;
    updateUI();
    saveGame();
    createParticles(clickerElement, 5);
    
    // Анимация клика
    clickerElement.style.transform = 'scale(0.95)';
    setTimeout(() => {
        clickerElement.style.transform = 'scale(1)';
    }, 100);
});

// Сброс игры
resetBtn.addEventListener('click', resetGame);

// Кнопка доната
donateBtn.addEventListener('click', () => {
    window.open('https://t.me/DOGE1001', '_blank');
});

// Загрузка при старте
window.addEventListener('load', loadGame);
// Сохранение при закрытии
window.addEventListener('beforeunload', saveGame);