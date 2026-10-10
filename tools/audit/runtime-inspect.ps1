param(
 [Parameter(Mandatory=$true)][string]$OutputPath,
 [string]$FixturePath
)
$ErrorActionPreference = 'Stop'
trap { [Console]::Error.WriteLine('Runtime audit failed; verify ignored output location and access.'); exit 1 }
$out = [IO.Path]::GetFullPath($OutputPath)
$privateRoot = [IO.Path]::GetFullPath((Join-Path (Get-Location).Path 'artifacts/audit-private'))
$comparison = if ($env:OS -eq 'Windows_NT') { [StringComparison]::OrdinalIgnoreCase } else { [StringComparison]::Ordinal }
if (-not $out.StartsWith($privateRoot + [IO.Path]::DirectorySeparatorChar, $comparison)) { throw 'private-output-required' }
for ($parent = $out; $parent -and $parent -ne (Get-Location).Path; $parent = Split-Path -Parent $parent) {
 if (Test-Path -LiteralPath $parent) {
  $item = Get-Item -LiteralPath $parent -Force
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'symlink-output' }
 }
}
& git --no-optional-locks -C (Get-Location).Path check-ignore --quiet --no-index -- $out
if ($LASTEXITCODE -ne 0) { throw 'output-not-ignored' }
$errors = @()
$ports = @()
$services = @()
$cron = 'unverified'
$source = 'live'
if ($FixturePath) {
 $source = 'fixture'
 $fixture = Get-Content -LiteralPath $FixturePath -Raw | ConvertFrom-Json
 foreach ($entry in $fixture.ports) {
  $ports += @{port=[int]$entry.port; listening=[bool]$entry.listening; status='unverified'}
 }
 $errors += 'fixture-not-live-evidence'
} else {
 foreach ($port in @(4000,8651,8642,8643)) {
  try {
   $connections = @(Get-NetTCPConnection -State Listen -ErrorAction Stop | Where-Object LocalPort -EQ $port)
   $ports += @{port=$port; listening=($connections.Count -gt 0); status=$(if($connections.Count -gt 0){'verified'}else{'unverified'})}
  } catch {
   $ports += @{port=$port; listening=$null; status='unverified'}
   $errors += 'port-inspection-unavailable'
  }
 }
 try {
  # Never collect task actions, process arguments, credentials or user paths.
  $tasks = @(Get-ScheduledTask -ErrorAction Stop | Where-Object { $_.TaskName -match 'Jarvis|Hermes' })
  foreach ($task in $tasks) {
   $services += @{kind=$(if($task.TaskName -match 'Hermes'){'hermes'}else{'jarvis'}); state=[string]$task.State; status='verified'}
  }
  $cron = 'unverified'
  $errors += 'hermes-cron-not-inspected'
 } catch { $errors += 'scheduled-task-inspection-unavailable' }
}
# A listening socket is evidence of a socket, never of Hermes health or profile identity.
$report = @{
 captured_at=[DateTime]::UtcNow.ToString('o'); source=$source; ports=@($ports);
 gateway_status='unverified'; jarvis_services=@($services); cron_visibility=$cron; errors=@($errors)
}
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($out)) | Out-Null
[IO.File]::WriteAllText($out, (($report | ConvertTo-Json -Depth 8) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
Write-Output 'Private runtime snapshot saved; gateway remains unverified.'
