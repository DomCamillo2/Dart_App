import requests
import json
import time

BASE_URL = "http://localhost:3000/api"

def create_game():
    payload = {
        "player_names": ["TestPlayer1", "TestPlayer2"],
        "start_score": 501
    }
    response = requests.post(f"{BASE_URL}/games", json=payload)
    return response.json()

def throw(game_id, multiplier, value):
    payload = {
        "multiplier": multiplier,
        "score_value": value
    }
    response = requests.post(f"{BASE_URL}/games/{game_id}/throw", json=payload)
    return response.json()

def get_state(game_id):
    response = requests.get(f"{BASE_URL}/games/{game_id}")
    return response.json()

def run_tests():
    print("--- Starting 501 Logic Tests ---")
    
    # Setup
    print("[1] Creating Game...")
    game = create_game()
    game_id = game["game_id"]
    p1_id = game["player_ids"][0]
    p2_id = game["player_ids"][1]
    print(f"Game ID: {game_id}")
    
    # Test 1: Standard Scoring
    print("\n[Test 1] Standard Scoring")
    throw(game_id, 3, 20) # 60
    state = get_state(game_id)
    p1_score = state["scores"][p1_id]
    print(f"P1 Score after T20 (Expected 441): {p1_score}")
    if p1_score == 441: print("PASS")
    else: print("FAIL")

    # Test 2: Bust Logic
    # We need to simulate a bust.
    # Player 1 is at 441. 
    # Let's hit 442 to bust (impossible in 1 dart but let's just use raw value for test)
    # Actually max is 60. We can't bust from 441 easily.
    # Let's reset game manually or just play along.
    
    # Let's play until close to 0 to test bust properly.
    # This is hard to do in a simple script rapidly.
    # Instead, let's create a NEW game with low score if API supported it, 
    # but api defaults to 501 or 301.
    
    # Let's try 301 game.
    game301 = requests.post(f"{BASE_URL}/games", json={"player_names": ["Buster", "Pro"], "start_score": 301}).json()
    gid_bust = game301["game_id"]
    pid_bust = game301["player_ids"][0]
    
    # Throw 6 x 50 (Bull) = 300. Score 1. -> THIS SHOULD BUST (Score 1 is invalid)
    # Turn 1 (3 throws)
    throw(gid_bust, 2, 25) # 50
    throw(gid_bust, 2, 25) # 50
    throw(gid_bust, 2, 25) # 50 -> Score 151
    
    # Turn 2 (Player 2 - skip)
    throw(gid_bust, 1, 1)
    throw(gid_bust, 1, 1) 
    throw(gid_bust, 1, 1)
    
    # Turn 3 (Player 1 again). Score 151.
    # Throw 3 Bulls (150). Remaining: 1. -> CHECK BUST
    throw(gid_bust, 2, 25) # 50. Rem: 101.
    throw(gid_bust, 2, 25) # 50. Rem: 51.
    throw(gid_bust, 2, 25) # 50. Rem: 1. -> BUST!
    
    state = get_state(gid_bust)
    final_score = state["scores"][pid_bust]
    print(f"\n[Test 2] Bust Check (Start Turn: 151. Thrown: 150. Rem: 1 -> Invalid).")
    print(f"Expect Score to revert to 151. Actual: {final_score}")
    
    if final_score == 151:
        print("PASS")
    else:
        print("FAIL (Logic did not revert score on Bust)")

    
if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"Test failed to run: {e}")
