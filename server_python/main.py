from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection, init_db
from models import GameCreate, ThrowInput, UserRegister, UserLogin, ForgotPasswordRequest, ResetPasswordRequest
import uuid
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import requests
import os

# Auth Configuration
SECRET_KEY = "super_secret_dart_key_change_me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

# Mailgun Configuration
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN", "sandbox64b84171150447e2a8964210a106f64a.mailgun.org")
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY", "API_KEY") 
MAILGUN_API_URL = os.getenv("MAILGUN_API_URL", "https://api.mailgun.net/v3") # Use https://api.eu.mailgun.net/v3 for EU

app = FastAPI()

@app.on_event("startup")
def on_startup():
    init_db()

# Switch to pbkdf2_sha256 to avoid bcrypt 72 byte limit issues on some systems/versions
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_id(authorization: Optional[str] = Header(None)):
    if not authorization:
        return None  # Or raise HTTPException if strictly required
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000", 
        "https://dart-frontend1.onrender.com",          # legacy frontend URL
        "https://dart-frontend-8245.onrender.com"        # current frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/register")
def register(user: UserRegister):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Check if name exists
                cur.execute("SELECT id, password_hash FROM players WHERE name = %s", (user.username,))
                existing = cur.fetchone()
                
                if existing:
                    if existing['password_hash']:
                        raise HTTPException(status_code=400, detail="Username already taken")
                    else:
                        # Claim existing guest account
                        hashed = get_password_hash(user.password)
                        cur.execute("UPDATE players SET password_hash = %s, email = %s WHERE id = %s", (hashed, user.email, existing['id']))
                        conn.commit()
                        return {"msg": "Guest account claimed via registration"}
                else:
                    hashed = get_password_hash(user.password)
                    cur.execute("INSERT INTO players (name, password_hash, email) VALUES (%s, %s, %s)", (user.username, hashed, user.email))
                    conn.commit()
                    return {"msg": "User created successfully"}
    except Exception as e:
        # Pscyopg error for unique email
        if "unique_email" in str(e):
             raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/login")
def login(user: UserLogin):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, password_hash, name FROM players WHERE name = %s", (user.username,))
            player = cur.fetchone()
            
            if not player or not player['password_hash'] or not verify_password(user.password, player['password_hash']):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            access_token = create_access_token(data={"sub": str(player['id'])})
            return {"access_token": access_token, "token_type": "bearer", "username": player['name'], "id": player['id']}

@app.post("/api/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name FROM players WHERE email = %s", (req.email,))
            player = cur.fetchone()
            
            if not player:
                # Don't reveal if user exists
                return {"msg": "If account exists, email sent"}
            
            # Generate Reset Token (JWT with short expiry)
            # 15 mins expiry
            expire = datetime.utcnow() + timedelta(minutes=15)
            reset_token = jwt.encode({"sub": str(player['id']), "type": "reset", "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
            
            # Send Email via Mailgun
            try:
                # We won't really send if API key is dummy (default value)
                if MAILGUN_API_KEY != "API_KEY":
                     print(f"Attempting to send email to {req.email} via {MAILGUN_DOMAIN}...")
                     response = requests.post(
                        f"{MAILGUN_API_URL}/{MAILGUN_DOMAIN}/messages",
                        auth=("api", MAILGUN_API_KEY),
                        data={
                            "from": f"Dart App <postmaster@{MAILGUN_DOMAIN}>",
                            "to": req.email,
                            "subject": "Reset Your Password - Dart App",
                            "text": f"Hi {player['name']},\n\nWe received a request to reset your password.\n\nPlease copy the following token and paste it into the app to reset your password:\n\n{reset_token}\n\nIf you did not request this, please ignore this email."
                        }
                    )
                     print(f"Mailgun Response Status: {response.status_code}")
                     if response.status_code != 200:
                         print(f"Error Body: {response.text}")
                     response.raise_for_status()
            except Exception as e:
                print(f"Failed to send email: {e}")
            
            # Keep logging for dev purposes since we likely don't have a valid API key running in this env
            print("============================================")
            print(f"PASSWORD RESET FOR {player['name']} ({req.email})")
            print(f"TOKEN: {reset_token}")
            print("============================================")
            
            return {"msg": "If account exists, email sent"}

@app.post("/api/reset-password")
def reset_password(req: ResetPasswordRequest):
    try:
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if not user_id or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token")
            
        hashed = get_password_hash(req.new_password)
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE players SET password_hash = %s WHERE id = %s", (hashed, user_id))
                conn.commit()
                
        return {"msg": "Password updated successfully"}
        
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

@app.get("/")
def read_root():
    return {"status": "Dart Scorer API (Python) is running"}

@app.get("/api/players")
def get_players():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name FROM players ORDER BY name ASC")
            players = cur.fetchall()
            return players

@app.get("/api/games")
def get_games_history():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT g.id, g.start_score, g.created_at, p.name as winner_name 
                FROM games g
                LEFT JOIN players p ON g.winner_id = p.id
                ORDER BY g.created_at DESC
                LIMIT 10
            """)
            return cur.fetchall()

@app.get("/api/players/{player_id}/games")
def get_player_history(player_id: str):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT g.id, g.start_score, g.created_at, w.name as winner_name, g.is_finished
                FROM games g
                JOIN game_participants gp ON g.id = gp.game_id
                LEFT JOIN players w ON g.winner_id = w.id
                WHERE gp.player_id = %s
                ORDER BY g.created_at DESC
            """, (player_id,))
            return cur.fetchall()

@app.post("/api/games")
def create_game(game: GameCreate):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # 1. Optimize Player Retrieval/Creation
            names = [n.strip() for n in game.player_names if n.strip()]
            if not names:
                raise HTTPException(status_code=400, detail="At least one player required")

            # Fetch all existing players in one go
            # Psycopg3 adapts lists to arrays automatically
            cur.execute("SELECT name, id FROM players WHERE name = ANY(%s)", (names,))
            existing_map = {row['name']: row['id'] for row in cur.fetchall()}
            
            final_player_ids = []
            
            # Create missing players
            for name in names:
                if name in existing_map:
                    final_player_ids.append(existing_map[name])
                else:
                    cur.execute("INSERT INTO players (name) VALUES (%s) RETURNING id", (name,))
                    new_id = cur.fetchone()['id']
                    existing_map[name] = new_id # Cache it
                    final_player_ids.append(new_id)

            # 2. Create Game
            cur.execute("INSERT INTO games (start_score) VALUES (%s) RETURNING id", (game.start_score,))
            game_id = cur.fetchone()['id']

            # 3. Link Participants (deduplicated by ID to be safe)
            unique_ids = []
            seen = set()
            for pid in final_player_ids:
                if pid not in seen:
                    unique_ids.append(pid)
                    seen.add(pid)

            # Batch Insert using executemany
            params = [(game_id, pid, idx + 1) for idx, pid in enumerate(unique_ids)]
            cur.executemany(
                "INSERT INTO game_participants (game_id, player_id, turn_order) VALUES (%s, %s, %s)", 
                params
            )
            
            conn.commit()
            return {"game_id": game_id, "player_ids": unique_ids}

def calculate_game_state(start_score, players, throws):
    # Initialize scores map: player_id -> score
    scores = {str(p['id']): start_score for p in players}
    
    # If no players, return empty
    if not players:
        return scores, None, None, []

    # Map player_id to index in players list to track turn order
    player_map = {str(p['id']): i for i, p in enumerate(players)}
    
    current_player_idx = 0
    throws_in_current_turn = 0
    
    # Track the score at the start of the current turn for the current player
    # Initial state: Player 0 starts, their score is start_score
    score_at_start_of_turn = start_score
    
    winner_id = None
    processed_throws = [] # To return with is_bust flags
    
    for t in throws:
        # If game is already won, ignore subsequent throws (or handle as error)
        if winner_id:
            t['is_bust'] = False
            processed_throws.append(t)
            continue

        pid = str(t['player_id'])
        
        # Verify it's actually this player's turn relative to our history calculation
        # (In a real app, we might enforce this on insert, but here we replay)
        expected_pid = str(players[current_player_idx]['id'])
        
        # If the log has a throw from the wrong player, likely out of sync or multi-client race.
        # We process it anyway to reflect DB state, but ideally we'd force turn order.
        if pid != expected_pid:
            # Force correcting our tracking to match the throw's player? 
            # Or skip? Let's assume the DB is truth and adjust our "start of turn" tracker.
            # This is complex. For now, assume strict order in DB.
            pass

        points = t['score_value'] * t['multiplier']
        current_score = scores[pid]
        
        new_score = current_score - points
        is_bust = False
        
        # 1. Check Win (Double Out)
        if new_score == 0:
            if t['multiplier'] == 2:
                scores[pid] = 0
                winner_id = pid
            else:
                is_bust = True # Hit 0 but not with double
        
        # 2. Check Bust
        elif new_score < 0 or new_score == 1:
             is_bust = True
             
        # Apply Logic
        if is_bust:
            scores[pid] = score_at_start_of_turn
            throws_in_current_turn = 3 # Force End of turn
            t['is_bust'] = True
        else:
            scores[pid] = new_score
            throws_in_current_turn += 1
            t['is_bust'] = False
            
        processed_throws.append(t)
        
        # End Turn Logic
        if throws_in_current_turn >= 3 or winner_id:
            if not winner_id:
                current_player_idx = (current_player_idx + 1) % len(players)
                throws_in_current_turn = 0
                # Prepare 'start of turn' for the NEXT player
                next_pid = str(players[current_player_idx]['id'])
                score_at_start_of_turn = scores[next_pid]
    
    current_player_id = players[current_player_idx]['id'] if not winner_id else None
    
    return scores, current_player_id, winner_id, processed_throws


@app.get("/api/games/{game_id}")
def get_game_state(game_id: uuid.UUID):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Get Game Info
            cur.execute("SELECT * FROM games WHERE id = %s", (game_id,))
            game = cur.fetchone()
            if not game:
                raise HTTPException(status_code=404, detail="Game not found")
            
            # Get Players
            cur.execute("""
                SELECT p.id, p.name, gp.turn_order 
                FROM players p
                JOIN game_participants gp ON p.id = gp.player_id
                WHERE gp.game_id = %s
                ORDER BY gp.turn_order
            """, (game_id,))
            players = cur.fetchall()

            # Get History
            cur.execute("""
                SELECT player_id, score_value, multiplier, is_bust, created_at
                FROM throws 
                WHERE game_id = %s 
                ORDER BY created_at
            """, (game_id,))
            throws = cur.fetchall()

            # Calculate State Logic
            scores, current_player_id, winner_id, processed_throws = calculate_game_state(
                game['start_score'], 
                players, 
                throws
            )

            return {
                "id": game['id'],
                "start_score": game['start_score'],
                "is_finished": bool(winner_id),
                "winner_id": winner_id,
                "players": players,
                "scores": scores,
                "current_player_id": current_player_id,
                "throws_history": processed_throws 
            }


@app.post("/api/games/{game_id}/throw")
def record_throw(game_id: uuid.UUID, throw_data: ThrowInput):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Get players to find order
            cur.execute("""
                SELECT p.id
                FROM players p
                JOIN game_participants gp ON p.id = gp.player_id
                WHERE gp.game_id = %s
                ORDER BY gp.turn_order
            """, (game_id,))
            players = cur.fetchall()
            if not players:
                 raise HTTPException(status_code=404, detail="Game not found")

            # Count throws to find whose turn it is
            cur.execute("SELECT count(*) as c FROM throws WHERE game_id = %s", (game_id,))
            count = cur.fetchone()['c']
            
            player_idx = (count // 3) % len(players)
            player_id = players[player_idx]['id']
            
            total_points = throw_data.score_value * throw_data.multiplier
            
            # Simple insertion. In real app, calculate is_bust here based on current score state.
            
            cur.execute("""
                INSERT INTO throws (game_id, player_id, round_number, throw_number, score_value, multiplier)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                game_id, 
                player_id, 
                (count // 3) + 1, # Round
                (count % 3) + 1,  # Throw # within turn (1-3) is simpler to just derive, but schema asks for it.
                throw_data.score_value, 
                throw_data.multiplier
            ))
            conn.commit()
            
            return {"status": "recorded"}

@app.delete("/api/games/{game_id}/undo")
def undo_last_throw(game_id: uuid.UUID):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Check if there are throws to undo
            cur.execute("SELECT id FROM throws WHERE game_id = %s ORDER BY created_at DESC LIMIT 1", (game_id,))
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=400, detail="No throws to undo")
            
            # Delete the last throw
            cur.execute("DELETE FROM throws WHERE id = %s", (row['id'],))
            conn.commit()
            return {"status": "undone"}
