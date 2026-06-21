# KCFHL Site Workflow

Use `public_html/` as the working website folder.

This folder matches the cPanel File Manager layout:

- `public_html/index.html`
- `public_html/draft_center.html`
- `public_html/standings.html`
- `public_html/rules.html`
- `public_html/trade_block.html`
- `public_html/css/`
- `public_html/images/`
- `public_html/data/`

For roster or trade updates, edit the JSON files in:

`public_html/data/teams/`

Then upload the changed files from `public_html/` to the server's `public_html/`.

For local preview, run a simple local server from the repo root:

```sh
python3 -m http.server 8123
```

Then open:

`http://localhost:8123/public_html/index.html`

The older folders are kept as archive/reference for now:

- `01 - site-pages/`
- `02 - css/`
- `03 - other-site-code/`
- `04 - deploy/`
