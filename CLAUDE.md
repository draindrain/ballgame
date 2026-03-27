# CLAUDE.md

## Project Overview

**Ballgame** is an early-stage 3D interactive terrain visualization built with React, Three.js, and a Rapier physics engine. The app renders a procedurally-generated terrain that users can orbit with mouse controls. Physics collision is set up for future game objects.

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 18 + TypeScript |
| 3D Renderer | Three.js via `@react-three/fiber` |
| 3D Helpers | `@react-three/drei` (OrbitControls, Environment) |
| Physics | `@react-three/rapier` (Rapier WASM) |
| Terrain Generation | `simplex-noise` (Perlin noise) |
| Build | Vite 6 |
| Linter | ESLint 9 (flat config) |
| Formatter | Prettier 3 |

## Project Structure

```
src/
  main.tsx          # App entry point — mounts Canvas with camera config
  Game.tsx          # Top-level scene: OrbitControls, Environment, Physics, Terrain
  Terrain.tsx       # Procedural terrain mesh + Rapier heightfield collider
  Game.css          # Full-viewport styles for the canvas
  assets/
    react.svg
public/
  kloofendal_48d_partly_cloudy_puresky_1k.hdr  # HDR environment map
```

No routing, no state management library, no backend — pure client-side 3D app.

## Development Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Type-check (tsc -b) then production build
npm run lint       # ESLint across all files
npm run preview    # Preview the production build locally
```

There is no test suite configured. Do not add test scripts unless explicitly asked.

## Code Style & Conventions

All formatting is enforced by Prettier. Run `npm run lint` before committing.

**Prettier config (`.prettierrc`):**
- No semicolons (`semi: false`)
- 4-space indentation
- Double quotes in JS/TS (`singleQuote: false`)
- Single quotes in JSX (`jsxSingleQuote: true`)
- Trailing commas in ES5 positions

**TypeScript:**
- Strict mode enabled — no implicit `any`, no unused variables/parameters
- Target ES2020 for app code
- All source lives in `src/`

**ESLint (flat config — `eslint.config.js`):**
- `@eslint/js` recommended + `typescript-eslint` recommended
- `eslint-plugin-react-hooks` enforced
- `eslint-plugin-react-refresh` warns on non-component exports
- `eslint-config-prettier` disables conflicting formatting rules

## Key Source Files

### `src/main.tsx`
Bootstraps the React app inside a `@react-three/fiber` `<Canvas>`. Camera is placed at `[0, 5, 10]` with a far clip plane of `10000`.

### `src/Game.tsx`
The scene root. Composes:
- `OrbitControls` (max distance 10000)
- `Environment` — HDR sky from `public/` for realistic PBR lighting
- `axesHelper` — visible XYZ axes at 100-unit scale (debug aid)
- `Physics` — Rapier physics context wrapping the terrain

### `src/Terrain.tsx`
Generates terrain on mount via a `useEffect`. Key constants at top of file:

| Constant | Value | Purpose |
|---|---|---|
| `TERRAIN_SIZE` | 512 | Grid resolution (512×512 vertices) |
| `NOISE_SCALE_1` | 0.0005 | Very broad low-frequency variation |
| `NOISE_SCALE_2` | 0.01 | Fine detail, gated by `noiseSwitch` |
| `NOISE_SCALE_3` | 0.002 | Mid-frequency base shape |
| `HEIGHT_MULTIPLIER` | 10 | Vertical scale factor |
| `WIDTH_MULTIPLIER` | 10 | Horizontal scale factor |

Two independent `createNoise2D()` instances provide variation. Heights combine as:
```
height = (noise2 * 2 + noise3 * 16 + noise1 * 20) * HEIGHT_MULTIPLIER
```

After mesh construction the same heightmap is passed to `rapier.ColliderDesc.heightfield(...)` for physics collision. The mesh is rendered teal (`meshStandardMaterial color="teal"`).

The `useEffect` cleanup removes the Rapier collider from the world to avoid leaks on unmount.

## Architecture Notes

- The 3D canvas is the entire app — no HTML UI overlay currently.
- Physics bodies must live inside `<Physics>`. Adding new collidable objects means wrapping them in `<RigidBody>` from `@react-three/rapier`.
- The commented-out `<Sphere>` in `Game.tsx` is an intentional placeholder for future dynamic physics objects.
- Terrain geometry is generated once on mount and never regenerated. It is deterministic only if `createNoise2D()` is seeded — currently it uses a random seed each load.
- The HDR file lives in `public/` and is referenced as an absolute path `/kloofendal_48d_partly_cloudy_puresky_1k.hdr`. Do not move it without updating `Game.tsx`.

## Dependency Notes

- `@react-three/rapier` wraps the Rapier physics engine compiled to WASM. It initializes asynchronously; components using `useRapier()` must be inside `<Physics>`.
- `@react-three/fiber` version 8 requires React 18. Do not downgrade React.
- `simplex-noise` v4 uses ES module exports — the import `createNoise2D` is the named export (not a default).

## Git Workflow

- Main branch: `main`
- No CI pipeline beyond Dependabot for NPM dependency updates (daily, max 5 open PRs, auto-rebase).
- Dependabot PRs use the commit prefix `deps`.
- There are no pre-commit hooks configured.
