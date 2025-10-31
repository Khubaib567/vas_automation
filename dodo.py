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

js_path = os.path.abspath("./middleware/match-middleware/get_matches.js")


def run_live_match():
    try:
        result = subprocess.run(["node", js_path, "get_live_match"], check=True)
        # If process exits successfully, return True
        print(True)
    except subprocess.CalledProcessError as e:
        print(f"Error while running Node.js script: {e}")
        # Returning False tells doit this task failed
        print(False)


def task_live_match():
    """Get live match update"""
    return {
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


