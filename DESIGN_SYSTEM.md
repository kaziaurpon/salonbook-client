# SalonBook UI design system

Apply this system to every current and future client page. Keep the palette close to a 60/30/10 balance: about 60% Powder Blue canvas, 30% lavender content panels, and 10% peach calls to action and highlights. The supplied reference guides the modern, soft-glow mood; use original SalonBook layouts and assets.

## Brand colors

- Powder Blue: `#8DB9F0` — dominant page canvas, navigation, large page sections, and selected backgrounds.
- Lavender: `#E9E8F8` — cards, forms, menus, appointment panels, and other content surfaces.
- Peach: `#F5B69E` — primary actions, small visual accents, badges, and warm highlights.

Shared tokens are in `src/app/design-tokens.css`: `--brand-blue`, `--brand-lavender`, `--brand-peach`, `--ink`, `--muted-ink`, `--blue-deep`, and `--surface-light`. Prefer these tokens over raw hex values in new page styles. Use dark navy text for contrast; reserve peach for accents and primary actions.

## Existing components and conventions

- Public pages use `PublicShell` for navigation and footer.
- `ServiceCard` is the shared card for real API-backed service data.
- Reuse `.button-primary`, `.secondary-button`, `.public-state`, `.service-skeleton`, `.status-pill`, and the shared input focus styles.
- Data-driven screens need loading, API failure/retry, and empty states.
- Keep narrow-screen layouts and keyboard-visible focus rings.
- Auth and dashboard pages use the same Powder Blue/Lavender/Peach system.

## Direction

Use clean spacing, editorial headings, simple sans-serif interface text, lavender cards over the blue canvas, and restrained peach accents. Keep the experience polished and readable. Do not copy the reference layout, images, copy, or decorative assets.
