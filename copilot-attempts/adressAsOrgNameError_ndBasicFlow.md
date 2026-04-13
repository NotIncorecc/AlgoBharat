The error is clear: the contract's `requester` arg is type `address` (an Algorand address), but the form is sending the organization name string. Let me fix the form to accept an Algorand address for that field. 

Read [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/components/GrantConsentForm.tsx#1-1), lines 1 to 170

Now I have the full picture. The fix: rename the "Organization Name" field to "Requester Address" (since the contract param is `arc4.Address`), add Algorand address validation, and also add a separate "Organization / Label" field that feeds into the `purpose`. 

Actually, a cleaner UX is: keep organization name as a label in the `purpose` field, and add a separate "Requester Algorand Address" field for the actual address parameter. Let me update the form:  

Replacing 170 lines with 200 lines in [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/components/GrantConsentForm.tsx)


```

```
Now let me verify the build still compiles:   

Ran terminal command:  bash -c "cd /home/gokulganesan/AlgoBharat/consent-ledger/frontend && npm run build 2>&1 | grep -E 'error|✓ built'"
Completed with input:  bash -c "cd /home/gokulganesan/AlgoBharat/consent-ledger/frontend && npm run build 2>&1 | grep -E 'error|✓ built'"

Clean. Here's what was wrong and the overall workflow:

---

**The bug:** The contract's `grant_consent` method takes `requester` as `arc4.Address` — meaning it must be a valid 58-character Algorand wallet address. The form was passing the free-text org name ("Apollo Hospitals") there, which algosdk correctly rejected.

**The fix:** The "Organization Name" field is now split into two:
- **Requester Algorand Address** (required) — the actual `address` arg the contract expects (the organisation's wallet)
- **Organisation Name** (optional label) — a human-friendly name prepended to the `purpose` string on-chain

---

**General workflow for this project:**

1. **User connects Pera Wallet** (TestNet mode) via the header button

2. **Grant Consent** — user fills in:
   - The organisation's Algorand address (who gets access to their data)
   - Optional display name, data type (KYC / Medical / Financial), purpose, expiry
   - Submitting calls `grant_consent()` on the contract → mints a **Consent ASA** (NFT) held by the user, writes a box record keyed by ASA ID
   - The user receives the ASA in their wallet as proof of consent

3. **Active Consents** — fetches all ASAs in the user's wallet created by the ConsentLedger app, reads each box record, and displays consent cards
   - **Active** (green) = ASA not frozen
   - **Revoked** (red) = ASA frozen on-chain
   - **Revoke button** calls `revoke_consent()` → triggers an inner AssetFreeze transaction, permanently freezing the ASA as an immutable on-chain revocation record

4. **Verification** (off-screen) — any third party can call `is_consent_valid(asset_id, requester_address)` to check if a consent is still active and not expired

Made changes.