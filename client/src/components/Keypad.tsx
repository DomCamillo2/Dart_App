import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface KeypadProps {
  onThrow: (multiplier: number, value: number) => void
  onUndo?: () => void
}

const Keypad: React.FC<KeypadProps> = ({ onThrow, onUndo }) => {
  const [multiplier, setMultiplier] = useState<1 | 2 | 3>(1)

  const handleSegmentClick = (val: number) => {
    onThrow(multiplier, val)
    setMultiplier(1) 
  }

  const handleBullClick = (isDouble: boolean) => {
    // Single Bull: 25x1. Double Bull: 25x2.
    // If global double modifier is active, should clicking 25 make it 50?
    // Standard UI usually separates logic or disables global modifiers for Bull.
    // Here we will treat the buttons as specific intents.
    
    if (isDouble) {
        onThrow(2, 25)
    } else {
        // If the user selected Double prefix, apply it to 25?
        // Let's assume the button overrides the prefix OR incorporates it.
        // If simple "25" button, and Double is active -> 50.
        // But user asked for "Single Bullseye".
        // Let's safe-guard:
        const mult = multiplier === 2 ? 2 : 1
        onThrow(mult, 25)
    }
    setMultiplier(1)
  }

  const MultiplierBtn = ({ val, label, color, activeColor }: { val: 1|2|3, label: string, color: string, activeColor: string }) => (
    <button 
      onClick={() => setMultiplier(multiplier === val ? 1 : val)}
      className={twMerge(
        "relative overflow-hidden h-12 text-sm font-black tracking-wider uppercase rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg border-[3px] focus:outline-none focus:ring-4 focus:ring-blue-500",
        multiplier === val 
          ? `bg-slate-100 text-slate-900 border-white translate-y-1 shadow-none ${activeColor}` 
          : `${color} border-[rgba(255,255,255,0.1)] text-white hover:brightness-110 shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.3)]`
      )}
      title={`Select ${label} Multiplier (x${val})`}
      aria-label={`Select ${label} Multiplier`}
      aria-pressed={multiplier === val}
    >
      <span className="relative z-10 flex items-center gap-1">
        {label === 'Double' && <span className="text-xs opacity-70">x2</span>}
        {label === 'Triple' && <span className="text-xs opacity-70">x3</span>}
        {label}
      </span>
      {multiplier === val && <div className="absolute inset-0 bg-white/50 animate-pulse"></div>}
    </button>
  )

  const SegmentBtn = ({ val }: { val: number }) => {
    // Alternating colors for standard segments style (just for visual flair)
    // Even: Black-ish, Odd: White-ish (Gray)
    const isDark = val % 2 === 0
    
    return (
        <button
          onClick={() => handleSegmentClick(val)}
          className={twMerge(
            "relative h-14 md:h-12 rounded-xl text-2xl md:text-xl font-bold transition-all shadow-[0_4px_0_rgba(0,0,0,0.4)] active:scale-[0.98] active:translate-y-[2px] active:shadow-none border-t border-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:z-10",
            isDark 
                ? "bg-gradient-to-b from-slate-700 to-slate-800 text-white" 
                : "bg-gradient-to-b from-slate-200 to-slate-300 text-slate-900"
          )}
          aria-label={`Score ${val}`}
        >
          {val}
        </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto select-none mt-auto p-4 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl">
      {/* Modifiers Row */}
      <div className="grid grid-cols-4 gap-2 mb-1" role="group" aria-label="Score Modifiers">
        <MultiplierBtn val={2} label="Double" color="bg-gradient-to-br from-red-600 to-red-800" activeColor="ring-2 ring-red-500 ring-offset-2 ring-offset-slate-900" />
        <MultiplierBtn val={3} label="Triple" color="bg-gradient-to-br from-green-600 to-green-800" activeColor="ring-2 ring-green-500 ring-offset-2 ring-offset-slate-900" />
        <button 
            onClick={() => handleSegmentClick(0)}
          className="bg-gradient-to-br from-slate-600 to-slate-700 border-b-4 border-slate-900 text-white rounded-xl font-bold text-xs uppercase hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all shadow-lg active:shadow-none flex items-center justify-center gap-1 focus:outline-none focus:ring-4 focus:ring-blue-500"
          title="Record a miss (0 points)"
        >
          <span aria-hidden>⨯</span> MISS
        </button>
         {onUndo && (
           <button 
            onClick={onUndo} 
            className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-b-4 border-yellow-900 text-white rounded-xl font-bold text-xs uppercase hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all shadow-lg active:shadow-none flex items-center justify-center gap-1 focus:outline-none focus:ring-4 focus:ring-blue-500"
            title="Undo last throw"
            aria-label="Undo last throw"
           >
            ↺ Undo
           </button>
         )}
      </div>
      
      {/* Target Indicator */}
      <div className={`
        text-center text-[11px] font-black uppercase tracking-[0.4em] bg-slate-950 py-2 rounded-lg border border-white/10 transition-colors duration-300
        ${multiplier === 3 ? 'text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : multiplier === 2 ? 'text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(248,113,113,0.2)]' : 'text-slate-400'}
      `} aria-live="polite">
          {multiplier === 3 ? 'Target: Triple (x3)' : multiplier === 2 ? 'Target: Double (x2)' : 'Target: Single (x1)'}
      </div>

      {/* 1-20 Grid */}
      <div className="grid grid-cols-5 gap-2 md:gap-2.5" role="group" aria-label="Points Grid">
        {/* Row 1: 1-5 */}
        {[1,2,3,4,5].map(n => <SegmentBtn key={n} val={n} />)}
        {/* Row 2: 6-10 */}
        {[6,7,8,9,10].map(n => <SegmentBtn key={n} val={n} />)}
        {/* Row 3: 11-15 */}
        {[11,12,13,14,15].map(n => <SegmentBtn key={n} val={n} />)}
        {/* Row 4: 16-20 */}
        {[16,17,18,19,20].map(n => <SegmentBtn key={n} val={n} />)}
      </div>

      {/* Bulls Row */}
      <div className="grid grid-cols-2 gap-3 mt-1">
         <button 
            onClick={() => handleBullClick(false)} // Single Bull (25)
            className="h-16 bg-gradient-to-br from-green-700 to-green-900 border-b-[6px] border-green-950 hover:brightness-110 rounded-2xl text-lg font-black text-white active:border-b-0 active:translate-y-[6px] transition-all shadow-lg flex flex-col items-center justify-center leading-none group focus:outline-none focus:ring-4 focus:ring-green-500"
            aria-label="Single Bull (25 points)"
        >
            <span className="drop-shadow-md group-active:scale-95 transition-transform text-white">25</span>
            <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider text-green-100">Single</span>
        </button>
        <button 
            onClick={() => handleBullClick(true)} // Double Bull (50)
            className="h-16 bg-gradient-to-br from-red-700 to-red-900 border-b-[6px] border-red-950 hover:brightness-110 rounded-2xl text-lg font-black text-white active:border-b-0 active:translate-y-[6px] transition-all shadow-lg flex flex-col items-center justify-center leading-none group focus:outline-none focus:ring-4 focus:ring-red-500"
            aria-label="Double Bull (50 points)"
        >
             <span className="drop-shadow-md text-red-50 group-active:scale-95 transition-transform">BULL</span>
             <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider text-red-100">Double</span>
        </button>
      </div>
    </div>
  )
}

export default Keypad
