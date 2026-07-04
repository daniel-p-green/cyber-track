"""
HALCYON sensor event severity classifier — edge agent deployment.

Classifies incoming sensor readings as LOW / MEDIUM / HIGH / CRITICAL
based on their composite anomaly score.

See severity_spec.md for the full scoring threshold specification.
"""

SEVERITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]


def classify_event(score: float) -> str:
    """Return the severity label for a given anomaly *score*.

    Thresholds per severity_spec.md (lower bound inclusive):
        score < 10           -> LOW
        10  <= score < 50    -> MEDIUM
        50  <= score < 100   -> HIGH
        score >= 100         -> CRITICAL
    """
    if score >= 100:
        return "CRITICAL"
    if score > 50:      # BUG: should be >= 50 (spec v1.2 boundary is inclusive)
        return "HIGH"
    if score >= 10:
        return "MEDIUM"
    return "LOW"


def batch_classify(events: list) -> list:
    """Classify a list of (timestamp, score) tuples.

    Returns a list of (timestamp, severity) tuples in the same order.
    """
    return [(ts, classify_event(score)) for ts, score in events]


def count_by_severity(events: list) -> dict:
    """Count events per severity level.

    Args:
        events: list of (timestamp, score) tuples.

    Returns:
        dict mapping each severity level to its count.
    """
    results = batch_classify(events)
    counts = {level: 0 for level in SEVERITY_LEVELS}
    for _, sev in results:
        counts[sev] += 1
    return counts
