import React from 'react'
import { useGameStore } from '../store/gameStore'
import { getCheckoutSuggestion } from '../utils/scoring.utils'

const Scoreboard = () => {
  const { players, currentPlayerIndex, startScore } = useGameStore()

  // Helper to calculate theoretical 3-dart average (Points deducted / Turns taken approx)
  // This is a rough estimation since we don't track total darts thrown in store yet.
  // Real implementation would need 'dartsThrownTotal' in player object. 
  // We can infer approx turns if we assume even play, but that's inaccurate.
  // For now: Just Show Score. We will add Avg later when we track Darts Count per player.

  return (
    <div className="w-full max-w-4xl mx-auto"> 
      {/* Scrollable Container for Players */}
      <div className="flex gap-4 overflow-x-auto pb-8 pt-4 px-4 snap-x snap-mandatory custom-scrollbar items-center md:justify-center min-h-[200px]">
      {players.map((p, idx) => {
        const isCurrent = idx === currentPlayerIndex
        const suggestion = isCurrent && p.score <= 170 ? getCheckoutSuggestion(p.score) : null
        
        return (
          <div 
            key={p.id}
            id={`player-card-${idx}`}
            className={`
              relative flex-shrink-0 w-[160px] md:w-[220px] flex flex-col items-center justify-center p-4 py-6 md:p-8 rounded-[2rem] border-2 transition-all duration-500 group snap-center
              ${isCurrent 
                ? 'bg-slate-800/90 border-green-500 shadow-[0_0_40px_-5px_rgba(34,197,94,0.2)] scale-110 z-20 mx-2' 
                : 'bg-slate-900/40 border-slate-800/50 opacity-50 scale-90 grayscale-[0.7] hover:opacity-80 hover:scale-95'}
            `}
          >
            {/* Background Texture for Cards */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none rounded-[2rem]"></div>

            {isCurrent && (
               <>
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-black text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full shadow-[0_2px_10px_rgba(34,197,94,0.4)] animate-in slide-in-from-top-2 duration-300 z-20 whitespace-nowrap">
                    Throwing
                 </div>
                 <div className="absolute inset-0 bg-green-500/5 animate-pulse rounded-[2rem]"></div>
               </>
            )}
            
            <div className="relative z-10 flex flex-col items-center w-full">
                <span className={`text-xs md:text-sm uppercase font-bold tracking-[0.2em] mb-2 transition-colors duration-300 truncate w-full text-center ${isCurrent ? 'text-green-400' : 'text-slate-400'}`}>
                    {p.name}
                </span>
                
                {/* Score Number with 3D drop shadow */}
                <div className="relative">
                    <span 
                        className={`font-mono font-black transition-all duration-300 leading-none
                        ${isCurrent 
                            ? 'text-5xl md:text-7xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]' 
                            : 'text-3xl md:text-5xl text-slate-500 blur-[0.5px]'}
                        `}
                        style={{ textShadow: isCurrent ? '0 0 30px rgba(34,197,94,0.2)' : 'none' }}
                    >
                        {p.score}
                    </span>
                </div>
            </div>

            {/* Checkout Hint - Floating Glass Pill */}
            {suggestion && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-max max-w-[150%] 
                              bg-slate-950/90 backdrop-blur-xl border border-green-500/30 
                              px-3 py-2 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] 
                              animate-in slide-in-from-bottom-2 fade-in duration-300 z-30
                              flex flex-col items-center gap-1 pointer-events-none">
                 <span className="text-[9px] text-green-500/70 font-bold uppercase tracking-widest leading-none">Checkout</span>
                 <span className="text-green-400 text-xs md:text-sm font-mono font-bold whitespace-nowrap">{suggestion}</span>
              </div>
            )}
          </div>
        )
      })}
      </div>
      
      {/* Fixed Turn Indicator for heavy scrolling */}
      <div className="md:hidden fixed top-24 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur border border-green-500/20 px-4 py-1 rounded-full shadow-xl pointer-events-none opacity-80 transition-opacity duration-300">
         <span className="text-[10px] text-slate-400 font-bold uppercase mr-2">Turn:</span>
         <span className="text-xs text-green-400 font-bold uppercase">{players[currentPlayerIndex]?.name}</span>
      </div>
    </div>
  )
}

export default Scoreboard
