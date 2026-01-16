import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { useGameStore } from '../store/gameStore'

const WinnerModal = () => {
    const { winner, resetGame } = useGameStore()

    useEffect(() => {
        if (winner) {
            // Fire confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => {
                return Math.random() * (max - min) + min;
            }

            const interval: any = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                
                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    }, [winner])

    if (!winner) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border-2 border-green-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(34,197,94,0.3)] transform scale-100 animate-in zoom-in-95 duration-300">
                <div className="mb-6">
                    <span className="text-6xl">🏆</span>
                </div>
                
                <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-2">Winner</h2>
                <h1 className="text-5xl font-black text-white mb-8 drop-shadow-lg break-words">
                    {winner.name}
                </h1>

                <button 
                    onClick={resetGame}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-black text-xl py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
                >
                    PLAY AGAIN
                </button>
            </div>
        </div>
    )
}

export default WinnerModal