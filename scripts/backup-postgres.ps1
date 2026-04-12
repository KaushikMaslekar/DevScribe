param(
    [string]$Host = "localhost",
    [string]$Port = "5432",
    [string]$Database = "devscribe",
    [string]$User = "postgres",
    [string]$OutputDir = ".\\backups"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$outputFile = Join-Path $OutputDir "${Database}_${timestamp}.dump"

Write-Host "Creating backup: $outputFile"
pg_dump -h $Host -p $Port -U $User -Fc $Database -f $outputFile

if ($LASTEXITCODE -ne 0) {
    throw "Backup failed"
}

Write-Host "Backup complete"
