import {useState} from 'react'
import { api } from '../api.js'
import { ExternalLink, Copy, Check } from 'lucide-react'


function CopyButton({ text }) {
    const [copied, setCopied] = useState(false)

    function handleCopy() {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
        onClick={handleCopy}
        className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400
                    hover:text-slate-200 transition-all"
        title="Copy to clipboard"
        >
        {copied
            ? <Check size={14} className="text-emerald-400" />
            : <Copy size={14} />
        }
        </button>
    )
}

export default function ShortenForm({ onSuccess }) {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    async function handleShorten() {
        if (!url.trim()) return

        setError('')
        setResult(null)
        setLoading(true)

        try {
            const data = await api.shorten(url)
            setResult(data)
            setUrl('')
            onSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
            }
    }
    

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
            <label className="block text-sm font-medium text-slate-400 mb-3">
                Paste a long URL
            </label>

            <div className="flex gap-3">
                <input
                type="url"
                value={url}
                disabled = {loading}
                onChange={e => setUrl(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleShorten()}
                placeholder="https://example.com/very/long/url"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl
                            px-4 py-3 text-sm text-slate-100 placeholder-slate-600
                            focus:outline-none focus:ring-2 focus:ring-violet-500
                            focus:border-transparent transition-all"
                />
                <button
                onClick={handleShorten}
                disabled={loading || !url.trim()}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500
                            disabled:bg-slate-700 disabled:text-slate-500
                            text-white font-semibold rounded-xl transition-all
                            text-sm whitespace-nowrap"
                >
                { loading ? (
                        <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30
                                        border-t-white rounded-full animate-spin" />
                        Shortening...
                        </span>
                    ) : 'Shorten URL'}
                </button>
            </div>
            {/* Error state */}
            {error && (
                <div className="mt-3 px-4 py-3 bg-red-950/50 border border-red-800
                                rounded-xl text-red-300 text-sm">
                {error}
                </div>
            )}
            {/* Success state */}
            {result && (
                <div className="mt-4 px-4 py-4 bg-emerald-950/40 border
                                border-emerald-800 rounded-xl">
                    <p className="text-xs text-emerald-400 font-mono mb-2">
                        Short URL created
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="flex-1 font-mono text-emerald-300
                                        font-semibold text-sm break-all">
                        {result.shortUrl}
                        </span>
                        <CopyButton text={result.shortUrl} />
                        <a
                        href={result.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-md hover:bg-emerald-900
                                    text-emerald-400 transition-all"
                        >
                        <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}