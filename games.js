const games = [
    { id: 1, title: "Змейка", category: "classic", icon: "🐍" },
    { id: 2, title: "Сапер", category: "logic", icon: "💣" },
    { id: 3, title: "Тетрис", category: "classic", icon: "🧱" },
    { id: 4, title: "Кликер", category: "arcade", icon: "🖱️" },
    // Сюда можно добавить еще 96 объектов
];

function displayGames(filter = 'all') {
    const container = document.getElementById('game-container');
    container.innerHTML = '';

    const filtered = filter === 'all' ? games : games.filter(g => g.category === filter);

    filtered.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div style="font-size: 50px;">${game.icon}</div>
            <h3>${game.title}</h3>
            <p>${game.category}</p>
        `;
        card.onclick = () => alert(`Запуск игры: ${game.title}\n(Нужно создать файл игры в папке games/)`);
        container.appendChild(card);
    });
}

function filterGames(cat) {
    displayGames(cat);
}

// Инициализация при загрузке
window.onload = () => displayGames();
