import React, { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import { twMerge } from 'tailwind-merge'
import { API_URL } from '../config'

const GameSetup = () => {
  const { user, isGuest } = useAuthStore()
  const [players, setPlayers] = useState<string[]>(['', ''])
  const [score, setScore] = useState(501)
  const [availablePlayers, setAvailablePlayers] = useState<{id: string, name: string}[]>([])
  const startGame = useGameStore(state => state.startGame)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<boolean[]>( [false, false] )

  // Auto-fill user
  useEffect(() => {
    if (user) {
        setPlayers(prev => {
            const newP = [...prev]
            newP[0] = user.username
            return newP
        })
    }
  }, [user])

  // Fetch player list for autocomplete
  useEffect(() => {
    fetch(`${API_URL}/api/players`)
      .then(res => res.json())
      .then(data => setAvailablePlayers(data))
      .catch(err => console.error("Failed to fetch players", err))
  }, [])

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
    <div className="relative w-full max-w-xl mx-auto anime-fade-in group/container">
        {/* Glow Effects */}
        <div aria-hidden="true" className="absolute -top-20 -left-20 w-72 h-72 bg-green-500/20 rounded-full blur-[80px] group-hover/container:bg-green-500/30 transition-all duration-1000 pointer-events-none" />
        <div aria-hidden="true" className="absolute -bottom-20 -right-20 w-72 h-72 bg-red-500/20 rounded-full blur-[80px] group-hover/container:bg-red-500/30 transition-all duration-1000 pointer-events-none" />

        <div className="relative bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] transition-colors">
            
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-block relative">
                     <h2 className="relative z-10 text-5xl md:text-7xl font-black italic tracking-tighter text-slate-900 dark:text-white drop-shadow-lg transform -skew-x-6 transition-colors">
                        DART <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">X01</span>
                     </h2>
                     {/* Decorative underline */}
                     <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-transparent to-green-500 mt-2 rounded-full opacity-80" />
                </div>
                <div className="flex justify-center items-end mt-3 px-2">
                    <p className="text-slate-500 font-bold tracking-[0.3em] text-[10px] uppercase">
                        Professional Scoring System
                    </p>
                </div>
            </div>
            
            {/* Dynamic Player List */}
            <fieldset className="space-y-4 mb-8 overflow-y-auto pr-2 custom-scrollbar shrink min-h-[150px] border-none m-0 p-0">
                <legend className="sticky top-0 z-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md w-full pb-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Players
                </legend>
                
                {players.map((p, idx) => {
                    const error = touched[idx] ? getPlayerError(p, idx) : null;
                    const inputId = `player-input-${idx}`;
                    const errorId = `player-error-${idx}`;
                    
                    return (
                    <div key={idx} className="group relative flex flex-col gap-1 transition-all animate-in fade-in slide-in-from-left-4 duration-300">
                        <label htmlFor={inputId} className="text-[10px] font-bold text-slate-500 ml-12 uppercase tracking-wider mb-0.5 block">
                            Player {idx + 1} Name
                        </label> 
                        <div className="flex items-center gap-3">
                            {/* Number Badge */}
                            <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border shadow-lg transform rotate-3 transition-colors shrink-0
                                ${error ? 'bg-red-500/20 border-red-500 text-red-500' : (p.trim() ? 'bg-green-500 border-green-400 text-black' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-500')}
                            `}>
                                {idx + 1}
                            </div>

                            <div className="relative flex-1 group-focus-within:scale-[1.02] transition-transform duration-200">
                                <input 
                                    id={inputId}
                                    value={p} 
                                    onChange={e => updatePlayerName(idx, e.target.value)}
                                    // ... rest matches existing code structure ...
                                    onBlur={() => markTouched(idx)}
                                    list="players-list"
                                    aria-invalid={!!error}
                                    aria-describedby={error ? errorId : undefined}
                                    className={`
                                        w-full bg-slate-50 dark:bg-slate-900 border p-4 rounded-2xl text-lg font-bold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 placeholder:font-semibold pr-12
                                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5' : 'border-slate-300 dark:border-slate-700/70 group-hover:border-slate-400 dark:group-hover:border-slate-500 focus:border-green-500 focus:ring-green-500/50'}
                                    `}
                                    placeholder={`e.g. "The Power"`}
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
                                    className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/10 dark:text-slate-600 dark:hover:text-red-500 rounded-xl transition-all opacity-100 shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                    className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-500/5 transition-all group flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    title="Add another player to the match"
                    aria-label="Add Player Slot"
                >
                    <div className="bg-slate-200 dark:bg-slate-800 group-hover:bg-green-500 rounded-lg p-1 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 dark:text-white group-hover:text-white" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="group-hover:tracking-[0.2em] transition-all">Add Player Slot</span>
                </button>
            </fieldset>

            {/* Controls Footer */}
            <div className="shrink-0 pt-6 border-t border-slate-200 dark:border-slate-800/50 transition-colors">
                <fieldset className="mb-6">
                    <legend className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                         </svg>
                         Starting Score
                    </legend>
                    {/* Game Mode Toggles */}
                    <div className="grid grid-cols-4 gap-3">
                        {[301, 501, 701].map(target => (
                            <button 
                                key={target}
                                onClick={() => setScore(target)}
                                className={twMerge(
                                    "relative py-3 rounded-xl font-black text-lg border transition-all duration-200 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-green-500",
                                    score === target
                                        ? "bg-slate-100 dark:bg-slate-800 border-green-500 text-green-600 dark:text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                                        : "bg-transparent border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300" 
                                )}
                                aria-label={`Set starting score to ${target}`}
                                aria-pressed={score === target}
                            >
                                <span className="relative z-10">{target}</span>
                                {score === target && (
                                    <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
                                )}
                            </button>
                        ))}
                        
                        <div className="relative group">
                             <input 
                                type="number"
                                value={score}
                                onChange={(e) => setScore(Math.max(1, parseInt(e.target.value) || 0))}
                                className={`
                                    w-full h-full bg-slate-100 dark:bg-slate-900/50 border rounded-xl text-center font-bold outline-none transition-all text-sm
                                    ${![301, 501, 701].includes(score) 
                                        ? 'border-green-500 text-green-600 dark:text-green-400 ring-1 ring-green-500/20' 
                                        : 'border-slate-300 dark:border-slate-700 text-slate-500 focus:border-green-500 focus:text-slate-900 dark:focus:text-white'}
                                `}
                                placeholder="Custom"
                                aria-label="Custom starting score"
                            />
                        </div>
                    </div>
                </fieldset>

                                <div className="space-y-4">

                                        <p className="text-sm text-slate-500 flex items-center gap-2 justify-center">
                                            <span aria-hidden>👉</span>
                                            Tip: Tap Double/Triple then a number.
                                        </p>

                    <button 
                        onClick={handleStart}
                        disabled={loading || !isFormValid}
                        className="group relative w-full bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-5 rounded-xl text-xl shadow-lg hover:shadow-green-500/30 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden focus:ring-4 focus:ring-green-500"
                    >
                        <span className="relative flex items-center justify-center gap-3 tracking-wide">
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Starting...
                                </>
                            ) : (
                                <>
                                Start Match
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                                </>
                            )}
                        </span>
                    </button>
                    
                    {!isFormValid && players.length > 0 && (
                        <div className="mt-2 text-center text-red-500 text-xs font-bold animate-pulse" role="alert">
                            Please fix the errors above to start.
                        </div>
                    )}

                    <div className="flex justify-center mt-4" />
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default GameSetup
