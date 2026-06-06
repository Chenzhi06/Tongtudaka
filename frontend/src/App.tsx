import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';
import LoginPage from './components/LoginPage';
import AdminLayout from './components/AdminLayout';
import UserLayout from './components/UserLayout';
import AdminOverview from './pages/AdminOverview';
import AdminUserManager from './pages/AdminUserManager';
import UserOverview from './pages/UserOverview';
import UserFriends from './pages/UserFriends';
import UserClock from './pages/UserClock';
import UserDiary from './pages/UserDiary';
import UserProfile from './pages/UserProfile';

const PrivateRoute: React.FC<{ children: React.ReactNode; isAdmin: boolean }> = ({ children, isAdmin }) => {
  const { isLoggedIn, user } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  if (isAdmin && !user?.is_admin) {
    return <Navigate to="/user/overview" />;
  }
  
  if (!isAdmin && user?.is_admin) {
    return <Navigate to="/admin/overview" />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/admin/*" element={
            <PrivateRoute isAdmin={true}>
              <AdminLayout>
                <Routes>
                  <Route path="overview" element={<AdminOverview />} />
                  <Route path="user-manager" element={<AdminUserManager />} />
                  <Route path="*" element={<Navigate to="overview" />} />
                </Routes>
              </AdminLayout>
            </PrivateRoute>
          } />
          
          <Route path="/user/*" element={
            <PrivateRoute isAdmin={false}>
              <UserLayout>
                <Routes>
                  <Route path="overview" element={<UserOverview />} />
                  <Route path="friends" element={<UserFriends />} />
                  <Route path="clock" element={<UserClock />} />
                  <Route path="diary" element={<UserDiary />} />
                  <Route path="profile" element={<UserProfile />} />
                  <Route path="*" element={<Navigate to="overview" />} />
                </Routes>
              </UserLayout>
            </PrivateRoute>
          } />
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;