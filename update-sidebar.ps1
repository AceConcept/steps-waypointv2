param(
  [string]$CommitMessage = "Bump luna-sidebar submodule",
  [switch]$Push
)

$ErrorActionPreference = "Stop"

Write-Host "Updating luna-sidebar submodule to latest remote commit..." -ForegroundColor Cyan
git submodule update --remote luna-sidebar

Write-Host "Staging updated submodule pointer..." -ForegroundColor Cyan
git add luna-sidebar

$hasChanges = git diff --cached --name-only
if (-not $hasChanges) {
  Write-Host "No new sidebar commit found. Nothing to commit." -ForegroundColor Yellow
  exit 0
}

Write-Host "Creating commit: $CommitMessage" -ForegroundColor Cyan
git commit -m "$CommitMessage"

if ($Push) {
  Write-Host "Pushing current branch..." -ForegroundColor Cyan
  git push
} else {
  Write-Host "Done. Run 'git push' when you are ready." -ForegroundColor Green
}
