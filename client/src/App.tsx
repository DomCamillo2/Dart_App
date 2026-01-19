import { useState, useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { useAuthStore } from './store/authStore'
import GameSetup from './components/GameSetup'
import Scoreboard from './components/Scoreboard'
import Keypad from './components/Keypad'
import WinnerModal from './components/WinnerModal'
import AuthScreen from './components/AuthScreen'
import { API_URL } from './config'

function App() {
  const { gameId, players, currentPlayerIndex, updateScore, nextTurn, setWinner, resetGame,
          dartsThrown, setDartsThrown, pushHistory, popHistory } = useGameStore()
  const { user, isGuest, login, setGuest, logout } = useAuthStore()
  const [lastThrows, setLastThrows] = useState<{ player: string; value: number; multiplier: number; isBust?: boolean; isWin?: boolean }[]>([])
  const [turnStartScore, setTurnStartScore] = useState<number | null>(null)
  
  // Simple backend sync logic (Polling)
  useEffect(() => {
    if (!gameId) return
    const interval = setInterval(async () => {
        try {
            const res = await fetch(`${API_URL}/api/games/${gameId}`)
            const data = await res.json()
            // In a real robust app, we would deep merge state here. 
            // For now, we trust local optimistic updates for speed and use this to verify.
        } catch(e) { console.error('Sync failed', e)}
    }, 5000)
    return () => clearInterval(interval)
  }, [gameId])

  // Reset local throw log when starting/ending a game
  useEffect(() => {
    setLastThrows([])
    setDartsThrown(0)
  }, [gameId])

  // Capture score at the start of each player's turn so busts can revert correctly
  useEffect(() => {
    if (!gameId) return
    const current = players[currentPlayerIndex]
    if (current) {
      setTurnStartScore(current.score)
    }
    // Intentionally not including players to avoid resetting mid-turn when scores update
  }, [gameId, currentPlayerIndex])

  const handleThrow = async (multiplier: number, value: number) => {
    if (!gameId) return
    
    // SAVE HISTORY FOR UNDO
    pushHistory()

    // 1. Calculate Score
    const points = multiplier * value
    const currentPlayer = players[currentPlayerIndex]
    const startingScore = turnStartScore ?? currentPlayer.score
    
    // Bust Logic (Simplified for UI)
    const newScore = currentPlayer.score - points
    
    const throwEntry = { player: currentPlayer.name, value, multiplier, isBust: false, isWin: false }

    if (newScore === 0) {
      updateScore(currentPlayer.id, 0)
      const winner = { ...currentPlayer, score: 0 }
      setWinner(winner)
      
      // Save for guest history
      if (isGuest) {
          const gameResult = {
              created_at: new Date().toISOString(),
              winner_name: winner.name,
              start_score: useGameStore.getState().startScore,
              id: gameId
          }
          localStorage.setItem('last_game_result', JSON.stringify(gameResult))
      }

      throwEntry.isWin = true
      fetch(`${API_URL}/api/games/${gameId}/throw`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ score_value: value, multiplier: multiplier })
      }).catch(e => console.error(e))
      setLastThrows(prev => [throwEntry, ...prev].slice(0, 6))
      return
    }

    if (newScore < 0 || newScore === 1) {
      throwEntry.isBust = true
      fetch(`${API_URL}/api/games/${gameId}/throw`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ score_value: value, multiplier: multiplier })
      }).catch(e => console.error(e))
      updateScore(currentPlayer.id, startingScore)
      setLastThrows(prev => [throwEntry, ...prev].slice(0, 6))
      
      // Reset Darts Thrown on Bust? Usually yes.
      // But standard rules say turn ends.
      // nextTurn() handles dartsThrown reset in store.
      nextTurn()
      return
    }

    updateScore(currentPlayer.id, newScore)

    // 2. Send to Backend
    fetch(`${API_URL}/api/games/${gameId}/throw`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ score_value: value, multiplier: multiplier })
    })

    setLastThrows(prev => [throwEntry, ...prev].slice(0, 6))

    // 3. Turn Management
    const nextDartCount = dartsThrown + 1
    if (nextDartCount >= 3) {
        nextTurn()
    } else {
        setDartsThrown(nextDartCount)
    }
  }

  const handleUndo = () => {
      popHistory()
      // Remove last throw entry visually
      setLastThrows(prev => prev.slice(1))
  }

  if (!gameId && !user && !isGuest) {
     return <AuthScreen onLogin={(token, username, id) => login({ token, username, id })} onGuest={setGuest} />
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col p-2 md:p-8 overflow-hidden touch-manipulation font-sans selection:bg-green-500/30">
      
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-600/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
        <div className="absolute top-[20%] right-[20%] w-[200px] h-[200px] bg-blue-600/5 rounded-full blur-[80px]" />
      </div>

      <WinnerModal />
      
      {!gameId ? (
         <div className="relative z-10 flex-1 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
             {user && (
                 <div className="absolute top-0 right-0 p-4 z-50 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md rounded-bl-3xl border-b border-l border-slate-800 shadow-2xl">
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Player</span>
                        <strong className="text-white text-sm">{user.username}</strong>
                     </div>
                     <button onClick={logout} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-all uppercase tracking-wider">
                        Logout
                     </button>
                 </div>
             )}
             {isGuest && (
                 <div className="absolute top-0 right-0 p-4 z-50">
                     <button onClick={() => useAuthStore.getState().logout()} className="text-slate-500 hover:text-white text-xs font-bold uppercase transition-colors tracking-widest flex items-center gap-2 group">
                        <span>Login to Save Stats</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                     </button>
                 </div>
             )}
             <GameSetup />
         </div>
      ) : (
        <div className="relative z-10 flex-1 flex flex-col items-center gap-4 w-full max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header / Status Bar */}
            <div className="w-full flex justify-between items-center px-4 py-3 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl">
                  <button
                   onClick={resetGame}
                   className="text-left text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 hover:from-green-100 hover:to-emerald-200 transition-colors"
                   aria-label="Back to start"
                  >
                    DART <span className="text-green-500">X01</span>
                  </button>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-xs font-mono font-bold text-slate-500">Match #{gameId.slice(0, 4)}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <button
                      onClick={resetGame}
                      className="text-[11px] font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Return
                    </button>
                    <button
                      onClick={resetGame}
                      className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 shadow-[0_10px_30px_-12px_rgba(16,185,129,0.8)]"
                    >
                      New Game
                    </button>
                 </div>
            </div>

           <Scoreboard />
           
           {/* Dart Indicator - 3D Spheres */}
           <div className="flex gap-4 my-2 p-2 bg-black/20 rounded-full backdrop-blur-sm border border-white/5">
              {[1,2,3].map(i => (
                  <div 
                    key={i} 
                    className={`
                        w-4 h-4 rounded-full transition-all duration-300 transform
                        ${i <= dartsThrown 
                            ? 'bg-gradient-to-tr from-green-600 to-green-300 shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-125 border border-white/20' 
                            : 'bg-slate-800 shadow-inner border border-slate-700/50 scale-100 opacity-50'}
                    `} 
                  />
              ))}
           </div>

            {/* Current Turn Indicator */}
           <div className="text-center animate-fade-in mb-2">
             <span className="text-slate-500 text-sm uppercase tracking-widest">Current Turn</span>
             <h2 className="text-2xl font-bold text-white transition-all">
                {players[currentPlayerIndex].name}
             </h2>
           </div>

           <div className="flex-1 w-full flex items-end pb-4">
                <Keypad onThrow={handleThrow} onUndo={handleUndo} />
           </div>

           {/* Recent Throws */}
           <div className="w-full max-w-lg bg-slate-900/40 border border-white/5 rounded-2xl p-4 mt-2 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent Throws</span>
                 <span className="text-[10px] text-slate-500">Last {lastThrows.length} dart(s)</span>
              </div>
              {lastThrows.length === 0 ? (
                <p className="text-xs text-slate-600">No throws yet.</p>
              ) : (
                <ul className="space-y-1 text-sm font-mono text-slate-200">
                  {lastThrows.map((t, idx) => {
                    const prefix = t.multiplier === 3 ? 'T' : t.multiplier === 2 ? 'D' : ''
                    const tag = t.isWin ? 'WIN' : t.isBust ? 'BUST' : ''
                    return (
                      <li key={idx} className="flex justify-between items-center bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1">
                        <span className="text-slate-300">{t.player}</span>
                        <span className="text-slate-100">{prefix || 'S'}{t.value}</span>
                        {tag && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.isWin ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
                            {tag}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
           </div>
           
        </div>
      )}
    </div>
  )
}

export default App
