import json
import subprocess
from pathlib import Path


data = Path(__file__).resolve().parents[2] / "_data"
publications = json.loads((data / "publication_links.json").read_text())
repositories = sorted({item["repo"] for item in publications.values() if "repo" in item})

counts = {}
for repo in repositories:
    result = subprocess.check_output(
        ["gh", "api", f"repos/{repo}", "--jq", ".stargazers_count"], text=True
    )
    count = int(result)
    if count < 0:
        raise ValueError(f"Invalid star count for {repo}: {count}")
    counts[repo] = count

(data / "github_stars.json").write_text(json.dumps(counts, indent=2) + "\n")
print(f"Read star counts for {len(counts)} repositories.")
