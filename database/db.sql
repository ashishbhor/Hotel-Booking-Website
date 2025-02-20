CREATE DATABASE hotel_bookings;
USE hotel_bookings;

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    aadharNumber VARCHAR(14) NOT NULL,
    adults INT NOT NULL,
    children INT NOT NULL,
    checkIn DATE NOT NULL,
    checkOut DATE NOT NULL,
    nights INT NOT NULL,
    roomType VARCHAR(50) NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL,
    bookingDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
