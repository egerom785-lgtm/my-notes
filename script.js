const games = [
    { id: 'snake', n: 'Змейка', i: '🐍' }, { id: 'mines', n: 'Сапер', i: '💣' },
    { id: 'pong', n: 'Понг', i: '🏓' }, { id: 'clicker', n: 'Кликер', i: '🖱️' },
    { id: 'bird', n: 'Птичка', i: '🐦' }, { id: '2048', n: '2048', i: '🔢' },
    { id: 'memory', n: 'Память', i: '🧠' }, { id: 'math', n: 'Математика', i: '➕' },
    { id: 'tictac', n: 'Крестики', i: '❌' }, { id: 'dice', n: 'Кости', i: '🎲' },
    { id: 'color', n: 'Цвета', i: '🎨' }, { id: 'react', n: 'Реакция', i: '⚡' },
    { id: 'jump', n: 'Прыжок', i: '👟' }, { id: 'stars', n: 'Звезды', i: '⭐' },
    { id: 'ghost', n: 'Призрак', i: '👻' }, { id: 'baloon', n: 'Шарики', i: '🎈' },
    { id: 'typing', n: 'Печать', i: '⌨️' }, { id: 'coin', n: 'Монетка', i: '🪙' },
    { id: '8ball', n: 'Шар 8', i: '🎱' }, { id: 'guess', n: 'Число', i: '🔎' },
    { id: 'tower', n: 'Башня', i: '🏢' }, { id: 'rps', n: 'Цу-е-фа', i: '✂️' },
    { id: 'maze', n: 'Лабиринт', i: '🌀' }, { id: 'simon', n: 'Саймон', i: '🔴' },
    { id: 'boxes', n: 'Коробки', i: '📦' }, { id: 'timer', n: 'Таймер', i: '⏱️' },
    { id: 'pizza', n: 'Пицца', i: '🍕' }, { id: 'rocket', n: 'Ракета', i: '🚀' },
    { id: 'gem', n: 'Алмаз', i: '💎' }, { id: 'apple', n: 'Яблоки', i: '🍎' }
];

const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const container = document.getElementById('game-container');

// Отрисовка карточек
games.forEach(g => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<span class="icon">${g.i}</span><div>${g.n}</div>`;
    div.onclick = () => launchGame(g.id, g.n);
    grid.appendChild(div);
});

function launchGame(id, name) {
    document.getElementById('game-title').innerText = name;
    modal.style.display = 'flex';
    container.innerHTML = '';

    // Логика запуска конкретных игр
    if (id === 'snake') {
        createCanvas(300, 300);
        startSnake();
    } else if (id === 'clicker') {
        let count = 0;
        const btn = document.createElement('button');
        btn.className = 'aero-btn'; btn.innerText = 'Клик: 0';
        btn.onclick = () => btn.innerText = `Клик: ${++count}`;
        container.appendChild(btn);
    } else if (id === 'dice') {
        container.innerHTML = `<h1 style="font-size:80px">${Math.floor(Math.random()*6)+1}</h1><button class="aero-btn" onclick="launchGame('dice', 'Кости')">Бросить</button>`;
    } else if (id === '8ball') {
        const answers = ["Да", "Нет", "Возможно", "Спроси позже"];
        container.innerHTML = `<h3>Шар говорит:</h3><h2>${answers[Math.floor(Math.random()*answers.length)]}</h2><button class="aero-btn" onclick="launchGame('8ball', 'Шар 8')">Еще раз</button>`;
    } else if (id === 'mines') {
        container.innerHTML = 'Нажмите на клетку! (Упрощенный режим)<br>';
        for(let i=0; i<16; i++) {
            const b = document.createElement('button');
            b.style.width='40px'; b.style.height='40px';
            b.onclick = () => { b.innerText = Math.random() > 0.8 ? '💣' : '💎'; if(b.innerText==='💣') alert('БАБАХ!'); };
            container.appendChild(b);
        }
    } else {
        container.innerHTML = `<p>Логика для "${name}" загружается...<br>Это место для твоего кода игры!</p>`;
    }
}

function createCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.id = 'gameCanvas';
    container.appendChild(canvas);
}

function closeGame() { modal.style.display = 'none'; }

// Пример: Код Змейки
function startSnake() {
    const cvs = document.getElementById('gameCanvas');
    const ctx = cvs.getContext('2d');
    let s = [{x:10, y:10}], f = {x:15, y:15}, d = 'R';
    const step = () => {
        let head = {...s[0]};
        if(d==='R') head.x++; if(d==='L') head.x--; if(d==='U') head.y--; if(d==='D') head.y++;
        s.unshift(head);
        if(head.x===f.x && head.y===f.y) f = {x:Math.floor(Math.random()*20), y:Math.floor(Math.random()*20)};
        else s.pop();
        ctx.fillStyle = '#eee'; ctx.fillRect(0,0,300,300);
        ctx.fillStyle = 'green'; s.forEach(p => ctx.fillRect(p.x*15, p.y*15, 14, 14));
        ctx.fillStyle = 'red'; ctx.fillRect(f.x*15, f.y*15, 14, 14);
    };
    const loop = setInterval(step, 150);
    window.onkeydown = e => {
        if(e.key==='ArrowRight') d='R'; if(e.key==='ArrowLeft') d='L';
        if(e.key==='ArrowUp') d='U'; if(e.key==='ArrowDown') d='D';
    };
    // Остановка при закрытии
    modal.onclick = (e) => { if(e.target === modal) { clearInterval(loop); closeGame(); } };
}
