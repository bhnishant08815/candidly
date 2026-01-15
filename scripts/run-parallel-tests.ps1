param(
    [Parameter(Mandatory=$false)]
    [string]$GrepPattern = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Folder1 = "tests/job-posting",
    
    [Parameter(Mandatory=$false)]
    [string]$Folder2 = "tests/Applicants",
    
    [Parameter(Mandatory=$false)]
    [switch]$Headed
)

# Build argument arrays for playwright command
$args1 = @("test", $Folder1)
$args2 = @("test", $Folder2)

if ($Headed) {
    $args1 += "--headed"
    $args2 += "--headed"
}

if ($GrepPattern) {
    $args1 += "--grep", $GrepPattern
    $args2 += "--grep", $GrepPattern
}

$grepDisplay = if ($GrepPattern) { "--grep `"$GrepPattern`"" } else { "" }
Write-Host "Running tests in parallel:" -ForegroundColor Cyan
Write-Host "  Folder 1: $Folder1 $grepDisplay" -ForegroundColor Yellow
Write-Host "  Folder 2: $Folder2 $grepDisplay" -ForegroundColor Yellow
Write-Host ""

# Run both commands in parallel using Start-Job
$job1 = Start-Job -ScriptBlock {
    param($argsArray)
    Set-Location $using:PWD
    & npx playwright @argsArray
} -ArgumentList (,$args1)

$job2 = Start-Job -ScriptBlock {
    param($argsArray)
    Set-Location $using:PWD
    & npx playwright @argsArray
} -ArgumentList (,$args2)

# Wait for both jobs to complete and show real-time output
Write-Host "Waiting for tests to complete..." -ForegroundColor Cyan
Write-Host ""

# Show output as it arrives
$completed = 0
while ($completed -lt 2) {
    $job1State = (Get-Job -Id $job1.Id).State
    $job2State = (Get-Job -Id $job2.Id).State
    
    if ($job1State -eq "Completed" -and $job1.HasMoreData) {
        Write-Host "=== Folder 1 Results ===" -ForegroundColor Green
        $job1 | Receive-Job
        $completed++
    }
    
    if ($job2State -eq "Completed" -and $job2.HasMoreData) {
        Write-Host "=== Folder 2 Results ===" -ForegroundColor Green
        $job2 | Receive-Job
        $completed++
    }
    
    Start-Sleep -Milliseconds 500
}

# Get remaining output
if ($job1.HasMoreData) {
    Write-Host "=== Folder 1 Additional Output ===" -ForegroundColor Green
    $job1 | Receive-Job
}
if ($job2.HasMoreData) {
    Write-Host "=== Folder 2 Additional Output ===" -ForegroundColor Green
    $job2 | Receive-Job
}

# Clean up jobs
$job1, $job2 | Remove-Job

Write-Host ""
Write-Host "All tests completed!" -ForegroundColor Green

