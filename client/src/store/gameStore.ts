import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Player {
  id: string
  name: string
  score: number // Current working score
}

interface GameState {
  gameId: string | null
  players: Player[]
  currentPlayerIndex: number
  startScore: number
  winner: Player | null
  
  // New: Track local history for undo
  history: { players: Player[], currentPlayerIndex: number }[]
  
  // Setup Actions
  startGame: (gameId: string, players: Player[], startScore: number) => void
  setWinner: (player: Player | null) => void
  resetGame: () => void
  
  // Game Actions
  updateScore: (playerId: string, newScore: number) => void
  nextTurn: () => void
  
  // Undo Support
  pushHistory: () => void
  popHistory: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      gameId: null,
      players: [],
      currentPlayerIndex: 0,
      startScore: 501,
      winner: null,
      history: [],

      startGame: (gameId, players, startScore) => set({ 
        gameId, 
        players, 
        startScore,
        currentPlayerIndex: 0,
        winner: null,
        history: []
      }),

      setWinner: (player) => set({ winner: player }),
      resetGame: () => set({ gameId: null, players: [], winner: null, history: [] }),

      updateScore: (playerId, newScore) => set((state) => ({
        players: state.players.map(p => 
          p.id === playerId ? { ...p, score: newScore } : p
        )
      })),

      nextTurn: () => set((state) => ({
        currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length
      })),

      pushHistory: () => {
        const state = get()
        set(s => ({
            history: [...s.history, { 
                players: JSON.parse(JSON.stringify(s.players)), // Deep copy 
                currentPlayerIndex: s.currentPlayerIndex 
            }]
        }))
      },

      popHistory: () => {
        const history = get().history
        if (history.length === 0) return

        const lastState = history[history.length - 1]
        set({
            players: lastState.players,
            currentPlayerIndex: lastState.currentPlayerIndex,
            history: history.slice(0, -1),
            winner: null
        })
      }
    }),
    {
      name: 'dart-game-storage',
    }
  )
)
