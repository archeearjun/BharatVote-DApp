# README:
#   1) Generate placeholders.json first (if not present):
#      python extract_placeholders.py --docx "C:\\path\\to\\input.docx"
#   2) Build mappings from test logs:
#      python build_testcase_mapping.py --placeholders placeholders.json \
#        --sc-log capstone_evidence\\logs\\sc-tests.log \
#        --api-log capstone_evidence\\logs\\api-tests.log \
#        --ui-log capstone_evidence\\logs\\ui-tests.log
#
# Notes:
#   - This script does NOT invent results.
#   - If uncertain, it writes TODO notes.

import argparse
import json
import re
from pathlib import Path

TC_RE = re.compile(r"TC-(SC|API|UI)-(\d{2})")
ANSI_RE = re.compile(r"\x1B\[[0-?]*[ -/]*[@-~]")

# Expected error keywords for negative cases (used only if found in logs)
EXPECTED_ERRORS = {
    "SC": {
        2: "NotAdmin",
        3: "WrongPhase",
        5: "WrongPhase",
        6: "EmptyHash",
        7: "NotEligible",
        8: "AlreadyCommitted",
        10: "NoCommit",
        11: "HashMismatch",
        12: "AlreadyRevealed",
        13: "InactiveCandidate",
        14: "WrongPhase",
        15: "CanOnlyResetAfterFinish",
        16: "WrongPhase",
    },
    "API": {
        2: "NotEligible",
        5: "demo join is unavailable",
    },
    "UI": {},
}


def read_text(path: Path):
    if not path or not path.exists():
        return ""
    return path.read_text(encoding="utf-8", errors="ignore")


def suite_status(log_text: str):
    if not log_text:
        return "UNKNOWN"
    cleaned = ANSI_RE.sub("", log_text)
    lowered = cleaned.lower()
    # Prefer explicit summary lines (vitest/jest/hardhat)
    if re.search(r"test files\s+\d+\s+failed", lowered):
        return "FAIL"
    if re.search(r"test suites:\s+\d+\s+failed", lowered):
        return "FAIL"
    if re.search(r"\b\d+\s+failing\b", lowered) and not re.search(r"\b0\s+failing\b", lowered):
        return "FAIL"

    if re.search(r"test files\s+\d+\s+passed", lowered):
        return "PASS"
    if re.search(r"test suites:\s+\d+\s+passed", lowered):
        return "PASS"
    if re.search(r"\b\d+\s+passing\b", lowered) and not re.search(r"\b\d+\s+failing\b", lowered):
        return "PASS"

    return "UNKNOWN"


def find_line_range(log_text: str, pattern: str):
    if not log_text:
        return None
    lines = log_text.splitlines()
    hits = [i + 1 for i, line in enumerate(lines) if pattern in line]
    if not hits:
        return None
    return f"L{hits[0]}" if len(hits) == 1 else f"L{hits[0]}-L{hits[-1]}"


def build_result(tc_type: str, tc_num: int, log_text: str, suite: str):
    # If we can find expected error in logs, use it.
    err = EXPECTED_ERRORS.get(tc_type, {}).get(tc_num)
    if err and err in log_text:
        return f"Reverted with {err} (expected)"
    # Otherwise, only assert pass if suite passed.
    if suite == "PASS":
        return "Passed in suite (see log)"
    if suite == "FAIL":
        return "TODO: suite failed; locate specific error for this test"
    return "TODO: confirm actual result from logs"


def build_status(suite: str):
    if suite == "PASS":
        return "PASS"
    if suite == "FAIL":
        return "FAIL"
    return "TODO: set PASS/FAIL after running tests"


def evidence_for(tc_type: str, line_range: str | None):
    base = {
        "SC": "Figure 3.1 (Hardhat test run)",
        "API": "Figure 3.2 (Backend API test run)",
        "UI": "Figure 3.3 (Frontend UI test run)",
    }[tc_type]
    if line_range:
        return f"{base}; log {line_range}"
    return base


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--placeholders", default="placeholders.json")
    ap.add_argument("--sc-log", default="capstone_evidence\\logs\\sc-tests.log")
    ap.add_argument("--api-log", default="capstone_evidence\\logs\\api-tests.log")
    ap.add_argument("--ui-log", default="capstone_evidence\\logs\\ui-tests.log")
    args = ap.parse_args()

    placeholders_path = Path(args.placeholders)
    if placeholders_path.exists():
        placeholders = json.loads(placeholders_path.read_text(encoding="utf-8"))
    else:
        placeholders = {}

    sc_log = read_text(Path(args.sc_log))
    api_log = read_text(Path(args.api_log))
    ui_log = read_text(Path(args.ui_log))

    sc_suite = suite_status(sc_log)
    api_suite = suite_status(api_log)
    ui_suite = suite_status(ui_log)

    # Build a lookup of placeholder tokens by type + index
    def token_for(prefix, idx):
        # match tokens like <<MANUAL_TESTRES_01: ...>>
        pat = re.compile(rf"<<{prefix}_{idx:02d}:[^>]*>>")
        for key in placeholders.keys():
            if pat.fullmatch(key):
                return key
        return None

    for idx in range(1, 33):
        # Determine test type by index mapping
        if 1 <= idx <= 15:
            tc_type = "SC"
            log_text = sc_log
            suite = sc_suite
        elif 16 <= idx <= 21:
            tc_type = "API"
            log_text = api_log
            suite = api_suite
        elif 22 <= idx <= 27:
            tc_type = "UI"
            log_text = ui_log
            suite = ui_suite
        else:
            tc_type = "SC"
            log_text = sc_log
            suite = sc_suite

        line_range = find_line_range(log_text, f"TC-{tc_type}-{idx:02d}")

        res_token = token_for("MANUAL_TESTRES", idx)
        status_token = token_for("MANUAL_TESTSTATUS", idx)
        evid_token = token_for("MANUAL_EVID", idx)

        result_val = build_result(tc_type, idx, log_text, suite)
        status_val = build_status(suite)
        evidence_val = evidence_for(tc_type, line_range)

        if res_token:
            placeholders[res_token] = result_val
        if status_token:
            placeholders[status_token] = status_val
        if evid_token:
            placeholders[evid_token] = evidence_val

    placeholders_path.write_text(json.dumps(placeholders, indent=2), encoding="utf-8")
    print(f"Updated placeholders: {placeholders_path}")


if __name__ == "__main__":
    main()
