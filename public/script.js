// Room rate configurations
const ROOM_RATES = {
    deluxe: { adult: 2000, child: 1400, multiplier: 1 },
    executive: { adult: 4000, child: 2800, multiplier: 2 },
    presidential: { adult: 8000, child: 5600, multiplier: 6 },
    family: { adult: 6000, child: 4200, multiplier: 4 }
};

// ✅ Global variable for Aadhar number
let actualAadharNumber = '';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
    // Phone number handling
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', handlePhoneInput);

    // Aadhar card handling
    const aadharInput = document.getElementById('aadharCard');
    aadharInput.addEventListener('input', handleAadharInput);

    // Nights dropdown
    const nightsSelect = document.getElementById('nights');
    for (let i = 1; i <= 30; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} Night${i > 1 ? 's' : ''}`;
        nightsSelect.appendChild(option);
    }

    // Date handling
    const checkInDate = document.getElementById('checkIn');
    const checkOutDate = document.getElementById('checkOut');
    const today = new Date().toISOString().split('T')[0];
    checkInDate.min = today;
    checkOutDate.min = today;

    checkInDate.addEventListener('change', function () {
        checkOutDate.min = this.value;
        calculateNights();
    });

    checkOutDate.addEventListener('change', calculateNights);

    // Price calculation listeners
    ['roomType', 'adults', 'children', 'nights'].forEach(id => {
        document.getElementById(id).addEventListener('change', calculateTotalPrice);
    });

    // Prevent non-numeric input for phone
    phoneInput.addEventListener('keypress', function (e) {
        if (e.key < '0' || e.key > '9') {
            e.preventDefault();
        }
    });
});

// 📞 Handle Phone Input
function handlePhoneInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    e.target.value = value.length > 5 ? `${value.slice(0, 5)} ${value.slice(5)}` : value;
}

// 🆔 Handle Aadhar Input
function handleAadharInput(e) {
    let input = e.target.value.replace(/\D/g, '');
    
    if (input.length > 12) {
        input = input.slice(0, 12);
    }
    actualAadharNumber = input; 
    let formattedInput = input.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = formattedInput;
}


// 🗓️ Calculate Nights
function calculateNights() {
    const checkIn = new Date(document.getElementById('checkIn').value);
    const checkOut = new Date(document.getElementById('checkOut').value);
    const nightsSelect = document.getElementById('nights');

    if (checkIn && checkOut) {
        const nights = Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        if (nights > 0) {
            nightsSelect.value = nights;
            calculateTotalPrice();
        }
    }
}

// 💰 Calculate Total Price
function calculateTotalPrice() {
    const roomType = document.getElementById('roomType').value;
    const adults = parseInt(document.getElementById('adults').value) || 0;
    const children = parseInt(document.getElementById('children').value) || 0;
    const nights = parseInt(document.getElementById('nights').value) || 0;

    if (roomType && nights > 0) {
        const rates = ROOM_RATES[roomType];
        const adultsCost = adults * rates.adult;
        const childrenCost = children * rates.child;
        const totalAmount = (adultsCost + childrenCost) * nights;

        document.getElementById('roomTypeRate').textContent = `₹${rates.adult}/adult, ₹${rates.child}/child`;
        document.getElementById('adultsCost').textContent = `₹${adultsCost}`;
        document.getElementById('childrenCost').textContent = `₹${childrenCost}`;
        document.getElementById('nightsCount').textContent = nights;
        document.getElementById('totalPrice').textContent = `₹${totalAmount}`;

        return totalAmount;
    }
    return 0;
}

function initiatePayment(paymentData) {
    const paymentModal = `
        <div class="payment-modal">
            <h3>Payment Details</h3>
            <p>Amount: ₹${paymentData.amount}</p>
            <div class="upi-section">
                <input type="text" id="upiId" placeholder="Enter UPI ID (example@upi)" />
                <button onclick="verifyAndPay()">Pay Now</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', paymentModal);
}

async function verifyAndPay() {
    const upiId = document.getElementById('upiId').value;
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    
    if (upiRegex.test(upiId)) {
        try {
            const response = await fetch('/api/payment/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    upiId,
                    amount: calculateTotalPrice(),
                    orderId: `HOTEL${Date.now()}`
                })
            });
            
            const result = await response.json();
            if (result.success) {
                // Show payment pending status
                showPaymentStatus('Payment request sent to your UPI ID');
            }
        } catch (error) {
            showPaymentStatus('Payment initiation failed');
        }
    } else {
        alert('Please enter a valid UPI ID');
    }
}

function showPaymentStatus(message) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'payment-status';
    statusDiv.innerHTML = `
        <h4>${message}</h4>
        <div class="payment-spinner"></div>
    `;
    document.body.appendChild(statusDiv);
}

// ✅ Validate Form
async function validateForm() {
    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    const email = document.getElementById('email').value;
    const checkIn = new Date(document.getElementById('checkIn').value);
    const checkOut = new Date(document.getElementById('checkOut').value);

    if (phone.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return false;
    }

    if (actualAadharNumber.length !== 12) {
        alert('Please enter a valid 12-digit Aadhar number');
        return false;
    }

    if (checkOut <= checkIn) {
        alert('Check-out date must be after check-in date');
        return false;
    }

    const formData = {
        userName: document.getElementById('userName').value,
        email: email,
        phone: phone,
        nationality: document.getElementById('nationality').value,
        aadharNumber: actualAadharNumber,
        adults: parseInt(document.getElementById('adults').value),
        children: parseInt(document.getElementById('children').value),
        checkIn: document.getElementById('checkIn').value,
        checkOut: document.getElementById('checkOut').value,
        nights: parseInt(document.getElementById('nights').value),
        roomType: document.getElementById('roomType').value,
        totalPrice: calculateTotalPrice()
    };

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (response.ok) {
            alert(`Booking successful! Your booking ID is: ${result.bookingId}`);
            document.getElementById('bookingForm').reset();
            return true;
        } else {
            alert('Booking failed: ' + result.message);
            return false;
        }
    } catch (error) {
        alert('Error submitting booking: ' + error.message);
        return false;
    }
    
    if (validationPassed) {
        const paymentData = {
            amount: calculateTotalPrice(),
            orderId: `HOTEL${Date.now()}`,
            customerName: document.getElementById('userName').value,
            customerPhone: phone
        };
        
        initiatePayment(paymentData);
    }
}

async function createRazorpayOrder(amount) {
    const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: amount
        })
    });
    
    const order = await response.json();
    
    const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your key
        amount: amount,
        currency: "INR",
        name: "Hotel Booking",
        description: "Room Booking Payment",
        order_id: order.id,
        handler: function (response) {
            verifyPayment(response);
        },
        prefill: {
            name: document.getElementById('userName').value,
            email: document.getElementById('email').value,
            contact: document.getElementById('phone').value
        },
        theme: {
            color: "#3399cc"
        }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
}