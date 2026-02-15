# SkillSpring Project Setup

## 🌐 Live Application URLs

### Main Public App (Start Here)
**🏠 Shell App:** https://skill-spring-nv2s.vercel.app
- This is the main public-facing application
- Browse courses, view details, and sign up
- All users start here

### Role-Based Portals

**👨‍💼 Admin Portal:** https://skill-spring-eight.vercel.app/login
- Manage users, courses, and platform settings
- Approve/reject instructor courses
- View analytics and reports

**👨‍🏫 Instructor Portal:** https://skill-spring-9fgn.vercel.app/login
- Create and manage courses
- Track student enrollments
- View earnings and analytics

**👨‍🎓 Student Portal:** https://skill-spring-ow1g.vercel.app/login
- Browse and enroll in courses
- Track learning progress
- Access enrolled courses

---

## 🔐 Login System Overview

### How It Works
1. **Main App (Shell):** Users visit https://skill-spring-nv2s.vercel.app to browse courses
2. **Independent Login:** Each portal (Admin, Instructor, Student) has its own login page
3. **Role-Based Access:** Users must login on their respective portal based on their role
4. **No Cross-Domain Sessions:** Due to different Vercel deployments, each app maintains independent sessions

### Test Credentials

#### 🔑 Admin Login
- **URL:** https://skill-spring-eight.vercel.app/login
- **Email:** `pandeynihal96083@gmail.com`
- **Password:** `nihal1234@@`
- **Access:** Full platform management, user management, course approval

#### 🔑 Instructor Login
- **URL:** https://skill-spring-9fgn.vercel.app/login
- **Email:** `adarshyadav95115@gmail.com`
- **Password:** `adrs1234@@`
- **Access:** Course creation, student management, earnings tracking

#### 🔑 Student Login
- **URL:** https://skill-spring-ow1g.vercel.app/login
- **Email:** Create your own account or use existing student credentials
- **Access:** Course enrollment, learning dashboard, progress tracking

---

## 🚀 How to Run the Project

### 1️⃣ Install Dependencies (First Time Only)

Run this command in the root directory:

```bash
npm install
npm run install:all
```

### 2️⃣ Start All Applications

To start the Shell, Admin, Instructor, and Student apps at once:

```bash
npm run dev
```

### 🌍 Access Points

| Application          | URL                                                | Route Path    |
| -------------------- | -------------------------------------------------- | ------------- |
| **Shell App** (Main) | [https://skill-spring-nv2s.vercel.app](https://skill-spring-nv2s.vercel.app)     | `/`           |
| **Admin App**        | [https://skill-spring-eight.vercel.app/admin](https://skill-spring-eight.vercel.app/admin) | `/admin`      |
| **Instructor App**   | [https://skill-spring-9fgn.vercel.app/instructor](https://skill-spring-9fgn.vercel.app/instructor) | `/instructor` |
| **Student App**      | [https://skill-spring-ow1g.vercel.app/student](https://skill-spring-ow1g.vercel.app/student) | `/student`    |

---

## 👥 User Access & Roles

### 👑 Admin
- **Email**: `pandeynihal96083@gmail.com`
- **Access Route**: `/admin`
- **Responsibilities**:
  - Approve or Reject courses submitted by instructors.
  - Manage course categories.
  - Register and manage Instructors.

### 👨‍🏫 Instructor
- **Access Route**: `/instructor`
- **Registration**: Instructors are registered by the Admin.
- **Responsibilities**:
  - Create and manage courses.
  - Build course curriculum (Sections & Lessons).
  - Track earnings and student enrollments.

### 🎓 Student
- **Access Route**: `/student`
- **Responsibilities**:
  - Browse and search for courses.
  - Enroll in courses and track progress.
  - Manage personal profile and learning history.

---

## 🏗 Microfrontend Features & Functionality

### 🌐 Shell App (Port 3000)
- **Marketplace Landing Page**: Showcases trending courses and categories.
- **Global Search**: Search for courses across the entire platform.
- **Auth Guard**: Recommends login/signup for unauthenticated users attempting to access course details.

### 🔑 Admin App (Production)
- **Course Approvals**: A dedicated dashboard for admins to review pending courses.
- **Category Management**: Add, edit, or remove course categories (e.g., Development, Design, AI).
- **User Management**: Overview of learners and instructors.

### ✍️ Instructor App (Production)
- **Stepwise Course Builder**:
  1. **Basic Info**: Title, Description, Category, Level, Price, and Thumbnail.
  2. **Curriculum**: Add Sections and Lessons with video URLs and durations.
  3. **Review & Submit**: Final preview before sending for admin approval.
- **Instructor Dashboard**: View performance metrics and course stats.

### 📖 Student App (Port 3003)
- **Course Exploration**: Filter courses by category, level, and price.
- **Classroom Experience**: Video player, progress tracking, and section navigation.
- **Profile Management**: Update user info and view enrolled courses.

---

## 🔄 Course Lifecycle

1.  **Creation**: An **Instructor** uses the Stepwise Course Builder to create a new course.
2.  **Submission**: Once the curriculum is ready, the instructor submits the course for review (status becomes `pending`).
3.  **Review**: An **Admin** (logged in as `pandeynihal96083@gmail.com`) sees the pending course in the **Course Approvals** list.
4.  **Approval/Rejection**:
    - If **Approved**: The course status becomes `approved` and it's instantly visible in the **Shell** and **Student** marketplaces.
    - If **Approved**: The course status becomes `approved` and it is instantly visible in the **Shell** and **Student** marketplaces.
    - If **Rejected**: The instructor can see the status and edit the course to resubmit.
5.  **Enrollment**: **Students** can find the approved course, enroll, and start learning immediately.

---

### 🛠 Manual Start (Optional)

If you want to run a specific app individually:

```bash
cd shell-app && npm run dev
# Frontends run on their own ports defined in package.json
```
