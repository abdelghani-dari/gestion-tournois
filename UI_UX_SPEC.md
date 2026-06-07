# Gestion Tournois - Fantasy Dashboard UI/UX Specification

This specification documents the layout design system for the **Gestion Tournois** Fantasy Team selection dashboard, inspired by professional dark-themed gaming interfaces.

---

## 1. Grid Hierarchy & Components

The interface is divided into modular components located inside the `src/components/` directory:

1. **`Dashboard.tsx`**: Orchestrator containing the layout grid.
2. **`LeagueHeader.tsx`**: Top header control panel.
3. **`TeamSidebar.tsx`**: Left panel for search and standings.
4. **`PlayerTable.tsx`**: Center-right panel containing the search filters and player data grids.

```
+--------------------------------------------------------------+
|                        LeagueHeader                          |
+-------------------+------------------------------------------+
|                   |                                          |
|    TeamSidebar    |               PlayerTable                |
|  (Left Standings) |       (Position Filters & List)          |
|                   |                                          |
+-------------------+------------------------------------------+
```

---

## 2. Visual Spec (High-End Dark Aesthetic)

* **Backgrounds**: Pure black (`#000000`) for the canvas. Subsections, tables, and sidebar items use dark card colors (`#0e0e11` / `bg-zinc-950`).
* **Borders**: Subtly marked using custom zinc dividers (`#18181b` / `border-zinc-900` or `#27272a` / `border-zinc-800`).
* **Accents**:
  * Action Highlight: Violet / Purple (`#8B2FF5` / `bg-purple-600` / `hover:bg-purple-700`) matching buttons and primary statuses.
  * Selection Stats: Vibrant Green (`#10b981` / `text-emerald-400` / `bg-emerald-950/20`) for ratings, transfer values, and selected counts.
  * Position Badges: Deep Indigo-Blue (`bg-blue-950/40 text-blue-400`) to highlight player classifications.

---

## 3. Font System (Poppins)

* All text nodes use the **Poppins** font family.
* High font weight contrast (medium/semibold for subtitles, bold for names, extra-bold for standings rankings).
* Sizing is customized to be slightly larger ("big a bit" layout) to emphasize readability and comfort.

---

## 4. Resource Declarations

* **Player Photos**: Must render the placeholder image: `@/assets/player-placeholder/player-placeholder.png` (or dynamic bundler references).
* **Team Logos**: Round crest format with generic placeholders or custom vector designs.
