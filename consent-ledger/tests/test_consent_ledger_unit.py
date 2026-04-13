"""
Unit tests for ConsentLedger smart contract.

These run without a network connection — they simulate AVM behaviour in
memory via the algorand-python-testing library (algopy_testing).

Run: algokit project run test
  or: poetry run pytest tests/ -v
"""
import algosdk
import pytest

import algopy
from algopy import arc4
from algopy_testing import algopy_testing_context

from smart_contracts.consent_ledger.contract import ConsentLedger


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _app_address(contract: ConsentLedger) -> str:
    """Derive the Algorand application address from the contract's app_id."""
    return algosdk.logic.get_application_address(contract.__app_id__)


def _grant(contract: ConsentLedger, ctx, *, requester: str | None = None) -> int:
    """Call grant_consent and return the plain-int asset ID."""
    req = arc4.Address(requester or str(ctx.default_sender))
    result = contract.grant_consent(
        requester=req,
        data_type=arc4.String("medical_records"),
        purpose=arc4.String("annual health screening"),
        expiry=arc4.UInt64(0),
    )
    return int(result.native)


# ---------------------------------------------------------------------------
# test_grant_consent_creates_asa
# ---------------------------------------------------------------------------

def test_grant_consent_creates_asa() -> None:
    """grant_consent must return a valid asset ID and the ASA must exist in
    the simulated ledger."""
    with algopy_testing_context() as ctx:
        contract = ConsentLedger()

        asset_id = _grant(contract, ctx)

        # 1. Returned asset ID must be non-zero
        assert asset_id > 0, "Expected a non-zero asset ID from grant_consent"

        # 2. The asset must be registered in the test ledger
        assert ctx.ledger.asset_exists(asset_id), (
            f"Asset {asset_id} should exist in the ledger after grant_consent"
        )

        # 3. The inner AssetConfig transaction was submitted
        last_itxn = ctx.txn.last_group.last_itxn.asset_config
        assert int(last_itxn.created_asset.id) == asset_id


# ---------------------------------------------------------------------------
# test_revoke_freezes_asset
# ---------------------------------------------------------------------------

def test_revoke_freezes_asset() -> None:
    """revoke_consent must submit an AssetFreeze inner transaction with
    frozen=True targeting the app's own account."""
    with algopy_testing_context() as ctx:
        contract = ConsentLedger()
        asset_id = _grant(contract, ctx)
        app_addr = _app_address(contract)

        # The app account needs a holding for revoke_consent's freeze to target
        ctx.ledger.update_asset_holdings(asset_id, app_addr, balance=1, frozen=False)

        contract.revoke_consent(arc4.UInt64(asset_id))

        # Inspect the inner AssetFreeze transaction
        freeze_itxn = ctx.txn.last_group.last_itxn.asset_freeze
        assert freeze_itxn.frozen is True, "Expected frozen=True in the freeze inner txn"
        assert int(freeze_itxn.freeze_asset.id) == asset_id


# ---------------------------------------------------------------------------
# test_is_valid_returns_false_when_frozen
# ---------------------------------------------------------------------------

def test_is_valid_returns_false_when_frozen() -> None:
    """is_consent_valid must return False once the consent ASA has been frozen
    (i.e., after revocation)."""
    with algopy_testing_context() as ctx:
        contract = ConsentLedger()
        requester_addr = str(ctx.default_sender)
        asset_id = _grant(contract, ctx, requester=requester_addr)
        app_addr = _app_address(contract)

        # Verify validity before revocation
        before = contract.is_consent_valid(
            asset_id=arc4.UInt64(asset_id),
            requester=arc4.Address(requester_addr),
        )
        assert before.native is True, "Consent should be valid before revocation"

        # Simulate the effect of revoke_consent: freeze the app's holding
        # (the testing library submits the inner AssetFreeze but intentionally
        # does not auto-apply the freeze flag — we update the ledger directly)
        ctx.ledger.update_asset_holdings(asset_id, app_addr, balance=1, frozen=True)

        # Validity check must now return False
        after = contract.is_consent_valid(
            asset_id=arc4.UInt64(asset_id),
            requester=arc4.Address(requester_addr),
        )
        assert after.native is False, "Consent should be invalid after revocation (asset frozen)"
