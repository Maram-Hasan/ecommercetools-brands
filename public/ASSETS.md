# Brand assets

Copied without redrawing from the existing reference project for the same brand storefront POC:

| Local file | Reference source |
|---|---|
| `brands/fg/logo.svg` | `app/frontgate/static/svg/ui/logo.svg` |
| `brands/gr/logo.svg` | `app/grandin/static/svg/ui/logo.svg` |
| `brands/gh/logo.svg` | `app/garnethill/static/svg/ui/logo.svg` |
| `fonts/open-sans.woff2` | `app/grandin/static/fonts/OpenSans-VariableFont_wdth,wght.woff2` |
| `fonts/frank-ruhl-libre.woff2` | `app/grandin/static/fonts/FrankRuhlLibre-VariableFont_wght.woff2` |
| `fonts/kepler-light.woff` | `app/garnethill/static/fonts/kepler_std_light.woff` |

Font family, weight and usage follow each brand's `styles/base/_webfonts.scss` and `styles/utils/_variables.scss`. These existing project assets are not newly generated or downloaded substitutes. No claim of broader redistribution rights is made. Proxima Nova (FG) and Gibson (GH) were not bundled locally in the reference project and remain unresolved in the parity audit.

The GH light WOFF2 is byte-identical to the reference project's italic WOFF2 (SHA-256 `79A39E3B6813936A6A522A68576B52938F9A0878FED8503C87A5B2F2AE509B5D`) and renders italic. Use the WOFF source that the reference project lists first: its internal names are `Kepler Std Light`, `Regular`, `KeplerStd-Light`. The mislabeled WOFF2 is not shipped by this POC.
