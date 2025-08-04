const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
    ? 'http://localhost/learnnest-backend/api/' 
    : '/api/'; // Changed from '../api/' to 'api/'
    

// Global chart instances
let salesChart, engagementChart;

// Theme management
const toggleDarkMode = (enable) => {
    if (enable) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
    // Redraw charts
    if (salesChart) salesChart.update();
    if (engagementChart) engagementChart.update();
};

// Load Dashboard Stats
async function loadDashboardStats() {
    const cards = document.querySelectorAll('.card-custom h2');
    cards.forEach(card => {
        card.innerHTML = '<span class="loading-spinner"></span>';
    });

    try {
        const response = await fetch(`${API_BASE_URL}get-dashboard-stats.php`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        
        if (result.success) {
            document.getElementById("totalStudents").textContent = result.stats.total_students;
            document.getElementById("activeCourses").textContent = result.stats.active_courses;
            document.getElementById("totalCourses").textContent = result.stats.total_courses;
        }
    } catch (error) {
        console.error("Failed to load dashboard stats:", error);
        cards.forEach(card => {
            card.textContent = 'Error';
        });
    }
}

// Load Courses on Dashboard
async function loadDashboardCourses() {
    const tbody = document.getElementById("dashboardCoursesTableBody");
    if (!tbody) return;


    // Show loading spinner
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <div class="spinner-border text-info"></div>
          <div class="mt-2">Loading courses...</div>
        </td>
      </tr>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}get-latest-courses.php`);
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status} status`);
        }

        const result = await response.json();
        
        // Clear the table
        tbody.innerHTML = "";

        if (result.success && result.courses?.length > 0) {
            result.courses.forEach(course => {
                const row = document.createElement("tr");
                
                // Handle both 'title' and 'name' fields from backend
                const courseTitle = course.title || course.name || 'Untitled Course';
                
                row.innerHTML = `
                    <td>${courseTitle}</td>
                    <td>${course.description || '—'}</td>
                    <td>${course.duration || '—'}</td>
                    <td>$${parseFloat(course.price || 0).toFixed(2)}</td>
                    <td>${course.students || 0}</td>
                    <td>
                        <span class="badge ${course.status === 'Published' ? 'bg-success' : 'bg-warning text-dark'}">
                            ${course.status || 'Draft'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-info me-1" onclick="openEditModalFromRow(this)">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="openPreviewModalFromRow(this)">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                
                // Store the full course data on the row element
                row.dataset.course = JSON.stringify({
                    ...course,
                    title: courseTitle // Ensure consistent title field
                });
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = `
              <tr>
                <td colspan="7" class="text-center text-muted py-4">
                  <i class="fas fa-book-open me-2"></i>
                  No courses found
                </td>
              </tr>
            `;
        }
    } catch (error) {
        console.error("Failed to load courses:", error);
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-danger py-4">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Error loading courses: ${error.message}
            </td>
          </tr>
        `;
    }
}


// Load Recent Enrollments
async function loadRecentEnrollments() {
    const list = document.getElementById("enrollmentsList");
    if (!list) return;

    list.innerHTML = '<li class="list-group-item bg-transparent text-center"><div class="spinner-border text-secondary"></div></li>';

    try {
        const response = await fetch(`${API_BASE_URL}get-recent-enrollments.php`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();

        list.innerHTML = "";
        
        if (result.success && result.enrollments.length > 0) {
            result.enrollments.forEach(enrollment => {
                const item = document.createElement("li");
                item.className = "list-group-item bg-transparent text-light d-flex justify-content-between align-items-center gap-2";
                item.innerHTML = `
                    <div><i class="fa-solid fa-user-graduate me-2 text-info"></i>
                        <strong>${enrollment.student_name}</strong> enrolled in <em>${enrollment.course_name}</em>
                    </div>
                    <small class="text-muted">${enrollment.time_ago}</small>
                `;
                list.appendChild(item);
            });
        } else {
            list.innerHTML = `<li class="list-group-item bg-transparent text-muted text-center">No recent enrollments</li>`;
        }
    } catch (error) {
        console.error("Failed to load enrollments:", error);
        list.innerHTML = `<li class="list-group-item bg-transparent text-danger text-center">Error loading enrollments</li>`;
    }
}

// Initialize Charts with real data
async function initializeCharts() {
    try {
        const response = await fetch(`${API_BASE_URL}get-chart-data.php`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();

        if (result.success) {
            // Sales Chart
            const ctx = document.getElementById('salesChart').getContext('2d');
            salesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: result.sales.labels,
                    datasets: [{
                        label: 'Sales ($)',
                        data: result.sales.data,
                        backgroundColor: 'rgba(0, 191, 255, 0.2)',
                        borderColor: 'deepskyblue',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1200,
                        easing: 'easeOutQuart'
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#ffffff' },
                            grid: { color: '#333' }
                        },
                        x: {
                            ticks: { color: '#ffffff' },
                            grid: { color: '#333' }
                        }
                    },
                    plugins: {
                        legend: { 
                            labels: { 
                                color: '#ffffff',
                                boxWidth: 12,
                                padding: 20
                            } 
                        }
                    }
                }
            });

            // Engagement Chart
            const ctxEngage = document.getElementById('engagementChart').getContext('2d');
            engagementChart = new Chart(ctxEngage, {
                type: 'doughnut',
                data: {
                    labels: result.engagement.labels,
                    datasets: [{
                        label: 'Engagement',
                        data: result.engagement.data,
                        backgroundColor: [
                            'deepskyblue',
                            'rgba(30, 144, 255, 0.5)',
                            '#333'
                        ],
                        borderColor: '#000',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            labels: { 
                                color: '#ffffff',
                                boxWidth: 12,
                                padding: 20
                            } 
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error("Failed to load chart data:", error);
        document.getElementById('salesChart').closest('.card-custom').innerHTML += '<div class="text-danger">Failed to load chart data</div>';
        document.getElementById('engagementChart').closest('.card-custom').innerHTML += '<div class="text-danger">Failed to load chart data</div>';
    }
}



// Load notifications
async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE_URL}get-notifications.php`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        
        const notificationBadge = document.querySelector('.notification-badge');
        const notificationDropdown = document.querySelector('.notification-dropdown');
        
        if (result.success && result.notifications.length > 0) {
            notificationBadge.textContent = result.notifications.length;
            
            notificationDropdown.innerHTML = '';
            result.notifications.forEach(notification => {
                const item = document.createElement('li');
                item.innerHTML = `
                    <a class="dropdown-item" href="${notification.link || '#'}">
                        <div class="d-flex align-items-center">
                            <div class="notification-icon bg-${notification.type || 'info'} me-2">
                                <i class="fas fa-${notification.icon || 'bell'}"></i>
                            </div>
                            <div>
                                <div class="small text-muted">${notification.time}</div>
                                <div>${notification.message}</div>
                            </div>
                        </div>
                    </a>
                `;
                notificationDropdown.appendChild(item);
            });
            
            // Add mark all as read button
            const footer = document.createElement('li');
            footer.innerHTML = `
                <hr class="dropdown-divider">
                <a class="dropdown-item text-center small" href="#" id="markAllRead">
                    Mark all as read
                </a>
            `;
            notificationDropdown.appendChild(footer);
            
            document.getElementById('markAllRead').addEventListener('click', async (e) => {
                e.preventDefault();
                await fetch(`${API_BASE_URL}mark-notifications-read.php`, { method: 'POST' });
                notificationBadge.textContent = '0';
            });
        } else {
            notificationBadge.textContent = '0';
            notificationDropdown.innerHTML = '<li><a class="dropdown-item text-muted text-center" href="#">No new notifications</a></li>';
        }
    } catch (error) {
        console.error("Failed to load notifications:", error);
    }
}

// Preview Modal
function openPreviewModalFromRow(button) {
    const row = button.closest("tr");
    if (!row) return;

    const course = JSON.parse(row.dataset.course);
    
    document.getElementById("modalCourseName").textContent = course.title;
    document.getElementById("modalDescription").textContent = course.description || '—';
    document.getElementById("modalDuration").textContent = course.duration || '—';
    document.getElementById("modalPrice").textContent = `$${course.price || '0.00'}`;
    document.getElementById("modalStudents").textContent = course.students;

    new bootstrap.Modal(document.getElementById("courseModal")).show();
}

// Debounce helper
function debounce(func, delay) {
    let timeoutId;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
    // Set theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    toggleDarkMode(savedTheme === 'dark');
    
    // Add theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'btn btn-sm btn-outline-light ms-2';
    themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    themeToggle.title = 'Toggle Dark/Light Mode';
    themeToggle.onclick = () => {
        const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        toggleDarkMode(!isDark);
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    };
    document.querySelector('.dropdown').insertAdjacentElement('beforebegin', themeToggle);
    
    // Initialize all components
    loadDashboardStats();
    loadDashboardCourses();
    loadRecentEnrollments();
    initializeCharts();
    loadNotifications();
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Fix for localhost CSS loading
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            if (link.href.startsWith('/')) {
                link.href = window.location.origin + link.href;
            }
        });
    }
});


function openEditModalFromRow(button) {
    const row = button.closest('tr');
    const course = JSON.parse(row.dataset.course);
    
    // Fill modal fields
    document.getElementById('editCourseId').value = course.id;
    document.getElementById('editCourseName').value = course.title || course.name;
    document.getElementById('editDescription').value = course.description;
    document.getElementById('editDuration').value = course.duration;
    document.getElementById('editPrice').value = course.price;
    document.getElementById('editStudents').value = course.students;
    document.getElementById('editStatus').value = course.status || 'Draft';
    
    // Show modal
    new bootstrap.Modal(document.getElementById('editCourseModal')).show();
}

function openPreviewModalFromRow(button) {
    const row = button.closest('tr');
    const course = JSON.parse(row.dataset.course);
    
    // Fill preview modal
    document.getElementById('modalCourseName').textContent = course.title || course.name;
    document.getElementById('modalDescription').textContent = course.description || '—';
    document.getElementById('modalDuration').textContent = course.duration || '—';
    document.getElementById('modalPrice').textContent = `$${parseFloat(course.price || 0).toFixed(2)}`;
    document.getElementById('modalStudents').textContent = course.students || 0;
    
    // Show modal
    new bootstrap.Modal(document.getElementById('courseModal')).show();
}

// Add this at the bottom of the existing JS file or where modal functions are

// Bind the save button in the Edit Modal
const saveEditBtn = document.getElementById("saveCourseEditBtn");
saveEditBtn?.addEventListener("click", saveCourseEdit);

async function saveCourseEdit(e) {
    e.preventDefault();
    const id = document.getElementById("editCourseId").value;
    const name = document.getElementById("editCourseName").value;
    const description = document.getElementById("editDescription").value;
    const duration = document.getElementById("editDuration").value;
    const price = document.getElementById("editPrice").value;
    const students = document.getElementById("editStudents").value;
    const status = document.getElementById("editStatus").value;

    const payload = {
        id,
        name,
        description,
        duration,
        price,
        students,
        status
    };

    try {
        const response = await fetch(`${API_BASE_URL}update-course.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            bootstrap.Modal.getOrCreateInstance(document.getElementById("editCourseModal")).hide();
            loadDashboardCourses();
        } else {
            alert("Update failed: " + (result.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Update error:", error);
        alert("An error occurred while updating the course.");
    }
}


// Toggle Sidebar
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
}