"""CyberTrack mission league engine.

Offline AI operations readiness in Cursor, powered by local Gemma4.
Standard library only by design: the mission loop must run on an
edge machine with no network and no package installs.
"""

__version__ = "0.1.0"

SEASON_ID = "season-one"

# Original, fictional rank ladder. Progression feedback only —
# never a job-suitability or selection signal.
RANK_LADDER = [
    ("Recruit", 0),
    ("Operator", 250),
    ("Specialist", 700),
    ("Sentinel", 1400),
    ("Warden", 2400),
    ("Commander", 3800),
    ("Field Marshal", 5600),
]


def rank_for_xp(xp: int) -> str:
    rank = RANK_LADDER[0][0]
    for name, threshold in RANK_LADDER:
        if xp >= threshold:
            rank = name
    return rank
