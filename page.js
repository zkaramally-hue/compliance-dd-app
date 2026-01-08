'use client'
import { useState } from 'react'

export default function Home() {
  const [stage, setStage] = useState(1)
  const [industry, setIndustry] = useState('')
  const [concerns, setConcerns] = useState([])
  const [entityName, setEntityName] = useState('')
  const [entityCountry, setEntityCountry] = useState('')
  const [entityDetails, setEntityDetails] = useState('')
  const [verifyData, setVerifyData] = useState('')
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const industries = [
    'Banking & Financial Services',
    'Defense & Government Contracting',
    'Technology & Software',
    'Legal Services',
    'Healthcare & Pharmaceuticals',
    'Energy & Natural Resources',
    'Manufacturing & Industrial',
    'General Commercial/Other'
  ]

  const concernsList = [
    'AML/KYC Compliance',
    'Export Controls (ITAR/EAR)',
    'Sanctions Screening',
    'Merger & Acquisition Due Diligence',
    'Vendor/Supplier Assessment',
    'Investment Partner Screening',
    'Customer Onboarding',
    'Cybersecurity Risk Assessment'
  ]

  const toggleConcern = (concern) => {
    setConcerns(prev =>
      prev.includes(concern)
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    )
  }

  const handleVerify = async () => {
    if (!entityName.trim()) {
      setError('Please enter entity name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityName, entityCountry })
      })

      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setVerifyData(data.result)
        setStage(3)
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setStage(4)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityName,
          entityCountry,
          entityDetails,
          industry,
          concerns
        })
      })

      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setStage(3)
      } else {
        setReport(data.report)
        setStage(5)
      }
    } catch (err) {
      setError('Report generation failed. Please try again.')
      setStage(3)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DD_Report_${entityName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setStage(1)
    setIndustry('')
    setConcerns([])
    setEntityName('')
    setEntityCountry('')
    setEntityDetails('')
    setVerifyData('')
    setReport('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Compliance Due Diligence Platform</h1>
          <p className="text-blue-200">Industry-Tailored Background Intelligence</p>
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-8">
          {stage === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Step 1: Your Organization</h2>
              <p className="text-gray-600 mb-6">Select your industry to customize the report</p>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Your Industry *</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select your industry...</option>
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Your Specific Concerns (Optional)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {concernsList.map(concern => (
                    <label key={concern} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={concerns.includes(concern)}
                        onChange={() => toggleConcern(concern)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{concern}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => industry && setStage(2)}
                disabled={!industry}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300"
              >
                Continue to Entity Information
              </button>
            </div>
          )}

          {stage === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Step 2: Target Entity</h2>
              <p className="text-gray-600 mb-6">Enter the entity you want to investigate</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Entity/Person Name *</label>
                  <input
                    type="text"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder="e.g., Lonza Houston"
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Country/Jurisdiction</label>
                  <input
                    type="text"
                    value={entityCountry}
                    onChange={(e) => setEntityCountry(e.target.value)}
                    placeholder="e.g., United States"
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Known Aliases or Additional Details</label>
                  <textarea
                    value={entityDetails}
                    onChange={(e) => setEntityDetails(e.target.value)}
                    placeholder="Any other names, addresses, or relevant information"
                    rows="3"
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStage(1)}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {loading ? 'Searching...' : 'Search & Verify Entity'}
                </button>
              </div>
            </div>
          )}

          {stage === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Step 3: Verify Entity</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-2">Entity Found:</h3>
                <p className="whitespace-pre-wrap text-gray-700">{verifyData}</p>
              </div>
              <p className="text-sm text-gray-600 mb-6">Is this the correct entity?</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStage(2)}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                >
                  No - Refine Search
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300"
                >
                  Yes - Generate Full Report
                </button>
              </div>
            </div>
          )}

          {stage === 4 && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Generating Your Report...</h2>
              <p className="text-gray-600">This may take 1-2 minutes</p>
            </div>
          )}

          {stage === 5 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Due Diligence Report</h2>
                <button
                  onClick={reset}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  New Report
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm">
                <p><strong>Industry:</strong> {industry}</p>
                <p><strong>Entity:</strong> {entityName}</p>
                {concerns.length > 0 && (
                  <p><strong>Concerns:</strong> {concerns.join(', ')}</p>
                )}
              </div>

              <div className="bg-gray-50 border rounded-lg p-6 max-h-96 overflow-y-auto mb-4">
                <pre className="whitespace-pre-wrap font-sans text-sm">{report}</pre>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={downloadReport}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Download Report
                </button>
                <button
                  onClick={reset}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                >
                  New Report
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-8 text-blue-200 text-sm">
          <p>Powered by Advanced AI Intelligence | © 2026</p>
        </div>
      </div>
    </div>
  )
}
