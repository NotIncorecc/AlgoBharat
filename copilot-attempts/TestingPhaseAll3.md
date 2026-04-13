Read skill [test-smart-contracts](file:///home/gokulganesan/AlgoBharat/.github/skills/test-smart-contracts/SKILL.md?vscodeLinkType%3Dskill#1-1), lines 1 to 120

This skill covers TypeScript testing. The user explicitly wants Python unit testing. Let me explore the project structure and the Python testing library: 

Ran terminal command:  cd /home/gokulganesan/AlgoBharat/consent-ledger && find . -name "*.py" | grep -v __pycache__ | grep -v ".venv" | sort
Completed with input:  cd /home/gokulganesan/AlgoBharat/consent-ledger && find . -name "*.py" | grep -v __pycache__ | grep -v ".venv" | sort

Ran terminal command:  cat pyproject.toml

Ran terminal command:  cat .algokit.toml

No `test` command in `.algokit.toml`. Let me check what the `algorand-python-testing` library provides: 

Ran terminal command:  poetry run python -c "import algorand_python_testing; print(algorand_python_testing.__file__)" && ls $(poetry run python -c "import algorand_python_testing, os; print(os.path.dirname(algorand_python_testing.__file__))")
Completed with input:  poetry run python -c "import algorand_python_testing; print(algorand_python_testing.__file__)" && ls $(poetry run python -c "import algorand_python_testing, os; print(os.path.dirname(algorand_python_testing.__file__))")

Ran terminal command:  poetry run pip list | grep -i "algorand\|algokit\|pytest\|puya"

Ran terminal command:  poetry run python -c "import algopy_testing; help(algopy_testing)" 2>&1 | head -60

Ran terminal command:  cd /home/gokulganesan/AlgoBharat/consent-ledger && poetry run python -c "
import algopy_testing, inspect, _algopy_testing
print('=== AlgopyTestContext ===')
print(inspect.getsource(_algopy_testing.context.AlgopyTestContext.__init__))
" 2>&1 | head -40

Ran terminal command:  cd /home/gokulganesan/AlgoBharat/consent-ledger && poetry run python -c "
import _algopy_testing, inspect
# Check the public API - what's exported
import algopy_testing as at
print(dir(at))
print()
# Look at context_for
src = inspect.getsource(_algopy_testing)
" 2>&1 | head -20

poetry run python -c "
from algopy_testing import algopy_testing_context
print('found algopy_testing_context')
" 2>&1


Ran terminal command:  cd /home/gokulganesan/AlgoBharat/consent-ledger && poetry run python -c "
import _algopy_testing, inspect
print(inspect.getsource(_algopy_testing.context.AlgopyTestContext))
" 2>&1 | head -100

Ran terminal command:  cd /home/gokulganesan/AlgoBharat/consent-ledger && poetry run python -c "
import _algopy_testing, inspect
print(inspect.getsource(_algopy_testing.context_helpers.ledger_context.LedgerContext))
" 2>&1 | head -120

Run in Terminal

Ran terminal command:  cd /home/gokulganesan/AlgoBharat/consent-ledger && poetry run python -c "
import _algopy_testing, inspect
# Find examples showing how to test contracts with inner txns
src = inspect.getsource(_algopy_testing.context_helpers.ledger_context.LedgerContext)
# Print methods related to inner txns and assets
for line in src.split('\n'):
    if 'inner' in line.lower() or 'itxn' in line.lower() or 'freeze' in line.lower() or 'patch' in line.lower() or 'get_last' in line.lower():
        print(line)
" 2>&1

Run in Terminal

Ran terminal command:  cd /home/gokulganesan/AlgoBharat/consent-ledger && poetry run python -c "
import _algopy_testing, inspect
# Check txn context to find get_last_inner_transaction
src = inspect.getsource(_algopy_testing.context_helpers.txn_context.TransactionContext)
print(src[:4000])
" 2>&1

Ran terminal command:  cd /home/gokulganesan/AlgoBharat/consent-ledger && poetry run python -c "
import _algopy_testing, inspect
src = inspect.getsource(_algopy_testing.context_helpers.txn_context.TransactionContext)
# Find things about 'last'
for i, line in enumerate(src.split('\n')):
    if 'last' in line.lower() or 'inner' in line.lower() or 'get_itxn' in line.lower():
        print(f'{i}: {line}')
" 2>&1 | head -40

Ran terminal command:  cd /home/gokulganesan/AlgoBharat/consent-ledger && poetry run python -c "
import _algopy_testing, inspect
src = inspect.getsource(_algopy_testing.context_helpers.txn_context.TransactionGroup)
print(src[:5000])
" 2>&1

Ran terminal command:  cd /home/gokulganesan/AlgoBharat/consent-ledger && poetry run python -c "
import _algopy_testing, inspect
# Check ITxnLoader to see what fields are available on inner txn results
src = inspect.getsource(_algopy_testing.itxn_loader.ITxnLoader)
print(src[:3000])
" 2>&1

Ran terminal command:  cd /home/gokulganesan/AlgoBharat/consent-ledger && poetry run python -c "
import _algopy_testing, inspect, algopy
# What fields does AssetFreezeInnerTransaction have?
src = inspect.getsource(algopy.itxn.AssetFreezeInnerTransaction)
print(src[:2000])
" 2>&1

Run in Terminal

Ran terminal command:  cd /home/gokulganesan/AlgoBharat/consent-ledger && poetry run python -c "
import _algopy_testing, inspect
src = inspect.getsource(_algopy_testing.models.inner_transactions)
print(src[:3000])
" 2>&1
Completed with input:  cd /home/gokulganesan/AlgoBharat/consent-ledger && poetry run python -c "
import _algopy_testing, inspect
src = inspect.getsource(_algopy_testing.models.inner_transactions)
print(src[:3000])
" 2>&1

Ran terminal command:  find .venv -name "*.py" -path "*/algopy_testing*" | xargs grep -l "AssetFreeze\|freeze_account\|frozen" 2>/dev/null | head -5

Ran terminal command:  find .venv -name "*.py" | xargs grep -l "freeze_account" 2>/dev/null
Completed with input:  find .venv -name "*.py" | xargs grep -l "freeze_account" 2>/dev/null

Ran terminal command:  grep -A5 "freeze_account\|asset_frozen\|is_frozen" .venv/lib/python3.12/site-packages/_algopy_testing/models/txn_fields.py | head -40

Ran terminal command:  find ~/.cache/pipx ~/.local -name "*.py" 2>/dev/null | xargs grep -l "algopy_testing_context\|AlgopyTestContext" 2>/dev/null | grep -v ".venv" | head -10

Ran terminal command:  grep -r "algopy_testing_context\|AlgopyTestContext" .venv/lib/python3.12/site-packages/_algopy_testing/ 2>/dev/null | grep "def " | head -20

Ran terminal command:  cat .venv/lib/python3.12/site-packages/_algopy_testing/context_helpers/context_storage.py

Now I have a clear picture. Let me also check how contracts are instantiated and how `create_asset` works in the ledger: 

Ran terminal command:  grep -A 30 "def create_asset" .venv/lib/python3.12/site-packages/_algopy_testing/context_helpers/ledger_context.py | head -40

Ran terminal command:  grep -n "def " .venv/lib/python3.12/site-packages/_algopy_testing/context_helpers/ledger_context.py | head -40

Ran terminal command:  sed -n '156,200p' .venv/lib/python3.12/site-packages/_algopy_testing/context_helpers/ledger_context.py

Ran terminal command:  sed -n '156,200p' .venv/lib/python3.12/site-packages/_algopy_testing/context_helpers/ledger_context.py

Ran terminal command:  grep -n "asset_id\|asset_data\|_register_asset\|add_asset" .venv/lib/python3.12/site-packages/_algopy_testing/context_helpers/ledger_context.py | head -20

Ran terminal command:  find .venv -name "*.py" | xargs grep -l "created_asset\|AssetConfig.*submit\|_register" 2>/dev/null | grep algopy | head -5
Completed with input:  find .venv -name "*.py" | xargs grep -l "created_asset\|AssetConfig.*submit\|_register" 2>/dev/null | grep algopy | head -5

Ran terminal command:  grep -n "created_asset\|asset_data\|_register\|AssetFields" .venv/lib/python3.12/site-packages/_algopy_testing/itxn.py | head -30

Ran terminal command:  sed -n '185,220p' .venv/lib/python3.12/site-packages/_algopy_testing/itxn.py

Ran terminal command:  grep -n "asset_frozen\|AssetHoldingGet\|asset_holding" .venv/lib/python3.12/site-packages/_algopy_testing/op/misc.py | head -20

Ran terminal command:  sed -n '311,360p' .venv/lib/python3.12/site-packages/_algopy_testing/op/misc.py

Ran terminal command:  grep -n "def asset" .venv/lib/python3.12/site-packages/_algopy_testing/value_generators/avm.py && sed -n '1,50p' .venv/lib/python3.12/site-packages/_algopy_testing/value_generators/avm.py

Run in Terminal

Ran terminal command:  sed -n '108,200p' .venv/lib/python3.12/site-packages/_algopy_testing/value_generators/avm.py

Ran terminal command:  grep -rn "ARC4Contract\|__app_id__\|app_address" .venv/lib/python3.12/site-packages/_algopy_testing/ | grep "def\|class\|app_address" | grep -v "pyc" | head -30

Run in Terminal

Ran terminal command:  sed -n '140,200p' .venv/lib/python3.12/site-packages/_algopy_testing/models/contract.py

Ran terminal command:  grep -n "__app_id__\|_register_contract\|__init__\|new_app" .venv/lib/python3.12/site-packages/_algopy_testing/models/contract.py | head -30

Ran terminal command:  sed -n '40,90p' .venv/lib/python3.12/site-packages/_algopy_testing/models/contract.py

Now I have enough understanding. Let me check if pytest is installed and write the tests: 

Ran terminal command:  poetry run pytest --version 2>&1

Good. Now I understand all the pieces. Let me write the proper unit tests. Key insights from the research:

- Inner `AssetConfig` auto-registers the asset in the ledger (via `any.asset()`)
- `_on_asset_freeze` has a `TODO` — it does NOT update the holding's frozen flag
- `AssetHoldingGet.asset_frozen` reads from `account_data.opted_assets[asset_id].frozen`
- To test the frozen path: manually call `ctx.ledger.update_asset_holdings(asset, app_addr, frozen=True)`
- App address is derived from app_id via `algosdk.logic.get_application_address(app_id)` 

Created [](file:///home/gokulganesan/AlgoBharat/consent-ledger/tests/test_consent_ledger_unit.py)

Now add the `test` command to `.algokit.toml` and run the tests: 

Replacing 4 lines with 7 lines in [](file:///home/gokulganesan/AlgoBharat/consent-ledger/.algokit.toml)

Ran terminal command:  algokit project run test 2>&1
Completed with input:  algokit project run test 2>&1

The issue is `pytest` is picking up the system Python, not the venv. Let me check:  

Ran terminal command:  poetry run python -c "import algosdk; print(algosdk.__file__)" && poetry run which pytest

The system `pytest` is being picked up instead of the venv one. Switch to `python -m pytest`:  

Replacing 3 lines with 3 lines in [](file:///home/gokulganesan/AlgoBharat/consent-ledger/.algokit.toml)

Ran terminal command:  algokit project run test 2>&1
Completed with input:  algokit project run test 2>&1

Ran terminal command:  poetry add --group dev pytest 2>&1 | tail -5

Ran terminal command:  algokit project run test 2>&1

All three tests pass in 0.10s — no network required:

```
tests/test_consent_ledger_unit.py::test_grant_consent_creates_asa          PASSED
tests/test_consent_ledger_unit.py::test_revoke_freezes_asset                PASSED
tests/test_consent_ledger_unit.py::test_is_valid_returns_false_when_frozen  PASSED
```

A few notes on what was done and the one subtle workaround:

**How the tests work (no network):**
- `algopy_testing_context()` simulates the full AVM in memory
- `ConsentLedger()` instantiated directly — auto-gets an app_id
- Inner `itxn.AssetConfig` auto-registers the ASA in the simulated ledger
- Inner `itxn.AssetFreeze` is submitted but the testing library intentionally does not auto-apply the `frozen` flag to the account holding (marked as `TODO` in the library source)
- For `test_is_valid_returns_false_when_frozen`: we directly call `ctx.ledger.update_asset_holdings(asset_id, app_addr, frozen=True)` to simulate the freeze effect, then verify `is_consent_valid` returns `False`

**Deprecation warnings** (not failures): `.native` on `arc4.UInt64` is deprecated in favour of `.as_uint64`. These can be fixed in the contract later; they don't affect correctness.

The contract is the non-negotiable foundation — it's verified. Ready for Phase 2 (frontend).