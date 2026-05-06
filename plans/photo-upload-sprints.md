# Photo Upload Backend-First Sprint Plan

## Goal

Add optional one-image uploads to anonymous cell stories, with a backend-first implementation that can be tested before committing to polished UX. V1 keeps the product model simple:

- A photo is an optional attachment on a story.
- Story text is still required.
- Each story can have at most one image.
- A cell can have many photos because it can have many stories.
- Photos appear immediately.
- Admin moderation remains row-based: hide the story to remove it from app views.
- Storage uses a private Supabase bucket and short-lived signed URLs.

## Working Principles

- Each ticket should be small enough to commit independently.
- Each commit should leave the app runnable.
- Backend behavior should be validated before frontend polish.
- Route handlers are the security boundary; browser validation is only UX.
- Store private object paths and metadata in Postgres, never signed URLs.
- Use `SUPABASE_SERVICE_ROLE_KEY` only in server-only code.
- Prefer validation scripts or focused API tests where unit tests are not already established.

## Definition Of Done For Every Ticket

- Code builds or the relevant validation command passes.
- Existing text-only story behavior is either preserved or intentionally migrated with clear validation.
- Errors are handled without losing user-entered story text in the lo-fi UI.
- Security-sensitive changes include a negative validation case.
- The commit message describes one logical change.

## Suggested Commit Style

- `backend: add server-only Supabase admin client`
- `db: add private story image storage`
- `api: validate multipart story submissions`
- `api: upload story images to private storage`
- `ui: add lo-fi story image picker`
- `docs: document story image moderation`

Do not mix schema, API, frontend, and docs in one commit unless the change is inseparable.

---

## Sprint 0 - Backend Safety And Test Harness

### Demoable Outcome

The app still runs with text-only stories, and there is a repeatable way to validate story API behavior before image work begins.

### Ticket 0.1 - Document Backend-Only Environment Variables

**Goal:** Add the service-role key expectation without exposing it to the client.

**Scope:**

- Update `.env.example` with `SUPABASE_SERVICE_ROLE_KEY=`.
- Add comments or documentation that this variable must never be prefixed with `NEXT_PUBLIC_`.
- Keep existing public Supabase variables unchanged.

**Validation:**

- Confirm no client component imports or references `SUPABASE_SERVICE_ROLE_KEY`.
- Run `npm run lint`.

**Commit:** `docs: document Supabase service role env`

### Ticket 0.2 - Add A Server-Only Supabase Admin Client

**Goal:** Provide a safe server-only client for Storage operations.

**Scope:**

- Add `lib/supabase/admin.ts`.
- Use `NEXT_PUBLIC_SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY`.
- Configure auth session persistence off.
- Use `server-only` if compatible with the current Next.js setup.
- Throw a clear error if required env vars are missing.

**Validation:**

- Run `npm run lint`.
- Add or run a minimal server-only import validation if the project has no test harness.
- Confirm no `'use client'` module imports `lib/supabase/admin.ts`.

**Commit:** `backend: add server-only Supabase admin client`

### Ticket 0.3 - Lock In Current Text-Only Story API Behavior

**Goal:** Capture current behavior before changing request formats.

**Scope:**

- Add a small validation script or API test for current `POST /api/stories` text-only success and validation failures.
- Cover missing `seasonId`, invalid `cellNumber`, invalid board size, missing text, and over-limit text.
- Prefer a script that can run against `npm run dev` if no test runner exists yet.

**Validation:**

- Run the validation script against the current app.
- Run `npm run lint`.

**Commit:** `test: add story api validation coverage`

### Ticket 0.4 - Decide And Document POST Compatibility

**Goal:** Make the upload API transition explicit.

**Scope:**

- Decide whether `POST /api/stories` will:
  - accept only `multipart/form-data` after the change, or
  - temporarily support both JSON and multipart.
- Recommendation: support both during backend transition, then let `lib/stories.ts` move to multipart. This keeps old text-only behavior testable while image support lands.
- Document the decision in the sprint notes or API comments.

**Validation:**

- Validation checklist identifies both accepted request formats, or clearly states JSON is intentionally removed.

**Commit:** `docs: define story post upload contract`

---

## Sprint 1 - Schema And Storage Foundation

### Demoable Outcome

Supabase has a private image bucket and `stories` can store nullable image metadata, while all existing text-only reads and writes still work.

### Ticket 1.1 - Add Private Story Images Bucket Migration

**Goal:** Create the Storage container for story images.

**Scope:**

- Add `supabase/migrations/0002_story_images.sql`.
- Insert a private bucket named `story-images` into `storage.buckets`.
- Set size and MIME restrictions if supported by the Supabase Storage bucket schema in the current project.
- Do not add anonymous insert/update/delete policies.

**Validation:**

- Apply migration in Supabase.
- Confirm anon users cannot list, read, upload, update, or delete Storage objects directly.
- Confirm service-role access can manage the bucket.

**Commit:** `db: add private story image bucket`

### Ticket 1.2 - Add Story Image Metadata Columns

**Goal:** Store image metadata on the existing `stories` row.

**Scope:**

- Add nullable columns:
  - `image_bucket text`
  - `image_path text`
  - `image_mime_type text`
  - `image_size_bytes integer`
  - `image_width integer`
  - `image_height integer`
- Add checks:
  - `image_size_bytes > 0` when present.
  - `image_width > 0` and `image_height > 0` when present.
  - MIME type is one of `image/jpeg`, `image/png`, `image/webp` when present.
  - Image metadata is internally consistent, at minimum requiring bucket/path/mime/size to be all null or all present.

**Validation:**

- Apply migration.
- Insert a text-only story with all image columns null.
- Insert a valid image-metadata story row manually.
- Confirm invalid MIME and partial metadata rows fail.

**Commit:** `db: add story image metadata columns`

### Ticket 1.3 - Update Story Types And Row Mapping

**Goal:** Make image metadata available without changing UI behavior yet.

**Scope:**

- Extend `types/game.ts` with an optional `StoryImage` type.
- Update `Story` to include `image?: StoryImage`.
- Update `lib/supabase/client.ts` `StoryRow` and `mapStoryRow`.
- Do not include signed URLs yet unless the API is ready to generate them.

**Validation:**

- Run `npm run lint`.
- Run TypeScript/build validation if available.
- Confirm `/api/stories` still returns text-only rows successfully.

**Commit:** `types: add optional story image metadata`

### Ticket 1.4 - Keep Cells Route Text/Visibility Based

**Goal:** Ensure board indicators still work without image-specific logic.

**Scope:**

- Confirm `app/api/stories/cells/route.ts` returns cells with visible stories only.
- No signed URL generation in this route.
- No change needed unless types or select columns break.

**Validation:**

- Run existing or new validation for cells with visible stories.
- Confirm hidden rows do not create board dots.

**Commit:** only if code changes are needed.

---

## Sprint 2 - Backend Upload API

### Demoable Outcome

Using API requests, a caller can create text-only stories and image-attached stories. Images are stored privately, metadata is saved, invalid files are rejected, and visible stories return signed image URLs.

### Ticket 2.1 - Parse Multipart Story Submissions

**Goal:** Let `POST /api/stories` receive form data.

**Scope:**

- Update `app/api/stories/route.ts` to parse `multipart/form-data`.
- Preserve JSON text-only support if Ticket 0.4 chose compatibility.
- Normalize form fields into the same internal input shape:
  - `seasonId`
  - `cellNumber`
  - `boardRows`
  - `boardCols`
  - `text`
  - optional `image`
- Keep story text required.

**Validation:**

- Text-only JSON request still succeeds if compatibility is kept.
- Text-only multipart request succeeds.
- Missing text fails.
- Image-only request fails.
- Run `npm run lint`.

**Commit:** `api: parse multipart story submissions`

### Ticket 2.2 - Add Server-Side Image Validation

**Goal:** Reject unsafe or unsupported files before Storage upload.

**Scope:**

- Allow exactly one optional file field named `image`.
- Reject multiple image fields.
- Set max file size to `5 MB`.
- Allow only JPEG, PNG, and WebP.
- Reject SVG, GIF, PDF, HEIC, empty files, and unknown types.
- Do not trust `File.type` alone; inspect magic bytes for JPEG, PNG, and WebP.
- Derive the stored extension from detected type, not the original filename.

**Validation:**

- Valid JPEG/PNG/WebP files pass.
- Oversized file fails.
- Forged MIME type fails.
- Unsupported MIME type fails.
- Multiple files fail.
- Empty file fails.

**Commit:** `api: validate story image uploads`

### Ticket 2.3 - Define Safe Object Path Strategy

**Goal:** Make object paths non-identifying and collision-resistant.

**Scope:**

- Generate a story UUID server-side before upload, or generate a separate random object UUID.
- Use paths like `stories/<storyId>/<random>.<ext>` or `<seasonId>/<cellNumber>/<uuid>.<ext>`.
- Do not use original filenames.
- Ensure path generation happens in one helper with tests or validation cases.

**Validation:**

- Generated paths contain no original filename.
- Generated paths have expected extension from detected MIME.
- Generated paths are unique across repeated calls.

**Commit:** `api: add safe story image paths`

### Ticket 2.4 - Upload Images With Service Role

**Goal:** Store valid images in the private bucket.

**Scope:**

- Use `lib/supabase/admin.ts` from the route handler.
- Upload to `story-images`.
- Set content type from detected MIME.
- Avoid upsert unless intentionally needed; random paths should not collide.
- Return object metadata to the insert flow.

**Validation:**

- Valid image uploads create a private Storage object.
- Anon key cannot read the object directly.
- Service-role client can read/delete it.

**Commit:** `api: upload story images to private storage`

### Ticket 2.5 - Insert Story Rows With Image Metadata

**Goal:** Persist the story and optional image metadata atomically enough for v1.

**Scope:**

- Insert text-only stories with image columns null.
- Insert image stories with bucket/path/mime/size and dimensions if dimensions are available.
- If upload succeeds but DB insert fails, delete the uploaded object before returning an error.
- If dimensions are hard to obtain without adding image processing dependencies, leave width/height null or defer those columns.

**Validation:**

- Text-only story insert succeeds.
- Image story insert succeeds and row metadata matches Storage object.
- Simulated DB insert failure deletes uploaded object.
- Row-level `hidden = false` behavior remains unchanged.

**Commit:** `api: persist story image metadata`

### Ticket 2.6 - Generate Signed URLs For Visible Stories

**Goal:** Let clients render private images without making the bucket public.

**Scope:**

- Update `GET /api/stories` to create signed URLs for rows with image metadata.
- Do not generate signed URLs for hidden rows.
- Choose a short TTL, such as 10-30 minutes.
- Return `story.image.url` in API responses, but never store it in Postgres.
- Include enough metadata for rendering and debugging.
- Keep absent-image stories unchanged.

**Validation:**

- Visible image story response includes signed URL.
- Text-only story response has no image URL.
- Hidden image story does not appear and does not receive a signed URL.
- Signed URL can fetch the private object during TTL.
- Anon direct Storage URL remains blocked.

**Commit:** `api: return signed story image urls`

### Ticket 2.7 - Add Backend Upload Validation Coverage

**Goal:** Make backend behavior repeatable and regression-resistant.

**Scope:**

- Extend the validation script/test suite to cover:
  - JSON text-only success if compatibility is kept.
  - Multipart text-only success.
  - Multipart text plus valid image success.
  - Missing text rejected.
  - Image-only rejected.
  - Two image fields rejected.
  - Oversized file rejected.
  - Unsupported file rejected.
  - Forged MIME rejected.
  - Upload success plus DB failure cleanup, using mocks if possible.
  - Hidden image rows receive no signed URLs.

**Validation:**

- Run validation suite/script.
- Run `npm run lint`.

**Commit:** `test: cover story image upload api`

---

## Sprint 3 - Moderation, Cleanup, And Abuse Controls

### Demoable Outcome

An admin can hide an image story and see it disappear from app/API views. There is a documented path to hard-delete image objects and identify orphaned data.

### Ticket 3.1 - Document Hide And Hard Delete Operations

**Goal:** Make moderation explicit and repeatable.

**Scope:**

- Add or update documentation with:
  - SQL to hide a story: `update public.stories set hidden = true where id = ...`.
  - Explanation that hiding stops future signed URL generation.
  - Note that existing signed URLs may work until TTL expiry.
  - Hard delete process: delete Storage object at `image_path`, then delete or keep row depending on admin intent.

**Validation:**

- Follow the documented hide steps manually.
- Confirm hidden story disappears from drawer and `/stories`.
- Confirm no fresh signed URL is returned.

**Commit:** `docs: document image story moderation`

### Ticket 3.2 - Add Orphan Detection Queries Or Script

**Goal:** Help clean up failed QA/deploy states.

**Scope:**

- Add SQL notes or a small server-side/admin script to identify:
  - story rows with image metadata but missing Storage objects.
  - Storage objects with no matching story row.
- Keep it admin-only and never callable by anonymous users.

**Validation:**

- Run against a test project or manually reason with sample rows/objects.
- Confirm it does not expose service-role credentials to client code.

**Commit:** `tools: add story image cleanup checks`

### Ticket 3.3 - Add Minimal Upload Abuse Guard

**Goal:** Reduce risk before exposing anonymous image uploads.

**Scope:**

- Add a simple server-side rate limit or deployment-level guidance.
- If implementing in app code, keep it small and well-scoped:
  - per IP where available, or
  - per route in-memory guard for local/demo only with a note about production limitations.
- Return `429` with the existing friendly client behavior.

**Validation:**

- Repeated rapid uploads eventually return `429`.
- Normal single upload still succeeds.
- UI keeps the draft and selected file on `429`.

**Commit:** `api: add basic story upload rate limit`

### Ticket 3.4 - Add Storage Policy Verification Notes

**Goal:** Ensure private bucket assumptions are tested.

**Scope:**

- Document checks proving:
  - anon cannot list bucket objects.
  - anon cannot upload.
  - anon cannot delete.
  - unsigned public object URLs do not work.
  - signed URLs work only for visible stories returned by the API.

**Validation:**

- Run the checks manually or through the validation script.

**Commit:** `docs: add storage policy verification`

---

## Sprint 4 - Lo-Fi Frontend Upload And Rendering

### Demoable Outcome

From `/play/game`, a user can attach one image to a story, submit it, and see it render in the drawer and story wall. The UI is intentionally basic.

### Ticket 4.1 - Update Browser Story API Helper

**Goal:** Let client code submit optional files.

**Scope:**

- Update `lib/stories.ts` `PostStoryInput` to include `image?: File`.
- Build `FormData` in `postStory`.
- Preserve error handling and `status` propagation.
- Keep fetch helpers unchanged except for typed image data in responses.

**Validation:**

- Text-only `postStory` still succeeds.
- `postStory` with image sends multipart data.
- API validation errors surface as readable messages.

**Commit:** `client: submit story form data`

### Ticket 4.2 - Add Basic File Picker To Cell Drawer

**Goal:** Enable image selection without polished UI.

**Scope:**

- Add a labeled file input under the textarea in `components/CellStoriesDrawer.tsx`.
- Accept `.jpg,.jpeg,.png,.webp` and `image/jpeg,image/png,image/webp`.
- Show helper text: `Optional. JPG, PNG, or WebP up to 5 MB.`
- Keep text required.
- Pass selected `File` into `postStory`.

**Validation:**

- Text-only story submit still works.
- Image-attached story submit works.
- Missing text with selected image cannot submit.

**Commit:** `ui: add lo-fi story image picker`

### Ticket 4.3 - Add Preview And Remove Controls

**Goal:** Give users basic confidence before uploading.

**Scope:**

- Show a local preview using `URL.createObjectURL`.
- Add `Remove photo` and `Change photo` affordances.
- Revoke object URLs on remove, submit success, drawer close, selected file change, and unmount.
- Preserve selected file and preview on upload failure where possible.

**Validation:**

- Selecting an image shows a preview.
- Removing clears the preview and file.
- Failed submit keeps text and selected image.
- Browser memory is not leaked through unreleased object URLs in normal flows.

**Commit:** `ui: preview selected story image`

### Ticket 4.4 - Render Images In Cell Story Cards

**Goal:** Display uploaded photos where the user just posted them.

**Scope:**

- Render `story.image.url` inside story cards in `CellStoriesDrawer.tsx`.
- Use plain `<img>` for v1 unless `next/image` remote config is added.
- Use simple alt text such as `Photo attached to story for square X`.
- Handle broken/expired signed URLs with a small fallback or natural broken image behavior for v1.

**Validation:**

- Submitted image appears after successful post.
- Image still appears after refresh/refetch while signed URL is valid.
- Text-only story card remains unchanged.

**Commit:** `ui: render images in cell stories`

### Ticket 4.5 - Render Images In Story Wall Cards

**Goal:** Make `/stories` a basic visual gallery without adding a separate page.

**Scope:**

- Render image at the top of each `StoriesBrowse` card when present.
- Keep existing season, time, text, and square metadata.
- Do not add filters, carousel, modal, masonry, or layout polish yet.

**Validation:**

- `/stories` shows mixed text-only and image stories.
- Cards remain readable at mobile and desktop widths.
- Expired/broken image does not crash the page.

**Commit:** `ui: render images in story wall`

### Ticket 4.6 - Update User-Facing Copy

**Goal:** Make the rough UI understandable.

**Scope:**

- Update `components/HowItWorks.tsx` to mention adding stories and optional photos.
- Update drawer label from `Add a story` only if needed, such as `Add a story or photo`.
- Avoid promising polished gallery behavior.

**Validation:**

- Copy matches actual functionality.
- Run `npm run lint`.

**Commit:** `copy: mention optional story photos`

---

## Sprint 5 - End-To-End Hardening

### Demoable Outcome

The feature can be demonstrated end-to-end with clear validation evidence, known limitations, and cleanup instructions.

### Ticket 5.1 - Run Full Manual QA Matrix

**Goal:** Validate the feature as a user and as an admin.

**Scope:**

- Test:
  - text-only story from drawer.
  - image story from drawer.
  - refresh and read back in drawer.
  - read back in `/stories`.
  - invalid file types.
  - oversized files.
  - image-only submission.
  - rapid repeated submissions.
  - hidden story moderation.
  - direct anon Storage access blocked.
  - signed URL works before expiry.

**Validation:**

- QA notes recorded in markdown.
- Any failures become follow-up tickets.

**Commit:** `docs: add image upload qa notes`

### Ticket 5.2 - Run Build And Lint

**Goal:** Confirm the app is shippable from a code-health perspective.

**Scope:**

- Run `npm run lint`.
- Run `npm run build`.
- Fix issues introduced by this feature.

**Validation:**

- Both commands pass.

**Commit:** only if fixes are needed.

### Ticket 5.3 - Document Known Limitations And Follow-Ups

**Goal:** Separate v1 backend functionality from later UI/product polish.

**Scope:**

- Document:
  - no multiple images per single story.
  - no image-only posts.
  - no in-app admin panel.
  - signed URLs may remain valid until expiry after hiding.
  - EXIF stripping is not guaranteed unless image re-encoding was added.
  - UI is intentionally lo-fi.
- Add follow-up candidates:
  - image compression/re-encoding.
  - gallery filters.
  - admin moderation UI.
  - stronger production rate limiting.
  - content moderation review queue.

**Validation:**

- Documentation accurately matches implementation.

**Commit:** `docs: record story image limitations`

---

## Recommended Sprint Order

1. Sprint 0: make the backend safe to change and test.
2. Sprint 1: apply schema and Storage foundation.
3. Sprint 2: build the upload API and signed URL read path.
4. Sprint 3: prove moderation and cleanup behavior.
5. Sprint 4: add the simplest possible UI to exercise the backend.
6. Sprint 5: harden, validate, and document what remains.

## Backend Validation Checklist

- `POST /api/stories` accepts text-only stories.
- `POST /api/stories` accepts text plus one valid JPEG/PNG/WebP.
- `POST /api/stories` rejects image-only submissions.
- `POST /api/stories` rejects multiple images.
- `POST /api/stories` rejects unsupported file types.
- `POST /api/stories` rejects forged MIME files.
- `POST /api/stories` rejects oversized files.
- Uploaded objects land in the private `story-images` bucket.
- Story rows store object path and metadata only.
- API responses include signed image URLs only for visible image stories.
- Hidden stories are omitted from list responses.
- Hidden image stories do not receive fresh signed URLs.
- Anon users cannot directly list/read/write/delete Storage objects.
- Insert failure after upload deletes the object.
- Lint and build pass.

## Frontend Validation Checklist

- User can submit a text-only story from the drawer.
- User can select, preview, remove, and submit one image.
- User cannot submit an image without story text.
- Failed upload keeps story text and selected image.
- Successful upload clears the draft and selected image.
- Drawer story cards render uploaded images.
- `/stories` cards render uploaded images.
- Text-only cards still render cleanly.
- Lo-fi UI is accessible enough for testing: labeled input, helper text, remove button, and visible errors.
