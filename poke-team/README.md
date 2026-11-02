# Pokémon Team Builder
React 18 (CDN, no build) + a global store (Zustand-style, `store.js`) + PokéAPI.
- Shared state: pokemon list, search, type filter, team (persisted in localStorage). No prop-drilling: Header, Card and TeamPanel all read the same store.
- Two features use shared state: search/type filter and the saved team list.
- Skeleton loaders on list and type filter; empty states for no results and empty team; error state with Retry.

## Run
Open `index.html` (or `npx serve .`).

## Go live
Netlify: drag this folder onto https://app.netlify.com/drop. Or push to GitHub, then Settings > Pages > deploy from `main`.

## Video (about 2 min)
1. Show `store.js`, then a component reading it. 2. Throttle network to show skeletons. 3. Search nonsense for the empty state. 4. Empty team panel. 5. Go offline for the error + Retry.
