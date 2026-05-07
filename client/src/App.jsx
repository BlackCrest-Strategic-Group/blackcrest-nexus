import { Navigate, Route, Routes } from 'react-router-dom';
import EnterpriseLayout from './layouts/EnterpriseLayout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route element={<EnterpriseLayout />}>
        <Route path='/app' element={<DashboardPage />} />
      </Route>
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}
