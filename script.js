// script.js - Frontend API Handler for GitHub Pages

// ========================
// API Communication Layer
// ========================

class UdharoAPI {
    constructor() {
        this.apiUrl = APP_SCRIPT_URL;
    }

    // Generic API caller - Uses URL parameters to avoid CORS
    async call(action, data = {}) {
        try {
            const token = localStorage.getItem('authToken');
            
            // Build URL with parameters
            const params = new URLSearchParams();
            params.append('action', action);
            if (token) params.append('token', token);
            
            // Add all data parameters
            for (let key in data) {
                if (data.hasOwnProperty(key) && data[key] !== undefined && data[key] !== null) {
                    params.append(key, data[key]);
                }
            }
            
            // Use GET method with URL parameters (works best with Apps Script)
            const url = `${this.apiUrl}?${params.toString()}`;
            console.log('Calling API:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('API Response:', result);
            return result;
            
        } catch (error) {
            console.error('API Error:', error);
            
            // Fallback to POST method if GET fails
            return await this.callPost(action, data);
        }
    }
    
    // Fallback POST method
    async callPost(action, data = {}) {
        try {
            const token = localStorage.getItem('authToken');
            const formData = new URLSearchParams();
            formData.append('action', action);
            if (token) formData.append('token', token);
            
            for (let key in data) {
                if (data.hasOwnProperty(key) && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            }
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });
            
            return await response.json();
            
        } catch (error) {
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
        const token = localStorage.getItem('authToken');
        return token !== null && token !== '';
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
    if (!amount && amount !== 0) return 'रु. ०';
    return 'रु. ' + new Intl.NumberFormat('ne-NP').format(amount);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('ne-NP');
}

// Show toast notification
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        const toastDiv = document.createElement('div');
        toastDiv.id = 'toast';
        toastDiv.className = 'toast';
        document.body.appendChild(toastDiv);
        toast = toastDiv;
    }
    
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Show loading
function showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = '<div class="spinner"></div> लोड हुँदै...';
    }
}

// Hide loading
function hideLoading(elementId, originalContent) {
    const el = document.getElementById(elementId);
    if (el && originalContent) {
        el.innerHTML = originalContent;
    }
}

// Check authentication
function checkAuth() {
    const isAuth = udharoAPI.isAuthenticated();
    const currentPage = window.location.pathname;
    
    if (!isAuth && !currentPage.includes('index.html')) {
        window.location.href = 'index.html';
    }
}

// Logout
function logout() {
    udharoAPI.logout();
}

// Modal functions
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
    if (event.target.classList && event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
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
    
    showToast('लगइन हुँदै...', 'success');
    
    const result = await udharoAPI.login(username, password);
    
    if (result.success) {
        showToast('लगइन सफल भयो', 'success');
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
            const tbody = document.getElementById('overdueList');
            if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center">कुनै बक्यौता छैन</td></tr>';
        }
    } else {
        showToast('ड्यासबोर्ड लोड गर्न असफल', 'error');
    }
}

function displayOverdueList(overdueList) {
    const tbody = document.getElementById('overdueList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    overdueList.forEach(item => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${escapeHtml(item.name)}</td>
            <td>${escapeHtml(item.phone || '-')}</td>
            <td class="text-danger">${formatCurrency(item.amount)}</td>
            <td>
                <button class="btn-sm btn-primary" onclick='sendReminder(${JSON.stringify(item.id)}, ${JSON.stringify(item.name)}, ${JSON.stringify(item.phone)}, ${item.amount})'>
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
        showToast('स्मरणपत्र पठाइयो', 'success');
    } else {
        showToast(result.message || 'पठाउन असफल', 'error');
    }
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path.includes('dashboard.html')) {
        checkAuth();
        loadDashboard();
    } else if (path.includes('customers.html')) {
        checkAuth();
        if (typeof loadCustomers === 'function') loadCustomers();
    } else if (path.includes('ledger.html')) {
        checkAuth();
        if (typeof loadLedger === 'function') loadLedger();
    } else if (path.includes('reports.html')) {
        checkAuth();
        // Set default dates if on reports page
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const startDateInput = document.getElementById('reportStartDate');
        const endDateInput = document.getElementById('reportEndDate');
        if (startDateInput) startDateInput.value = firstDay.toISOString().split('T')[0];
        if (endDateInput) endDateInput.value = today.toISOString().split('T')[0];
    }
});
