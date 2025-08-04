// Global state
let earningsData = [];
let currentPage = 1;
let earningsPerPage = 10;
let currentSearch = '';
let currentFilters = {
    course_id: '',
    status: '',
    payment_method: '',
    date_from: '',
    date_to: ''
};
let currentSortBy = 'transaction_date';
let currentSortOrder = 'desc';

// DOM Elements
const tableBody = document.getElementById('earningsTableBody');
const paginationEl = document.getElementById('earningsPagination');
const searchInput = document.getElementById('earningsSearch');
const courseFilter = document.getElementById('earningsCourseFilter');
const statusFilter = document.getElementById('earningsStatusFilter');
const methodFilter = document.getElementById('earningsMethodFilter');
const dateFromFilter = document.getElementById('earningsDateFrom');
const dateToFilter = document.getElementById('earningsDateTo');
const exportBtn = document.getElementById('exportEarningsBtn');
const rowsPerPageSelect = document.getElementById('earningsPerPage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchEarnings();
    setupEventListeners();
});

function setupEventListeners() {
    // Search and filter listeners
    searchInput.addEventListener('input', debounce(() => {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        fetchEarnings();
    }, 300));

    [courseFilter, statusFilter, methodFilter].forEach(el => {
        el.addEventListener('change', () => {
            currentFilters.course_id = courseFilter.value;
            currentFilters.status = statusFilter.value;
            currentFilters.payment_method = methodFilter.value;
            currentPage = 1;
            fetchEarnings();
        });
    });

    rowsPerPageSelect.addEventListener('change', () => {
        earningsPerPage = parseInt(rowsPerPageSelect.value);
        currentPage = 1;
        fetchEarnings();
    });

    [dateFromFilter, dateToFilter].forEach(el => {
        el.addEventListener('change', () => {
            currentFilters.date_from = dateFromFilter.value;
            currentFilters.date_to = dateToFilter.value;
            currentPage = 1;
            fetchEarnings();
        });
    });

    exportBtn.addEventListener('click', exportEarnings);

    document.querySelectorAll('[data-sort]').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const sortBy = header.getAttribute('data-sort');
            if (currentSortBy === sortBy) {
                currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortBy = sortBy;
                currentSortOrder = 'asc';
            }
            document.querySelectorAll('[data-sort]').forEach(h => {
                h.classList.remove('active-sort');
                h.querySelector('.sort-icon')?.remove();
            });

            header.classList.add('active-sort');
            const icon = document.createElement('i');
            icon.className = `fas fa-sort-${currentSortOrder === 'asc' ? 'up' : 'down'} ms-2 sort-icon`;
            header.appendChild(icon);

            fetchEarnings();
        });
    });
}

async function fetchEarnings() {
    try {
        const query = new URLSearchParams({
            page: currentPage,
            limit: earningsPerPage,
            search: currentSearch,
            sort_by: currentSortBy,
            sort_order: currentSortOrder,
            ...currentFilters
        });

        const response = await fetch(`../learnnest-backend/api/get-earnings.php?${query}`);
        const result = await response.json();

        if (result.success) {
            earningsData = result.earnings;
            renderEarnings();
            renderPagination(result.total);
            populateFilters(result.filters);
        } else {
            showError(result.message || 'Failed to load earnings data');
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    }
}

function renderEarnings() {
    tableBody.innerHTML = '';

    if (!earningsData.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    No earnings records found matching your criteria
                </td>
            </tr>
        `;
        return;
    }

    earningsData.forEach((earning, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${(currentPage - 1) * earningsPerPage + index + 1}</td>
            <td>${earning.student_name}</td>
            <td>${earning.course_name}</td>
            <td>$${parseFloat(earning.amount).toFixed(2)}</td>
            <td>${new Date(earning.transaction_date).toLocaleDateString()}</td>
            <td><span class="badge ${getStatusBadgeClass(earning.status)}">${earning.status}</span></td>
            <td>${earning.payment_method.replace('_', ' ')}</td>
            <td>
                <button class="btn btn-sm btn-info me-2" onclick="viewInvoice('${earning.invoice_number}')">
                    <i class="fas fa-file-invoice"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function getStatusBadgeClass(status) {
    const classes = {
        'completed': 'bg-success',
        'pending': 'bg-warning text-dark',
        'refunded': 'bg-secondary',
        'failed': 'bg-danger'
    };
    return classes[status] || 'bg-info';
}

function renderPagination(total) {
    paginationEl.innerHTML = '';
    const totalPages = Math.ceil(total / earningsPerPage);

    if (totalPages <= 1) return;

    const prevBtn = createPaginationButton('Previous', currentPage > 1, () => {
        if (currentPage > 1) {
            currentPage--;
            fetchEarnings();
        }
    });
    paginationEl.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = createPaginationButton(i, true, () => {
            currentPage = i;
            fetchEarnings();
        }, i === currentPage);
        paginationEl.appendChild(btn);
    }

    const nextBtn = createPaginationButton('Next', currentPage < totalPages, () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchEarnings();
        }
    });
    paginationEl.appendChild(nextBtn);
}

function createPaginationButton(text, enabled, onClick, isActive = false) {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm mx-1 ${isActive ? 'btn-primary' : 'btn-outline-primary'}`;
    btn.textContent = text;
    btn.disabled = !enabled;
    btn.addEventListener('click', onClick);
    return btn;
}

function populateFilters(filters) {
    const preserveSelection = (el, value) => {
        const options = Array.from(el.options);
        const exists = options.some(o => o.value === value);
        if (exists) el.value = value;
    };

    courseFilter.innerHTML = '<option value="">All Courses</option>';
    filters.courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        courseFilter.appendChild(option);
    });
    preserveSelection(courseFilter, currentFilters.course_id);

    statusFilter.innerHTML = '<option value="">All Statuses</option>';
    filters.statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusFilter.appendChild(option);
    });
    preserveSelection(statusFilter, currentFilters.status);

    methodFilter.innerHTML = '<option value="">All Methods</option>';
    filters.payment_methods.forEach(method => {
        const option = document.createElement('option');
        option.value = method;
        option.textContent = method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        methodFilter.appendChild(option);
    });
    preserveSelection(methodFilter, currentFilters.payment_method);
}

function exportEarnings() {
    let csv = 'Student,Course,Amount,Date,Status,Payment Method,Invoice\n';
    earningsData.forEach(earning => {
        csv += `"${earning.student_name}","${earning.course_name}","$${earning.amount}","${new Date(earning.transaction_date).toLocaleDateString()}","${earning.status}","${earning.payment_method.replace('_', ' ')}","${earning.invoice_number}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function debounce(func, delay) {
    let timeoutId;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
}

function showError(message) {
    const toast = document.getElementById('errorToast');
    const toastBody = toast.querySelector('.toast-body');
    toastBody.textContent = message;
    bootstrap.Toast.getOrCreateInstance(toast).show();
}



function viewInvoice(invoiceNumber) {
    const earning = earningsData.find(e => e.invoice_number === invoiceNumber);
    if (!earning) {
        showError('Invoice data not found');
        return;
    }

    // Store the earning data for download
    window.currentInvoice = earning;



    // Populate modal with proper data mapping
    document.getElementById("inv-id").textContent = earning.invoice_number || "N/A";
    document.getElementById("inv-date").textContent = earning.transaction_date ? 
        new Date(earning.transaction_date).toLocaleDateString() : "N/A";
    document.getElementById("inv-student").textContent = earning.student_name || "N/A";
    document.getElementById("inv-course").textContent = earning.course_name || "N/A";
    document.getElementById("inv-status").textContent = earning.status ? 
        earning.status.charAt(0).toUpperCase() + earning.status.slice(1) : "N/A";
    document.getElementById("inv-method").textContent = earning.payment_method ? 
        earning.payment_method.replace('_', ' ') : "N/A";
    document.getElementById("inv-amount").textContent = earning.amount ? 
        `$${parseFloat(earning.amount).toFixed(2)}` : "$0.00";

    // Show modal with proper styling
    const invoiceModal = new bootstrap.Modal(document.getElementById("invoiceModal"), {
        backdrop: 'static'
    });
    
    // Ensure modal has proper dark theme classes
    const modalContent = document.querySelector('#invoiceModal .modal-content');
    modalContent.classList.add('bg-dark', 'text-light');
    
    invoiceModal.show();
}

// Add this right after the viewInvoice function (at the bottom of the file)
function downloadInvoice() {
    // Get the current invoice data from the modal
    const invoiceData = {
        id: document.getElementById("inv-id").textContent,
        date: document.getElementById("inv-date").textContent,
        student: document.getElementById("inv-student").textContent,
        course: document.getElementById("inv-course").textContent,
        status: document.getElementById("inv-status").textContent,
        method: document.getElementById("inv-method").textContent,
        amount: document.getElementById("inv-amount").textContent
    };

    // Create HTML content for the invoice
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice ${invoiceData.id}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .invoice-header { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                .invoice-details { margin-bottom: 30px; }
                .invoice-row { display: flex; margin-bottom: 10px; }
                .invoice-label { font-weight: bold; width: 150px; }
                .invoice-amount { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    text-align: center; 
                    margin-top: 20px;
                    font-size: 1.2em;
                    font-weight: bold;
                }
                h1 { color: #007bff; margin-bottom: 20px; }
                .text-center { text-align: center; }
            </style>
        </head>
        <body>
            <h1 class="text-center">Invoice ${invoiceData.id}</h1>
            <div class="invoice-header">
                <div class="invoice-row">
                    <div class="invoice-label">Date:</div>
                    <div>${invoiceData.date}</div>
                </div>
            </div>
            <div class="invoice-details">
                <div class="invoice-row">
                    <div class="invoice-label">Student:</div>
                    <div>${invoiceData.student}</div>
                </div>
                <div class="invoice-row">
                    <div class="invoice-label">Course:</div>
                    <div>${invoiceData.course}</div>
                </div>
                <div class="invoice-row">
                    <div class="invoice-label">Status:</div>
                    <div>${invoiceData.status}</div>
                </div>
                <div class="invoice-row">
                    <div class="invoice-label">Payment Method:</div>
                    <div>${invoiceData.method}</div>
                </div>
            </div>
            <div class="invoice-amount">
                Total Amount: ${invoiceData.amount}
            </div>
        </body>
        </html>
    `;

    // Create a blob and download it
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${invoiceData.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}