# CEO-approved gameplay layout contract — Yimma Ekhtalat

**Locked direction (26 November 2026):** The CEO explicitly restored the original design: **exactly two sorting baskets and two item categories in every round**, even though each world contains 4–5 available item categories across its stages.

1. Exactly **two distinct types** are selected from the current world's catalog for each level/round.
2. Exactly **two visible baskets**, one for each selected type; no third, fourth, or fifth basket.
3. Only the selected two types may spawn. Keep no more than **six items** on screen simultaneously.
4. First round in the kitchen must sort **uncooked rice (عيش)** and **lentils (عدس)**. Their present temporary emoji visuals are NOT approved artwork.
5. World catalog stays unchanged (5+5+5+4+4=23 types total); categories are available across stages, **not simultaneously** in any one round.
6. Keep five approved painted world backgrounds and their world allocation unchanged. Restore fifth world title **ساحل الغوص**.
7. Maintain mobile/desktop touch and mouse drag, timing, win/loss, progress and stars.
8. Do not silently add HUD clutter, basket count, object types or mechanics without CEO approval.
9. Tests: `node qa/two-baskets-smoke.cjs` via workflow `Two-Basket Original Design Acceptance`; test MUST check two baskets on 25 stages and on desktop and mobile, unique pair, bounded item count and correct mapping.

**Separate unresolved art problem:** Many of the 23 item illustrations are semantically wrong emoji stand-ins and basket artwork is generic. This contract does not approve or fix those graphics; handle them under ART-FIDELITY-010.
