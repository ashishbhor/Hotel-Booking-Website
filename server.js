const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MySQL Connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// Booking Route
app.post('/api/bookings', async (req, res) => {
    try {
        const {
            userName, email, phone, nationality, aadharNumber,
            adults, children, checkIn, checkOut, nights, roomType, totalPrice
        } = req.body;

        const [result] = await promisePool.execute(
            `INSERT INTO bookings (
                userName, email, phone, nationality, aadharNumber,
                adults, children, checkIn, checkOut, nights, roomType, totalPrice
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userName, email, phone, nationality, aadharNumber,
                adults, children, checkIn, checkOut, nights, roomType, totalPrice
            ]
        );

        res.status(201).json({
            message: 'Booking successful',
            bookingId: result.insertId
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(400).json({
            message: 'Booking failed',
            error: error.message
        });
    }
});

// View Bookings Route
app.get('/api/bookings', async (req, res) => {
    try {
        const [rows] = await promisePool.execute('SELECT * FROM bookings ORDER BY bookingDate DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.post('/api/payment/initiate', async (req, res) => {
    const { upiId, amount, orderId } = req.body;
    
    // Here you'd integrate with a UPI payment service
    // For example: RazorPay, PhonePe, or Google Pay
    
    try {
        // Simulate payment request
        res.json({
            success: true,
            message: 'Payment request initiated',
            paymentId: `PAY${Date.now()}`
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Payment initiation failed'
        });
    }
});
