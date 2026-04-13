# ConsentLedger

A decentralised consent management system built on Algorand. Users grant data-access consent as on-chain ASA tokens; organisations verify consent status in real time; users can revoke consent by freezing the token — all without a central authority.

## How it works

| Role | View | What they do |
|---|---|---|
| Data owner | **Grant Consent** | Mint a Consent ASA, recorded in a box keyed by asset ID |
| Data owner | **My Consents** | View and revoke issued tokens (freezes the ASA on-chain) |
| Organisation | **Org View** | Connect their wallet, see all consents granted to their address |

The smart contract is deployed on **Algorand TestNet**. No Docker or LocalNet is required to run this project.

---

## Prerequisites

Install these tools before starting. Verify each one is on your PATH.

| Tool | Min version | Install |
|---|---|---|
| Python | 3.12 | [python.org](https://www.python.org/downloads/) or `pyenv install 3.12` |
| pipx | any | `pip install pipx && pipx ensurepath` |
| AlgoKit CLI | 2.10 | `pipx install algokit` |
| Poetry | 1.2+ | `pipx install poetry` |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) or `nvm install --lts` |

```bash
# Verify all tools
algokit --version   # expect 2.10.x
python3 --version   # expect 3.12.x
poetry --version
node --version      # expect v18+
npm --version
```

---

## Step 1 — Clone the repo

```bash
git clone <repo-url>
cd consent-ledger
```

---

## Step 2 — Install Python dependencies

```bash
poetry install
```

Creates a `.venv` inside the project with `algokit-utils`, `puyapy`, `algopy-testing`, and `python-dotenv`.

---

## Step 3 — Run the unit tests (no network needed)

```bash
poetry run python -m pytest tests/ -v
```

Expected output — all 3 tests pass in under a second:

```
PASSED tests/test_consent_ledger_unit.py::test_grant_consent_creates_asa
PASSED tests/test_consent_ledger_unit.py::test_revoke_freezes_asset
PASSED tests/test_consent_ledger_unit.py::test_is_valid_returns_false_when_frozen
```

---

## Step 4 — Deploy the contract to TestNet

### 4a. Generate a deployer wallet

```bash
poetry run python - <<'EOF'
import algosdk
pk, addr = algosdk.account.generate_account()
print("Address :", addr)
print("Mnemonic:", algosdk.mnemonic.from_private_key(pk))
EOF
```

Save both values — you need the mnemonic in step 4c and the address to fund in 4b.

### 4b. Fund the deployer

Paste your address into the [Algorand TestNet Dispenser](https://dispenser.testnet.aws.algodev.network/) and request **5 ALGO** (the deploy script sends 2 ALGO to the contract for box storage MBR).

### 4c. Create the contract `.env` file

Create a file at `consent-ledger/.env`:

```env
ALGOD_SERVER=https://testnet-api.4160.nodely.dev
ALGOD_PORT=443
ALGOD_TOKEN=
INDEXER_SERVER=https://testnet-idx.4160.nodely.dev
INDEXER_PORT=443
INDEXER_TOKEN=
DEPLOYER_MNEMONIC=<your 25-word mnemonic from step 4a>
```

### 4d. Deploy

```bash
ALGOD_SERVER=https://testnet-api.4160.nodely.dev \
ALGOD_PORT=443 \
ALGOD_TOKEN="" \
INDEXER_SERVER=https://testnet-idx.4160.nodely.dev \
INDEXER_PORT=443 \
INDEXER_TOKEN="" \
DEPLOYER_MNEMONIC="$(grep DEPLOYER_MNEMONIC .env | cut -d= -f2-)" \
poetry run python -m smart_contracts deploy consent_ledger
```

The last lines of output will show:

```
ConsentLedger deployed: app_id=<APP_ID>, app_address=<APP_ADDRESS>
```

Copy both values — you need them in step 5.

---

## Step 5 — Configure and start the frontend

### 5a. Create `frontend/.env`

```env
VITE_APP_ID=<APP_ID from step 4d>
VITE_APP_ADDRESS=<APP_ADDRESS from step 4d>
```

### 5b. Install npm dependencies

```bash
cd frontend
npm install
```

### 5c. Start the dev server

```bash
npm run dev
```

Open the URL shown in the terminal (usually [http://localhost:5173](http://localhost:5173)).

---

## Step 6 — Use the app

You need **Pera Wallet** ([browser extension](https://chromewebstore.google.com/detail/pera-wallet/eanbowmgkkphaenmcaldejakbdopdnak) or mobile app). Switch Pera Wallet to **TestNet** mode before connecting.

### Grant consent (data owner)

1. Click **Connect Pera Wallet** in the header → approve in Pera
2. Go to the **Grant Consent** tab
3. Fill in:
   - **Requester Algorand Address** — the organisation's 58-character TestNet wallet address
   - **Organisation Name** — optional human-readable label (stored in the purpose field)
   - **Data Type** — KYC / Medical / Financial
   - **Purpose** — free-text description
   - **Expiry** — optional date; leave blank for no expiry
4. Click **Grant Consent** → approve the transaction in Pera Wallet
5. On success, the app displays the Consent ASA ID and a link to the TestNet explorer

### Revoke consent (data owner)

1. Go to **My Consents** — your issued tokens load automatically
2. Active tokens show a green **Active** badge
3. Click **Revoke** → approve in Pera Wallet
4. The ASA is frozen on-chain and the card turns red immediately

### View granted consents (organisation)

1. Connect the **organisation's wallet** (the address entered as Requester above)
2. Go to **Org View**
3. All consents granted to your address appear with:
   - Data subject's (owner's) Algorand address
   - Data type, purpose, expiry
   - Active / Revoked status

---

## Project structure

```
consent-ledger/
├── smart_contracts/
│   ├── consent_ledger/
│   │   ├── contract.py          # AVM smart contract (Algorand Python / PuyaPy)
│   │   └── deploy_config.py     # Deployment script
│   └── artifacts/
│       └── consent_ledger/
│           ├── ConsentLedger.arc56.json   # ABI specification
│           └── consent_ledger_client.py   # Auto-generated Python client
├── tests/
│   └── test_consent_ledger_unit.py        # Unit tests (no network)
├── frontend/
│   └── src/
│       ├── contracts/
│       │   └── ConsentLedgerClient.ts     # Auto-generated TypeScript client
│       ├── components/
│       │   ├── GrantConsentForm.tsx       # Grant consent view
│       │   ├── ActiveConsents.tsx         # My Consents view (data owner)
│       │   ├── OrgConsents.tsx            # Org View (organisation)
│       │   └── Header.tsx
│       ├── config.ts                      # Reads VITE_APP_ID / VITE_APP_ADDRESS
│       └── utils.ts                       # ARC-4 box decoder, address helpers
├── pyproject.toml
├── .env                                   # Contract deploy config (do not commit)
└── frontend/.env                          # Frontend config (do not commit)
```

---

## Rebuilding after contract changes

If you modify `contract.py`:

```bash
# 1. Recompile and regenerate artifacts
poetry run python -m smart_contracts build

# 2. Redeploy to TestNet
ALGOD_SERVER=https://testnet-api.4160.nodely.dev \
ALGOD_PORT=443 \
ALGOD_TOKEN="" \
INDEXER_SERVER=https://testnet-idx.4160.nodely.dev \
INDEXER_PORT=443 \
INDEXER_TOKEN="" \
DEPLOYER_MNEMONIC="$(grep DEPLOYER_MNEMONIC .env | cut -d= -f2-)" \
poetry run python -m smart_contracts deploy consent_ledger

# 3. Regenerate the TypeScript client
algokit generate client \
  smart_contracts/artifacts/consent_ledger/ConsentLedger.arc56.json \
  --output frontend/src/contracts/ConsentLedgerClient.ts

# 4. Update frontend/.env with the new app_id and app_address
```

# Setup

### Pre-requisites

- [Python 3.12](https://www.python.org/downloads/) or later
- [Docker](https://www.docker.com/) (only required for LocalNet)

> For interactive tour over the codebase, download [vsls-contrib.codetour](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.codetour) extension for VS Code, then open the [`.codetour.json`](./.tours/getting-started-with-your-algokit-project.tour) file in code tour extension.

### Initial Setup

#### 1. Clone the Repository
Start by cloning this repository to your local machine.

#### 2. Install Pre-requisites
Ensure the following pre-requisites are installed and properly configured:

- **Docker**: Required for running a local Algorand network. [Install Docker](https://www.docker.com/).
- **AlgoKit CLI**: Essential for project setup and operations. Install the latest version from [AlgoKit CLI Installation Guide](https://github.com/algorandfoundation/algokit-cli#install). Verify installation with `algokit --version`, expecting `2.0.0` or later.

#### 3. Bootstrap Your Local Environment
Run the following commands within the project folder:

- **Install Poetry**: Required for Python dependency management. [Installation Guide](https://python-poetry.org/docs/#installation). Verify with `poetry -V` to see version `1.2`+.
- **Setup Project**: Execute `algokit project bootstrap all` to install dependencies and setup a Python virtual environment in `.venv`.
- **Configure environment**: Execute `algokit generate env-file -a target_network localnet` to create a `.env.localnet` file with default configuration for `localnet`.
- **Start LocalNet**: Use `algokit localnet start` to initiate a local Algorand network.

### Development Workflow

#### Terminal
Directly manage and interact with your project using AlgoKit commands:

1. **Build Contracts**: `algokit project run build` compiles all smart contracts. You can also specify a specific contract by passing the name of the contract folder as an extra argument.
For example: `algokit project run build -- hello_world` will only build the `hello_world` contract.
2. **Deploy**: Use `algokit project deploy localnet` to deploy contracts to the local network. You can also specify a specific contract by passing the name of the contract folder as an extra argument.
For example: `algokit project deploy localnet -- hello_world` will only deploy the `hello_world` contract.

#### VS Code 
For a seamless experience with breakpoint debugging and other features:

1. **Open Project**: In VS Code, open the repository root.
2. **Install Extensions**: Follow prompts to install recommended extensions.
3. **Debugging**:
   - Use `F5` to start debugging.
   - **Windows Users**: Select the Python interpreter at `./.venv/Scripts/python.exe` via `Ctrl/Cmd + Shift + P` > `Python: Select Interpreter` before the first run.

#### JetBrains IDEs
While primarily optimized for VS Code, JetBrains IDEs are supported:

1. **Open Project**: In your JetBrains IDE, open the repository root.
2. **Automatic Setup**: The IDE should configure the Python interpreter and virtual environment.
3. **Debugging**: Use `Shift+F10` or `Ctrl+R` to start debugging. Note: Windows users may encounter issues with pre-launch tasks due to a known bug. See [JetBrains forums](https://youtrack.jetbrains.com/issue/IDEA-277486/Shell-script-configuration-cannot-run-as-before-launch-task) for workarounds.

## AlgoKit Workspaces and Project Management
This project supports both standalone and monorepo setups through AlgoKit workspaces. Leverage [`algokit project run`](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/features/project/run.md) commands for efficient monorepo project orchestration and management across multiple projects within a workspace.

## AlgoKit Generators

This template provides a set of [algokit generators](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/features/generate.md) that allow you to further modify the project instantiated from the template to fit your needs, as well as giving you a base to build your own extensions to invoke via the `algokit generate` command.

### Generate Smart Contract 

By default the template creates a single `HelloWorld` contract under hello_world folder in the `smart_contracts` directory. To add a new contract:

1. From the root of the project (`../`) execute `algokit generate smart-contract`. This will create a new starter smart contract and deployment configuration file under `{your_contract_name}` subfolder in the `smart_contracts` directory.
2. Each contract potentially has different creation parameters and deployment steps. Hence, you need to define your deployment logic in `deploy_config.py`file.
3. `config.py` file will automatically build all contracts in the `smart_contracts` directory. If you want to build specific contracts manually, modify the default code provided by the template in `config.py` file.

> Please note, above is just a suggested convention tailored for the base configuration and structure of this template. The default code supplied by the template in `config.py` and `index.ts` (if using ts clients) files are tailored for the suggested convention. You are free to modify the structure and naming conventions as you see fit.

### Generate '.env' files

By default the template instance does not contain any env files. Using [`algokit project deploy`](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/features/project/deploy.md) against `localnet` | `testnet` | `mainnet` will use default values for `algod` and `indexer` unless overwritten via `.env` or `.env.{target_network}`. 

To generate a new `.env` or `.env.{target_network}` file, run `algokit generate env-file`

### Debugging Smart Contracts

This project is optimized to work with AlgoKit AVM Debugger extension. To activate it:
Refer to the commented header in the `__main__.py` file in the `smart_contracts` folder.

If you have opted in to include VSCode launch configurations in your project, you can also use the `Debug TEAL via AlgoKit AVM Debugger` launch configuration to interactively select an available trace file and launch the debug session for your smart contract.

For information on using and setting up the `AlgoKit AVM Debugger` VSCode extension refer [here](https://github.com/algorandfoundation/algokit-avm-vscode-debugger). To install the extension from the VSCode Marketplace, use the following link: [AlgoKit AVM Debugger extension](https://marketplace.visualstudio.com/items?itemName=algorandfoundation.algokit-avm-vscode-debugger).

# Tools

This project makes use of Algorand Python to build Algorand smart contracts. The following tools are in use:

- [Algorand](https://www.algorand.com/) - Layer 1 Blockchain; [Developer portal](https://dev.algorand.co/), [Why Algorand?](https://dev.algorand.co/getting-started/why-algorand/)
- [AlgoKit](https://github.com/algorandfoundation/algokit-cli) - One-stop shop tool for developers building on the Algorand network; [docs](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/algokit.md), [intro tutorial](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/tutorials/intro.md)
- [Algorand Python](https://github.com/algorandfoundation/puya) - A semantically and syntactically compatible, typed Python language that works with standard Python tooling and allows you to express smart contracts (apps) and smart signatures (logic signatures) for deployment on the Algorand Virtual Machine (AVM); [docs](https://github.com/algorandfoundation/puya), [examples](https://github.com/algorandfoundation/puya/tree/main/examples)
- [AlgoKit Utils](https://github.com/algorandfoundation/algokit-utils-py) - A set of core Algorand utilities that make it easier to build solutions on Algorand.
- [Poetry](https://python-poetry.org/): Python packaging and dependency management.
It has also been configured to have a productive dev experience out of the box in [VS Code](https://code.visualstudio.com/), see the [.vscode](./.vscode) folder.

