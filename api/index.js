import { createServer } from 'http';
import { parse } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

console.log("API starting, NODE_ENV:", process.env.NODE_ENV);

// Настройка базы данных для Vercel
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Проверяем подключение к базе данных
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
  } else {
    console.log('База данных подключена:', res.rows[0]);
  }
});

// Создаем приложение Express
const app = express();

// Логгер запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Настройка middleware
app.use(cors({
  origin: '*',
  methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Middleware для проверки токена
function authenticateToken(req, res, next) {
  console.log('Checking authentication token');
  const token = req.cookies.authToken;

  if (!token) {
    console.log('No token found');
    return res.status(401).json({ error: 'токена нет' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Invalid token:', err.message);
      return res.status(403).json({ error: 'недействительный токен' });
    }
    
    console.log('Token valid for user:', user.userId);
    req.user = user;
    next();
  });
}

// API Routes

// Получение задач
app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    console.log('Getting tasks for user:', req.user.userId);
    const result = await pool.query('SELECT * FROM tasksr WHERE userId = $1', [req.user.userId]);
    console.log(`Found ${result.rows.length} tasks`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting tasks:', err);
    res.status(500).json({ error: err.message });
  }
});

// Удаление задачи
app.delete('/deleteTask', authenticateToken, async (req, res) => {
  let { id } = req.body;
  try {
    console.log('Deleting task:', id);
    await pool.query('DELETE FROM tasksr WHERE id = $1 AND userId = $2', [id, req.user.userId]);
    const result = await pool.query('SELECT * FROM tasksr WHERE userId = $1', [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: err.message });
  }
});

// Создание задачи
app.post('/tasks', authenticateToken, async (req, res) => {
  let { text, isChecked } = req.body;
  try {
    console.log('Creating task:', text);
    await pool.query('INSERT INTO tasksr (text, isChecked, userId) VALUES ($1, $2, $3)', [text, isChecked, req.user.userId]);
    const result = await pool.query('SELECT * FROM tasksr WHERE userId = $1', [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: err.message });
  }
});

// Регистрация пользователя
app.post('/auth/sign-up', async (req, res) => {
  let { username, email, password } = req.body;
  console.log('Registration attempt for:', email);
  
  try {
    let password_hash = await bcrypt.hash(password, 10);
    let result = await pool.query('SELECT * FROM usersr WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      console.log('Email already in use:', email);
      return res.status(400).json({ error: 'этот email уже занят' });
    }
    await pool.query('INSERT INTO usersr (username,email,password_hash) VALUES ($1,$2,$3)', [username, email, password_hash]);
    console.log('User created:', email);
    res.status(201).json({ success: 'пользователь создан' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'ошибка на сервере' });
  }
});

// Аутентификация пользователя
app.post('/auth/sign-in', async (req, res) => {
  let { email, password } = req.body;
  console.log('Login attempt for:', email);
  
  try {
    let result = await pool.query('SELECT * FROM usersr WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ error: 'юзера нет' });
    }
    
    let checkPassword = await bcrypt.compare(password, user.password_hash);
    if (!checkPassword) {
      console.log('Password incorrect for:', email);
      return res.status(401).json({ error: 'неверный пароль' });
    }
    
    let token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful for:', email);
    
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 3600000
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'ошибка на сервере' });
  }
});

// Выход из системы
app.post('/auth/logout', (req, res) => {
  console.log('Logout request');
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
  });
  res.json({ success: true });
});

// Обновление задачи
app.put('/tasks/:id', authenticateToken, async (req, res) => {
  let { currentData } = req.body;
  let { id } = req.params;
  
  try {
    console.log('Updating task:', id, 'with data:', currentData);
    if (typeof currentData === 'boolean') {
      let result = await pool.query('UPDATE tasksr SET ischecked = $1 WHERE userid = $2 AND id = $3', [currentData, req.user.userId, id]);
      res.json(result.rows);
    } else if (typeof currentData === 'string') {
      let result = await pool.query('UPDATE tasksr SET text = $1 WHERE userid = $2 AND id = $3', [currentData, req.user.userId, id]);
      res.json(result.rows);
    } else {
      console.log('Invalid data format:', typeof currentData);
      res.status(400).json({ error: 'неверный формат данных' });
    }
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'ошибка на сервере' });
  }
});

// Проверка аутентификации
app.get('/check-auth', authenticateToken, (req, res) => {
  console.log('Auth check successful for user:', req.user.userId);
  res.json({ authenticated: true });
});

// Добавляем тестовый маршрут для проверки работоспособности API
app.get('/', (req, res) => {
  console.log('API health check');
  res.json({ status: 'API is working!' });
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Запуск сервера для локальной разработки
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Обработчик запросов для serverless функции
export default async (req, res) => {
  console.log('API request received:', req.url);
  return app(req, res);
}; 