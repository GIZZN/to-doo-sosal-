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

// Настройка базы данных для Vercel
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Создаем приложение Express
const app = express();

// Настройка middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Middleware для проверки токена
function authenticateToken(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: 'токена нет' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'недействительный токен' });
    }
    
    req.user = user;
    next();
  });
}

// API Routes

// Получение задач
app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasksr WHERE userId = $1', [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удаление задачи
app.delete('/deleteTask', authenticateToken, async (req, res) => {
  let { id } = req.body;
  try {
    await pool.query('DELETE FROM tasksr WHERE id = $1 AND userId = $2', [id, req.user.userId]);
    const result = await pool.query('SELECT * FROM tasksr WHERE userId = $1', [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создание задачи
app.post('/tasks', authenticateToken, async (req, res) => {
  let { text, isChecked } = req.body;
  try {
    await pool.query('INSERT INTO tasksr (text, isChecked, userId) VALUES ($1, $2, $3)', [text, isChecked, req.user.userId]);
    const result = await pool.query('SELECT * FROM tasksr WHERE userId = $1', [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Регистрация пользователя
app.post('/auth/sign-up', async (req, res) => {
  let { username, email, password } = req.body;
  let password_hash = await bcrypt.hash(password, 10);
  try {
    let result = await pool.query('SELECT * FROM usersr WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ error: 'этот email уже занят' });
    }
    await pool.query('INSERT INTO usersr (username,email,password_hash) VALUES ($1,$2,$3)', [username, email, password_hash]);
    res.status(201).json({ success: 'пользователь создан' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'ошибка на сервере' });
  }
});

// Аутентификация пользователя
app.post('/auth/sign-in', async (req, res) => {
  let { email, password } = req.body;
  try {
    let result = await pool.query('SELECT * FROM usersr WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ error: 'юзера нет' });
    }
    let checkPassword = await bcrypt.compare(password, user.password_hash);
    if (!checkPassword) {
      return res.status(401).json({ error: 'неверный пароль' });
    }
    let token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 3600000
    });
    
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'ошибка на сервере' });
  }
});

// Выход из системы
app.post('/auth/logout', (req, res) => {
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
    if (typeof currentData === 'boolean') {
      let result = await pool.query('UPDATE tasksr SET ischecked = $1 WHERE userid = $2 AND id = $3', [currentData, req.user.userId, id]);
      res.json(result.rows);
    } else if (typeof currentData === 'string') {
      let result = await pool.query('UPDATE tasksr SET text = $1 WHERE userid = $2 AND id = $3', [currentData, req.user.userId, id]);
      res.json(result.rows);
    } else {
      res.status(400).json({ error: 'неверный формат данных' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'ошибка на сервере' });
  }
});

// Проверка аутентификации
app.get('/check-auth', authenticateToken, (req, res) => {
  res.json({ authenticated: true });
});

// Добавляем тестовый маршрут для проверки работоспособности API
app.get('/', (req, res) => {
  res.json({ status: 'API is working!' });
});

// Обработчик запросов для serverless функции
export default async (req, res) => {
  console.log('API request received:', req.url);
  
  // Обрабатываем запрос через Express
  app(req, res);
}; 