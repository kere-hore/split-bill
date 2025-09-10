'use client'

import { useEffect, useState } from 'react'

export default function ApiDocsPage() {
  const [swaggerSpec, setSwaggerSpec] = useState(null)

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(setSwaggerSpec)
  }, [])

  if (!swaggerSpec) {
    return <div className="p-8">Loading API documentation...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Split Bill API Documentation</h1>
          <p className="text-gray-600 mb-8">Complete API reference for Split Bill application</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">OCR Extract API</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-mono">POST</span>
                  <code className="text-lg">/api/ocr/extract</code>
                </div>
                <p className="text-gray-700 mb-4">Extract bill/receipt data from image using Gemini AI</p>
                
                <h3 className="font-semibold mb-2">Request</h3>
                <div className="bg-gray-800 text-green-400 p-4 rounded mb-4">
                  <pre>{`Content-Type: multipart/form-data

FormData:
  image: File (JPEG, PNG, WebP)`}</pre>
                </div>

                <h3 className="font-semibold mb-2">Response Example</h3>
                <div className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
                  <pre>{JSON.stringify({
                    success: true,
                    data: {
                      merchant_name: "Starbucks Coffee",
                      receipt_number: "INV-2024-001234",
                      date: "2024-01-15",
                      time: "14:30",
                      items: [{
                        name: "Cappuccino Grande",
                        quantity: 2,
                        unit_price: 45000,
                        total_price: 90000,
                        category: "drink"
                      }],
                      subtotal: 90000,
                      discounts: [{
                        name: "Member Discount",
                        amount: 9000,
                        type: "percentage"
                      }],
                      service_charge: 8100,
                      tax: 8910,
                      additional_fees: [{
                        name: "Delivery Fee",
                        amount: 5000
                      }],
                      total_amount: 103010,
                      payment_method: "Credit Card",
                      currency: "IDR"
                    }
                  }, null, 2)}</pre>
                </div>

                <h3 className="font-semibold mb-2 mt-4">cURL Example</h3>
                <div className="bg-gray-800 text-green-400 p-4 rounded">
                  <pre>{`curl -X POST http://localhost:3000/api/ocr/extract \\
  -F "image=@bill.jpg"`}</pre>
                </div>

                <h3 className="font-semibold mb-2 mt-4">JavaScript Example</h3>
                <div className="bg-gray-800 text-green-400 p-4 rounded">
                  <pre>{`const formData = new FormData()
formData.append('image', fileInput.files[0])

const response = await fetch('/api/ocr/extract', {
  method: 'POST',
  body: formData
})

const result = await response.json()`}</pre>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">Data Format Notes</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h3 className="font-semibold mb-2">Price Format</h3>
                <p className="mb-2">All monetary values are returned as raw numbers without formatting:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><code>&quot;Rp 25,000&quot;</code> → <code>25000</code></li>
                  <li><code>&quot;$12.50&quot;</code> → <code>1250</code></li>
                  <li><code>&quot;15.000,00&quot;</code> → <code>15000</code></li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}