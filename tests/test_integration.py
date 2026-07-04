"""Integration smoke test — score + AAR artifacts from a real run directory."""

import json
import unittest
from pathlib import Path

from cybertf.missions import load_mission
from cybertf.report import generate_aar
from cybertf.scoring import score_run

REPO = Path(__file__).resolve().parent.parent


class TestIntegrationLoop(unittest.TestCase):
    def test_rescore_produces_valid_artifacts(self):
        """Re-score an existing run and regenerate AAR (no network, no Gemma)."""
        run_dirs = sorted((REPO / "runs").glob("*/run.json"), reverse=True)
        self.assertTrue(run_dirs, "need at least one run under runs/")

        meta_path = run_dirs[0]
        run_dir = meta_path.parent
        run = json.loads(meta_path.read_text())
        mission = load_mission(run["mission_id"])
        self.assertTrue((run_dir / "answer.json").is_file())

        score = score_run(mission, run_dir, run)
        (run_dir / "score.json").write_text(json.dumps(score, indent=2) + "\n")
        aar_path = generate_aar(mission, run_dir, narrate=False)

        self.assertEqual(score["schema"], "cybertrack.score.v1")
        self.assertIn("dimensions", score)
        self.assertIn("checks", score)
        self.assertTrue(aar_path.is_file())
        self.assertIn("After-Action Report", aar_path.read_text())


if __name__ == "__main__":
    unittest.main()
