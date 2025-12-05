
import requests
import random
import time
import sys
from collections import Counter

API_URL = "http://localhost:8002/api"

# Basic dictionary to help the bot guess real words
# In a real "Invention", this would connect to a massive local word database.
BOT_VOCAB = [
    "ADIEU", "AUDIO", "RAISE", "STONE", "CRANE", "SLATE", "TRACE", "ROAST", 
    "GHOST", "BEACH", "WORLD", "APPLE", "PIANO", "HOUSE", "TRAIN", "MOUNT",
    "WORDS", "PLANT", "SNAKE", "ZEBRA", "QUICK", "JUMPY", "WALTZ", "VIXEN"
]

class WordleBot:
    def __init__(self):
        self.target_length = 5
        self.possible_words = BOT_VOCAB[:] # Simple pool for demo
        self.known_correct = {} # index -> letter
        self.known_present = [] # list of letters
        self.known_absent = []  # list of letters

    def get_game_word(self):
        try:
            res = requests.get(f"{API_URL}/word")
            return res.json()['word']
        except Exception as e:
            print(f"Server Error: {e}")
            sys.exit(1)

    def choose_guess(self, attempt):
        # STRATEGY 1: Always start with vowel-heavy words
        if attempt == 0:
            return "ADIEU"
        
        # STRATEGY 2: Filter remaining possibilities (Simple Logic)
        candidates = []
        for word in self.possible_words:
            valid = True
            
            # Must contain all known 'present' letters
            for char in self.known_present:
                if char not in word:
                    valid = False
                    break
            
            # Must not contain any 'absent' letters (unless they are also present/correct elsewhere)
            for char in self.known_absent:
                # Improving logic: Absent means "not in the word anymore" usually, 
                # but if we have double letters it gets complex.
                # Simplified: Just skip if absent char is in word and we don't know it's correct there.
                if char in word and char not in self.known_present: 
                     # Check if it's already fixed in a correct spot
                     is_fixed = False
                     for idx, fixed_char in self.known_correct.items():
                         if fixed_char == char:
                             is_fixed = True
                     if not is_fixed:
                        valid = False
                        break

            # Must match fixed positions
            for idx, char in self.known_correct.items():
                if word[idx] != char:
                    valid = False
                    break
            
            if valid:
                candidates.append(word)

        if candidates:
            return random.choice(candidates)
        
        # Fallback if logic is too strict for small vocab: Pick random new word
        return random.choice(BOT_VOCAB)

    def play_round(self, guess, target):
        res = requests.post(f"{API_URL}/validate", json={"guess": guess, "target": target})
        data = res.json()
        
        if data['invalid_word']:
            print(f"Bot tried invalid word: {guess} - Skipping turn logic")
            return [] # Return empty list instead of None to prevent crash
            
        results = data['results'] # ['correct', 'absent', ...]
        
        # Learn from results
        for i, status in enumerate(results):
            letter = guess[i]
            if status == 'correct':
                self.known_correct[i] = letter
            elif status == 'present':
                if letter not in self.known_present:
                    self.known_present.append(letter)
            elif status == 'absent':
                if letter not in self.known_absent:
                    self.known_absent.append(letter)
        
        return results

def run_auto_tester_match():
    bot = WordleBot()
    target_word = bot.get_game_word()
    print(f"\n🤖 AUTO-TESTER INITIALIZED")
    print(f"🎯 Target Word (Secret): {target_word}")
    print("-" * 30)

    for attempt in range(1, 7):
        guess = bot.choose_guess(attempt - 1)
        print(f"Attempt {attempt}: Bot guesses '{guess}'")
        
        if guess == target_word:
            print(f"✨ SUCCESS! Bot solved it in {attempt} tries.")
            return True
            
        results = bot.play_round(guess, target_word)
        # Visual feedback log
        feedback = ""
        for r in results:
            if r == 'correct': feedback += "🟩"
            elif r == 'present': feedback += "🟨"
            else: feedback += "⬛"
        print(f"Feedback:  {feedback}")
        time.sleep(0.5)

    print(f"💀 FAILED. Bot ran out of guesses.")
    return False

if __name__ == "__main__":
    # Ensure server is reachable
    try:
        requests.get(f"{API_URL}/word")
    except:
        print("❌ Error: Game Server not running on Port 8002")
        print("Run: python word_api.py")
        sys.exit(1)

    # Run 3 test matches
    for i in range(3):
        print(f"\n--- MATCH {i+1} ---")
        run_auto_tester_match()
