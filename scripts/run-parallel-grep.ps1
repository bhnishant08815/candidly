param(
    [Parameter(Mandatory=$true)]
    [string]$GrepPattern
)

$folder1 = "tests/job-posting"
$folder2 = "tests/Applicants"

Write-Host "Running tests in parallel with grep: '$GrepPattern'" -ForegroundColor Cyan
Write-Host "  Folder 1: $folder1" -ForegroundColor Yellow
Write-Host "  Folder 2: $folder2" -ForegroundColor Yellow
Write-Host ""

# Run both commands in separate jobs
$job1 = Start-Job -ScriptBlock {
    param($folder, $grep)
    Set-Location $using:PWD
    npx playwright test $folder --grep $grep
} -ArgumentList $folder1, $GrepPattern

$job2 = Start-Job -ScriptBlock {
    param($folder, $grep)
    Set-Location $using:PWD
    npx playwright test $folder --grep $grep
} -ArgumentList $folder2, $GrepPattern

# Wait for both and show output
$results1 = $job1 | Wait-Job | Receive-Job
$results2 = $job2 | Wait-Job | Receive-Job

# Clean up
$job1, $job2 | Remove-Job

Write-Host ""
Write-Host "=== Folder 1 Results ===" -ForegroundColor Green
$results1
Write-Host ""
Write-Host "=== Folder 2 Results ===" -ForegroundColor Green
$results2

