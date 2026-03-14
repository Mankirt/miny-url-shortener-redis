import {useState} from 'react'
export default function ShortenForm({ onSuccess }) {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')   

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
            <label className="block text-sm font-medium text-slate-400 mb-3">
                Paste a long URL
            </label>

            <div className="flex gap-3">
                <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)} 
                placeholder="https://example.com/very/long/url"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl
                            px-4 py-3 text-sm text-slate-100 placeholder-slate-600
                            focus:outline-none focus:ring-2 focus:ring-violet-500
                            focus:border-transparent transition-all"
                />
                <button
                disabled={loading || !url.trim()}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500
                            disabled:bg-slate-700 disabled:text-slate-500
                            text-white font-semibold rounded-xl transition-all
                            text-sm whitespace-nowrap"
                >
                Shorten URL
                </button>
            </div>
        </div>
    )
}