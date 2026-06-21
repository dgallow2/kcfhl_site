# KCFHL Trade Tool

This tool lets you execute trades between teams without editing `index.html` manually.

## What it updates

- `01 - site-pages/01 - current/data/rosters.json` (source of truth for rosters and picks)
- `Other Projects/fantasy-hockey-tool/transactions.json` (trade history)

Your homepage (`01 - site-pages/01 - current/index.html`) now loads roster/pick values from `data/rosters.json` automatically.

## Run the tool

```bash
cd "Other Projects/fantasy-hockey-tool"
pip3 install streamlit
streamlit run trade_tool.py
```

## Trade workflow

1. Select Team A and Team B.
2. Select outgoing players/picks from each side.
3. Review the preview.
4. Click **Confirm Trade**.

After confirming, the JSON data is saved and the site will show the updated trade values.

## Notes

- The tool enforces roster slot limits for: forwards, defence, goalies, minor pro, and prospects.
- Entry picks and minor pro picks are traded as individual pick assets (for example: `2026 1st (LH)`).
