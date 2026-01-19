import React from 'react'

interface HelpModalProps {
  onClose: () => void
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  // Focus Trap Logic (simple version)
  const modalRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === 'Escape') onClose();
     };
     document.addEventListener('keydown', handleKeyDown);
     // Focus the close button or modal on mount
     modalRef.current?.focus();
     return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        role="dialog"
        aria-labelledby="help-title"
        aria-modal="true"
    >
      <div 
        ref={modalRef}
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative outline-none"
        tabIndex={-1}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
          aria-label="Close Help"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="help-title" className="text-2xl font-black italic text-white mb-6">How to Play <span className="text-green-500">X01</span></h2>

        <div className="space-y-4 text-slate-300 text-sm overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
          <section>
            <h3 className="text-white font-bold uppercase tracking-wider mb-2 text-xs">Scoring</h3>
            <p>
              Tap <span className="text-green-400 font-bold">Double</span> or <span className="text-green-400 font-bold">Triple</span> before selecting a number to apply the multiplier.
              <br/>
              Tap the number directly for a single score.
              <br/>
              Use <span className="text-red-400 font-bold">MISS</span> for 0 points.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold uppercase tracking-wider mb-2 text-xs">Game Rules</h3>
            <ul className="list-disc pl-4 space-y-1 marker:text-green-500">
              <li>Each player throws 3 darts per turn.</li>
              <li>Start with 301 or 501 points.</li>
              <li>Your goal is to reach exactly 0.</li>
              <li>To finish, you must land on a <span className="text-green-400 font-bold">Double</span> that brings your score to 0.</li>
              <li>If you go below 0 or reach 1, you "Bust" and your score resets to the start of the turn.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-bold uppercase tracking-wider mb-2 text-xs">Controls</h3>
            <ul className="list-disc pl-4 space-y-1 marker:text-green-500">
              <li><span className="text-yellow-400 font-bold">Undo</span>: Correct the last throw if you made a mistake.</li>
              <li>Use "Return" or "New Game" to exit the current match.</li>
            </ul>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors uppercase tracking-widest text-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default HelpModal
