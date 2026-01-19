import React, { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import { twMerge } from 'tailwind-merge'
import { API_URL } from '../config'
import HelpModal from './HelpModal'

const GameSetup = () => {
  const { user, isGuest } = useAuthStore()
  const [players, setPlayers] = useState<string[]>(['', ''])
  const [score, setScore] = useState(501)
  const [availablePlayers, setAvailablePlayers] = useState<{id: string, name: string}[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [filterPlayerId, setFilterPlayerId] = useState<string>("")
  const startGame = useGameStore(state => state.startGame)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<boolean[]>( [false, false] )
  const [showHelp, setShowHelp] = useState(false)

  // Auto-fill user
  useEffect(() => {
    if (user) {
        setPlayers(prev => {
            const newP = [...prev]
            newP[0] = user.username
            return newP
        })
        setFilterPlayerId(user.id)
    }
  }, [user])

  // Fetch player list for autocomplete
  useEffect(() => {
    fetch(`${API_URL}/api/players`)
      .then(res => res.json())
      .then(data => setAvailablePlayers(data))
      .catch(err => console.error("Failed to fetch players", err))
  }, [])

  // Fetch history when showHistory or filter changes
  useEffect(() => {
    if (showHistory) {
        if (isGuest) {
            const output = localStorage.getItem('last_game_result')
            if (output) {
                setHistory([JSON.parse(output)])
            } else {
                setHistory([])
            }
            return
        }

        const url = filterPlayerId 
            ? `${API_URL}/api/players/${filterPlayerId}/games`
            : `${API_URL}/api/games`
            
        fetch(url)
            .then(res => res.json())
            .then(data => setHistory(data))
            .catch(err => console.error("Failed to fetch history", err))
    }
  }, [showHistory, filterPlayerId, isGuest])

  // Validation Logic
  const getPlayerError = (name: string, index: number) => {
      // Empty check is fine, maybe could be more specific but "Name cannot be empty" is okay.
      if (!name.trim()) return "Name cannot be empty"
      
      // Check duplicate
      const otherNames = players.filter((_, i) => i !== index).map(n => n.trim().toLowerCase())
      if (otherNames.includes(name.trim().toLowerCase())) {
          return "Player names must be unique"
      }
      return null
  }

  const isFormValid = players.every((p, i) => !getPlayerError(p, i)) && players.length > 0

  const handleStart = async () => {
    if (!isFormValid) return

    setLoading(true)
    try {
        const res = await fetch(`${API_URL}/api/games`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                player_names: players.map(p => p.trim()),
                start_score: score
            })
        })
        const data = await res.json()
        
        // Initialize State
        const playersForStore = data.player_ids.map((id: string, idx: number) => ({
            id,
            name: players[idx].trim(),
            score: score
        }))
        
        startGame(data.game_id, playersForStore, score)
        
    } catch (e: any) {
        console.error(e)
        alert(`Connection Error: ${e.message}\nTarget: ${API_URL}/api/games`)
    } finally {
        setLoading(false)
    }
  }

  const updatePlayerName = (index: number, val: string) => {
    const newPlayers = [...players]
    newPlayers[index] = val
    setPlayers(newPlayers)
  }

  const markTouched = (index: number) => {
      const newTouched = [...touched]
      newTouched[index] = true
      setTouched(newTouched)
  }

  const addPlayerSlot = () => {
    setPlayers([...players, ''])
    setTouched([...touched, false])
  }

  const removePlayerSlot = (index: number) => {
    if (players.length <= 1) return
    const newPlayers = players.filter((_, i) => i !== index)
    const newTouched = touched.filter((_, i) => i !== index)
    setPlayers(newPlayers)
    setTouched(newTouched)
  }

  return (
    <>
    {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    <div className="relative w-full max-w-xl mx-auto anime-fade-in group/container">
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-green-500/20 rounded-full blur-[80px] group-hover/container:bg-green-500/30 transition-all duration-1000" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-red-500/20 rounded-full blur-[80px] group-hover/container:bg-red-500/30 transition-all duration-1000" />

        <div className="relative bg-slate-950/80 backdrop-blur-xl border border-slate-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-block relative">
                     <h2 className="relative z-10 text-5xl md:text-7xl font-black italic tracking-tighter text-white drop-shadow-lg transform -skew-x-6">
                        DART <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">X01</span>
                     </h2>
                     {/* Decorative underline */}
                     <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-transparent to-green-500 mt-2 rounded-full opacity-80" />
                </div>
                <div className="flex justify-between items-end mt-3 px-2">
                    <p className="text-slate-500 font-bold tracking-[0.3em] text-[10px] uppercase">
                        Professional Scoring System
                    </p>
                    <button 
                         onClick={() => setShowHelp(true)}
                         className="text-xs font-bold text-green-500 hover:text-green-400 flex items-center gap-1 transition-colors uppercase tracking-wider"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                         How to Play
                    </button>
                </div>
            </div>
            
            {/* Dynamic Player List */}
            <div className="space-y-4 mb-8 overflow-y-auto pr-2 custom-scrollbar shrink min-h-[150px]">
                {players.map((p, idx) => {
                    const error = touched[idx] ? getPlayerError(p, idx) : null;
                    const inputId = `player-input-${idx}`;
                    const errorId = `player-error-${idx}`;
                    
                    return (
                    <div key={idx} className="group relative flex flex-col gap-1 transition-all animate-in fade-in slide-in-from-left-4 duration-300">
                        <label htmlFor={inputId} className="sr-only">Player {idx + 1} Name</label> 
                        <div className="flex items-center gap-3">
                            {/* Number Badge */}
                            <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border shadow-lg transform rotate-3 transition-colors shrink-0
                                ${error ? 'bg-red-500/20 border-red-500 text-red-500' : (p.trim() ? 'bg-green-500 border-green-400 text-black' : 'bg-slate-800 border-slate-700 text-slate-500')}
                            `}>
                                {idx + 1}
                            </div>

                            <div className="relative flex-1 group-focus-within:scale-[1.02] transition-transform duration-200">
                                <input 
                                    id={inputId}
                                    value={p} 
                                    onChange={e => updatePlayerName(idx, e.target.value)}
                                    onBlur={() => markTouched(idx)}
                                    list="players-list"
                                    aria-invalid={!!error}
                                    aria-describedby={error ? errorId : undefined}
                                    className={`
                                        w-full bg-slate-900 border p-4 rounded-2xl text-lg font-bold text-white outline-none transition-all placeholder:text-slate-400 placeholder:font-semibold pr-12
                                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5' : 'border-slate-700/70 group-hover:border-slate-500 focus:border-green-500 focus:ring-green-500/50'}
                                    `}
                                    placeholder={`Player Name`}
                                />
                                {/* Error Icon inside input */}
                                {error && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none animate-in fade-in zoom-in duration-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}

                                {/* Autocomplete Datalist */}
                                <datalist id="players-list">
                                    {availablePlayers.map(ap => (
                                        <option key={ap.id} value={ap.name} />
                                    ))}
                                </datalist>
                            </div>
                            
                            {players.length > 1 && (
                                <button 
                                    onClick={() => removePlayerSlot(idx)}
                                    className="w-12 h-12 flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                    aria-label={`Remove Player ${idx + 1}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {error && (
                            <div id={errorId} className="text-red-400 text-xs font-bold pl-12 flex items-center gap-1 animate-in slide-in-from-top-1">
                                <span className="sr-only">Error:</span>
                                {error === "Name must be unique" ? error + ". Please change the highlighted fields." : error}
                            </div>
                        )}
                    </div>
                )})}
                
                <button 
                    onClick={addPlayerSlot}
                    className="w-full py-4 border-2 border-dashed border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/5 transition-all group"
                >
                    <span className="group-hover:tracking-[0.2em] transition-all">+ Add Player Slot</span>
                </button>
            </div>

            {/* Controls Footer */}
            <div className="shrink-0 pt-6 border-t border-slate-800/50">
                <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className="col-span-2 flex items-center">
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Score</span>
                    </div>
                    {/* Game Mode Toggles */}
                    <div className="col-span-3 grid grid-cols-2 gap-3">
                        {[301, 501].map(target => (
                            <button 
                                key={target}
                                onClick={() => setScore(target)}
                                className={twMerge(
                                    "relative py-3 rounded-xl font-black text-lg border transition-all duration-200 overflow-hidden group",
                                    score === target
                                        ? "bg-slate-800 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                                        : "bg-transparent border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300" 
                                )}
                            >
                                <span className="relative z-10">{target}</span>
                                {score === target && (
                                    <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                                <div className="space-y-2">

                                        <p className="text-xs text-slate-500 flex items-center gap-2">
                                            <span aria-hidden>❔</span>
                                            Tip: Tap Double/Triple then a number. Unique names are required.
                                        </p>

                    <button 
                        onClick={handleStart}
                        disabled={loading || !isFormValid}
                        className="group relative w-full bg-gradient-to-br from-green-500 to-emerald-700 hover:from-green-400 hover:to-emerald-600 text-white font-black py-6 rounded-2xl text-2xl shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:from-green-500 disabled:hover:to-emerald-700 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                        <span className="relative flex items-center justify-center gap-3 tracking-wider group-hover:gap-6 transition-all">
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    STARTING...
                                </>
                            ) : (
                                <>
                                START MATCH
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                </>
                            )}
                        </span>
                    </button>

                    <div className="flex justify-center mt-4">
                        <button 
                            onClick={() => setShowHistory(!showHistory)}
                            className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest flex items-center gap-2 transition-colors"
                        >
                            {showHistory ? 'Hide Games' : 'View Past Games'}
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-4 w-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {showHistory && (
                        <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-4">
                             {/* Filter Dropdown */}
                             {!isGuest && (
                             <div className="flex justify-end">
                                <select 
                                    value={filterPlayerId}
                                    onChange={(e) => setFilterPlayerId(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg p-2 outline-none focus:border-green-500"
                                >
                                    <option value="">All Recent Games</option>
                                    <option disabled>──────────</option>
                                    {availablePlayers.map(p => (
                                        <option key={p.id} value={p.id}>History: {p.name}</option>
                                    ))}
                                </select>
                             </div>
                             )}

                             <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left text-sm text-slate-400">
                                    <thead className="text-xs uppercase bg-slate-900/80 text-slate-300 sticky top-0 backdrop-blur-sm">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Winner</th>
                                            <th className="p-3 text-right">Game Info</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {history.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="p-4 text-center text-slate-600 italic">
                                                    No games found
                                                </td>
                                            </tr>
                                        ) : (
                                            history.map((game) => (
                                                <tr key={game.id} className="hover:bg-slate-800/50 transition-colors">
                                                    <td className="p-3 whitespace-nowrap">
                                                        {new Date(game.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3 font-medium text-green-400">
                                                        {game.winner_name || <span className="text-slate-600 italic">In Progress / Tie</span>}
                                                    </td>
                                                    <td className="p-3 text-right text-xs font-mono text-slate-500">
                                                        {game.start_score} pts
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
            </div>
        </div>
    </div>
    </>
  )
}

export default GameSetup
