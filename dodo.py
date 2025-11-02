# dodo.py
"""
PyDoit example for match updates.

Available tasks:
    doit list          # Show all available tasks
    doit run live_match
    doit run last_match
    doit run next_match
    doit run match_summary
"""

import os
import subprocess

js_path = os.path.abspath("./middleware/vas-middleware/get-response.js")


def run_live_match():
   try:
        # Capture both stdout and stderr
        result = subprocess.run(
            ["node", js_path, "update_subscription_in_bulk"],
            capture_output=True,
            text=True,
            check=True  # raises CalledProcessError on non-zero exit
        )

        # Print the raw stdout output
        print("✅ Node.js Output:")
        print(result.stdout.strip())

        # Return the output so PyDoit can log it or use it later
        return result.stdout.strip()

    except subprocess.CalledProcessError as e:
        print(f"❌ Error while running Node.js script: {e.stderr}")
        return e.stderr


def task_live_match():
    """PyDoit task: run Node.js script and capture its output"""
    return {
        # ✅ Pass the actual Python function, not a string
        'actions': [run_live_match],
        'verbosity': 2,
    }

def task_last_match():
    """Get last match update"""
    return {
        'actions': ['echo "Fetching last match details..."'],
        'verbosity': 2,
    }

def task_next_match():
    """Get next match update"""
    return {
        'actions': ['echo "Fetching upcoming match info..."'],
        'verbosity': 2,
    }

def task_match_summary():
    """Get match summary"""
    return {
        'actions': ['echo "Fetching full match summary..."'],
        'verbosity': 2,
    }


