
import requests
import time
import sys

BASE_URL = "http://localhost:8001/api"

def test_health():
    try:
        r = requests.get(f"{BASE_URL}/health")
        if r.status_code == 200:
            print("✅ API Health Check: PASSED")
        else:
            print(f"❌ API Health Check: FAILED ({r.status_code})")
            sys.exit(1)
    except Exception as e:
        print(f"❌ API Connection Error: {e}")
        print("Make sure server is running: python api_server.py")
        sys.exit(1)

def test_game_flow():
    # 1. Create New Game (Human vs Bot)
    payload = {
        "player1_type": "human",
        "player2_type": "bot",
        "difficulty": "medium"
    }
    r = requests.post(f"{BASE_URL}/games/new", json=payload)
    data = r.json()
    game_id = data['game_id']
    print(f"✅ Created Game: {game_id}")
    
    # 2. Human Moves (Col 3)
    move_payload = {"column": 3, "player": 1}
    r = requests.post(f"{BASE_URL}/games/{game_id}/move", json=move_payload)
    if r.status_code == 200:
        print("✅ Human Move (Col 3): PASSED")
    else:
        print(f"❌ Human Move Failed: {r.text}")
    
    # 3. Bot Move
    # Trigger bot
    start = time.time()
    r = requests.get(f"{BASE_URL}/games/{game_id}/bot-move")
    duration = time.time() - start
    
    if r.status_code == 200:
        bot_data = r.json()
        col = bot_data['column']
        score = bot_data['evaluation_score']
        print(f"✅ Bot Move (Col {col}, Score {score}): PASSED ({duration:.2f}s)")
    else:
        print(f"❌ Bot Move Failed: {r.text}")
        
    # 4. Get State
    r = requests.get(f"{BASE_URL}/games/{game_id}/state")
    state = r.json()
    if len(state['move_history']) == 2:
        print("✅ Game State Verification: PASSED")
    else:
        print("❌ Game State Verification: FAILED")

    print("\nAPI Integration Tests Complete.")

if __name__ == "__main__":
    # Wait a moment for server to start if running via script
    time.sleep(1) 
    test_health()
    test_game_flow()
