import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AskAI from './pages/AskAI';
import SqlEditor from './pages/SqlEditor';
import History from './pages/History';
import SavedQueries from './pages/SavedQueries';
import Schema from './pages/Schema';
import Settings from './pages/Settings';

import { ThemeProvider } from './context/ThemeContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 overflow-hidden transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <PrivateRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/ask-ai" element={
        <PrivateRoute>
          <AppLayout>
            <AskAI />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/sql-editor" element={
        <PrivateRoute>
          <AppLayout>
            <SqlEditor />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/history" element={
        <PrivateRoute>
          <AppLayout>
            <History />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/saved-queries" element={
        <PrivateRoute>
          <AppLayout>
            <SavedQueries />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/schema" element={
        <PrivateRoute>
          <AppLayout>
            <Schema />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
