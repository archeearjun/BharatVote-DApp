# PowerShell script to kill process on port 8545
# Usage: .\scripts\kill-port-8545.ps1

Write-Host "Checking for processes on port 8545..." -ForegroundColor Yellow

try {
    $connections = Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue
    
    if ($connections) {
        $connectionsArray = @($connections)
        
        foreach ($connection in $connectionsArray) {
            $processId = $connection.OwningProcess
            
            if ($processId) {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                
                if ($process) {
                    Write-Host "Found process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Red
                    Write-Host "Killing process..." -ForegroundColor Yellow
                    Stop-Process -Id $processId -Force
                    Write-Host "Process killed successfully" -ForegroundColor Green
                }
            }
        }
    } else {
        Write-Host "Port 8545 is free" -ForegroundColor Green
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
