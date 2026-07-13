document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const API_BASE = "/api"; // was "/.netlify/functions/api"
    let currentUser = null;
    let currentGroupId = null;

    // --- DOM ELEMENTS ---
    const authView = document.getElementById('auth-view');
    const appView = document.getElementById('app-view');
    const loginForm = document.getElementById('login-form');
    const devLoginForm = document.getElementById('dev-login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');
    const groupInfo = document.getElementById('group-info');
    const navTabs = document.getElementById('nav-tabs');
    const tabContent = document.getElementById('tab-content');
    const alertContainer = document.getElementById('alert-container');

    // Modals
    const modals = {
        addMember: document.getElementById('add-member-modal'),
        savings: document.getElementById('record-savings-modal'),
        loan: document.getElementById('issue-loan-modal'),
        repayment: document.getElementById('record-repayment-modal'),
        attendance: document.getElementById('record-attendance-modal'),
        announcement: document.getElementById('post-announcement-modal'),
        createGroup: document.getElementById('create-group-modal'),
    };

    // --- UTILITY FUNCTIONS ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(amount || 0);
    };

    const showAlert = (message, type = 'success') => {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alertContainer.appendChild(alert);
        setTimeout(() => alert.remove(), 4000);
    };

    const apiFetch = async (endpoint, options = {}) => {
        const headers = { 'Content-Type': 'application/json',...options.headers };
        if (currentGroupId &&!endpoint.startsWith('/developer')) {
            headers['x-group-id'] = currentGroupId;
        }
        if (currentUser) {
            headers['x-user-id'] = currentUser.id;
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {...options, headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'API request failed');
            return data;
        } catch (error) {
            console.error("API Error:", error);
            showAlert(error.message, 'error');
            throw error;
        }
    };

    // --- AUTHENTICATION ---
    const handleLogin = async (e) => {
        e.preventDefault();
        const groupId = document.getElementById('group-id').value;
        const membershipNo = document.getElementById('membership-no').value;
        const password = document.getElementById('password').value;

        try {
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ groupId, membershipNo, password })
            });
            if (data.success) {
                currentUser = data.user;
                currentGroupId = data.user.groupId;
                sessionStorage.setItem('vsg_user', JSON.stringify(currentUser));
                initializeApp();
            }
        } catch (err) {}
    };

    const handleDevLogin = async (e) => {
        e.preventDefault();
        const password = document.getElementById('dev-password').value;
        try {
            const data = await apiFetch('/developer/login', {
                method: 'POST',
                body: JSON.stringify({ password })
            });
            if (data.success) {
                currentUser = { role: 'developer' };
                sessionStorage.setItem('vsg_user', JSON.stringify(currentUser));
                initializeApp();
            }
        } catch (err) {}
    };

    const logout = () => {
        currentUser = null;
        currentGroupId = null;
        sessionStorage.removeItem('vsg_user');
        authView.classList.remove('hidden');
        appView.classList.add('hidden');
    };

    // --- APP INITIALIZATION & ROUTING ---
    const initializeApp = () => {
        authView.classList.add('hidden');
        appView.classList.remove('hidden');

        if (currentUser.role === 'developer') {
            userInfo.textContent = 'Developer Access';
            groupInfo.textContent = 'System Wide';
            document.querySelectorAll('.member-only,.secretary-only').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.dev-only').forEach(el => el.classList.remove('hidden'));
            switchTab('dev-groups-tab');
        } else {
            userInfo.textContent = `${currentUser.name} (${currentUser.role})`;
            groupInfo.textContent = currentUser.groupName;
            if (currentUser.role === 'Secretary') {
                document.querySelectorAll('.secretary-only').forEach(el => el.classList.remove('hidden'));
            }
            switchTab('dashboard-tab');
        }
    };

    const switchTab = (tabId) => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        // Load data for the tab
        if (tabId === 'dashboard-tab') loadDashboardSummary();
        if (tabId === 'members-tab') loadMembers();
        if (tabId === 'savings-tab') loadSavings();
        if (tabId === 'loans-tab') loadLoans();
        if (tabId === 'attendance-tab') loadAttendance();
        if (tabId === 'announcements-tab') loadAnnouncements();
        if (tabId === 'reports-tab') loadReports();
        if (tabId === 'dev-groups-tab') loadGroups();
    };

    // --- DATA LOADING FUNCTIONS ---
    const loadDashboardSummary = async () => {
        const summary = await apiFetch('/dashboard/summary');
        document.getElementById('total-savings').textContent = formatCurrency(summary.totalSavings);
        document.getElementById('total-loans').textContent = formatCurrency(summary.totalLoans);
        document.getElementById('cash-available').textContent = formatCurrency(summary.cashAvailable);
        document.getElementById('overdue-loans').textContent = formatCurrency(summary.overdueLoans);
        document.getElementById('active-members').textContent = summary.activeMembers;
        document.getElementById('total-interest').textContent = formatCurrency(summary.totalInterest);
    };

    const loadMembers = async () => {
        const members = await apiFetch('/members');
        const tbody = document.getElementById('members-table-body');
        tbody.innerHTML = members.map(m => `
            <tr>
                <td>${m.membership_no}</td>
                <td>${m.name}</td>
                <td>${m.phone}</td>
                <td>${m.role}</td>
                <td><span class="status ${m.status.toLowerCase()}">${m.status}</span></td>
                <td class="secretary-only">
                    <button class="btn-icon" onclick="openEditMemberModal(${m.id})">✏️</button>
                    <button class="btn-icon" onclick="deleteMember(${m.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    };

    const loadSavings = async () => {
        const savings = await apiFetch('/savings');
        const tbody = document.getElementById('savings-table-body');
        tbody.innerHTML = savings.map(s => `
            <tr>
                <td>${s.transaction_date}</td>
                <td>${s.name} (${s.membership_no})</td>
                <td>${formatCurrency(s.amount)}</td>
                <td>${s.recorded_by}</td>
            </tr>
        `).join('');
    };

    const loadLoans = async () => {
        const loans = await apiFetch('/loans');
        const tbody = document.getElementById('loans-table-body');
        tbody.innerHTML = loans.map(l => {
            const balance = (parseFloat(l.principal) + parseFloat(l.principal) * (parseFloat(l.interest_rate)/100)) - parseFloat(l.total_repaid);
            return `
            <tr>
                <td>${l.name}</td>
                <td>${formatCurrency(l.principal)}</td>
                <td>${l.interest_rate}%</td>
                <td>${formatCurrency(balance)}</td>
                <td><span class="status ${l.status.toLowerCase().replace(' ', '-')}">${l.status}</span></td>
                <td class="secretary-only">
                    <button class="btn" onclick="openRepaymentModal(${l.id})">Record Payment</button>
                </td>
            </tr>
        `}).join('');
    };

    const loadGroups = async () => {
        const groups = await apiFetch('/developer/groups');
        const tbody = document.getElementById('groups-table-body');
        tbody.innerHTML = groups.map(g => `
            <tr>
                <td>${g.group_id}</td>
                <td>${g.name}</td>
                <td>${g.member_count}</td>
                <td><input type="checkbox" ${g.allow_broadcast? 'checked' : ''} onchange="toggleBroadcast(${g.id}, this.checked)"></td>
                <td><button class="btn-danger" onclick="deleteGroup(${g.id})">Delete</button></td>
            </tr>
        `).join('');
    };

    // --- FORM SUBMISSIONS & CRUD ---
    document.getElementById('add-member-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await apiFetch('/members', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData))
        });
        showAlert('Member added successfully');
        closeModal('addMember');
        loadMembers();
    });

    document.getElementById('record-savings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await apiFetch('/savings', { method: 'POST', body: JSON.stringify(Object.fromEntries(formData)) });
        showAlert('Savings recorded');
        closeModal('savings');
        loadSavings();
    });

    //... Add similar handlers for loans, repayments, attendance, announcements, createGroup...

    // --- MODAL & UI HELPERS ---
    window.openModal = (modalName) => modals[modalName].classList.remove('hidden');
    window.closeModal = (modalName) => modals[modalName].classList.add('hidden');

    window.exportReport = (format) => {
        showAlert(`Exporting report as ${format}... Feature coming soon!`);
    };

    // --- EVENT LISTENERS ---
    loginForm.addEventListener('submit', handleLogin);
    devLoginForm.addEventListener('submit', handleDevLogin);
    logoutBtn.addEventListener('click', logout);
    navTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-button')) {
            switchTab(e.target.dataset.tab);
        }
    });

    // --- CHECK SESSION ON LOAD ---
    const savedUser = sessionStorage.getItem('vsg_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        currentGroupId = currentUser.groupId;
        initializeApp();
    }
});