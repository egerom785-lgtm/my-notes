require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const User = require('./models/User');
const Channel = require('./models/Channel');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/discordmini');

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Настройка загрузки аватарок
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Проверка токена
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Нет доступа' });
  try {
    const verified = jwt.verify(token, 'секретный_ключ_меняй_на_свой');
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

// Регистрация
app.post('/api/register', async (req, res) => {
  let { username, password } = req.body;
  username = username.trim();

  if (!/^[a-zA-Z]{4,12}$/.test(username)) {
    return res.status(400).json({ error: 'Ник: 4–12 латинских букв' });
  }

  if (await User.findOne({ username })) {
    return res.status(400).json({ error: 'Такой ник уже занят' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();

  const token = jwt.sign({ id: user._id }, 'секретный_ключ_меняй_на_свой');
  res.json({ token });
});

// Вход
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Неверный ник или пароль' });
  }
  const token = jwt.sign({ id: user._id }, 'секретный_ключ_меняй_на_свой');
  res.json({ token });
});

// Получить профиль
app.get('/api/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
});

// Обновить профиль
app.put('/api/profile', auth, upload.single('avatar'), async (req, res) => {
  const user = await User.findById(req.user.id);
  let { username, description } = req.body;

  if (username && username !== user.username) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (user.lastNicknameChange > weekAgo) {
      return res.status(400).json({ error: 'Ник можно менять раз в неделю' });
    }
    if (!/^[a-zA-Z]{4,12}$/.test(username)) {
      return res.status(400).json({ error: 'Ник: 4–12 латинских букв' });
    }
    if (await User.findOne({ username })) {
      return res.status(400).json({ error: 'Ник занят' });
    }
    user.username = username;
    user.lastNicknameChange = new Date();
  }

  if (description) user.description = description;
  if (req.file) user.avatar = `/uploads/${req.file.filename}`;

  await user.save();
  res.json(user);
});

// Добавить в друзья
app.post('/api/friends/add', auth, async (req, res) => {
  const { friendUsername } = req.body;
  const user = await User.findById(req.user.id);
  const friend = await User.findOne({ username: friendUsername });

  if (!friend) return res.status(404).json({ error: 'Пользователь не найден' });
  if (user.friends.includes(friend._id)) {
    return res.status(400).json({ error: 'Уже в друзьях' });
  }

  user.friends.push(friend._id);
  friend.friends.push(user._id);
  await user.save();
  await friend.save();

  res.json({ message: 'Добавлен в друзья' });
});

// Создать канал
app.post('/api/channels', auth, async (req, res) => {
  const { name, description, isVoice } = req.body;
  const channel = new Channel({
    name,
    description,
    isVoice: !!isVoice,
    creator: req.user.id
  });
  await channel.save();
  res.json(channel);
});

// Получить все каналы
app.get('/api/channels', auth, async (req, res) => {
  const channels = await Channel.find();
  res.json(channels);
});

// Socket.io — чат
io.on('connection', (socket) => {
  socket.on('join', (channelId) => {
    socket.join(channelId);
  });

  socket.on('message', ({ channelId, text, username }) => {
    io.to(channelId).emit('message', { text, username, time: new Date() });
  });
});

// WebRTC сервер (голос и экран)
const peerServer = ExpressPeerServer(server, { debug: true });
app.use('/peerjs', peerServer);

server.listen(3000, () => {
  console.log('Сервер запущен → http://localhost:3000');
});
