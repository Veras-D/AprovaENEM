#!/usr/bin/env python3
"""
CI Quality Gate & Diagnostic Tool for AprovaENEM
Inspects GitHub Actions workflow runs, pinpoints root causes of failures,
and watches live CI execution.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import time
from typing import Any, Dict, List, Optional, Tuple

# ANSI Colors
USE_COLOR = sys.stdout.isatty() and not os.environ.get("NO_COLOR")

def color(text: str, code: str) -> str:
    return f"\033[{code}m{text}\033[0m" if USE_COLOR else text

def red(t: str) -> str: return color(t, "1;31")
def green(t: str) -> str: return color(t, "1;32")
def yellow(t: str) -> str: return color(t, "1;33")
def blue(t: str) -> str: return color(t, "1;34")
def magenta(t: str) -> str: return color(t, "1;35")
def cyan(t: str) -> str: return color(t, "1;36")
def bold(t: str) -> str: return color(t, "1")
def dim(t: str) -> str: return color(t, "2")


def run_cmd(cmd: List[str], check: bool = True) -> str:
    """Executes a command and returns stripped stdout."""
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if check and res.returncode != 0:
        err = res.stderr.strip() or f"Command failed with exit code {res.returncode}"
        raise RuntimeError(f"Error running {' '.join(cmd)}: {err}")
    return res.stdout.strip()


def get_repo() -> str:
    """Retrieves current owner/repo from gh."""
    try:
        out = run_cmd(["gh", "repo", "view", "--json", "owner,name"])
        data = json.loads(out)
        return f"{data['owner']['login']}/{data['name']}"
    except Exception as e:
        sys.stderr.write(yellow(f"Warning: Could not detect repository via gh repo view: {e}\n"))
        return "Veras-D/AprovaENEM"


def get_latest_run(repo: str, branch: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Fetches the latest workflow run on the specified branch or default."""
    args = [
        "gh", "run", "list",
        "--limit", "1",
        "--json", "databaseId,status,conclusion,displayTitle,headBranch,headSha,url,createdAt,event"
    ]
    if branch:
        args.extend(["--branch", branch])
    out = run_cmd(args, check=False)
    if not out:
        return None
    try:
        runs = json.loads(out)
        return runs[0] if runs else None
    except Exception:
        return None


def get_run_details(run_id: int) -> Dict[str, Any]:
    """Retrieves detailed job and step breakdown for a specific run."""
    out = run_cmd(["gh", "run", "view", str(run_id), "--json", "jobs,status,conclusion,url,displayTitle,headBranch,headSha"])
    return json.loads(out)


def fetch_job_log(repo: str, job_id: int) -> str:
    """Fetches raw logs for a specific job via GitHub API."""
    try:
        return run_cmd(["gh", "api", f"/repos/{repo}/actions/jobs/{job_id}/logs"], check=False)
    except Exception:
        return ""


def clean_timestamp(line: str) -> str:
    """Strips leading ISO timestamp prefix from GitHub Actions logs."""
    return re.sub(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s*", "", line)


def extract_failure_highlights(log: str) -> List[str]:
    """
    Intelligently extracts error snippets and failure context from raw job logs.
    Targets ESLint warnings, Vitest/Cypress assertion errors, Axe-core violations,
    Maven compilation failures, and Checkstyle/PMD violations.
    """
    raw_lines = log.splitlines()
    clean_lines = [clean_timestamp(line) for line in raw_lines]

    matches: List[Tuple[int, str]] = []
    error_patterns = [
        re.compile(r"##\[error\]", re.IGNORECASE),
        re.compile(r"ESLint found too many warnings", re.IGNORECASE),
        re.compile(r"warning\s+React Hook", re.IGNORECASE),
        re.compile(r"AssertionError:", re.IGNORECASE),
        re.compile(r"=== A11Y VIOLATIONS", re.IGNORECASE),
        re.compile(r"accessibility violation was detected", re.IGNORECASE),
        re.compile(r"Timed out retrying", re.IGNORECASE),
        re.compile(r"\[ERROR\]\s+(COMPILATION ERROR|Failure|Failed to execute goal)", re.IGNORECASE),
        re.compile(r"BUILD FAILURE", re.IGNORECASE),
        re.compile(r"There are test failures", re.IGNORECASE),
        re.compile(r"FAIL\s+src/", re.IGNORECASE),
        re.compile(r"FAILED\s+tests/", re.IGNORECASE),
        re.compile(r"npm error Missing script", re.IGNORECASE),
    ]

    for idx, line in enumerate(clean_lines):
        for pattern in error_patterns:
            if pattern.search(line):
                matches.append((idx, line))
                break

    if not matches:
        # Fallback: scan for any line with ##[error] or 'error' keyword in the last 100 lines
        for idx in range(max(0, len(clean_lines) - 80), len(clean_lines)):
            line = clean_lines[idx]
            if "error" in line.lower() and not "deprecationwarning" in line.lower() and not "0 errors" in line.lower():
                matches.append((idx, line))

    if not matches:
        # Last fallback: return the tail of the log
        return clean_lines[-25:]

    # Group overlapping context windows
    snippet_lines: List[str] = []
    included_indices = set()

    for idx, _ in matches:
        start = max(0, idx - 4)
        end = min(len(clean_lines), idx + 8)
        # For a11y violations or Cypress assertions, expand context further
        if "A11Y VIOLATIONS" in clean_lines[idx] or "AssertionError" in clean_lines[idx]:
            end = min(len(clean_lines), idx + 25)

        for i in range(start, end):
            included_indices.add(i)

    # Output contiguous chunks
    sorted_indices = sorted(included_indices)
    prev = None
    for i in sorted_indices:
        if prev is not None and i > prev + 1:
            snippet_lines.append(dim("--- [...] ---"))
        line = clean_lines[i]
        # Highlight error indicators
        if any(w in line for w in ["##[error]", "AssertionError", "A11Y VIOLATIONS", "ESLint found", "FAIL", "FAILED"]):
            snippet_lines.append(red(line))
        elif any(w in line for w in ["warning", "Warning", "warn", "WARN"]):
            snippet_lines.append(yellow(line))
        else:
            snippet_lines.append(line)
        prev = i

    return snippet_lines


def print_check_report(run_data: Dict[str, Any], repo: str) -> bool:
    """Prints diagnostic report of the run. Returns True if passed, False if failed."""
    run_id = run_data["databaseId"]
    conclusion = run_data.get("conclusion")
    status = run_data.get("status")
    title = run_data.get("displayTitle", "")
    branch = run_data.get("headBranch", "unknown")
    sha = run_data.get("headSha", "")[:8]
    url = run_data.get("url", f"https://github.com/{repo}/actions/runs/{run_id}")

    print("=" * 80)
    print(bold("🔍 AprovaENEM — GitHub Actions CI Diagnostic Inspector"))
    print("=" * 80)
    print(f"Run ID    : {bold(cyan(str(run_id)))}")
    print(f"Branch    : {bold(branch)} (commit: {dim(sha)})")
    print(f"Trigger   : {title}")
    print(f"URL       : {dim(url)}")

    status_str = f"Status: {status.upper()}"
    if conclusion:
        status_str += f" | Conclusion: {conclusion.upper()}"

    if conclusion == "success":
        print(f"Outcome   : {green('● PASSED')} ({status_str})")
    elif conclusion == "failure":
        print(f"Outcome   : {red('✖ FAILED')} ({status_str})")
    elif status in ["in_progress", "queued"]:
        print(f"Outcome   : {yellow('⏳ IN PROGRESS')} ({status_str})")
    else:
        print(f"Outcome   : {magenta(f'● {status.upper()}')} ({status_str})")

    print("-" * 80)

    jobs = run_data.get("jobs", [])
    if not jobs:
        # Fetch detailed jobs if not included
        detail = get_run_details(run_id)
        jobs = detail.get("jobs", [])

    failed_jobs = [j for j in jobs if j.get("conclusion") == "failure"]
    in_progress_jobs = [j for j in jobs if j.get("status") in ["in_progress", "queued"]]
    passed_jobs = [j for j in jobs if j.get("conclusion") == "success"]

    print(bold("Jobs Summary:"))
    for j in jobs:
        name = j.get("name", "Unknown Job")
        j_conclusion = j.get("conclusion") or j.get("status", "")
        if j_conclusion == "success":
            badge = green("✓ PASS")
        elif j_conclusion == "failure":
            badge = red("✖ FAIL")
        elif j_conclusion in ["in_progress", "queued"]:
            badge = yellow("⠸ RUN ")
        else:
            badge = dim("○ SKIP")
        print(f"  {badge} {name}")

    if not failed_jobs and conclusion == "success":
        print("-" * 80)
        print(green("🎉 All CI quality gates passed cleanly! Ready for deployment."))
        print("=" * 80)
        return True

    if status in ["in_progress", "queued"]:
        print("-" * 80)
        print(yellow("ℹ️ Run is still actively executing. Use `scripts/ci.sh watch` to monitor live."))
        print("=" * 80)
        return False

    if failed_jobs:
        print("-" * 80)
        print(bold(red(f"❌ Root Cause Analysis for {len(failed_jobs)} Failed Job(s):")))

        for job in failed_jobs:
            job_name = job.get("name", "Unknown Job")
            job_id = job.get("databaseId")
            print("\n" + red("━" * 80))
            print(f"🔴 {bold(red('JOB'))}: {bold(job_name)} (ID: {cyan(str(job_id))})")

            # Show which step failed
            failed_steps = [s for s in job.get("steps", []) if s.get("conclusion") == "failure"]
            if failed_steps:
                print(f"   {bold('Failed Step(s):')}")
                for s in failed_steps:
                    print(f"     • {red(s.get('name', 'Unknown step'))} (Step #{s.get('number', '?')})")

            print(dim(f"   Fetching log snippet for job {job_id}..."))
            log = fetch_job_log(repo, job_id)
            if not log:
                print(yellow("   [Log empty or not available yet]"))
                continue

            highlights = extract_failure_highlights(log)
            print(f"   {bold('Failure Log Snippet:')}")
            print(dim("   " + "─" * 76))
            for line in highlights:
                print(f"   {line}")
            print(dim("   " + "─" * 76))

        print("\n" + "=" * 80)
        return False

    return True


def cmd_check(args: argparse.Namespace, repo: str) -> int:
    """Handler for 'check' command."""
    run_id = args.run_id
    if run_id:
        try:
            run_data = get_run_details(run_id)
            run_data["databaseId"] = run_id
        except Exception as e:
            print(red(f"Failed to find run {run_id}: {e}"))
            return 1
    else:
        latest = get_latest_run(repo, branch=args.branch)
        if not latest:
            print(red("No workflow runs found."))
            return 1
        run_data = get_run_details(latest["databaseId"])
        run_data["databaseId"] = latest["databaseId"]

    passed = print_check_report(run_data, repo)
    return 0 if passed else 1


def cmd_watch(args: argparse.Namespace, repo: str) -> int:
    """Handler for 'watch' command."""
    run_id = args.run_id
    if not run_id:
        latest = get_latest_run(repo, branch=args.branch)
        if not latest:
            print(red("No workflow runs found to watch."))
            return 1
        run_id = latest["databaseId"]

    print(bold(cyan(f"Watching GitHub Actions Run #{run_id}...")))
    print(dim("Press Ctrl+C to stop watching at any time.\n"))

    # Use native gh run watch
    cmd = ["gh", "run", "watch", str(run_id), "--interval", str(args.interval)]
    if args.exit_status:
        cmd.append("--exit-status")

    res = subprocess.run(cmd)

    # After watch concludes, automatically inspect and print root cause diagnosis if failed
    print("\n" + bold("CI execution concluded. Inspecting final result..."))
    try:
        run_data = get_run_details(run_id)
        run_data["databaseId"] = run_id
        passed = print_check_report(run_data, repo)
        return 0 if passed else 1
    except Exception as e:
        print(red(f"Error inspecting run {run_id} after completion: {e}"))
        return res.returncode


def cmd_list(args: argparse.Namespace, repo: str) -> int:
    """Handler for 'list' command."""
    cmd = [
        "gh", "run", "list",
        "--limit", str(args.limit),
    ]
    if args.branch:
        cmd.extend(["--branch", args.branch])

    subprocess.run(cmd)
    return 0


def cmd_log(args: argparse.Namespace, repo: str) -> int:
    """Handler for 'log' command."""
    job_id = args.job_id
    print(bold(cyan(f"Fetching logs for Job #{job_id} on {repo}...")))
    log = fetch_job_log(repo, job_id)
    if not log:
        print(red(f"No logs returned for Job #{job_id}."))
        return 1

    for line in log.splitlines():
        clean = clean_timestamp(line)
        if "##[error]" in clean:
            print(red(clean))
        elif "warning" in clean.lower():
            print(yellow(clean))
        else:
            print(clean)
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(
        description="AprovaENEM CI Inspector & Watcher",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  ./scripts/ci.sh                    # Check latest CI run and diagnose failure reasons
  ./scripts/ci.sh check 40155334985  # Check specific run ID
  ./scripts/ci.sh watch              # Watch latest active run until completion
  ./scripts/ci.sh watch 40155334985  # Watch specific run
  ./scripts/ci.sh list               # List recent CI runs
  ./scripts/ci.sh log 121055424248   # View formatted logs for a specific job ID
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # check command
    check_p = subparsers.add_parser("check", help="Check and diagnose CI run failures (default)")
    check_p.add_argument("run_id", nargs="?", type=int, help="Optional run ID (defaults to latest)")
    check_p.add_argument("-b", "--branch", help="Filter by branch name")

    # watch command
    watch_p = subparsers.add_parser("watch", help="Watch live CI execution until completion")
    watch_p.add_argument("run_id", nargs="?", type=int, help="Optional run ID (defaults to latest)")
    watch_p.add_argument("-b", "--branch", help="Filter by branch name")
    watch_p.add_argument("-i", "--interval", type=int, default=3, help="Refresh interval in seconds (default: 3)")
    watch_p.add_argument("--exit-status", action="store_true", help="Exit with non-zero if run fails")

    # list command
    list_p = subparsers.add_parser("list", help="List recent CI runs")
    list_p.add_argument("-n", "--limit", type=int, default=10, help="Number of runs to list (default: 10)")
    list_p.add_argument("-b", "--branch", help="Filter by branch name")

    # log command
    log_p = subparsers.add_parser("log", help="Dump logs for a specific job ID")
    log_p.add_argument("job_id", type=int, help="GitHub Actions Job ID")

    # If no subcommand provided, default to 'check'
    if len(sys.argv) == 1:
        args = parser.parse_args(["check"])
    elif sys.argv[1] not in ["check", "watch", "list", "log", "-h", "--help"]:
        # First argument might be a run ID or flag
        if sys.argv[1].isdigit():
            args = parser.parse_args(["check", sys.argv[1]] + sys.argv[2:])
        else:
            args = parser.parse_args(["check"] + sys.argv[1:])
    else:
        args = parser.parse_args()

    repo = get_repo()

    if args.command == "check":
        sys.exit(cmd_check(args, repo))
    elif args.command == "watch":
        sys.exit(cmd_watch(args, repo))
    elif args.command == "list":
        sys.exit(cmd_list(args, repo))
    elif args.command == "log":
        sys.exit(cmd_log(args, repo))
    else:
        parser.print_help()
        sys.exit(0)


if __name__ == "__main__":
    main()
