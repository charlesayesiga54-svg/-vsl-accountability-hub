import { useEffect, useState } from 'react'
import api from '../utils/api'
import { FileText, Download } from 'lucide-react'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('financial')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const groupId = localStorage.getItem('groupId') || 1

  const generateReport = async (reportType) => {
    setLoading(true)
    try {
      let response
      switch (reportType) {
        case 'financial':
          response = await api.get('/reports/financial', { params: { groupId } })
          break
        case 'savings':
          response = await api.get('/reports/savings', { params: { groupId } })
          break
        case 'loans':
          response = await api.get('/reports/loans', { params: { groupId } })
          break
        case 'attendance':
          response = await api.get('/reports/attendance', { params: { groupId } })
          break
        default:
          return
      }
      setReportData(response.data)
    } catch (error) {
      console.error('Failed to generate report', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          {['financial', 'savings', 'loans', 'attendance'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                generateReport(tab)
              }}
              className={`px-6 py-3 font-medium capitalize ${
                activeTab === tab
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-12">Generating report...</div>
        ) : reportData ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{reportData.report || 'Report'}</h2>
            <p className="text-sm text-gray-600 mb-6">Generated: {new Date(reportData.generatedAt).toLocaleString()}</p>
            
            {/* Financial Report */}
            {activeTab === 'financial' && reportData.income && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">UGX {Math.round(reportData.income.total).toLocaleString()}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">UGX {Math.round(reportData.expenses.total).toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Net Income</p>
                    <p className="text-2xl font-bold text-blue-600">UGX {Math.round(reportData.netIncome).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Other Reports */}
            {reportData.data && (
              <div className="mt-6">
                <p className="text-gray-600 text-sm mb-4">Records: {reportData.totalRecords || reportData.data.length}</p>
                <div className="max-h-96 overflow-y-auto">
                  <pre className="text-xs bg-gray-50 p-4 rounded">
                    {JSON.stringify(reportData.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Select a report type to generate</p>
          </div>
        )}
      </div>
    </div>
  )
}
