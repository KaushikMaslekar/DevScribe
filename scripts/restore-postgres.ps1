param(
    [string]$Host = "localhost",
    [string]$Port = "5432",
    [string]$Database = "devscribe",
    [string]$User = "postgres",
    [Parameter(Mandatory = $true)]
    [string]$BackupFile
)

if (-not (Test-Path $BackupFile)) {
    throw "Backup file not found: $BackupFile"
}

Write-Host "Restoring from: $BackupFile"
pg_restore -h $Host -p $Port -U $User -d $Database --clean --if-exists $BackupFile

if ($LASTEXITCODE -ne 0) {
    throw "Restore failed"
}

Write-Host "Restore complete"
