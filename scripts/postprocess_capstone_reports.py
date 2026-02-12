import re
from pathlib import Path

TEST_CASES = [
    ("TC-SC-01", "Smart Contract (BharatVote)", "Election deployed; admin wallet connected; phase=Commit", "Call addCandidate('A')", "Candidate added and CandidateAdded event emitted"),
    ("TC-SC-02", "Smart Contract (BharatVote)", "Election deployed; non-admin wallet connected; phase=Commit", "Call addCandidate('A')", "Revert with NotAdmin"),
    ("TC-SC-03", "Smart Contract (BharatVote)", "Election deployed; admin wallet connected; phase=Reveal", "Call addCandidate('A')", "Revert with WrongPhase"),
    ("TC-SC-04", "Smart Contract (BharatVote)", "Allowlisted voter with valid proof; phase=Commit", "Call commitVote(commitHash, proof)", "Commit stored; VoteCommitted event emitted"),
    ("TC-SC-05", "Smart Contract (BharatVote)", "Allowlisted voter; phase=Reveal", "Call commitVote(commitHash, proof)", "Revert with WrongPhase"),
    ("TC-SC-06", "Smart Contract (BharatVote)", "Allowlisted voter; phase=Commit", "Call commitVote(bytes32(0), proof)", "Revert with EmptyHash"),
    ("TC-SC-07", "Smart Contract (BharatVote)", "Non-allowlisted voter; phase=Commit", "Call commitVote(commitHash, invalidProof)", "Revert with NotEligible"),
    ("TC-SC-08", "Smart Contract (BharatVote)", "Allowlisted voter already committed; phase=Commit", "Call commitVote(newCommit, proof) again", "Revert with AlreadyCommitted"),
    ("TC-SC-09", "Smart Contract (BharatVote)", "Allowlisted voter committed; phase=Reveal", "Call revealVote(candidateId, correctSalt)", "Tally increments; VoteRevealed event emitted"),
    ("TC-SC-10", "Smart Contract (BharatVote)", "Allowlisted voter has not committed; phase=Reveal", "Call revealVote(candidateId, salt)", "Revert with NoCommit"),
    ("TC-SC-11", "Smart Contract (BharatVote)", "Allowlisted voter committed; phase=Reveal", "Call revealVote(candidateId, wrongSalt)", "Revert with HashMismatch"),
    ("TC-SC-12", "Smart Contract (BharatVote)", "Allowlisted voter already revealed; phase=Reveal", "Call revealVote(candidateId, correctSalt) again", "Revert with AlreadyRevealed"),
    ("TC-SC-13", "Smart Contract (BharatVote)", "Candidate removed (inactive); phase=Reveal", "Call revealVote(removedCandidateId, salt)", "Revert with InactiveCandidate"),
    ("TC-SC-14", "Smart Contract (BharatVote)", "Phase=Commit; admin wallet connected", "Call finishElection()", "Revert with WrongPhase"),
    ("TC-SC-15", "Smart Contract (BharatVote)", "Phase=Commit; admin wallet connected", "Call resetElection()", "Revert with CanOnlyResetAfterFinish"),
    ("TC-API-01", "Backend API", "Allowlisted address exists in voter list", "GET /api/merkle-proof/:address", "Returns proof and merkleRoot"),
    ("TC-API-02", "Backend API", "Address not in voter list", "GET /api/merkle-proof/:address", "Returns error or empty proof with NotEligible indication"),
    ("TC-API-03", "Backend API", "Backend running with allowlist loaded", "GET /api/merkle-root", "Returns current merkleRoot"),
    ("TC-API-04", "Backend API", "Backend configured with admin key; demo election set", "POST /api/join { address }", "Address added (if new) and updated merkleRoot returned"),
    ("TC-API-05", "Backend API", "Backend missing admin key or not demo admin", "POST /api/join { address }", "Returns error indicating demo join is unavailable"),
    ("TC-API-06", "Backend API", "Demo analytics enabled", "GET /api/demo/analytics", "Returns aggregated demo counts or empty state"),
    ("TC-UI-01", "Frontend UI", "MetaMask connected to wrong network", "Open app and attempt action", "User prompted to switch network; actions blocked"),
    ("TC-UI-02", "Frontend UI", "Allowlisted address; phase=Commit", "Enter candidate + salt and submit commit", "Commit transaction submitted and UI shows pending/confirmed"),
    ("TC-UI-03", "Frontend UI", "Address committed; phase=Reveal", "Reveal with wrong salt", "UI shows error; reveal rejected"),
    ("TC-UI-04", "Frontend UI", "Main election flow and demo election flow available", "Open main election and attempt vote without KYC; open demo election", "Main election blocks until KYC; demo election skips KYC"),
    ("TC-UI-05", "Frontend UI", "Public results page opened", "Load current tally and all-time scan", "Results shown or graceful retry message on RPC limits"),
    ("TC-UI-06", "Frontend UI", "Non-admin wallet connected", "Open Admin panel and try phase change", "Admin actions disabled or rejected with error"),
    ("TC-SC-16", "Smart Contract (BharatVote)", "Phase=Reveal; admin wallet connected", "Call startReveal()", "Revert with WrongPhase"),
    ("TC-SC-17", "Smart Contract (BharatVote)", "Phase=Commit; admin wallet connected", "Call startReveal()", "Phase changes to Reveal; PhaseChanged emitted"),
    ("TC-SC-18", "Smart Contract (BharatVote)", "Phase=Reveal; admin wallet connected", "Call finishElection()", "Phase changes to Finished; TallyFinalized emitted"),
    ("TC-SC-19", "Smart Contract (BharatVote)", "Phase=Finished; admin wallet connected", "Call resetElection()", "Commits/tallies reset; phase returns to Commit"),
    ("TC-SC-20", "Smart Contract (BharatVote)", "Phase=Commit; admin wallet connected", "Call setMerkleRoot(newRoot)", "merkleRoot updated on-chain"),
]


def make_test_table(cases):
    headers = [
        "TC ID",
        "Module",
        "Preconditions",
        "Steps",
        "Expected Result",
        "Actual Result",
        "Status",
        "Evidence",
    ]
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for idx, (tc_id, module, pre, steps, expected) in enumerate(cases, start=1):
        actual = f"<<MANUAL_TESTRES_{idx:02d}: Paste actual result>>"
        status = f"<<MANUAL_TESTSTATUS_{idx:02d}: PASS/FAIL>>"
        evid = f"<<MANUAL_EVID_{idx:02d}: Insert screenshot or log reference>>"
        row = [tc_id, module, pre, steps, expected, actual, status, evid]
        lines.append("| " + " | ".join(row) + " |")
    return "\n".join(lines)


def replace_marker(path, marker, replacement):
    text = path.read_text(encoding="utf-8")
    if marker not in text:
        return
    text = text.replace(marker, replacement)
    path.write_text(text, encoding="utf-8")


def extract_placeholders(path):
    text = path.read_text(encoding="utf-8")
    placeholders = []
    current_heading = ""
    for line_no, line in enumerate(text.splitlines(), start=1):
        if line.startswith("#"):
            current_heading = line.lstrip("#").strip()
        for match in re.findall(r"<<MANUAL[^>]*>>", line):
            inner = match[2:-2]
            if ":" in inner:
                pid, desc = inner.split(":", 1)
                pid = pid.strip()
                desc = desc.strip()
            else:
                pid = inner.strip()
                desc = ""
            placeholders.append(
                {
                    "id": pid,
                    "desc": desc,
                    "file": path.name,
                    "heading": current_heading or "(no heading)",
                    "line": line_no,
                }
            )
    return placeholders


report_path = Path("BharatVote_Capstone_Report_FINAL.md")
plan_path = Path("TEST_PLAN_AND_CASES.md")

# 1) Insert test case table into report + test plan
case_table = make_test_table(TEST_CASES)
replace_marker(report_path, "{{TEST_CASE_TABLE}}", case_table)
replace_marker(plan_path, "{{TEST_CASE_TABLE}}", case_table)

# 2) Build placeholder key for report
report_placeholders = extract_placeholders(report_path)
seen = set()
key_lines = []
for p in report_placeholders:
    if p["id"] in seen:
        continue
    seen.add(p["id"])
    key_lines.append(f"- {p['id']}: {p['desc']}")

replace_marker(report_path, "{{PLACEHOLDER_KEY}}", "\n".join(key_lines))

# 3) Build manual checklist (report + test plan)
all_placeholders = extract_placeholders(report_path) + extract_placeholders(plan_path)
checklist_lines = ["# Manual TODO Checklist", ""]
for p in all_placeholders:
    checklist_lines.append(
        f"- [ ] {p['id']}: {p['desc']} (File: {p['file']}, Section: {p['heading']})"
    )

Path("MANUAL_TODO_CHECKLIST.md").write_text("\n".join(checklist_lines), encoding="utf-8")

print("Post-processing complete.")
