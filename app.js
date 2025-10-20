const baseUrl = 'http://localhost:3000';
let token = localStorage.getItem('token');
let userRole = localStorage.getItem('role');

const errorMessage = document.getElementById('error-message');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const carsSection = document.getElementById('cars-section');
const proposeTradeSection = document.getElementById('propose-trade-section');
const paymentSection = document.getElementById('payment-section');
const analyticsSection = document.getElementById('analytics-section');

const showLogin = document.getElementById('show-login');
const showRegister = document.getElementById('show-register');
const showCars = document.getElementById('show-cars');
const showProposeTrade = document.getElementById('show-propose-trade');
const showPayment = document.getElementById('show-payment');
const showAnalytics = document.getElementById('show-analytics');
const logout = document.getElementById('logout');

function showSection(section) {
  [loginSection, registerSection, carsSection, proposeTradeSection, paymentSection, analyticsSection].forEach(s => s.classList.add('hidden'));
  section.classList.remove('hidden');
  errorMessage.classList.add('hidden');
}

function displayError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function updateNav() {
  if (token) {
    showLogin.classList.add('hidden');
    showRegister.classList.add('hidden');
    showCars.classList.remove('hidden');
    showProposeTrade.classList.remove('hidden');
    showPayment.classList.remove('hidden');
    logout.classList.remove('hidden');
    if (userRole === 'Admin') {
      showAnalytics.classList.remove('hidden');
    }
  } else {
    showLogin.classList.remove('hidden');
    showRegister.classList.remove('hidden');
    showCars.classList.add('hidden');
    showProposeTrade.classList.add('hidden');
    showPayment.classList.add('hidden');
    showAnalytics.classList.add('hidden');
    logout.classList.add('hidden');
  }
}

// Navigation
showLogin.addEventListener('click', () => showSection(loginSection));
showRegister.addEventListener('click', () => showSection(registerSection));
showCars.addEventListener('click', () => { showSection(carsSection); fetchCars(); });
showProposeTrade.addEventListener('click', () => showSection(proposeTradeSection));
showPayment.addEventListener('click', () => showSection(paymentSection));
showAnalytics.addEventListener('click', () => showSection(analyticsSection));
logout.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  token = null;
  userRole = null;
  updateNav();
  showSection(loginSection);
});

// Login Form
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    token = data.token;
    userRole = data.user.role;
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);
    updateNav();
    showSection(carsSection);
    fetchCars();
  } catch (err) {
    displayError(err.message);
  }
});

// Register Form
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const userData = {
    username: document.getElementById('register-username').value,
    full_name: document.getElementById('register-full-name').value,
    email: document.getElementById('register-email').value,
    phone_number: document.getElementById('register-phone').value || undefined,
    password: document.getElementById('register-password').value,
    role: document.getElementById('register-role').value
  };

  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    displayError('Registration successful! Please login.');
    showSection(loginSection);
  } catch (err) {
    displayError(err.message);
  }
});

// Fetch Cars
async function fetchCars() {
  try {
    const response = await fetch(`${baseUrl}/api/cars`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const cars = await response.json();
    if (!response.ok) {
      throw new Error(cars.message || 'Failed to fetch cars');
    }
    const tbody = document.getElementById('cars-table-body');
    tbody.innerHTML = '';
    cars.forEach(car => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="border p-2">${car.car_model}</td>
        <td class="border p-2">${car.year_of_manufacture}</td>
        <td class="border p-2">${car.engine_size}</td>
        <td class="border p-2">${car.fuel_type || 'N/A'}</td>
        <td class="border p-2">${car.owner_id}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    displayError(err.message);
  }
}

// Propose Trade
document.getElementById('propose-trade-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const tradeData = {
    my_car_id: parseInt(document.getElementById('my-car-id').value),
    target_car_id: parseInt(document.getElementById('target-car-id').value),
    cash_top_up: parseFloat(document.getElementById('cash-top-up').value) || 0
  };

  try {
    const response = await fetch(`${baseUrl}/api/trades/propose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tradeData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to propose trade');
    }
    displayError(`Trade proposed successfully! Trade ID: ${data.trade_id}`);
  } catch (err) {
    displayError(err.message);
  }
});

// Record Payment
document.getElementById('payment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const paymentData = {
    trade_id: parseInt(document.getElementById('trade-id').value),
    amount: parseFloat(document.getElementById('amount').value),
    payment_method: document.getElementById('payment-method').value,
    transaction_id: document.getElementById('transaction-id').value || undefined
  };

  try {
    const response = await fetch(`${baseUrl}/api/trades/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to record payment');
    }
    displayError(`Payment recorded successfully! Payment ID: ${data.payment_id}`);
  } catch (err) {
    displayError(err.message);
  }
});

// Fetch Analytics
document.getElementById('fetch-analytics').addEventListener('click', async () => {
  try {
    const response = await fetch(`${baseUrl}/api/trades/reports?type=most_traded_models`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch analytics');
    }
    const tbody = document.getElementById('analytics-table-body');
    tbody.innerHTML = '';
    data.report.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="border p-2">${item.car_model}</td>
        <td class="border p-2">${item.trade_count}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    displayError(err.message);
  }
});

// Initialize
updateNav();
if (token) {
  showSection(carsSection);
  fetchCars();
} else {
  showSection(loginSection);
}