import React, { useState, useEffect } from 'react'
import { API_URL } from '../config'
import { useAuthStore } from '../store/authStore'

const PastGames = () => {
    const { user, isGuest } = useAuthStore()
    const [history, setHistory] = useState<any[]>([])
    const [filterPlayerId, setFilterPlayerId] = useState<string>("")
    const [availablePlayers, setAvailablePlayers] = useState<{id: string, name: string}[]>([])
    const [loading, setLoading] = useState(false)
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

    // Fetch players for filter
    useEffect(() => {
        fetch(`${API_URL}/api/players`)
            .then(res => res.json())
            .then(data => setAvailablePlayers(data))
            .catch(err => console.error("Failed to fetch players", err))
    }, [])

    // Fetch history
    useEffect(() => {
        setLoading(true)
        if (isGuest) {
            const output = localStorage.getItem('last_game_result')
            if (output) {
                setHistory([JSON.parse(output)])
            } else {
                setHistory([])
            }
            setLoading(false)
            return
        }

        const url = filterPlayerId 
            ? `${API_URL}/api/players/${filterPlayerId}/games`
            : `${API_URL}/api/games`
            
        fetch(url)
            .then(res => res.json())
            .then(res => {
                // Ensure array
                const data = Array.isArray(res) ? res : []
                setHistory(data)
            })
            .catch(err => console.error("Failed to fetch history", err))
            .finally(() => setLoading(false))
    }, [filterPlayerId, isGuest])

    const sortedHistory = [...history].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    const handleExportCSV = () => {
        if (sortedHistory.length === 0) return

        const headers = ['Date', 'Time', 'Winner', 'Start Score', 'Status', 'ID']
        const rows = sortedHistory.map(game => [
            new Date(game.created_at).toLocaleDateString(),
            new Date(game.created_at).toLocaleTimeString(),
            `"${game.winner_name || 'N/A'}"`,
            game.start_score,
            game.winner_name ? 'Completed' : 'In Progress',
            game.id
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `dart_x01_history_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-0">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter transition-colors">Match History</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Review past performance and game results</p>
                </div>

                {!isGuest && (
                    <div className="flex gap-2">
                         <button
                            onClick={handleExportCSV}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 p-3 rounded-xl hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition-colors focus:ring-2 focus:ring-green-500 outline-none shadow-sm active:scale-95 flex items-center gap-2"
                            aria-label="Export to CSV"
                            title="Export history to CSV"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="hidden sm:inline text-xs font-bold uppercase">Export</span>
                        </button>

                        <select 
                            value={filterPlayerId}
                            onChange={(e) => setFilterPlayerId(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-xl p-3 outline-none focus:border-green-500 transition-colors"
                            aria-label="Filter by player"
                        >
                            <option value="">All Players</option>
                            {availablePlayers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <button 
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 p-3 rounded-xl hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition-colors focus:ring-2 focus:ring-green-500 outline-none"
                            aria-label={`Sort by date ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
                            title="Toggle sort order"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
            ) : (
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-base text-slate-600 dark:text-slate-400 transition-colors">
                            <thead className="bg-slate-100/50 dark:bg-slate-950/50 text-xs uppercase font-bold text-slate-500 tracking-wider transition-colors">
                                <tr>
                                    <th className="p-5 font-bold text-slate-400 dark:text-slate-500">Date</th>
                                    <th className="p-5 font-bold text-slate-400 dark:text-slate-500">Winner</th>
                                    <th className="p-5 font-bold text-slate-400 dark:text-slate-500">Mode</th>
                                    <th className="p-5 font-bold text-slate-400 dark:text-slate-500 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 transition-colors">
                                {sortedHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center text-slate-500 dark:text-slate-600 italic text-lg">
                                            No games found
                                        </td>
                                    </tr>
                                ) : (
                                    sortedHistory.map((game) => (
                                        <tr key={game.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="p-5 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">
                                                {new Date(game.created_at).toLocaleDateString()}
                                                <span className="text-slate-400 dark:text-slate-600 ml-2 text-xs">
                                                    {new Date(game.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </td>
                                            <td className="p-5 font-bold text-lg text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                                {game.winner_name || <span className="text-slate-400 dark:text-slate-600 font-normal italic text-base">-</span>}
                                            </td>
                                            <td className="p-5">
                                                <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-md text-sm font-mono transition-colors">
                                                    {game.start_score}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                {game.winner_name ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 transition-colors uppercase tracking-wider">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20 transition-colors uppercase tracking-wider">
                                                        In Progress
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PastGames