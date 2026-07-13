import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function SavingsPage() {
  const [savings, setSavings] = useState([])
  const [loading, setLoading] = useState(true)
  const groupId = localStorage.getItem('groupId') || 1

  useEffect(() => {
    fetchSavings()
  }, [groupId])

  const fetchSavings = async () => {
    try {
      const response = await api.get('/savings', { params: { groupId } })
      setSavings(response.data)
    } catch (error) {
      console.error('Failed to fetch savings', error)
    } finally {
      setLoading(false)
    }
  }

  const totalSavings = savings.reduce((sum, s) => sum + parseFloat(s.amount), 0)

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Savings Records</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-gray-600 mb-2">Total Savings</p>
        <p className="text-4xl font-bold text-green-600">UGX {Math.round(totalSavings).toLocaleString()}</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading savings records...</div>
        ) : savings.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No savings records found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Member</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {savings.map((saving) => (
                <tr key={saving.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {saving.first_name} {saving.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm capitalize text-gray-600">{saving.savings_type}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    UGX {parseFloat(saving.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(saving.transaction_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
