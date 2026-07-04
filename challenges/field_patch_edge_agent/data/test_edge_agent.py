"""
Unit tests for edge_agent.py severity classifier.

Run from the challenges/field_patch_edge_agent/data/ directory:
    python -m unittest -q test_edge_agent

Two or more tests fail against the committed buggy code.
All tests pass once the minimal correct fix is applied.
See severity_spec.md for the authoritative threshold specification.
"""

import unittest

import edge_agent


class TestClassifyEventBoundaries(unittest.TestCase):

    def test_low_range(self):
        """Scores strictly below 10 must be LOW."""
        self.assertEqual(edge_agent.classify_event(0), "LOW")
        self.assertEqual(edge_agent.classify_event(5), "LOW")
        self.assertEqual(edge_agent.classify_event(9), "LOW")
        self.assertEqual(edge_agent.classify_event(9.9), "LOW")

    def test_medium_lower_boundary(self):
        """Score of exactly 10 must be MEDIUM (inclusive lower bound)."""
        self.assertEqual(edge_agent.classify_event(10), "MEDIUM")

    def test_medium_range(self):
        """Scores from 10 up to (but not including) 50 must be MEDIUM."""
        self.assertEqual(edge_agent.classify_event(25), "MEDIUM")
        self.assertEqual(edge_agent.classify_event(49), "MEDIUM")
        self.assertEqual(edge_agent.classify_event(49.9), "MEDIUM")

    def test_high_lower_boundary(self):
        """Score of exactly 50 must be HIGH per severity_spec.md v1.2.

        This test FAILS against the committed buggy code.
        The bug: `score > 50` should be `score >= 50`.
        """
        self.assertEqual(
            edge_agent.classify_event(50),
            "HIGH",
            "Score 50 must classify as HIGH (inclusive boundary, see severity_spec.md)",
        )

    def test_high_boundary_consistency(self):
        """Scores 50 and 51 must both classify as HIGH — no discontinuity.

        This test FAILS against the committed buggy code.
        """
        result_50 = edge_agent.classify_event(50)
        result_51 = edge_agent.classify_event(51)
        self.assertEqual(
            result_50,
            result_51,
            f"Boundary discontinuity: score 50 → {result_50!r}, score 51 → {result_51!r}. "
            "Both should be HIGH.",
        )

    def test_high_range(self):
        """Scores from 51 up to (but not including) 100 must be HIGH."""
        self.assertEqual(edge_agent.classify_event(51), "HIGH")
        self.assertEqual(edge_agent.classify_event(75), "HIGH")
        self.assertEqual(edge_agent.classify_event(99), "HIGH")
        self.assertEqual(edge_agent.classify_event(99.9), "HIGH")

    def test_critical_lower_boundary(self):
        """Score of exactly 100 must be CRITICAL."""
        self.assertEqual(edge_agent.classify_event(100), "CRITICAL")

    def test_critical_range(self):
        """Scores >= 100 must be CRITICAL."""
        self.assertEqual(edge_agent.classify_event(150), "CRITICAL")
        self.assertEqual(edge_agent.classify_event(500), "CRITICAL")


class TestBatchClassify(unittest.TestCase):

    def test_batch_score_50_classified_correctly(self):
        """Batch classify must return HIGH for score 50, not MEDIUM.

        This test FAILS against the committed buggy code.
        """
        events = [("T1", 5), ("T2", 25), ("T3", 50), ("T4", 110)]
        results = edge_agent.batch_classify(events)
        sev_at_50 = results[2][1]
        self.assertEqual(
            sev_at_50,
            "HIGH",
            f"batch_classify: score 50 returned {sev_at_50!r}, expected 'HIGH'",
        )

    def test_batch_preserves_order(self):
        """batch_classify returns results in the same order as input."""
        events = [("A", 5), ("B", 50), ("C", 120)]
        results = edge_agent.batch_classify(events)
        self.assertEqual(len(results), 3)
        self.assertEqual(results[0][0], "A")
        self.assertEqual(results[1][0], "B")
        self.assertEqual(results[2][0], "C")


class TestCountBySeverity(unittest.TestCase):

    def test_count_includes_all_levels(self):
        """count_by_severity always returns all four severity keys."""
        counts = edge_agent.count_by_severity([])
        for level in edge_agent.SEVERITY_LEVELS:
            self.assertIn(level, counts)

    def test_count_correct_totals(self):
        """Counts sum to the number of input events."""
        events = [("T1", 5), ("T2", 25), ("T3", 75), ("T4", 110)]
        counts = edge_agent.count_by_severity(events)
        self.assertEqual(sum(counts.values()), len(events))
