
# Argus Protocol - Full-Stacked Blockchain Startup Script
# This script initializes the real GhostDAG node and the Python Orchestration Gateway.

Write-Host "--- Initializing Argus Protocol Full-Stack ---" -ForegroundColor Cyan

# 1. Check for Prerequisites
$rust = Get-Command rustc -ErrorAction SilentlyContinue
$python = Get-Command python -ErrorAction SilentlyContinue

if (-not $rust) { Write-Error "Rust (rustc) not found. Please install from https://rustup.rs"; exit }
if (-not $python) { Write-Error "Python not found. Please install Python 3.10+"; exit }

# 2. Build Rust Node
Write-Host "[1/3] Building Argus GhostDAG Node..." -ForegroundColor Yellow
cd argus-node
cargo build --release
if ($LASTEXITCODE -ne 0) { Write-Error "Rust build failed."; exit }
cd ..

# 3. Setup Python Gateway
Write-Host "[2/3] Setting up Python Orchestration Gateway..." -ForegroundColor Yellow
cd argus-gateway
python -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) { Write-Error "Python dependency installation failed."; exit }
cd ..

# 4. Launch Sequence
Write-Host "[3/3] Launching Argus Synapse Stack..." -ForegroundColor Green
Write-Host "Starting GhostDAG Node on port 9293..." -ForegroundColor Gray
Start-Process -NoNewWindow -FilePath "./argus-node/target/release/argus" -ArgumentList "start --rpc-port 9293 --ws-port 9292 --k 3"

Write-Host "Starting Python Gateway on port 8080..." -ForegroundColor Gray
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m uvicorn argus_gateway.main:app --host 0.0.0.0 --port 8080"

Write-Host "--- Argus Protocol is now LIVE at http://localhost:8080 ---" -ForegroundColor Green
Write-Host "The Vault in your React application is now connected to the real DAG stream." -ForegroundColor Green
