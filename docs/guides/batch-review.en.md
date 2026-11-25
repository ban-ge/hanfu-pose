# Batch visual review

[简体中文](batch-review.md)

Maintainers should prepare the research records and staged images locally before starting a batch.

Apply the [reference and deduplication rules](dynasty-reference-workflow.en.md#reviewing-existing-and-new-assets) to both new and existing assets. For each design, look for comparable looks in at least two productions set in the period. Inspect the complete outfit, all four garment views, and seasonal variants from the same dynasty. Correct verified errors, merge duplicates, delete redundant designs, and add representative looks that existing assets cannot cover. Verify the views, references, and role coverage. If direct evidence is missing, close the review using the best-supported design and record the inferred parts and evidence in `inference`. If fewer than two productions offer comparable stills, enter the actual `show`, `query`, and `finding` for each search in `reference_search`. With no stills, use an empty array for `references` and an empty string for `selected`. Complete the visual checks as usual.

Run the following from the project root, using the manifest and staging directory for this review.

```sh
pnpm review:batch prepare review.json --ids C047 C321 --staged /tmp/hanfu-stage
pnpm review:batch check review.json --staged /tmp/hanfu-stage
pnpm review:batch apply review.json --staged /tmp/hanfu-stage
```

Omit `--ids` to prepare a library-wide manifest. The template lists comparable candidates, IDs with identical files at all four angles, view paths, and existing stills. After inspection, fill in `color`, `structure`, `presentation`, `four_views`, `compare_with`, `duplicate_review`, and `reason`. For each entry in `references`, record the production, source page, local image, visible details, and `visually_reviewed`. Set `selected` to the chosen still’s ID. Complete `no_body` after inspecting each garment view. Footwear is optional. If visible in both the garment image and an existing still, record the comparison and reference ID. Otherwise skip it. Record obscured details and creative extensions in the conclusion. After the whole library has been reviewed, compare same-purpose designs for the same role across dynasties, verify applicability in each period, and migrate role references before merging.

A manifest can mix `retain`, `replace`, `merge` (into `target`), `delete` (redundant design), and `reopen` (keep the image and reopen review). Use `skip` to defer. Stage replacements at their original relative paths. Template preparation records SHA-256 hashes for the source sheet and all four views. Enter a new `crop` when cropping changes. For merges, record the comparison and structural evidence, then update role references and applicable seasons. Check role coverage after deletion. Applying a batch validates it as a unit and refreshes its report. Validation failure rolls back the changes. Image content and historical evidence require individual review.
