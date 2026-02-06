// ===== State =====
let state = {
    income: 0,
    expenses: [] // { id, description, amount, type: 'personal' | 'shared' }
};

// ===== DOM Elements =====
const incomeForm = document.getElementById('income-form');
const incomeAmountInput = document.getElementById('income-amount');
const expenseForm = document.getElementById('expense-form');
const expenseDescInput = document.getElementById('expense-description');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseList = document.getElementById('expense-list');
const emptyMessage = document.getElementById('empty-message');
const resetBtn = document.getElementById('reset-btn');

// Dashboard
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const remainingBudgetEl = document.getElementById('remaining-budget');

// ===== LocalStorage =====
const STORAGE_KEY = 'expense-tracker-data';

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        state = JSON.parse(saved);
    }
}

// ===== Calculations =====
function calculateTotals() {
    let myShareOfExpenses = 0;

    state.expenses.forEach(expense => {
        if (expense.type === 'shared') {
            // 50% split - I only pay half
            myShareOfExpenses += expense.amount / 2;
        } else {
            // Personal - I pay 100%
            myShareOfExpenses += expense.amount;
        }
    });

    const remaining = state.income - myShareOfExpenses;

    return {
        income: state.income,
        expenses: myShareOfExpenses,
        remaining: remaining
    };
}

// ===== Render =====
function formatCurrency(amount) {
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function renderDashboard() {
    const totals = calculateTotals();
    totalIncomeEl.textContent = formatCurrency(totals.income);
    totalExpensesEl.textContent = formatCurrency(totals.expenses);
    remainingBudgetEl.textContent = formatCurrency(totals.remaining);

    // Color code remaining
    if (totals.remaining < 0) {
        remainingBudgetEl.style.color = '#ff6b6b';
    } else if (totals.remaining < 100) {
        remainingBudgetEl.style.color = '#ffd93d';
    } else {
        remainingBudgetEl.style.color = '#4facfe';
    }
}

function renderExpenseList() {
    expenseList.innerHTML = '';

    if (state.expenses.length === 0) {
        emptyMessage.classList.remove('hidden');
        return;
    }

    emptyMessage.classList.add('hidden');

    state.expenses.forEach(expense => {
        const li = document.createElement('li');
        li.className = 'expense-item';

        const badgeClass = expense.type === 'shared' ? 'badge-shared' : 'badge-personal';
        const badgeText = expense.type === 'shared' ? '50%' : '100%';
        const displayAmount = expense.type === 'shared' 
            ? `${formatCurrency(expense.amount)} (ma part: ${formatCurrency(expense.amount / 2)})`
            : formatCurrency(expense.amount);

        li.innerHTML = `
            <div class="expense-info">
                <span class="expense-desc">${escapeHtml(expense.description)}</span>
                <span class="expense-meta">
                    ${displayAmount}
                    <span class="badge ${badgeClass}">${badgeText}</span>
                </span>
            </div>
            <button class="delete-btn" data-id="${expense.id}" title="Supprimer">✕</button>
        `;

        expenseList.appendChild(li);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function render() {
    renderDashboard();
    renderExpenseList();
}

// ===== Event Handlers =====
incomeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(incomeAmountInput.value);
    if (!isNaN(amount) && amount >= 0) {
        state.income = amount;
        saveState();
        render();
        incomeAmountInput.value = '';
    }
});

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = expenseDescInput.value.trim();
    const amount = parseFloat(expenseAmountInput.value);
    const type = document.querySelector('input[name="expense-type"]:checked').value;

    if (description && !isNaN(amount) && amount > 0) {
        const newExpense = {
            id: Date.now(),
            description,
            amount,
            type
        };
        state.expenses.push(newExpense);
        saveState();
        render();

        expenseDescInput.value = '';
        expenseAmountInput.value = '';
    }
});

expenseList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = parseInt(e.target.dataset.id);
        state.expenses = state.expenses.filter(exp => exp.id !== id);
        saveState();
        render();
    }
});

resetBtn.addEventListener('click', () => {
    if (confirm('Êtes-vous sûr de vouloir tout réinitialiser ?')) {
        state = { income: 0, expenses: [] };
        saveState();
        render();
    }
});

// ===== Init =====
loadState();
render();
