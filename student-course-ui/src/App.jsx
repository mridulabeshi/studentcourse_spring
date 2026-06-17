import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import Navbar      from "./components/Navbar";
import Dashboard   from "./pages/Dashboard";
import Students    from "./pages/Students";
import Courses     from "./pages/Courses";
import Enrollments from "./pages/Enrollments";
import Grades      from "./pages/Grades";
import Attendance  from "./pages/Attendance";
import Reports     from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-shell">
          <Navbar />
          <main className="page-content">
            <Routes>
              <Route path="/"            element={<Dashboard />}   />
              <Route path="/students"    element={<Students />}    />
              <Route path="/courses"     element={<Courses />}     />
              <Route path="/enrollments" element={<Enrollments />} />
              <Route path="/grades"      element={<Grades />}      />
              <Route path="/attendance"  element={<Attendance />}  />
              <Route path="/reports"     element={<Reports />}     />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;