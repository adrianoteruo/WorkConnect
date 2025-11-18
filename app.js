const express = require('express');
const path = require('path');
const pool = require('./config/database'); 

const app = express();

const { verifyToken } = require('./middleware/authMiddleware');


const authRoutes = require('./routes/authRoutes');
const professionalRoutes = require('./routes/professionalRoutes');
const contactRoutes = require('./routes/contactRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes'); 


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, user-role');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', true);
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});


app.use('/auth', authRoutes); 

app.use('/api', verifyToken); 
app.use('/api', professionalRoutes);
app.use('/api', contactRoutes);
app.use('/api', serviceRoutes);
app.use('/api', evaluationRoutes);
app.use('/api', chatRoutes);
app.use('/api', userRoutes);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/contratante', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contratante.html'));
});
app.get('/profissional', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profissional.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.get('/reset-password.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});


module.exports = app;
