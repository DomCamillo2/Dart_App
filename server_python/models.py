from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class UserRegister(BaseModel):
    username: str
    password: str
    email: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class PlayerCreate(BaseModel):
    name: str

class GameCreate(BaseModel):
    player_names: List[str]
    start_score: int = 501

class ThrowInput(BaseModel):
    score_value: int
    multiplier: int

class GameState(BaseModel):
    id: UUID
    start_score: int
    is_finished: bool
    winner_id: Optional[UUID]
    current_player_id: Optional[UUID]
    players: List[dict]
    scores: dict
