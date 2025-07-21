// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './components/Layout/PublicLayout';
import PublicDashboard from './pages/PublicDashboard';
import Login from './pages/Auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import RainfallAlertPage from './pages/Alerts/RainfallAlertPage';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // ✅ Your custom theme

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/alerts/rainfall" element={<RainfallAlertPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
