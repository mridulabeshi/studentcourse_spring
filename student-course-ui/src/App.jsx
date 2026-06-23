import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";

// Admin
import AdminDashboard     from "./pages/admin/Dashboard";
import AdminStudents      from "./pages/admin/Students";
import AdminCourses       from "./pages/admin/Courses";
import AdminEnrollments   from "./pages/admin/Enrollments";
import AdminPrerequisites from "./pages/admin/Prerequisites";
import AdminViewAll       from "./pages/admin/ViewAll";
import AdminReports       from "./pages/admin/Reports";

// Teacher
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherGrades     from "./pages/teacher/Grades";
import TeacherStudents   from "./pages/teacher/Students";
import TeacherReports    from "./pages/teacher/Reports";

// Student
import StudentProfile    from "./pages/student/Profile";
import StudentGrades     from "./pages/student/Grades";
import StudentAttendance from "./pages/student/Attendance";

function Layout({ children }) {
  const location = useLocation();
  const isLogin  = location.pathname === "/login";
  return (
    <div className="app-shell">
      {!isLogin && <Navbar />}
      <main style={isLogin ? {} : { flex: 1, marginLeft: "var(--sidebar-w)", padding: "32px 36px", maxWidth: 1200 }}>
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Root redirect */}
        <Route path="/" element={
          user?.role === "ADMIN"   ? <Navigate to="/admin/dashboard" replace /> :
          user?.role === "TEACHER" ? <Navigate to="/teacher/attendance" replace /> :
          user?.role === "STUDENT" ? <Navigate to="/student/profile" replace /> :
          <Navigate to="/login" replace />
        } />

        {/* Admin routes */}
        <Route path="/admin/dashboard"     element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students"      element={<ProtectedRoute role="ADMIN"><AdminStudents /></ProtectedRoute>} />
        <Route path="/admin/courses"       element={<ProtectedRoute role="ADMIN"><AdminCourses /></ProtectedRoute>} />
        <Route path="/admin/enrollments"   element={<ProtectedRoute role="ADMIN"><AdminEnrollments /></ProtectedRoute>} />
        <Route path="/admin/prerequisites" element={<ProtectedRoute role="ADMIN"><AdminPrerequisites /></ProtectedRoute>} />
        <Route path="/admin/view-all"      element={<ProtectedRoute role="ADMIN"><AdminViewAll /></ProtectedRoute>} />
        <Route path="/admin/reports"       element={<ProtectedRoute role="ADMIN"><AdminReports /></ProtectedRoute>} />

        {/* Teacher routes */}
        <Route path="/teacher/attendance" element={<ProtectedRoute role="TEACHER"><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/teacher/grades"     element={<ProtectedRoute role="TEACHER"><TeacherGrades /></ProtectedRoute>} />
        <Route path="/teacher/students"   element={<ProtectedRoute role="TEACHER"><TeacherStudents /></ProtectedRoute>} />
        <Route path="/teacher/reports"    element={<ProtectedRoute role="TEACHER"><TeacherReports /></ProtectedRoute>} />

        {/* Student routes */}
        <Route path="/student/profile"    element={<ProtectedRoute role="STUDENT"><StudentProfile /></ProtectedRoute>} />
        <Route path="/student/grades"     element={<ProtectedRoute role="STUDENT"><StudentGrades /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute role="STUDENT"><StudentAttendance /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;