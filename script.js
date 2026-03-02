const state = {
    user: { name: '', avatar: null },
    stream: null
};

// РЕГИСТРАЦИЯ
function handleRegister() {
    const name = document.getElementById('reg-name').value;
    const pass = document.getElementById('reg-pass').value;
    const regex = /^[a-zA-Z]{4,12}$/;

    if (!regex.test(name)) {
        alert("Ник должен быть от 4 до 12 латинских букв!");
        return;
    }
    if (pass.length < 4) {
        alert("Пароль слишком короткий!");
        return;
    }

    state.user.name = name;
    document.getElementById('my-nick').innerText = name;
    document.getElementById('demo-name').innerText = name;
    document.getElementById('auth-screen').style.display = 'none';
}

// ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ
function showSection(id) {
    document.getElementById('section-chat').style.display = 'none';
    document.getElementById('section-friends').style.display = 'none';
    document.getElementById('section-voice').style.display = 'none';

    const target = document.getElementById('section-' + id);
    target.style.display = (id === 'voice') ? 'flex' : 'block';
}

// ЧАТ
function checkEnter(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById('msg-input');
        if (input.value.trim()) {
            addMessage(state.user.name, input.value);
            input.value = '';
        }
    }
}

function addMessage(user, text) {
    const flow = document.getElementById('chat-flow');
    const msg = `
        <div class="msg">
            <div class="avatar"></div>
            <div>
                <b>${user}</b> <span style="color:gray; font-size:11px;">Сегодня</span><br>
                <span>${text}</span>
            </div>
        </div>
    `;
    flow.insertAdjacentHTML('beforeend', msg);
    flow.scrollTop = flow.scrollHeight; // Автопрокрутка вниз
}

// ДЕМОНСТРАЦИЯ ЭКРАНА
async function startScreenShare() {
    try {
        state.stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const video = document.getElementById('demo-video');
        video.srcObject = state.stream;
        video.style.display = 'block';
        document.getElementById('voice-placeholder').style.display = 'none';

        // Клик по видео для полного экрана
        video.onclick = () => {
            if (video.requestFullscreen) video.requestFullscreen();
        };

        state.stream.getVideoTracks()[0].onended = () => stopScreenShare();
    } catch (err) {
        console.error("Ошибка демки:", err);
    }
}

function stopScreenShare() {
    if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
        state.stream = null;
    }
    document.getElementById('demo-video').style.display = 'none';
    document.getElementById('voice-placeholder').style.display = 'block';
}

// СОЗДАНИЕ СЕРВЕРА (ИМИТАЦИЯ)
function createNewServer() {
    const srvName = prompt("Введите название сервера:");
    if (srvName) {
        const list = document.querySelector('.sidebar-servers');
        const icon = document.createElement('div');
        icon.className = 'icon';
        icon.innerText = srvName[0].toUpperCase();
        icon.onclick = () => alert("Вы перешли на " + srvName);
        list.insertBefore(icon, list.lastElementChild);
    }
}
