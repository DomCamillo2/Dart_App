import React, { useState, useRef, useEffect } from 'react'

interface HelpModalProps {
  onClose: () => void
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null);
  
  const totalSteps = 4;

  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === 'Escape') onClose();
         if (e.key === 'ArrowRight') nextStep();
         if (e.key === 'ArrowLeft') prevStep();
     };
     document.addEventListener('keydown', handleKeyDown);
     modalRef.current?.focus();
     return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, step]);

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  const content = [
      {
          title: "Welcome to Dart X01",
          subtitle: "The Goal",
          text: (
              <div className="space-y-4">
                  <p>In X01, players start with a fixed score (usually 501 or 301) and race to reduce it to exactly zero.</p>
                  <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
                      <span className="text-4xl font-black text-white">501</span>
                      <span className="mx-2 text-slate-500">➜</span>
                      <span className="text-4xl font-black text-green-500">0</span>
                  </div>
              </div>
          )
      },
      {
          title: "Scoring & Input",
          subtitle: "How to enter points",
          text: (
              <div className="space-y-4">
                  <p>Use the keypad to enter your throw. Tap the number you hit on the dartboard.</p>
                   <ul className="list-disc pl-5 space-y-2 marker:text-green-500">
                      <li>For a <strong className="text-white">Single</strong> hit, just tap the number.</li>
                      <li>For <strong className="text-red-400">Double</strong> or <strong className="text-green-400">Triple</strong> rings, tap the multiplier button <em>first</em>, then the number.</li>
                      <li>Use <strong className="text-slate-400">MISS</strong> if you hit outside the scoring area (0 points).</li>
                  </ul>
              </div>
          )
      },
      {
          title: "Special Areas",
          subtitle: "Bullseye & Busts",
          text: (
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-900/40 p-3 rounded-lg border border-green-800 text-center">
                          <div className="text-green-400 font-bold mb-1">Single Bull</div>
                          <div className="text-2xl font-black text-white">25</div>
                      </div>
                      <div className="bg-red-900/40 p-3 rounded-lg border border-red-800 text-center">
                          <div className="text-red-400 font-bold mb-1">Double Bull</div>
                          <div className="text-2xl font-black text-white">50</div>
                      </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                      <strong>Bust Rule:</strong> If you score more points than you have left, or reach a score of 1, your turn ends immediately and your score resets to what it was at the start of the turn.
                  </p>
              </div>
          )
      },
      {
          title: "Winning the Game",
          subtitle: "Double Out",
          text: (
              <div className="space-y-4">
                  <p>To win, you must land on exactly zero.</p>
                  <div className="bg-slate-800 p-4 rounded-xl border border-yellow-600/50 flex flex-col gap-2">
                       <strong className="text-yellow-400 uppercase tracking-widest text-xs">Crucial Rule</strong>
                       <p className="text-white font-bold">The final dart must be a DOUBLE.</p>
                  </div>
                  <p className="text-sm">This means if you have 32 left, you must hit Double 16. If you have 40, Double 20.</p>
                  <p className="text-sm italic text-slate-400">The app will give you checkout suggestions when you get close!</p>
              </div>
          )
      }
  ]

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        role="dialog"
        aria-labelledby="help-title"
        aria-modal="true"
    >
      <div 
        ref={modalRef}
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative outline-none flex flex-col min-h-[400px]"
        tabIndex={-1}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800 z-10"
          aria-label="Close Help"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 mt-2">
            {content.map((_, idx) => (
                <div key={idx} className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx <= step ? 'bg-green-500' : 'bg-slate-700'}`} />
            ))}
        </div>

        <div className="flex-1 flex flex-col"> 
            <div className="animate-in slide-in-from-right-4 fade-in duration-300 w-full" key={step}>
                <h2 id="help-title" className="text-3xl font-black italic text-white mb-1">{content[step].title}</h2>
                <h3 className="text-green-500 font-bold uppercase tracking-widest text-sm mb-6">{content[step].subtitle}</h3>
                
                <div className="text-slate-300 text-base leading-relaxed">
                    {content[step].text}
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
             <button 
                onClick={prevStep}
                disabled={step === 0}
                className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 font-bold transition-colors"
             >
                Back
             </button>

             {step < totalSteps - 1 ? (
                 <button 
                    onClick={nextStep}
                    className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-200 font-black rounded-xl transition-colors min-w-[120px]"
                 >
                    Next
                 </button>
             ) : (
                 <button 
                    onClick={onClose}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl transition-colors min-w-[120px] shadow-[0_0_20px_rgba(22,163,74,0.4)]"
                 >
                    Play Now
                 </button>
             )}
        </div>
      </div>
    </div>
  )
}

export default HelpModal
