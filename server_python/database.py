import os
import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/dart_app")

# Fix Render's "postgres://" scheme if necessary for some drivers, 
# though psycopg 3 usually handles it.
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def get_db_connection():
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    return conn

def init_db():
    schema = """
    -- TABLE: players
    CREATE TABLE IF NOT EXISTS players (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- TABLE: games
    CREATE TABLE IF NOT EXISTS games (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      start_score INT NOT NULL DEFAULT 501,
      is_finished BOOLEAN DEFAULT FALSE,
      winner_id UUID REFERENCES players(id),
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- TABLE: game_participants
    CREATE TABLE IF NOT EXISTS game_participants (
      game_id UUID REFERENCES games(id),
      player_id UUID REFERENCES players(id),
      turn_order INT NOT NULL,
      PRIMARY KEY (game_id, player_id)
    );

    -- TABLE: throws
    CREATE TABLE IF NOT EXISTS throws (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      game_id UUID REFERENCES games(id),
      player_id UUID REFERENCES players(id),
      round_number INT NOT NULL,
      throw_number INT NOT NULL,
      score_value INT NOT NULL,
      multiplier INT NOT NULL,
      total_score INT GENERATED ALWAYS AS (score_value * multiplier) STORED,
      is_bust BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(schema)
            conn.commit()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")

