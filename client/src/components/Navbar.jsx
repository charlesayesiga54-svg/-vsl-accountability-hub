import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-green-600">VSLA</h1>
            <div className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Dashboard</a>
              <a href="/members" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Members</a>
              <a href="/savings" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Savings</a>
              <a href="/loans" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Loans</a>
              <a href="/reports" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Reports</a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.firstName}</p>
              <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
