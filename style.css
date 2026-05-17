// script.js - Complete Frontend API Handler

// ========================
// API Communication Layer
// ========================

class UdharoAPI {
    constructor() {
        this.apiUrl = APP_SCRIPT_URL;
    }

    // Generic API caller
    async call(action, data = {}) {
        try {
            const token = localStorage.getItem('authToken');
            const requestBody = {
                action: action,
                token: token,
                ...data
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                message: 'नेटवर्क त्रुटि: ' + error.message
            };
        }
    }

    // Authentication
    async login(username, password) {
        const result = await this.call('doLogin', { username, password });
        if (result.success && result.token) {
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('username', username);
        }
        return result;
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }

    isAuthenticated() {
        return localStorage.getItem('authToken') !== null;
    }

    // Customer Management
    async getCustomers(search = '') {
        return await this.call('getCustomers', { search });
    }

    async addCustomer(name, phone, address) {
        return await this.call('addCustomer', { name, phone, address });
    }

    // Transactions
    async saveUdharo(customerId, amount, date, dueDate, note) {
        return await this.call('saveUdharo', { customerId, amount, date, dueDate, note });
    }

    async receivePayment(customerId, amount, date, paymentMethod, reference) {
        return await this.call('receivePayment', { customerId, amount, date, paymentMethod, reference });
    }

    // Dashboard & Reports
    async getDashboard() {
        return await this.call('getDashboard');
    }

    async getLedger(customerId) {
        return await this.call('getLedger', { customerId });
    }

    async getTransactionsReport(startDate, endDate) {
        return await this.call('getTransactionsReport', { startDate, endDate });
    }

    async sendSmsReminder(phone, customerName, dueAmount) {
        return await this.call('sendSmsReminder', { phone, customerName, dueAmount });
    }
}

// Initialize API globally
const udharoAPI = new UdharoAPI();

// ========================
// UI Helper Functions
// ========================

// Format currency in Nepali Rupees
function formatCurrency(amount) {
    return 'रु. ' + new Intl.NumberFormat('ne-NP').format(amount);
}

// Format date to Nepali format
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ne-NP');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) {
        // Create toast if not exists
        const toastDiv = document.createElement('div');
        toastDiv.id = 'toast';
        toastDiv.className = 'toast';
        document.body.appendChild(toastDiv);
    }
    
    const toastEl = document.getElementById('toast');
    toastEl.textContent = message;
    toastEl.className = `toast toast-${type} show`;
    
    setTimeout(() => {
        toastEl.className = 'toast';
    }, 3000);
}

// Show loading spinner
function showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = '<div class="spinner"></div> Loading...';
    }
}

// Hide loading
function hideLoading(elementId, originalContent) {
    const el = document.getElementById(elementId);
    if (el && originalContent) {
        el.innerHTML = originalContent;
    }
}

// Check authentication on page load
function checkAuth() {
    if (!udharoAPI.isAuthenticated() && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
    }
}

// Logout function
function logout() {
    udharoAPI.logout();
}

// ========================
// Page-Specific Functions
// ========================

// Login Page
async function handleLogin(event) {
    if (event) event.preventDefault();
    
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!username || !password) {
        showToast('कृपया प्रयोगकर्ता नाम र पासवर्ड प्रविष्ट गर्नुहोस्', 'error');
        return;
    }
    
    const result = await udharoAPI.login(username, password);
    
    if (result.success) {
        showToast('लगइन सफल भयो');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        showToast(result.message || 'लगइन असफल भयो', 'error');
    }
}

// Dashboard Page
async function loadDashboard() {
    if (!udharoAPI.isAuthenticated()) return;
    
    showLoading('dashboard-stats');
    
    const result = await udharoAPI.getDashboard();
    
    if (result.success !== false) {
        document.getElementById('totalUdharo').innerText = formatCurrency(result.totalUdharo || 0);
        document.getElementById('totalPaid').innerText = formatCurrency(result.totalPaid || 0);
        document.getElementById('outstanding').innerText = formatCurrency(result.outstanding || 0);
        document.getElementById('customerCount').innerText = result.customerCount || 0;
        
        // Load overdue list
        if (result.overdueList && result.overdueList.length > 0) {
            displayOverdueList(result.overdueList);
        } else {
            document.getElementById('overdueList').innerHTML = '<tr><td colspan="4" class="text-center">कुनै बक्यौता छैन</td></tr>';
        }
    } else {
        showToast('ड्यासबोर्ड लोड गर्न असफल', 'error');
    }
}

function displayOverdueList(overdueList) {
    const tbody = document.getElementById('overdueList');
    tbody.innerHTML = '';
    
    overdueList.forEach(item => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.phone || '-'}</td>
            <td class="text-danger">${formatCurrency(item.amount)}</td>
            <td>
                <button class="btn-sm btn-primary" onclick="sendReminder(${item.id}, '${item.name}', '${item.phone}', ${item.amount})">
                    स्मरणपत्र पठाउनुहोस्
                </button>
            </td>
        `;
    });
}

async function sendReminder(id, name, phone, amount) {
    if (!phone) {
        showToast('यस ग्राहकको फोन नम्बर छैन', 'error');
        return;
    }
    
    const result = await udharoAPI.sendSmsReminder(phone, name, amount);
    
    if (result.success) {
        showToast('स्मरणपत्र पठाइयो');
    } else {
        showToast(result.message || 'पठाउन असफल', 'error');
    }
}

// Customers Page
async function loadCustomers() {
    if (!udharoAPI.isAuthenticated()) return;
    
    const searchInput = document.getElementById('searchCustomer');
    const search = searchInput ? searchInput.value : '';
    
    showLoading('customersTable');
    
    const result = await udharoAPI.getCustomers(search);
    
    if (Array.isArray(result)) {
        displayCustomers(result);
    } else if (result.success !== false && Array.isArray(result.customers)) {
        displayCustomers(result.customers);
    } else {
        showToast('ग्राहक लोड गर्न असफल', 'error');
    }
}

function displayCustomers(customers) {
    const tbody = document.getElementById('customersTable');
    tbody.innerHTML = '';
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">कुनै ग्राहक छैन</td></tr>';
        return;
    }
    
    customers.forEach(customer => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.phone || '-'}</td>
            <td>${customer.address || '-'}</td>
            <td>
                <button class="btn-sm btn-info" onclick="viewLedger(${customer.id})">लेजर हेर्नुहोस्</button>
                <button class="btn-sm btn-success" onclick="addUdharo(${customer.id}, '${customer.name}')">उधारो थप्नुहोस्</button>
                <button class="btn-sm btn-primary" onclick="receivePaymentModal(${customer.id}, '${customer.name}')">भुक्तानी लिनुहोस्</button>
            </td>
        `;
    });
}

async function addCustomer() {
    const name = document.getElementById('customerName')?.value;
    const phone = document.getElementById('customerPhone')?.value;
    const address = document.getElementById('customerAddress')?.value;
    
    if (!name) {
        showToast('ग्राहकको नाम आवश्यक छ', 'error');
        return;
    }
    
    const result = await udharoAPI.addCustomer(name, phone, address);
    
    if (result.success) {
        showToast('ग्राहक थपियो');
        closeModal('addCustomerModal');
        loadCustomers();
        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerAddress').value = '';
    } else {
        showToast(result.message || 'ग्राहक थप्न असफल', 'error');
    }
}

function viewLedger(customerId) {
    localStorage.setItem('selectedCustomerId', customerId);
    window.location.href = 'ledger.html';
}

function addUdharo(customerId, customerName) {
    localStorage.setItem('selectedCustomerId', customerId);
    localStorage.setItem('selectedCustomerName', customerName);
    document.getElementById('udharoCustomerName').innerText = customerName;
    document.getElementById('udharoCustomerId').value = customerId;
    document.getElementById('udharoDate').value = new Date().toISOString().split('T')[0];
    openModal('addUdharoModal');
}

function receivePaymentModal(customerId, customerName) {
    localStorage.setItem('selectedCustomerId', customerId);
    localStorage.setItem('selectedCustomerName', customerName);
    document.getElementById('paymentCustomerName').innerText = customerName;
    document.getElementById('paymentCustomerId').value = customerId;
    document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
    openModal('receivePaymentModal');
}

async function saveUdharo() {
    const customerId = document.getElementById('udharoCustomerId').value;
    const amount = parseFloat(document.getElementById('udharoAmount').value);
    const date = document.getElementById('udharoDate').value;
    const dueDate = document.getElementById('udharoDueDate').value;
    const note = document.getElementById('udharoNote').value;
    
    if (!amount || amount <= 0) {
        showToast('मान्य रकम प्रविष्ट गर्नुहोस्', 'error');
        return;
    }
    
    const result = await udharoAPI.saveUdharo(customerId, amount, date, dueDate, note);
    
    if (result.success) {
        showToast('उधारो सुरक्षित गरियो');
        closeModal('addUdharoModal');
        document.getElementById('udharoAmount').value = '';
        document.getElementById('udharoNote').value = '';
    } else {
        showToast(result.message || 'उधारो थप्न असफल', 'error');
    }
}

async function savePayment() {
    const customerId = document.getElementById('paymentCustomerId').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const date = document.getElementById('paymentDate').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const reference = document.getElementById('paymentReference').value;
    
    if (!amount || amount <= 0) {
        showToast('मान्य रकम प्रविष्ट गर्नुहोस्', 'error');
        return;
    }
    
    const result = await udharoAPI.receivePayment(customerId, amount, date, paymentMethod, reference);
    
    if (result.success) {
        showToast('भुक्तानी रेकर्ड गरियो');
        closeModal('receivePaymentModal');
        document.getElementById('paymentAmount').value = '';
        document.getElementById('paymentReference').value = '';
    } else {
        showToast(result.message || 'भुक्तानी रेकर्ड गर्न असफल', 'error');
    }
}

// Ledger Page
async function loadLedger() {
    if (!udharoAPI.isAuthenticated()) return;
    
    const customerId = localStorage.getItem('selectedCustomerId');
    const customerName = localStorage.getItem('selectedCustomerName');
    
    if (!customerId) {
        window.location.href = 'customers.html';
        return;
    }
    
    document.getElementById('ledgerCustomerName').innerText = customerName || 'ग्राहक';
    
    showLoading('ledgerTable');
    
    const result = await udharoAPI.getLedger(customerId);
    
    if (Array.isArray(result)) {
        displayLedger(result);
    } else if (result.success !== false && Array.isArray(result.ledger)) {
        displayLedger(result.ledger);
    } else {
        showToast('लेजर लोड गर्न असफल', 'error');
    }
}

function displayLedger(transactions) {
    const tbody = document.getElementById('ledgerTable');
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">कुनै कारोबार छैन</td></tr>';
        return;
    }
    
    let runningBalance = 0;
    
    transactions.forEach(txn => {
        const row = tbody.insertRow();
        let amountDisplay = '';
        let balanceChange = 0;
        
        if (txn.type === 'Udharo') {
            amountDisplay = `<span class="text-danger">${formatCurrency(txn.amount)}</span>`;
            balanceChange = txn.amount;
            runningBalance += txn.amount;
        } else {
            amountDisplay = `<span class="text-success">${formatCurrency(txn.amount)}</span>`;
            balanceChange = -txn.amount;
            runningBalance -= txn.amount;
        }
        
        row.innerHTML = `
            <td>${formatDate(txn.date)}</td>
            <td>${txn.type === 'Udharo' ? 'उधारो' : 'भुक्तानी'}</td>
            <td>${amountDisplay}</td>
            <td>${txn.note || '-'}</td>
            <td>${formatCurrency(runningBalance)}</td>
        `;
    });
}

// Reports Page
async function loadReports() {
    if (!udharoAPI.isAuthenticated()) return;
    
    const startDate = document.getElementById('reportStartDate')?.value;
    const endDate = document.getElementById('reportEndDate')?.value;
    
    if (!startDate || !endDate) {
        showToast('कृपया सुरु र अन्त्य मिति चयन गर्नुहोस्', 'error');
        return;
    }
    
    showLoading('reportsTable');
    
    const result = await udharoAPI.getTransactionsReport(startDate, endDate);
    
    if (result.transactions) {
        displayReports(result);
    } else {
        showToast('रिपोर्ट लोड गर्न असफल', 'error');
    }
}

function displayReports(data) {
    // Display summary
    document.getElementById('reportTotalUdharo').innerText = formatCurrency(data.totalUdharo || 0);
    document.getElementById('reportTotalPayment').innerText = formatCurrency(data.totalPayment || 0);
    document.getElementById('reportBalance').innerText = formatCurrency((data.totalUdharo || 0) - (data.totalPayment || 0));
    
    // Display transactions
    const tbody = document.getElementById('reportsTable');
    tbody.innerHTML = '';
    
    if (data.transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">कुनै कारोबार छैन</td></tr>';
        return;
    }
    
    data.transactions.forEach(txn => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${formatDate(txn.date)}</td>
            <td>${txn.customerName}</td>
            <td>${txn.type === 'Udharo' ? 'उधारो' : 'भुक्तानी'}</td>
            <td>${formatCurrency(txn.amount)}</td>
            <td>${txn.note || '-'}</td>
        `;
    });
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Initialize page based on current page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path.includes('dashboard.html')) {
        checkAuth();
        loadDashboard();
    } else if (path.includes('customers.html')) {
        checkAuth();
        loadCustomers();
        
        // Setup search
        const searchInput = document.getElementById('searchCustomer');
        if (searchInput) {
            searchInput.addEventListener('keyup', () => loadCustomers());
        }
    } else if (path.includes('ledger.html')) {
        checkAuth();
        loadLedger();
    } else if (path.includes('reports.html')) {
        checkAuth();
        // Set default dates
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        document.getElementById('reportStartDate').value = firstDay.toISOString().split('T')[0];
        document.getElementById('reportEndDate').value = today.toISOString().split('T')[0];
    }
});
