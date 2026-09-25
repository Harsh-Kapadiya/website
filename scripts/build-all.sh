#!/usr/bin/env bash
# Builds frontend/ and admin-panel/ separately, then nests admin-panel's
# build output inside frontend's, so deploying frontend/dist/ as your site
# root serves the admin panel at /admin-panel automatically — no server
# config or reverse proxy needed, works on any static host.
set -e

cd "$(dirname "$0")/.."

echo "→ Building frontend..."
(cd frontend && npm install --no-audit --no-fund && npm run build)

echo "→ Building admin-panel..."
(cd admin-panel && npm install --no-audit --no-fund && npm run build)

echo "→ Nesting admin-panel build inside frontend/dist/admin-panel..."
rm -rf frontend/dist/admin-panel
cp -r admin-panel/dist frontend/dist/admin-panel

echo "✓ Done. Deploy the contents of frontend/dist/ as your site root."
echo "  Site:  https://your-domain.com/"
echo "  Admin: https://your-domain.com/admin-panel/"
