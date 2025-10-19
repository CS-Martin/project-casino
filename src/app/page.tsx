'use client';

import { useState } from 'react';

interface Casino {
  casino_name: string;
  website: string;
  license_status: 'active' | 'pending' | 'unknown';
  source_url: string;
}

export default function Home() {
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchCasinos = async () => {
    setLoading(true);
    setError('');
    setCasinos([]);

    try {
      const response = await fetch('/api/mcp/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setCasinos(data.map((result: any) => result.data).flat());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Casino Research Tool</h1>

        <div className="mb-8">
          <button
            onClick={searchCasinos}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Searching...' : 'Search Casinos'}
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="text-lg">Searching for casinos...</div>
          </div>
        )}

        {error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {casinos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Found {casinos.length} casino(s):</h2>
            <div className="grid gap-4">
              {casinos.map((casino, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">{casino.casino_name}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${casino.license_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : casino.license_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {casino.license_status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Website:</strong> <a href={casino.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{casino.website}</a></p>
                    <p><strong>Source:</strong> <a href={casino.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{casino.source_url}</a></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {casinos.length === 0 && !loading && !error && (
          <div className="text-gray-500 text-center py-8">
            Click the button above to search for casinos
          </div>
        )}
      </main>
    </div>
  );
}
