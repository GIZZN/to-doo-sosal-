import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import cookieParser from 'cookie-parser';
const { Pool } = pkg

dotenv.config();

const app = express();
const PORT = 5000;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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

app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasksr WHERE userId = $1', [req.user.userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/deleteTask', async (req, res) => {
    let { id } = req.body
    try {
        await pool.query('DELETE FROM tasksr WHERE id = $1', [id]);
        const result = await pool.query('SELECT * FROM tasksr');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/api/tasks', authenticateToken, async (req, res) => {
    let { text, isChecked } = req.body
    console.log(req.user);

    try {
        await pool.query('INSERT INTO tasksr (text, isChecked, userId) VALUES ($1, $2, $3)', [text, isChecked, req.user.userId]);
        const result = await pool.query('SELECT * FROM tasksr');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/api/auth/sign-up', async (req, res) => {
    let { username, email, password } = req.body
    let password_hash = await bcrypt.hash(password, 10)
    try {
        let result = await pool.query('SELECT * FROM usersr WHERE email = $1', [email])
        if (result.rows.length > 0) {
            return res.status(400).json({ error: 'этот email уже занят' })
        }
        await pool.query('INSERT INTO usersr (username,email,password_hash) VALUES ($1,$2,$3)', [username, email, password_hash])
        res.status(201).json({ succes: 'пользователь создан' })
    } catch (err) {
        console.log(err);
    }
})

app.post('/api/auth/sign-in', async (req, res) => {
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
            secure: false,
            maxAge: 3600000,
            sameSite: 'strict'
        });
        
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'ошибка на сервере' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ success: true });
});

app.put('/api/tasks/:id',authenticateToken, async (req, res) => {
    let { currentData } = req.body
    let { id } = req.params
    
    try {
        if (typeof currentData === 'boolean') {
            let result = await pool.query('UPDATE tasksr SET ischecked = $1 WHERE userid = $2 AND id = $3', [currentData, req.user.userId, id])
            res.json(result.rows);
        } else if (typeof currentData === 'string') {
            let result = await pool.query('UPDATE tasksr SET text = $1 WHERE userid = $2 AND id = $3', [currentData, req.user.userId, id])
            res.json(result.rows);
        } else {
            console.log('ошибка');
        }
    } catch (err) {
        console.log(err);
    }
})

app.get('/api/check-auth', authenticateToken, (req, res) => {
    res.json({ authenticated: true });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// npm install cookie-parser --save для кук :)