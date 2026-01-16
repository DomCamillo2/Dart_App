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
