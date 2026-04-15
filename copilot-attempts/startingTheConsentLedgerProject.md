Let me explore the project structure to understand what's needed.   

Read [](file:///home/gokulganesan/AlgoBharat/consent-ledger/pyproject.toml)

Read [](file:///home/gokulganesan/AlgoBharat/consent-ledger/pyproject.toml)

Read [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/package.json)

Read [](file:///home/gokulganesan/AlgoBharat/consent-ledger/README.md#1-1), lines 1 to 100

Read [](file:///home/gokulganesan/AlgoBharat/consent-ledger/README.md#1-1), lines 1 to 100

Read [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/config.ts)

Read [](file:///home/gokulganesan/AlgoBharat/consent-ledger/smart_contracts/consent_ledger/deploy_config.py)

Searched for files matching `**/consent-ledger/**/.env*`, no matches

Searched for regex `VITE_APP_ID|VITE_APP_ADDRESS|DEPLOYER` (`**/consent-ledger/**`), 20 results

Read [](file:///home/gokulganesan/AlgoBharat/consent-ledger/.algokit.toml)

Read [](file:///home/gokulganesan/AlgoBharat/consent-ledger/.env)

Here are the complete step-by-step instructions to start this project from scratch:

---

## Starting the Consent Ledger Project

### Prerequisites (one-time setup)

Make sure these are installed:

```bash
# Verify Docker is running
docker info

# Verify AlgoKit (need v2.0.0+)
algokit --version

# Verify Python 3.12+
python3 --version

# Verify Poetry (need 1.2+)
poetry -V

# Verify Node.js / npm (for frontend)
node --version && npm --version
```

---

### Step 1 — Start LocalNet (Algorand local blockchain)

```bash
algokit localnet start
```

This pulls and starts the Docker containers for `algod`, `indexer`, and `kmd`. Wait until it says the network is healthy.

---

### Step 2 — Bootstrap Python dependencies

```bash
cd /home/gokulganesan/AlgoBharat/consent-ledger
algokit project bootstrap all
```

This installs all Python packages into the .venv virtual environment using Poetry.

---

### Step 3 — Ensure the .env file exists

The file .env should already exist with LocalNet defaults. If it doesn't:

```bash
algokit generate env-file -a target_network localnet
```

It should contain:
```
ALGOD_SERVER=http://localhost
ALGOD_PORT=4001
ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaa...
DEPLOYER_MNEMONIC=<your localnet mnemonic>
```

---

### Step 4 — Build the smart contracts

```bash
algokit project run build
```

This compiles the Algorand Python contracts with PuyaPy and regenerates the client files under `smart_contracts/artifacts/`.

---

### Step 5 — Deploy the contract to LocalNet

```bash
algokit project deploy localnet
```

Note the printed `app_id` and `app_address` from the output.

---

### Step 6 — Update the frontend .env

Edit .env with the values from Step 5:

```bash
# consent-ledger/frontend/.env
VITE_APP_ID=<app_id from deploy output>
VITE_APP_ADDRESS=<app_address from deploy output>
```

---

### Step 7 — Install frontend dependencies and start the dev server

```bash
cd /home/gokulganesan/AlgoBharat/consent-ledger/frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

### Quick reference (subsequent starts)

Once set up, on each new session you only need:

```bash
algokit localnet start                    # restart Docker containers
cd consent-ledger/frontend && npm run dev  # start frontend
```