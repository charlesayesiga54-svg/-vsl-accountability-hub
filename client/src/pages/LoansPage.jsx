import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function LoansPage() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const groupId = localStorage.getItem('groupId') || 1

  useEffect(() => {
    fetchLoans()
  }, [groupId])

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans', { params: { groupId } })
      setLoans(response.data)
    } catch (error) {
      console.error('Failed to fetch loans', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      repaid: 'bg-gray-100 text-gray-800',
      defaulted: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Loans Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading loans...</div>
        ) : loans.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No loans found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Member</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Purpose</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Outstanding</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {loan.first_name} {loan.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    UGX {parseFloat(loan.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{loan.purpose}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                    UGX {parseFloat(loan.outstanding_balance).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
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
