# Bug Log

New bugs are appended at the bottom. Never remove entries — only add.

---

## Bug #001 — Blog posts not showing inside a series

**Date:** 2026-03-08
**Symptom:** Adding a blog post to a series in Django Admin had no visible effect on the frontend. The series page always showed "No articles in this series yet."
**Affected pages:** `/blogs/series/:id` and `/blogs` (article count always showing 0)

### Root Cause

Two field name mismatches between the Django API response and the React components that consumed it.

**Mismatch 1 — Series detail page (`BlogSeries.jsx`)**

The `BlogSeriesDetailSerializer` exposes the nested posts list under the key `posts` (inherited from the model's `related_name='posts'`):

```python
# blog/serializers.py
class BlogSeriesDetailSerializer(serializers.ModelSerializer):
    posts = BlogPostSerializer(many=True, read_only=True)
    class Meta:
        fields = ['id', 'title', 'description', 'cover_image', 'created_at', 'posts']
```

But `BlogSeries.jsx` was reading `series.blogs` — a field that doesn't exist in the response:

```jsx
// WRONG — series.blogs is always undefined
{series.blogs && series.blogs.length > 0 ? series.blogs.map(...) : 'No articles'}
```

Since `undefined` is falsy, the condition was always false → always showed "No articles in this series yet."

**Mismatch 2 — Series list page (`Blogs.jsx`)**

The `BlogSeriesSerializer` (used on the list endpoint) returns a computed integer field `post_count`, not an array:

```python
# blog/serializers.py
class BlogSeriesSerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()
    class Meta:
        fields = ['id', 'title', 'description', 'cover_image', 'created_at', 'post_count']
```

But `Blogs.jsx` was reading `s.blogs?.length`, which was also always `undefined` → displayed "0 articles" on every series card regardless of actual post count.

### Fix

**`frontend/src/pages/BlogSeries.jsx`** — change `series.blogs` → `series.posts`:

```jsx
// BEFORE
{series.blogs && series.blogs.length > 0 ? (
    series.blogs.map((blog, index) => ( ... ))

// AFTER
{series.posts && series.posts.length > 0 ? (
    series.posts.map((blog, index) => ( ... ))
```

**`frontend/src/pages/Blogs.jsx`** — change `s.blogs?.length` → `s.post_count`:

```jsx
// BEFORE
<span>📝 {s.blogs?.length || 0} articles</span>

// AFTER
<span>📝 {s.post_count || 0} articles</span>
```

### Lesson

When the API returns data and the UI shows nothing or 0, the first thing to check is the **field names** in the API response vs what the component is reading. Open the browser DevTools → Network tab → click the API request → look at the actual JSON keys returned. Compare them to what the component accesses.

Quick way to check: open `http://localhost:8000/api/series/1/` in the browser and look at the JSON keys.

---

## Bug #002 — Blog post page opens but shows no content

**Date:** 2026-03-08
**Symptom:** Clicking a blog post navigates to the correct URL and the page loads (no error message, no loading spinner stuck), but the article title, content, and all other elements are completely invisible.

### Root Cause

`frontend/src/utils/markdown.js` was written for **marked v4** but the project has **marked v15** installed. Three APIs that the file relied on were removed or changed in the v5–v15 upgrade cycle:

**Breaking change 1 — `marked()` is async in v15**

```js
// OLD (v4): returns a string synchronously
export const parseMarkdown = (content) => marked(content, { renderer });

// NEW (v15): marked() returns a Promise, not a string
// React receives a Promise object for dangerouslySetInnerHTML.__html → renders nothing
```

When React sees `dangerouslySetInnerHTML={{ __html: Promise {} }}`, it silently renders nothing — no error, no blank page message, just empty space.

**Breaking change 2 — second argument to `marked()` removed (v9)**

```js
marked(content, { renderer })  // renderer option in second arg silently ignored in v9+
```

The custom image renderer was never applied, and even if it were, see change 1.

**Breaking change 3 — `marked.setOptions({ highlight })` removed (v5)**

```js
// This option was removed in v5 — code blocks rendered without syntax highlighting
marked.setOptions({ highlight: function(code, lang) { ... } });
```

**Breaking change 4 — Renderer method signatures changed (v12)**

```js
// OLD: positional arguments
renderer.image = function(href, title, text) { ... }

// NEW (v12+): single token object with named properties
renderer.image = function({ href, title, text }) { ... }
```

### Fix

Rewrote `frontend/src/utils/markdown.js` to use the v15 API:

| Old API | New API |
|---|---|
| `marked(content, { renderer })` | `marked.use({ renderer })` + `marked.parse(content)` |
| `marked.setOptions({ highlight })` | `renderer.code({ text, lang })` inside the renderer object |
| `renderer.image = function(href, title, text)` | `renderer.image = function({ href, title, text })` |
| `marked(content)` — async | `marked.parse(content)` — sync, returns string directly |

Key points:
- `marked.use({ renderer })` registers the renderer globally once at module load
- `marked.parse(content)` is synchronous and always returns a string
- The `code` renderer replaces the old `highlight` option and handles syntax highlighting inline

### Lesson

When a page renders blank with no error, check the browser **Console tab** in DevTools for warnings. marked v15 logs deprecation warnings when old APIs are used. Also, when `dangerouslySetInnerHTML` renders nothing, add a `console.log(parseMarkdown(content))` temporarily — if it logs `[object Promise]`, the function is async when it shouldn't be.

Always check the **changelog** of a library when upgrading major versions — v4 → v15 is 11 major versions of breaking changes.

---

## Bug #003 — SVG files rejected when uploading blog images

**Date:** 2026-03-08
**Symptom:** Uploading an `.svg` file via the **Post Images** inline in Django Admin showed the error:
> "Upload a valid image. The file you uploaded was either not an image or a corrupted image."

### Root Cause

`blog/models.py` declared `BlogImage.image` as an `ImageField`:

```python
image = models.ImageField(
    upload_to='blog_images/',
    help_text="Upload your image file (PNG, JPG, SVG, GIF)"  # ← help text promised SVG support
)
```

`ImageField` uses **Pillow** to validate the uploaded file. Pillow is a raster image library — it can decode PNG, JPEG, GIF, WebP, BMP, and TIFF. It cannot parse SVG because SVG is an XML-based vector format, not a pixel bitmap. Pillow's validation runs before the file is saved; when it fails to parse the SVG as a bitmap, it raises a `ValidationError`, which Admin displays as the "not a valid image" message.

The help text claimed SVG was supported, but the field type made it impossible.

### Fix

Changed `BlogImage.image` from `ImageField` to `FileField` with a `FileExtensionValidator`:

```python
# blog/models.py
from django.core.validators import FileExtensionValidator

image = models.FileField(
    upload_to='blog_images/',
    validators=[FileExtensionValidator(
        allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']
    )],
    help_text="Upload your image file (PNG, JPG, GIF, WebP, SVG)"
)
```

`FileField` skips Pillow entirely — it stores whatever file is uploaded. `FileExtensionValidator` then checks that the filename ends with one of the allowed extensions, rejecting anything else (e.g. `.exe`, `.pdf`).

Migration: `blog.0003_alter_blogimage_image` was generated and applied.

### Lesson

`ImageField` = Pillow validation = raster only. If you want to accept SVG (or any non-raster format like PDF), switch to `FileField` and add your own `FileExtensionValidator`. Note that extension validation is weaker than content validation — a user could rename a file to `.png` and still upload it. For a personal admin-only CMS this is acceptable; for public uploads you would additionally check the file's MIME type or magic bytes.

---

## Bug #004 — Inline images in blog posts not loading (404 from wrong server)

**Date:** 2026-03-08
**Symptom:** After uploading an image via the **Post Images** inline in Django Admin and pasting the provided Markdown snippet into a blog post, the image did not appear in the rendered post. The browser DevTools Network tab showed a `404` from `http://localhost:5173/media/blog_images/...` (the React dev server) instead of `http://localhost:8000/media/blog_images/...` (Django).

### Root Cause

`frontend/src/utils/markdown.js` contains a custom image renderer that rewrites relative image paths to absolute Django URLs. The original check only handled the old FastAPI path prefix:

```js
// BEFORE — only rewrites paths starting with /api/uploads
if (href && href.startsWith('/api/uploads')) {
    src = `http://localhost:8000${href}`;
}
```

Django serves uploaded media at `/media/` (configured via `MEDIA_URL = '/media/'` in `settings.py`). So a relative path like `/media/blog_images/diagram.svg` was not matched by the `/api/uploads` check and was passed through unchanged.

When the browser encountered `src="/media/blog_images/diagram.svg"` with no hostname, it resolved it relative to the page origin — which during development is the React dev server (`http://localhost:5173`), not Django. The React dev server has no `/media/` route, so the request returned 404.

### Fix

Extended the condition to also catch `/media/` paths:

```js
// AFTER — rewrites /media/ paths (Django) and /api/uploads paths (old FastAPI)
if (href && (href.startsWith('/media/') || href.startsWith('/api/uploads'))) {
    src = `http://localhost:8000${href}`;
}
```

The admin panel's auto-generated Markdown snippet already uses the full absolute URL (`http://localhost:8000/media/...`), so copy-pasting the snippet works without any rewriting. The fix only matters when someone writes a relative `/media/...` path manually.

### Lesson

When an image shows a 404, check the **Network tab** in DevTools and look at the full URL being requested. If it's hitting the wrong server (5173 instead of 8000), the path was never prepended with a hostname. The root cause is almost always a missing or incomplete URL rewrite in the Markdown image renderer (or wherever `src` is constructed).

---
