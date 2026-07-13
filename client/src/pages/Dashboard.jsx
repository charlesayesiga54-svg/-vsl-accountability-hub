import { useEffect, useState } from 'react'
import api from '../utils/api'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, DollarSign, Loan } from 'lucide-react'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const groupId = localStorage.getItem('groupId') || 1

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats', { params: { groupId } })
        setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [groupId])

  if (loading) return <div className="p-8">Loading...</div>
  if (!stats) return <div className="p-8">No data available</div>

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-gray-600 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  )

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Members"
          value={stats.totalMembers}
          color="bg-green-500"
        />
        <StatCard
          icon={DollarSign}
          label="Total Savings"
          value={Math.round(stats.totalSavings)}
          color="bg-blue-500"
        />
        <StatCard
          icon={Loan}
          label="Active Loans"
          value={stats.activeLoans}
          color="bg-orange-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Cash Balance"
          value={Math.round(stats.cashBalance)}
          color="bg-indigo-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income/Expenses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Income', value: stats.monthlyIncome },
              { name: 'Expenses', value: stats.monthlyExpenses }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900 capitalize">{tx.transaction_type}</p>
                  <p className="text-xs text-gray-600">{tx.description}</p>
                </div>
                <p className="font-semibold text-gray-900">UGX {tx.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
