"""Engine smoke tests. Run from the repo root:

    python3 -m unittest discover -s tests -q
"""

import json
import unittest
from pathlib import Path

from cybertf import rank_for_xp
from cybertf.missions import list_missions, load_mission
from cybertf.scoring import answer_hash, normalize

REPO = Path(__file__).resolve().parent.parent


class TestRanks(unittest.TestCase):
    def test_ladder(self):
        self.assertEqual(rank_for_xp(0), "Recruit")
        self.assertEqual(rank_for_xp(249), "Recruit")
        self.assertEqual(rank_for_xp(250), "Operator")
        self.assertEqual(rank_for_xp(5600), "Field Marshal")


class TestNormalize(unittest.TestCase):
    def test_loose(self):
        self.assertEqual(normalize("  Link_MTU! "), "link mtu")
        self.assertEqual(normalize("Sector 4."), "sector 4")
        self.assertEqual(normalize("02:14 UTC"), "02:14 utc")

    def test_hash_is_salted_per_check(self):
        a = answer_hash("m1", "c1", "same")
        b = answer_hash("m1", "c2", "same")
        self.assertNotEqual(a, b)


class TestMissions(unittest.TestCase):
    def test_all_missions_load(self):
        missions = list_missions()
        self.assertGreaterEqual(len(missions), 6)
        ids = {m.id for m in missions}
        self.assertIn("basic_qualification", ids)
        self.assertIn("sprint_signal_lost", ids)

    def test_mission_structure(self):
        for m in list_missions():
            self.assertTrue(m.brief_path.is_file(), f"{m.id} missing brief.md")
            self.assertTrue(
                m.answer_template_path.is_file(), f"{m.id} missing answer template"
            )
            self.assertGreater(m.max_check_points(), 0)
            self.assertLess(
                m.expected_seconds["min"], m.timebox_minutes * 60,
                f"{m.id} suspicious floor exceeds timebox",
            )

    def test_no_plaintext_answers_in_specs(self):
        """Checks must not carry expected values in plaintext fields."""
        for m in list_missions():
            for check in m.checks:
                self.assertNotIn("expected_answer", check)
                self.assertNotIn("answer", check)

    def test_known_hash_roundtrip(self):
        m = load_mission("basic_qualification")
        check = next(c for c in m.checks if c["id"] == "model_claim_verdict")
        self.assertEqual(
            answer_hash("basic_qualification", "model_claim_verdict", "FALSE."),
            check["sha256"],
        )


class TestSampleScoreArtifact(unittest.TestCase):
    def test_score_schema_fields(self):
        # Any score.json in runs/ (if present) must carry the v1 schema fields.
        for score_file in (REPO / "runs").glob("*/score.json"):
            data = json.loads(score_file.read_text())
            for field in (
                "run_id", "mission_id", "callsign", "total", "max_total",
                "dimensions", "checks", "flags", "local_model", "xp_awarded",
            ):
                self.assertIn(field, data, f"{score_file} missing {field}")


if __name__ == "__main__":
    unittest.main()
