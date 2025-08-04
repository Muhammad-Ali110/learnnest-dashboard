# LearnNest - AI-Powered Educational Platform Dashboard

A professional full-stack educational platform dashboard for managing online courses, students, earnings, and instructor profiles. LearnNest is designed to be **responsive**, **dark mode ready**, and **API-driven** with seamless frontend-backend integration.

## 🌟 Features

- Clean and modern admin panel UI
- Fully responsive & mobile-optimized design
- Real-time data management using PHP + MySQL backend APIs
- Manage Courses (Create, Edit, Delete)
- Manage Students (Enrollments, Filters, Search)
- Instructor Profile & Bio Management
- Course Earnings Report with Filters
- Upload profile pictures & course images
- Dark Mode UI for better user experience
- AJAX-powered interactions for smooth experience
- Secure database queries using PDO

## 💻 Technologies Used

| Technology | Purpose |
|------------|---------|
| PHP        | Backend APIs |
| MySQL      | Database |
| HTML5 + CSS3 | Markup & Styling |
| Bootstrap 5 | Frontend UI framework |
| JavaScript (Vanilla) | Interactions & AJAX |
| jQuery     | Optional Utilities |
| Font Awesome | Icons |
| Chart.js   | Charts & Analytics |
| XAMPP / WAMP | Local Development Server |

## 🎨 Project Screenshots

> 📸 _Add your own screenshots here or use the project preview collage you created._

## 📂 Folder Structure

```
learnnest-dashboard/
├── learnnest/            → Frontend (HTML, CSS, JS, assets)
├── learnnest-backend/    → Backend (PHP APIs + DB connection)
├── README.md
```

## 🛠️ Installation & Setup

### Requirements
- PHP >= 7.4
- MySQL >= 5.7
- XAMPP, WAMP, MAMP or any local server

### Steps

1. Clone this repo:
```
git clone https://github.com/yourusername/learnnest-dashboard.git
```

2. Place the project in your server root:
```
htdocs/learnnest-dashboard/
```

3. Import the `learnnest.sql` file into your MySQL database.

4. Update `learnnest-backend/includes/db.php` with your database credentials:
```php
$host = 'localhost';
$dbname = 'learnnest';
$username = 'root';
$password = '';
```

5. Open browser:
```
http://localhost/learnnest-dashboard/learnnest/
```

6. You’re ready to go 🚀

## ⚠️ API URL Configuration

Make sure your API base URL in JavaScript is correct:
```javascript
const API_BASE_URL = window.location.hostname.includes("localhost")
    ? "http://localhost/learnnest-dashboard/learnnest-backend/api/"
    : "/learnnest-backend/api/";
```

## 💡 Recommended Folder Setup

For production / hosting:
```
/public_html/learnnest/         → Frontend
/public_html/learnnest-backend/ → Backend
```

or

```
/root-folder/learnnest-dashboard/
├── learnnest/
├── learnnest-backend/
```

## 🙏 Credits

Developed by **Muhammad Ali Mughal**  
LearnNest is an educational pro
