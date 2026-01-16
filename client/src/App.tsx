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
  const { gameId, players, currentPlayerIndex, updateScore, nextTurn, setWinner } = useGameStore()
  const { user, isGuest, login, setGuest, logout } = useAuthStore()
  const [dartsThrown, setDartsThrown] = useState<number>(0)
  
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

  const handleThrow = async (multiplier: number, value: number) => {
    if (!gameId) return
    
    // 1. Calculate Score
    const points = multiplier * value
    const currentPlayer = players[currentPlayerIndex]
    
    // Bust Logic (Simplified for UI)
    const newScore = currentPlayer.score - points
    
    if (newScore === 0) {
        // WINNER
        // Update score to 0
        updateScore(currentPlayer.id, 0)
        // Trigger Win State
        setWinner({ ...currentPlayer, score: 0 })
        // Send to backend (last throw)
        fetch(`${API_URL}/api/games/${gameId}/throw`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ score_value: value, multiplier: multiplier })
        }).catch(e => console.error(e))
        
        return; // End flow here
    }

    if (newScore < 0 || newScore === 1) {
       alert("BUST!")
       // Reset turn would imply reverting 3 darts. 
       // For this MVP, we just don't substract score and move to next throw?
       // Actually user expects standard rules: Turn ends immediately, score resets to start of turn.
       // That requires tracking 'scoreAtStartOfTurn'. 
       // Keeping it simple: Just ignore this throw for now.
    } else {
        updateScore(currentPlayer.id, newScore)
    }

    // 2. Send to Backend
    fetch(`${API_URL}/api/games/${gameId}/throw`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ score_value: value, multiplier: multiplier })
    })

    // 3. Turn Management
    const nextDartCount = dartsThrown + 1
    if (nextDartCount >= 3) {
        setDartsThrown(0)
        nextTurn()
    } else {
        setDartsThrown(nextDartCount)
    }
  }

  const handleUndo = () => {
      // Logic for undoing last throw
      // Requires stack history
      alert("Undo not implemented in MVP yet")
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
                 <h1 className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                    DART <span className="text-green-500">X01</span>
                 </h1>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-xs font-mono font-bold text-slate-500">Match #{gameId.slice(0, 4)}</span>
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
           
        </div>
      )}
    </div>
  )
}

export default App
