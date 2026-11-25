# Producing and syncing Hanfu assets

[简体中文](SKILL.md)

## Where originals belong

`hanfu-pose` is the public GitHub source library. The website, `cgi-image-hanfu`, consumes its exports. The library follows Shisei’s approach of separate files for each angle, machine-readable indexes, and distinct sizes for originals and derivatives. Save the full-size image in the source library under its ID and angle, update the index, then export from that file. Look up clothing and inner layers in `data/garment-images.json` and descriptive records in `data/catalog.json`.

Before migrating existing assets, compare IDs, designs, angles, and versions in both repositories. If the latest approved image exists only in the website repository, copy it back first. Replace the previous original, preview, thumbnail, and generation-page reference for that angle. Verify favorites, drafts, and generation history. When renumbering, match the actual assets before and after migration and verify references before removing old aliases.

## Generation and delivery

- Generate each angle separately as a 9:16 portrait. Scale proportionally to deliver a 900 × 1600 px original. Center the entire subject, allowing room for wide sleeves and headpieces. Frame from the original image and check all four edges for padding seams. Wide poses must retain the person and props. Derive previews and thumbnails from individual originals. A cropped panel from a contact sheet cannot serve as a newly generated angle.
- Garments, inner layers, hairstyles, and headwear use `front`, `diag`, `side`, and `back`. Show clothing alone against pure white. Match cut, color, motifs, and details across views. When shoes belong with the outfit and are missing, add the same period- and status-appropriate pair in every view. Show buns with hair and ornaments only. Display crowns, hats, and helmets individually, without a face, neck, or stand.
- Poses use `front`, `diag`, `side`, `high`, and `low`. Keep the white mannequin, background, movement, anatomical left and right, balance, props, and contact points consistent. Save a separate sample photograph of the same pose with the subject and key props in frame. Work within the authorized batch and resume deferred categories when requested.
- Website zoom previews and generation references use 900 × 1600 px files. Scale garment and sample portrait thumbnails proportionally to 360 × 640 px. Use the approved category dimensions for headwear thumbnails. Website garment and headwear filenames follow `{id}-{angle}-preview.webp` and `{id}-{angle}-thumb.webp`. Poses use a JPG per angle, `example-full.jpg` for the full portrait, and `example.jpg` for its thumbnail.
- Follow the [dynasty production guide](../../../docs/guides/dynasty-reference-workflow.en.md) for garment identity, screen references, palettes, seasonal differences, and merging duplicates. Count reframed existing images separately from newly generated views.

## Import checks

Compare each set with the original design at every angle. Inspect the silhouette, ornaments, footwear, perspective, color, and dimensions. Read pixel dimensions directly. Check source files, website previews, thumbnails, and the paths the generation page actually uses. Compare export and import checksums and verify the active local catalog or database records. Count each approved set once its import succeeds. External publication requires separate authorization.
