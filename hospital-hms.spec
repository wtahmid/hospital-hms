# hospital-hms.spec
"""
PyInstaller spec file for Hospital HMS desktop app.
Packages the Flask backend and the React frontend SPA into a single app bundle.
"""

import os
import sys

from PyInstaller import compat
from PyInstaller.building.build_main import Analysis, EXE, COLLECT, PYZ

# ── Paths ──────────────────────────────────────────────────────────────────
# Compute project root relative to the current working directory (run pyinstaller from project root)
project_root = os.getcwd()
backend_dir = os.path.join(project_root, 'backend')
frontend_dist = os.path.join(project_root, 'frontend', 'dist')
instance_dir = os.path.join(project_root, 'instance')

# ── Analysis ───────────────────────────────────────────────────────────────
a = Analysis(
    [os.path.join(backend_dir, 'app.py')],
    pathex=[backend_dir, project_root],
    binaries=[],
    datas=[
        # Flask templates
        (os.path.join(backend_dir, 'templates'), 'templates'),
        # Flask static assets
        (os.path.join(backend_dir, 'static'), 'static'),
        # React SPA build
        (frontend_dist, 'frontend/dist'),
        # SQLite database
        (instance_dir, 'instance'),
    ],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)

# ── Bundle ─────────────────────────────────────────────────────────────────
app = EXE(
    a.pure,
    a.scripts,
    a.binaries,
    a.datas,
    name='hospital-hms',
    debug=False,
    strip=False,
    upx=False,
    console=False,  # GUI app (no console window)
    icon=None,
    target_arch='arm64',  # macOS Apple Silicon
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    a.pure,
    a.scripts,
    a.binaries,
    a.datas,
    name='hospital-hms',
    strip=False,
    upx=False,
    upx_exclude=[],
    debug=False,
)

# ── One-file variant (optional) ────────────────────────────────────────────
# app_onefile = EXE(
#     a.pure,
#     a.scripts,
#     a.binaries,
#     a.datas,
#     name='hospital-hms',
#     debug=False,
#     strip=False,
#     upx=False,
#     console=True,
# )
