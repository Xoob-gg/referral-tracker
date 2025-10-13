# Deployment Guide

## How It Works

This project uses GitHub Releases + jsDelivr CDN for distribution. When you create a version tag, GitHub Actions automatically builds and releases the minified script.

## Quick Start

### 1. Create a Release

```bash
# Build locally to verify (optional)
pnpm run build

# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will automatically:
- Build the minified version
- Create a GitHub Release
- Attach `tracker.min.js` to the release
- Make it available on jsDelivr CDN

### 2. Use the CDN URL

Your script will be available at:

```html
<!-- Specific version (RECOMMENDED for production) -->
<script src="https://cdn.jsdelivr.net/gh/xoob/referral-tracker@v1.0.0/tracker.min.js"></script>

<!-- Always latest version -->
<script src="https://cdn.jsdelivr.net/gh/xoob/referral-tracker@latest/tracker.min.js"></script>

<!-- Shortest form (also uses latest) -->
<script src="https://cdn.jsdelivr.net/gh/xoob/referral-tracker/tracker.min.js"></script>
```

### 3. With Auto-initialization

```html
<script
  src="https://cdn.jsdelivr.net/gh/xoob/referral-tracker@latest/tracker.min.js"
  data-referral-tracker-url="https://your-api.com/track"
></script>
```

## CDN URL Options

| URL | Behavior | Use Case |
|-----|----------|----------|
| `@v1.0.0` | Locked to specific version | Production (stable, cached) |
| `@latest` | Auto-updates to newest release | Development/testing |
| No version | Same as `@latest` | Shortest URL |

## Versioning Strategy

### Semantic Versioning
- `v1.0.0` - Major release (breaking changes)
- `v1.1.0` - Minor release (new features)
- `v1.0.1` - Patch release (bug fixes)

### Creating Releases

```bash
# Patch release (bug fix)
git tag v1.0.1
git push origin v1.0.1

# Minor release (new feature)
git tag v1.1.0
git push origin v1.1.0

# Major release (breaking change)
git tag v2.0.0
git push origin v2.0.0
```

## Workflow

1. Make changes to [src/tracker.js](src/tracker.js)
2. Test locally: `pnpm run dev`
3. Commit and push to `dev` branch
4. When ready to release:
   ```bash
   git checkout main
   git merge dev
   git tag v1.0.1
   git push origin main --tags
   ```
5. GitHub Actions builds and releases automatically
6. jsDelivr CDN picks up the new version within minutes

## Monitoring Deployments

- **GitHub Actions**: `https://github.com/xoob/referral-tracker/actions`
- **Releases**: `https://github.com/xoob/referral-tracker/releases`
- **CDN Status**: `https://www.jsdelivr.com/package/gh/xoob/referral-tracker`

## CDN Cache Management

jsDelivr automatically caches releases:
- Specific versions (`@v1.0.0`) are cached permanently
- Latest (`@latest`) updates within minutes but may take up to 24h
- Manual purge: `https://purge.jsdelivr.net/gh/xoob/referral-tracker@latest/tracker.min.js`

## Production Recommendations

1. **Always use specific versions in production**:
   ```html
   <script src="https://cdn.jsdelivr.net/gh/xoob/referral-tracker@v1.0.0/tracker.min.js"></script>
   ```

2. **Use `@latest` for development/testing only**:
   ```html
   <script src="https://cdn.jsdelivr.net/gh/xoob/referral-tracker@latest/tracker.min.js"></script>
   ```

3. **Test before releasing**:
   - Build locally: `pnpm run build`
   - Test with [example.html](example.html): `pnpm run dev`

## Troubleshooting

**Release not creating:**
- Check GitHub Actions logs in Actions tab
- Verify tag starts with `v` (e.g., `v1.0.0`, not `1.0.0`)

**CDN not updating:**
- Wait a few minutes after release
- Check if release exists: `https://github.com/xoob/referral-tracker/releases`
- Purge cache manually using purge URL above

**404 on jsDelivr:**
- Ensure GitHub release was created successfully
- Verify file path: `tracker.min.js` (not in subdirectory)
- Check jsDelivr package page for availability