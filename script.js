const app = {
    data: {
        currentUser: JSON.parse(localStorage.getItem('dc_user')) || null,
        users: JSON.parse(localStorage.getItem('dc_all_users')) || [], // Симуляция БД
        servers: JSON.parse(localStorage.getItem('dc_servers')) || []
    },

    init() {
        if (this.data.currentUser) {
            document.getElementById('auth-screen').style.display = 'none';
            this.ui.updateProfile();
            this.servers.render();
        }
    },

    auth: {
        isLogin: false,
        toggle() {
            this.isLogin = !this.isLogin;
            document.getElementById('auth-title').innerText = this.isLogin ? "С возвращением!" : "Создать аккаунт";
        },
        submit() {
            const name = document.getElementById('reg-name').value;
            const pass = document.getElementById('reg-pass').value;
            const bio = document.getElementById('reg-bio').value;

            if (!/^[a-zA-Z0-9]{4,12}$/.test(name)) return alert("Ник: 4-12 лат. букв или цифр!");

            if (this.isLogin) {
                // Вход
                const user = app.data.users.find(u => u.name === name && u.pass === pass);
                if (user) {
                    app.data.currentUser = user;
                } else return alert("Неверный логин или пароль");
            } else {
                // Регистрация
                if (app.data.users.some(u => u.name === name)) return alert("Этот ник уже занят!");
                const newUser = { 
                    name, pass, bio, 
                    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
                    lastNickChange: 0,
                    friends: [],
                    id: Math.floor(Math.random() * 9000) + 1000
                };
                app.data.users.push(newUser);
                app.data.currentUser = newUser;
            }
            this.saveAndLogin();
        },
        saveAndLogin() {
            localStorage.setItem('dc_user', JSON.stringify(app.data.currentUser));
            localStorage.setItem('dc_all_users', JSON.stringify(app.data.users));
            location.reload();
        },
        logout() {
            localStorage.removeItem('dc_user');
            location.reload();
        }
    },

    user: {
        saveSettings() {
            const user = app.data.currentUser;
            const now = Date.now();
            const newName = document.getElementById('set-name').value;

            // Проверка на 5 дней (432000000 мс)
            if (newName !== user.name) {
                if (now - user.lastNickChange < 432000000) {
                    return alert("Ник можно менять раз в 5 дней!");
                }
                if (app.data.users.some(u => u.name === newName)) return alert("Ник занят!");
                user.name = newName;
                user.lastNickChange = now;
            }

            user.avatar = document.getElementById('set-av').value || user.avatar;
            user.bio = document.getElementById('set-bio').value;
            
            app.auth.saveAndLogin();
        }
    },

    servers: {
        create() {
            const name = document.getElementById('srv-name').value;
            const av = document.getElementById('srv-av').value;
            if(!name) return;

            const newSrv = {
                name,
                avatar: av || 'https://cdn.discordapp.com/embed/avatars/1.png',
                id: Math.random().toString(36).substr(2, 9),
                owner: app.data.currentUser.name,
                members: [app.data.currentUser.name],
                roles: [{name: 'Создатель', color: '#f1c40f'}]
            };

            app.data.servers.push(newSrv);
            localStorage.setItem('dc_servers', JSON.stringify(app.data.servers));
            app.ui.closeModal('server-modal');
            this.render();
        },
        render() {
            const list = document.getElementById('ui-servers');
            // Очистка и рендер (кроме кнопки + и Домой)
            this.renderIcons();
        },
        renderIcons() {
            const list = document.getElementById('ui-servers');
            // Здесь должна быть логика отрисовки иконок из массива app.data.servers
        }
    },

    voice: {
        stream: null,
        async start() {
            try {
                this.stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const video = document.getElementById('demo-video');
                video.srcObject = this.stream;
                document.getElementById('demo-placeholder').style.display = 'none';
                this.stream.getVideoTracks()[0].onended = () => this.stop();
            } catch (e) { alert("Демка отклонена"); }
        },
        stop() {
            if(this.stream) this.stream.getTracks().forEach(t => t.stop());
            app.ui.view('chat');
        }
    },

    ui: {
        view(id) {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.getElementById('view-' + id).classList.remove('hidden');
            if(id === 'voice') document.getElementById('view-voice').style.display = 'flex';
        },
        modal(id) { document.getElementById(id).style.display = 'flex'; },
        closeModal(id) { document.getElementById(id).style.display = 'none'; },
        updateProfile() {
            const u = app.data.currentUser;
            document.getElementById('ui-my-name').innerText = u.name;
            document.getElementById('ui-my-avatar').src = u.avatar;
            document.getElementById('set-name').value = u.name;
            document.getElementById('set-bio').value = u.bio;
        }
    }
};

app.init();
