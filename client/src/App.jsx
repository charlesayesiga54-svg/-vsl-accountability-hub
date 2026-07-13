import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import MembersPage from './pages/MembersPage'
import SavingsPage from './pages/SavingsPage'
import LoansPage from './pages/LoansPage'
import ReportsPage from './pages/ReportsPage'
import Navbar from './components/Navbar'

function App() {
  const { user } = useAuthStore()

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        <Routes>
          {!user ? (
            <Route path="/" element={<LoginPage />} />
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/savings" element={<SavingsPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
