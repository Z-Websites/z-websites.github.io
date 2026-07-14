# Source Site V2 Aqua Preview

This folder is a side-by-side visual preview fork of `website/source-site/`.

It keeps the copied current-site content, assets, links, JavaScript, analytics, and form behavior, but applies the aqua v2 visual system from `inbox/aqua-branding-palette-example.html` and the landing page v2 homepage concept.

## Status

- Preview only.
- Not the active current-site baseline.
- Not a production workflow replacement.
- Not a brand-palette replacement unless a later decision record promotes it.

## Working Notes

- Use `assets/css/main.css` as the primary v2 stylesheet.
- The aqua v2 rules are consolidated into the `Source-Site V2 Aqua Theme` section at the end of `main.css`.
- Treat `index.html` as the v2 homepage preview.
- Keep `landing-page-2.html` as the copied source concept reference.
- Do not apply changes from this folder back to `website/source-site/` without explicit approval.

## Preview

From the repository root:

```powershell
python -m http.server 8001 --directory website/source-site-v2
```

Then open `http://127.0.0.1:8001/`.
