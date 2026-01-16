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
    <div className="grid grid-cols-2 gap-3 md:gap-6 w-full max-w-md">
      {players.map((p, idx) => {
        const isCurrent = idx === currentPlayerIndex
        const suggestion = isCurrent && p.score <= 170 ? getCheckoutSuggestion(p.score) : null
        
        // Calculate Pseudo-Average if we had the data.
        // For MVP research task: Let's assume we can't show accurate avg yet.

        return (
          <div 
            key={p.id}
            className={`
              relative flex flex-col items-center justify-center p-4 md:p-8 rounded-[2rem] border-2 transition-all duration-500 group
              ${isCurrent 
                ? 'bg-slate-800/80 border-green-500 shadow-[0_0_40px_-5px_rgba(34,197,94,0.15)] scale-[1.02] z-10' 
                : 'bg-slate-900/40 border-slate-800/50 opacity-60 scale-95 grayscale-[0.5] hover:opacity-80'}
            `}
          >
            {/* Background Texture for Cards */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none rounded-[2rem]"></div>

            {isCurrent && (
               <>
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-black text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full shadow-[0_2px_10px_rgba(34,197,94,0.4)] animate-in slide-in-from-top-2 duration-300 z-20">
                    Throwing
                 </div>
                 <div className="absolute inset-0 bg-green-500/5 animate-pulse rounded-[2rem]"></div>
               </>
            )}
            
            <div className="relative z-10 flex flex-col items-center">
                <span className={`text-xs md:text-sm uppercase font-bold tracking-[0.2em] mb-2 transition-colors duration-300 ${isCurrent ? 'text-green-400' : 'text-slate-500'}`}>
                    {p.name}
                </span>
                
                {/* Score Number with 3D drop shadow */}
                <div className="relative">
                    <span 
                        className={`font-mono font-black transition-all duration-300 leading-none
                        ${isCurrent 
                            ? 'text-6xl md:text-8xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]' 
                            : 'text-4xl md:text-6xl text-slate-600 blur-[0.5px]'}
                        `}
                        style={{ textShadow: isCurrent ? '0 0 30px rgba(34,197,94,0.2)' : 'none' }}
                    >
                        {p.score}
                    </span>
                </div>
            </div>

            {/* Checkout Hint - Floating Glass Pill */}
            {suggestion && (
              <div className="absolute -bottom-4 md:-bottom-5 left-1/2 -translate-x-1/2 w-max max-w-[110%] 
                              bg-slate-950/90 backdrop-blur-xl border border-green-500/30 
                              px-4 py-2 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] 
                              animate-in slide-in-from-bottom-2 fade-in duration-300 z-20
                              flex flex-col items-center gap-1">
                 <span className="text-[10px] text-green-500/70 font-bold uppercase tracking-widest leading-none">Checkout Path</span>
                 <span className="text-green-400 text-xs md:text-sm font-mono font-bold whitespace-nowrap">{suggestion}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Scoreboard
