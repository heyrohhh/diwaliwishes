const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify SMTP at startup
transporter.verify()
    .then(() => console.log('✅ SMTP transporter ready'))
    .catch(err => console.error('❌ SMTP transporter verification failed:', err.message));

// Test email route (optional)
app.get('/test-email', async (req, res) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.EMAIL_TO,
            subject: 'Test Email',
            text: 'This is a test email from your Diwali website 🎇'
        });
        console.log('Email info:', info.response);
        res.send('✅ Test email sent! Check your inbox.');
    } catch (err) {
        console.error('Error sending test email:', err);
        res.status(500).send('❌ Failed: ' + err.message);
    }
});

// Form submit route
app.post('/submit', async (req, res) => {
    try {
        const { name, relation, message, upi, gameNumber, prize, sender } = req.body;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.EMAIL_TO || process.env.SMTP_USER,
            subject: '🪔 New Diwali Website Response',
            text: `Name: ${name || 'N/A'}
Relation: ${relation || 'N/A'}
Sender: ${sender || 'N/A'}
Message: ${message || 'N/A'}
UPI: ${upi || 'N/A'}
Game Number: ${gameNumber || 'N/A'}
Prize: ${prize || 'N/A'}`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📨 Email sent:', info.response);
        console.log('📋 Received form data:', req.body);

        res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (err) {
        console.error('❌ Error sending email:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// SPA fallback route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
