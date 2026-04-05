import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Users from './pages/Users';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Entry Points */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 2. Authenticated Routes (Wrapped in ProtectedRoute & AppShell) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            {/* Dashboard: Analyst+ Access (Analytics Visualization) */}
            <Route index element={
              <ProtectedRoute allowedRoles={['analyst', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Records Management: Viewer+ Access (Reading always allowed) */}
            <Route path="records" element={<Records />} />
            
            {/* User Management: Admin Only Access */}
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            } />
          </Route>
        </Route>

        {/* 3. Automatic Redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
