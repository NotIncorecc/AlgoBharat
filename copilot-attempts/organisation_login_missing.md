The current app only shows the **data owner's** side. The organization's side doesn't exist yet — we need to add a third view where orgs connect their wallet and see all consents granted to their address.

The approach: enumerate all app boxes, decode each `ConsentRecord`, filter by `record.requester === activeAddress`.  

Read [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/components/Header.tsx#1-1), lines 1 to 60

Read [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/App.tsx)

Now I'll create the org view component and wire everything up: 

Created [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/components/OrgConsents.tsx)

I put an import in the wrong place. Let me fix the file properly:  

Replacing 6 lines with 7 lines in [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/components/OrgConsents.tsx)

Replacing 3 lines with 2 lines in [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/components/OrgConsents.tsx)

The `algosdk` import is unused since `record.requester` is already a decoded address string from `decodeConsentRecord`. Remove it and also check the frozen status via the ASA:   

Replacing 7 lines with 6 lines in [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/components/OrgConsents.tsx)

Now also fix the `OrgConsentCard` — it hardcodes `isRevoked = false`. We need to pass the frozen status. Let me look up the ASA's frozen state from the app account. The cleanest approach is to check `algod.getAssetByID(assetId)` — if `params.defaultFrozen` is false but we want the actual holding: the app address holds the ASA (it's the creator and total=1). Let me rethink — the revoke logic freezes the **app's own holding**. So to detect revocation, check `algod.accountAssetInformation(APP_ADDRESS, assetId)` for `isFrozen`. Let me rewrite the component properly:  

Replacing 57 lines with 69 lines in [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/components/OrgConsents.tsx)

Now fix the card to use `revoked` and remove the hardcoded `isRevoked = false`:   

Replacing 39 lines with 36 lines in [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/components/OrgConsents.tsx)

Now update App.tsx and Header.tsx to add the third view:  

Replacing 52 lines with 51 lines in [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/App.tsx), [](file:///home/gokulganesan/AlgoBharat/consent-ledger/frontend/src/components/Header.tsx)

Ran terminal command:  bash -c "cd /home/gokulganesan/AlgoBharat/consent-ledger/frontend && npm run build 2>&1 | grep -E 'error TS|✓ built'"
Completed with input:  bash -c "cd /home/gokulganesan/AlgoBharat/consent-ledger/frontend && npm run build 2>&1 | grep -E 'error TS|✓ built'"

Clean. Here's what was added and how the org flow works:

---

**New "Org View" tab** — the third tab in the header. When an organisation connects their Pera Wallet:

1. The app calls `algod.getApplicationBoxes(appId)` to fetch **all boxes** stored by the ConsentLedger contract
2. Each box name is `"consent_" + uint64 asset_id` — it extracts the asset ID from the name
3. Decodes each box's `ConsentRecord` value
4. **Filters** to only records where `record.requester === your connected address` 
5. For each match, checks `accountAssetInformation(APP_ADDRESS, assetId)` to see if the app's holding is frozen (= consent was revoked)
6. Displays cards with the **data subject's address** (owner), data type, purpose, expiry, and Active/Revoked badge

**The key limitation to understand:** The org can see who granted them consent (the owner's address) and what was permitted, but they cannot access the actual off-chain data — the contract only proves that consent *exists*. The actual data exchange happens in your application layer, using the consent token as an on-chain proof of authorization.