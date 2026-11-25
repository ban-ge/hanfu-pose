# Architecture

[简体中文](ARCHITECTURE.md) · [Current gallery and downloads](../README.en.md)

## Gallery and workbench

The gallery is a static React 19, TypeScript, and Vite application using Tailwind CSS 4 and HeroUI 3. The browser can call a user-configured OpenAI-compatible image editing endpoint. Three distribution indexes supply published entries and filter fields at build time. `data/catalog.json` adds detailed records where available. React manages filters, selected views, and composition choices within the current page. Refreshing clears those selections.

`src/App.tsx` manages filters, search, per-card views, and composition choices. `src/components/ReferenceCard.tsx` shows the views for one set. `src/components/DetailDialog.tsx` provides details, downloads, and review notes. `src/components/Workbench.tsx` displays selections and assembles the prompt. Shared asset types and view names live in `src/types.ts`. Vite copies `assets/` to `dist/assets/` for previews and static deployment. Originals stay at the project root under `assets/`.

The three `data/*-images.json` indexes distribute clothing, head assets, and poses. The descriptive catalog is maintained separately. The README gives current counts, angles, and download instructions. Batch counts below describe the library at the time of each change.

Each catalog asset has a stable `id`, `kind`, `era`, and `gender`. Additional metadata includes `season` (older single-season records), `seasons` (multiple suggested seasons), `season_scope` (all-season inner layers), `presentation` (garment-only display), `age`, `occasion`, `structure`, and the research lead `inspiration_url`. Records also carry a description, review status, generation prompt, front image in `image`, and angle paths in `view_files`. Hairstyles can be filtered by reference age. Details show available fields. A video used to discover a subject is only a research lead. Views are separate files. Earlier imagegen garment batches used PNG panels extracted with macOS sips or `tools/crop_four_views.swift`, which used top-left pixel coordinates. Consult the record for provenance and review status and the [asset production specification](../.agents/skills/hanfu-asset-library/SKILL.en.md) for current single-angle production.

The workbench orders references by pose, clothing, then optional hair or headwear. A pose and a garment are required. Outer and inner garments share one slot, as do hairstyles and headpieces. A hairstyle’s reference age is included in the prompt. Child and adolescent styles prompt an age-fit check. Age filters cover five detailed stages plus the older adult and middle-aged/older labels. Generation sends originals in prompt order, then previews the downloadable result in the browser. Period or gender mismatches flag a creative combination. They do not establish historical accuracy.

Update the catalog to extend images, prompts, and filters. New angles require a real image and a quality status. Multi-view consistency and historical accuracy require human review. `tools/verify.py` checks files and data. The earlier static page was accessible at `/legacy.html` in the development server.

## Role mappings and shared categories

The role-planning implementation used `src/roles.ts` for categories, settings, gender presentations, and seasonal inner and outer layers. `RoleExplorer` assembled text suggestions for the workbench. Only explicitly linked IDs had reference images. Explicit mappings supplied candidates for Han, Tang, Song, Yuan, Ming, and Qing. Role plans did not generate images. Titles and garment designs remained creative references subject to verification.

Han candidates came from `data/han-role-outfits.json`. Late Han monks used a creative draped garment. Ritual specialists and early Daoist figures reused everyday clothing, subject to period limits.

Tang clothing included 84 adult outer sets, 8 seasonal children’s sets, and 7 shared inner layers. C240–C247 retained child proportions, their seasons, and `age: "儿童"` in garment-only images. Other curated garments retained `gender` after exclusive `role` bindings were removed. Outerwear used `seasons`. Innerwear with `season_scope: "不分季节"` matched every season. Details and prompts shared the seasonal display logic. `occasion` preserved ceremonial, official, military, and religious restrictions.

`RoleExplorer` counted applicable outer and inner garments, including restricted shared designs. Gender and season filters replaced tasks derived from the old role matrix. `tools/next_role_task.cjs` skipped all six dynasties. The importer checked existing source images during ID allocation to avoid reusing archived IDs.

`CostumeFamilyGallery` derived `costume_family` groups before applying the season filter. Within groups, `matchesSeason` kept categories and ordering stable across seasons. An empty group displayed no match and offered nothing to add to the composition. Era, gender, search, and view filters ran before grouping. Innerwear had its own filter.

Head assets use `kind: "head"` and distinguish `head_type: "hairstyle" | "headwear"`. For `era: "通用"`, `applicable_eras` limits reuse. `applicable_ages` lets a basic hairstyle appear under several age filters. Shared designs still have period and cultural limits. The gallery supports type and shared/specific filters. `choiceSlot` maps categories to three composition slots. A new selection replaces the previous one in its slot. The workbench checks era conflicts for restricted shared items and flags physical fit. Details list applicable periods.

Yuan had 63 dedicated sets (53 outer, 2 inner, 8 head), Ming had 59 (48 outer, 3 inner, 8 head), and both Ming and Qing shared 12 outer sets and one Daoist crown. Each distinct garment or headpiece was shown without a person. `data/yuan-role-outfits.json` and `data/ming-role-outfits.json` each mapped 38 roles and 51 standard role/gender options. `RoleExplorer` used these mappings for text and candidates. `CuratedRoleReferences` served Song, Yuan, and Ming, filtering outerwear by season and sharing innerwear year-round. Children could use I227/I228 for Tang, Song, Han Chinese settings in the Yuan period, and Ming. Monks had no separate human-head image. Notes documented the limits of Mongol and Han Chinese Yuan dress. Compatibility was assessed manually.

The P001–P028 batch had 28 pose sets using a common gray-clad model. `pose_category` identified the action, `applicable_roles` referenced names in `roleCatalog`, and `props` recorded contact objects. Categories came from the pose data and search included roles and props. `RolePoseReferences` showed candidates below a role plan, reused the details view to select an angle, and cleared the old action filter on navigation. P020 used child proportions. Poses were shared across seasons. The workbench used the pose for movement, framing, and prop contact while sourcing clothing and headwear independently.

## Han completion and shared head assets

Basic head assets shared across periods use explicit era and age limits. The Han role mappings reuse these assets alongside period-specific headwear.

## Seasonal coverage across five dynasties

`sync_roles.py` inherited seasonal candidates with matching uses and linked children’s inner layers. `RoleExplorer` used `matchesEra` to include eligible shared innerwear in counts and selectors. `report.py` generated a six-dynasty overview and refreshed role and season tables for Song, Yuan, Ming, and Qing. `verify_completion.py` checked the scope of changes to 309 existing records, new assets, and seasonal role coverage. Innerwear was season-independent. Head assets and poses were outside this batch. Garment-only presentation and historical accuracy were recorded separately.

## Coverage checks and Tang role mappings

Like the Han, Song, Yuan, and Ming mappings, `data/tang-role-outfits.json` supplied 38 roles and 51 standard role/gender options. RoleExplorer used explicit candidate IDs. A structural review extended I227/I228 to Tang-themed children. The original generation prompt was retained with a separate `reuse_note`. C478–C480 added Ming first- and second-rank military officials’ everyday robes with lion badges, classified separately from civilian bird badges and armor.

## Qing integration and Ming lion badges

`data/qing-role-outfits.json` supplied 39 roles and 52 standard role/gender options. The mid-to-late Qing batch added 52 sets (37 outer, 4 inner, 11 head) with four independent views each. Twelve Buddhist and Daoist garments and H081 became shared Ming/Qing entries using `era: 通用` and `applicable_eras: [明, 清]`, retaining IDs, paths, and original prompts. Including shared designs, Qing had 19 gender-specific garment categories and 76 seasonal cells. All 208 seasonal combinations for the 52 role/gender options had candidates.

`RoleExplorer` used `matchesEra` to count Qing outerwear. `App` added Qing filters and stable garment groups. Qing summer and winter hats carried explicit `seasons`, which the role text and `CuratedRoleReferences` respected. Children had their own proportions. Adult men’s queues were excluded from Buddhist and Daoist roles. Qing children’s twin buns were assigned only to Han Chinese girls. Notes constrained rank, Manchu/Han context, and court, festive, or informal use.

`output/qing-completion/tasks.json` recorded generation and cropping for 52 sets, `visual-review.json` recorded inspections, and `reuse.json` recorded sharing limits. C496 was reclassified as a layered vest. I230’s right-closing lapel and the center openings of C503–C506 were corrected. At this point the catalog had 455 sets and 1820 views, with candidates in 456 seasonal cells across 114 categories. Checks used `verify:assets`, `verify:coverage`, `typecheck`, and `build`.

`tools/refresh_garment_colors.swift` performed offline color correction with parameters and per-image hashes in `output/color-refresh/`. Each source and its four views used the same use-specific parameters without redrawing, resizing, or CSS filters. Before replacement, `tools/verify_garment_colors.swift` checked dimensions, transparency, hue direction, and shadows pixel by pixel. The optional `color_adjustment` recorded post-processing separately from the original `prompt` and role mappings.

The screen-reference review in `output/tv-costume-review/` retained IDs and paths for 11 sets. Catalog `visual_reference` recorded the production, source, and aspects used. `prompt` held the actual editing prompt. Earlier prompts and color corrections moved to `prompt_history` and `color_adjustment_history`. Production stills stayed in the local research report. The build copied only original `assets/`. The local comparison page showed the earlier front thumbnail, the still, and the four revised views.

## Garment and seasonal review

Seasons describe suitability. `verify:coverage` checks candidate existence, identity, gender, period, child proportions, year-round innerwear, four-view files, and valid tags. Seasonal gaps are informational. Structural coverage and historical accuracy need separate review. `output/iconic-costume-audit/` held source links, candidate IDs, and visual spot checks as recommendations.

`tools/review_batch.py` processes single or batch decisions. Reviewers record color, construction, garment-only presentation, four-view consistency, differences from peers, and sources separately. The import transaction updates catalog records, role mappings, tasks, image hashes, and reports together. After interruption, the next batch invocation first recovers an uncommitted transaction. The gallery reads its build-time catalog. See the [batch visual review guide](guides/batch-review.en.md).
