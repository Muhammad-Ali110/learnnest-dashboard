// === THEME TOGGLE ===
function initThemeToggle() {
    // Set initial theme from localStorage or default to dark
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-bs-theme", savedTheme);
    
    // Create or update theme toggle button
    let themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) {
        themeToggle = document.createElement("button");
        themeToggle.className = "btn btn-sm btn-outline-secondary ms-2";
        themeToggle.id = "themeToggle";
        themeToggle.title = "Toggle Dark/Light Mode";
        
        // Add button to the header
        const header = document.querySelector(".main h2");
        if (header) {
            header.insertAdjacentElement('afterend', themeToggle);
        }
    }
    
    // Update icon based on current theme
    updateThemeIcon(savedTheme);
    
    // Set click handler
    themeToggle.onclick = () => {
        const currentTheme = document.documentElement.getAttribute("data-bs-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-bs-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeIcon(newTheme);
    };
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.innerHTML = theme === "dark" 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
}

// === API CONFIGURATION ===
const API_BASE = "../learnnest-backend/api/";

// === STATE ===
let allStudents = [];
let currentPage = 1;
let studentsPerPage = 10;
let currentSearch = "";
let currentCourseFilter = "";
let currentSortBy = "enrolled_on";
let currentSortOrder = "desc";

// === MAIN FUNCTIONS ===
async function fetchFilteredStudents() {
  try {
    const query = new URLSearchParams({
      page: currentPage,
      limit: studentsPerPage,
      search: currentSearch,
      course: currentCourseFilter,
      sort_by: currentSortBy,
      sort_order: currentSortOrder
    });

    const res = await fetch(`${API_BASE}get-students.php?${query}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const result = await res.json();
    
    if (!result) {
      throw new Error("Empty response from server");
    }

    const tbody = document.getElementById("studentsTableBody");
    if (result.success) {
      allStudents = result.students;
      renderStudents(result.students, result.total || 0);
      if (result.all_courses) populateCourseFilter(result.all_courses);
    } else {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">${result.message || 'No students found.'}</td></tr>`;
    }
  } catch (err) {
    console.error("Fetch error:", err);
    document.getElementById("studentsTableBody").innerHTML = `
      <tr>
        <td colspan="6" class="text-danger text-center">
          Error loading data: ${err.message}
        </td>
      </tr>`;
  }
}

function renderStudents(students, totalCount = 0) {
  const tbody = document.getElementById("studentsTableBody");
  tbody.innerHTML = "";

  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No matching students found.</td></tr>`;
    return;
  }

  students.forEach((student, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${(currentPage - 1) * studentsPerPage + index + 1}</td>
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.course_name || '—'}</td>
      <td>${student.enrolled_on}</td>
      <td>
        <button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${student.id}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${student.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  renderPagination(totalCount);
}

function renderPagination(total) {
  const pagination = document.getElementById("studentsPagination");
  pagination.innerHTML = "";
  const totalPages = Math.ceil(total / studentsPerPage);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm me-1 ${i === currentPage ? "btn-info" : "btn-outline-info"}`;
    btn.textContent = i;
    btn.addEventListener("click", () => {
      currentPage = i;
      fetchFilteredStudents();
    });
    pagination.appendChild(btn);
  }
}

function populateCourseFilter(courses) {
  const courseFilter = document.getElementById("courseFilter");
  courseFilter.innerHTML = '<option value="">All Courses</option>';

  courses.forEach(course => {
    if (course.name) {
      const opt = document.createElement("option");
      opt.value = course.name;
      opt.textContent = course.name;
      courseFilter.appendChild(opt);
    }
  });
}

// === FILTER LISTENERS ===
document.getElementById("studentSearch")?.addEventListener("input", e => {
  currentSearch = e.target.value.trim();
  currentPage = 1;
  fetchFilteredStudents();
});

document.getElementById("courseFilter")?.addEventListener("change", e => {
  currentCourseFilter = e.target.value;
  currentPage = 1;
  fetchFilteredStudents();
});

document.getElementById("studentsPerPage")?.addEventListener("change", e => {
  studentsPerPage = parseInt(e.target.value);
  currentPage = 1;
  fetchFilteredStudents();
});

// === LOAD STUDENTS MAIN ENTRY ===
function loadStudents() {
  currentPage = 1;
  fetchFilteredStudents();
}

// === SORTING ===
function setupSortingHeaders() {
  const nameHeader = document.querySelector("th:nth-child(2)");
  const enrolledHeader = document.querySelector("th:nth-child(5)");
  nameHeader.setAttribute("data-sort", "name");
  enrolledHeader.setAttribute("data-sort", "enrolled_on");

  [nameHeader, enrolledHeader].forEach(header => {
    header.style.cursor = "pointer";
    header.classList.add("sortable-header");

    header.addEventListener("mouseenter", () => {
      if (!header.classList.contains("active-sort")) {
        header.style.color = "deepskyblue";
      }
    });
    header.addEventListener("mouseleave", () => {
      if (!header.classList.contains("active-sort")) {
        header.style.color = "";
      }
    });

    header.addEventListener("click", () => {
      const sortBy = header.getAttribute("data-sort");

      document.querySelectorAll(".sortable-header").forEach(h => {
        h.classList.remove("active-sort");
        h.querySelector(".sort-icon")?.remove();
      });

      if (currentSortBy === sortBy) {
        currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
      } else {
        currentSortBy = sortBy;
        currentSortOrder = "asc";
      }

      header.classList.add("active-sort");
      const icon = document.createElement("i");
      icon.className = `fas fa-sort-${currentSortOrder === "asc" ? "up" : "down"} ms-2 sort-icon`;
      header.appendChild(icon);

      fetchFilteredStudents();
    });

    // Set initial sort indicator
    if (currentSortBy === header.getAttribute("data-sort")) {
      header.classList.add("active-sort");
      const icon = document.createElement("i");
      icon.className = `fas fa-sort-${currentSortOrder === "asc" ? "up" : "down"} ms-2 sort-icon`;
      header.appendChild(icon);
    }
  });
}

// Update loadCourseOptions to show prices
document.getElementById("addStudentModal")?.addEventListener("show.bs.modal", loadCourseOptions);
async function loadCourseOptions() {
  try {
    const response = await fetch("api/get-courses.php");
    const result = await response.json();
    const courseSelect = document.getElementById("studentCourse");

    courseSelect.innerHTML = '<option value="">Select a course</option>';

    if (result.success && result.courses.length > 0) {
      result.courses.forEach(course => {
        const opt = document.createElement("option");
        opt.value = course.id;
        opt.textContent = `${course.name} ($${course.price})`;
        opt.dataset.price = course.price;
        courseSelect.appendChild(opt);
      });
      
      // Auto-update price when course selected
      courseSelect.addEventListener('change', function() {
        const priceField = document.getElementById("coursePrice");
        const selected = this.options[this.selectedIndex];
        priceField.value = selected.dataset.price || '10.00';
      });
    }
  } catch (error) {
    // showToast("Error loading courses", "danger");
  }
}

// Enhanced add student form submission
// === ADD STUDENT FUNCTIONALITY ===
async function loadCourseOptionsForAddModal() {
  const courseSelect = document.getElementById("studentCourse");
  const priceField = document.getElementById("coursePrice");
  
  try {
    courseSelect.innerHTML = '<option value="">Loading courses...</option>';
    priceField.value = "";

    const response = await fetch(`${API_BASE}get-courses.php`);
    if (!response.ok) throw new Error("Network error loading courses");
    
    const result = await response.json();
    
    // Handle both possible response formats
    const courses = result.courses || result;
    if (!Array.isArray(courses)) {
      throw new Error("Invalid course data format");
    }

    courseSelect.innerHTML = '<option value="">Select a course</option>';
    
    courses.forEach(course => {
      const opt = document.createElement("option");
      opt.value = course.id || course.course_id;
      opt.textContent = course.name || course.course_name;
      if (course.price) {
        opt.dataset.price = course.price;
      }
      courseSelect.appendChild(opt);
    });

    // Auto-update price when course selected
    courseSelect.addEventListener('change', function() {
      const selected = this.options[this.selectedIndex];
      priceField.value = selected.dataset.price || '';
    });

  } catch (error) {
    console.error("Course load error:", error);
    courseSelect.innerHTML = '<option value="">Error loading courses</option>';
    showToast("Failed to load courses", "danger");
  }
}

// Initialize when modal opens
document.getElementById("addStudentModal").addEventListener("show.bs.modal", loadCourseOptionsForAddModal);

// Form submission
document.getElementById("addStudentForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

    const formData = {
      name: document.getElementById("studentName").value.trim(),
      email: document.getElementById("studentEmail").value.trim(),
      course_id: document.getElementById("studentCourse").value,
      payment_method: document.getElementById("paymentMethod").value,
      amount: document.getElementById("coursePrice").value
    };

    // Validation
    if (!formData.name || !formData.email || !formData.course_id || !formData.payment_method || !formData.amount) {
      throw new Error("Please fill all required fields");
    }

    const response = await fetch(`${API_BASE}enroll-student.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    
    // First check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(text || "Invalid server response");
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Enrollment failed");
    }

    showToast("Student enrolled and payment processed successfully!");
    form.reset();
    bootstrap.Modal.getInstance(form.closest(".modal")).hide();
    loadStudents();

  } catch (err) {
    console.error("Enrollment error:", err);
    showToast(err.message || "Enrollment failed. Please check console for details.", "danger");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Enroll & Process Payment';
  }
});

// === EDIT STUDENT FUNCTIONALITY ===
async function loadCoursesForEditModal(selectedCourseName = "") {
  const courseSelect = document.getElementById("editCourseId");
  courseSelect.innerHTML = '<option value="">Loading courses...</option>';

  try {
    // Use the existing get-courses.php endpoint but process differently
    const response = await fetch(`${API_BASE}get-courses.php`);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const result = await response.json();
    
    // Handle both possible response formats to maintain compatibility
    const courses = result.courses || result;
    if (!Array.isArray(courses)) {
      throw new Error("Invalid course data format");
    }

    courseSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a course";
    courseSelect.appendChild(defaultOption);

    // Add course options
    courses.forEach(course => {
      const option = document.createElement("option");
      option.value = course.id || course.course_id; // Handle different field names
      option.textContent = course.name || course.course_name; // Handle different field names
      
      // Set selected if matches current course
      if ((course.name || course.course_name) === selectedCourseName) {
        option.selected = true;
      }
      
      courseSelect.appendChild(option);
    });

  } catch (error) {
    console.error("Error loading courses:", error);
    courseSelect.innerHTML = '<option value="">Error loading courses</option>';
    showToast("Failed to load courses", "danger");
  }
}

// === EDIT STUDENT MODAL HANDLER ===
document.getElementById("studentsTableBody").addEventListener("click", async function (e) {
  if (e.target.classList.contains("edit-btn")) {
    const row = e.target.closest("tr").children;
    const studentData = {
      id: e.target.getAttribute("data-id"),
      name: row[1].textContent.trim(),
      email: row[2].textContent.trim(),
      course: row[3].textContent.trim()
    };

    document.getElementById("editStudentId").value = studentData.id;
    document.getElementById("editStudentName").value = studentData.name;
    document.getElementById("editStudentEmail").value = studentData.email;

    await loadCoursesForEditModal(studentData.course);
    
    new bootstrap.Modal(document.getElementById("editStudentModal")).show();
  }
});

// === UPDATE STUDENT HANDLER === 
document.getElementById("editStudentForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...';

    const updatedStudent = {
      id: document.getElementById("editStudentId").value,
      name: document.getElementById("editStudentName").value.trim(),
      email: document.getElementById("editStudentEmail").value.trim(),
      course_id: document.getElementById("editCourseId").value
    };

    // Basic validation
    if (!updatedStudent.name || !updatedStudent.email || !updatedStudent.course_id) {
      throw new Error("Please fill all fields");
    }

    const response = await fetch(`${API_BASE}update-student.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedStudent)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Update failed");
    }

    showToast("Student updated successfully!");
    bootstrap.Modal.getInstance(document.getElementById("editStudentModal")).hide();
    loadStudents();

  } catch (err) {
    console.error("Update error:", err);
    showToast(err.message || "Update failed", "danger");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Update Student";
  }
});

// === DELETE STUDENT FUNCTIONALITY ===
document.getElementById("studentsTableBody").addEventListener("click", async function(e) {
  if (e.target.classList.contains("delete-btn")) {
    if (!confirm("Are you sure you want to delete this student?")) return;
    
    const studentId = e.target.getAttribute("data-id");
    const deleteBtn = e.target;
    
    try {
      // Show loading state on the button
      deleteBtn.disabled = true;
      deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
      
      const response = await fetch(`${API_BASE}delete-student.php?id=${studentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Delete failed");
      }
      
      showToast("Student deleted successfully!");
      loadStudents(); // Refresh the student list
      
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.message || "Failed to delete student", "danger");
    } finally {
      deleteBtn.disabled = false;
      deleteBtn.innerHTML = "Delete";
    }
  }
});


// toast message popup
function showToast(message, type = "success") {
  const toastEl = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  toastMessage.textContent = message;
  toastEl.className = `toast align-items-center text-bg-${type} border-0 show`;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  setupSortingHeaders();
  loadStudents();
});