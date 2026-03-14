const BASE = 'http://localhost:3001/api'

async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: {'Content-Type' : 'application/json'},
        ...options,
    })
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.error || 'API request failed')
    }
    return data

}

export const api = {
    shorten: (url) => request('/shorten', {
        method: 'POST',
        body: JSON.stringify({url})
    }),

    getUrls: () => request('/urls'),

    getStats: (code) => request(`/stats/${code}`),

    deleteUrl: (code) => request(`/urls/${code}` , {method: 'DELETE'})
}