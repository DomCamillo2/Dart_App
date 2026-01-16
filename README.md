Das ist ein sehr schlauer Schachzug. Wenn du eine "Context-File" oder eine optimierte README für eine KI (wie Cursor, GitHub Copilot, ChatGPT oder Claude) erstellst, reduzierst du Halluzinationen und stellst sicher, dass der Code konsistent bleibt.

KIs lieben Struktur, Typdefinitionen und klare Regeln.

Hier ist der Inhalt für deine README.md (oder CONTEXT.md), optimiert für die Fütterung an eine Coding-KI.

Project: Dart X01 Scorer Web App
1. Project Context & Goal
Objective: Build a responsive web application for tracking Dart scores (X01 format). Primary Use Case: Local multiplayer (2+ players sharing one device). Mobile-first design is critical. Core Philosophy: "Arrow-by-Arrow" tracking for detailed statistics, but with a fast, touch-friendly UI.

2. Tech Stack Requirements
Frontend: React (TypeScript), Vite, Tailwind CSS.




State Management: React Context or Zustand (keep it simple but scalable).

Language: Strict TypeScript (no any).

3. Database Schema (Source of Truth)
The AI must adhere to this relational model.

SQL

-- TABLE: players
-- Stores user identities.
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TABLE: games
-- Represents a match (e.g., 501 Best of 3).
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_score INT NOT NULL DEFAULT 501, -- 301 or 501
  is_finished BOOLEAN DEFAULT FALSE,
  winner_id UUID REFERENCES players(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- TABLE: game_participants
-- Links players to a game and defines turn order.
CREATE TABLE game_participants (
  game_id UUID REFERENCES games(id),
  player_id UUID REFERENCES players(id),
  turn_order INT NOT NULL, -- 1, 2, ...
  PRIMARY KEY (game_id, player_id)
);

-- TABLE: throws
-- THE CORE: Stores every single dart thrown.
CREATE TABLE throws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id),
  player_id UUID REFERENCES players(id),
  round_number INT NOT NULL,     -- e.g., Round 1, 2, 3...
  throw_number INT NOT NULL,     -- 1, 2, or 3 (within the turn)
  score_value INT NOT NULL,      -- The raw value (e.g., 20)
  multiplier INT NOT NULL,       -- 1 (Single), 2 (Double), 3 (Triple)
  total_score INT GENERATED ALWAYS AS (score_value * multiplier) STORED,
  is_bust BOOLEAN DEFAULT FALSE, -- True if this throw caused a bust
  created_at TIMESTAMP DEFAULT NOW()
);
4. Business Logic & Rules (CRITICAL)
Game Logic (X01)
Starting Score: Usually 501 or 301.

Ending Condition: Exact 0. Last dart MUST be a Double (Multiplier = 2) or Bullseye (Red Bull).

Bust Rule (Überworfen):

If Remaining Score - Throw Score < 0: BUST.

If Remaining Score - Throw Score == 1: BUST (cannot finish on 1).

Logic: Reset score to what it was at the start of the current 3-dart turn (Round).

Input Logic:

Input happens per dart (not sum of 3).

Max score per dart: 60 (Triple 20).

Max score per turn: 180.

Checkout Calculator Logic
Trigger: When Remaining Score <= 170.

Functionality: Suggest the optimal path (e.g., 121 -> T20, T11, D14).

Must update dynamically after every throw.

5. UI/UX Guidelines (Frontend)
Input Method: "Hybrid Keypad".

Buttons 0-9.

Modifier toggles: [Double], [Triple].

Special buttons: [Bull], [25], [Miss/0].

Action: User taps [Triple] -> [2] -> [0] = System records T20 (60 points).

Visual Feedback: High contrast. Green for Score, Red for Bust.

Active Player: Must be extremely obvious (large name, highlighted background) to avoid scoring for the wrong person.

Undo: Must support undoing the last single dart (update local state immediately).

6. API Structure (REST)
POST /api/games -> Create new game.

POST /api/games/:id/throw -> Submit a throw (validates logic on server).

GET /api/games/:id/status -> Sync state (polling or eventual websocket).

GET /api/players/:id/stats -> Fetch average, checkout %, etc.

7. Development Constraints for AI
Safety: Always sanitize SQL inputs. Use parameterized queries.

Logic Separation: Keep scoring logic in a separate utility file (scoring.utils.ts) so it can be shared between Frontend (for instant UI updates) and Backend (for validation).

Naming: Use camelCase for TS/JS variables and snake_case for Database columns.

Testing: When writing logic, always generate a Unit Test for the "Bust" scenarios and "Checkout" calculations.