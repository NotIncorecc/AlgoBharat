"""
Manual integration test for ConsentLedger on LocalNet.
Run: poetry run python test_consent_ledger.py
"""
from dotenv import load_dotenv
import algokit_utils
from algokit_utils import BoxReference

load_dotenv()

APP_ID = 1019  # Update if redeployed
APP_ADDRESS = "E36TMDCHVSYAAI5HHNPGGHYFUJYK4MW2SKRORFZQBB46ITJYQ7L72GBWUU"


def box_ref(app_id: int, asset_id: int) -> list:
    """Build box reference for a consent record keyed by asset_id."""
    return [BoxReference(app_id, b"consent_" + asset_id.to_bytes(8, "big"))]


def main() -> None:
    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer = algorand.account.from_environment("DEPLOYER")

    from smart_contracts.artifacts.consent_ledger.consent_ledger_client import (
        ConsentLedgerClient,
        GrantConsentArgs,
        RevokeConsentArgs,
        IsConsentValidArgs,
    )

    client = ConsentLedgerClient(
        algorand=algorand,
        app_id=APP_ID,
        default_sender=deployer.address,
        default_signer=deployer.signer,
    )

    requester = deployer.address   # using deployer as the "organization" for simplicity
    data_type = "medical_records"
    purpose = "annual health screening"
    expiry = 0  # 0 = no expiry

    print(f"\nUsing app_id={APP_ID}, deployer={deployer.address[:16]}...")

    # ------------------------------------------------------------------ #
    # 1. GRANT CONSENT                                                    #
    # ------------------------------------------------------------------ #
    print("\n--- 1. GRANT CONSENT ---")
    grant_result = client.send.grant_consent(
        args=GrantConsentArgs(
            requester=requester,
            data_type=data_type,
            purpose=purpose,
            expiry=expiry,
        ),
        params=algokit_utils.CommonAppCallParams(
            # Cover inner txn fee + box MBR
            extra_fee=algokit_utils.AlgoAmount(micro_algo=3000),
            # Placeholder box ref — actual key is set dynamically after mint
            # We pass app box refs after knowing asset_id, so just pay extra fee here
        ),
    )
    asset_id: int = grant_result.abi_return
    print(f"  ✓ Consent ASA minted. asset_id = {asset_id}")
    print(f"  Transaction ID: {grant_result.tx_id}")

    # ------------------------------------------------------------------ #
    # 2. CHECK CONSENT IS VALID                                           #
    # ------------------------------------------------------------------ #
    print("\n--- 2. CHECK CONSENT IS VALID ---")
    valid_result = client.send.is_consent_valid(
        args=IsConsentValidArgs(
            asset_id=asset_id,
            requester=requester,
        ),
        params=algokit_utils.CommonAppCallParams(
            box_references=box_ref(APP_ID, asset_id),
            asset_references=[asset_id],
            account_references=[APP_ADDRESS],
        ),
    )
    print(f"  is_consent_valid = {valid_result.abi_return}")
    assert valid_result.abi_return is True, "Expected consent to be valid"

    # ------------------------------------------------------------------ #
    # 3. REVOKE CONSENT                                                   #
    # ------------------------------------------------------------------ #
    print("\n--- 3. REVOKE CONSENT ---")
    revoke_result = client.send.revoke_consent(
        args=RevokeConsentArgs(asset_id=asset_id),
        params=algokit_utils.CommonAppCallParams(
            extra_fee=algokit_utils.AlgoAmount(micro_algo=1000),
            box_references=box_ref(APP_ID, asset_id),
            asset_references=[asset_id],
            account_references=[APP_ADDRESS],
        ),
    )
    print(f"  ✓ Consent revoked (ASA frozen). Txn: {revoke_result.tx_id}")

    # ------------------------------------------------------------------ #
    # 4. CHECK CONSENT IS NOW INVALID                                     #
    # ------------------------------------------------------------------ #
    print("\n--- 4. CHECK CONSENT IS NOW INVALID ---")
    invalid_result = client.send.is_consent_valid(
        args=IsConsentValidArgs(
            asset_id=asset_id,
            requester=requester,
        ),
        params=algokit_utils.CommonAppCallParams(
            box_references=box_ref(APP_ID, asset_id),
            asset_references=[asset_id],
            account_references=[APP_ADDRESS],
        ),
    )
    print(f"  is_consent_valid = {invalid_result.abi_return}")
    assert invalid_result.abi_return is False, "Expected consent to be invalid after revocation"

    print("\n✅ All tests passed!")


if __name__ == "__main__":
    main()
