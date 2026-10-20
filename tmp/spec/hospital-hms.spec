# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['/Users/tron/hospital-hms/backend/app.py'],
    pathex=['/Users/tron/hospital-hms'],
    binaries=[],
    datas=[('/Users/tron/hospital-hms/backend/templates', 'templates'), ('/Users/tron/hospital-hms/backend/static', 'static'), ('/Users/tron/hospital-hms/frontend/dist', 'frontend/dist'), ('/Users/tron/hospital-hms/instance', 'instance')],
    hiddenimports=['flask_sqlalchemy', 'flask_login', 'sqlalchemy', 'werkzeug'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['test', 'pytest', 'numpy', 'scipy', 'matplotlib', 'pandas', 'sklearn', 'tensorflow'],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='hospital-hms',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='hospital-hms',
)
app = BUNDLE(
    coll,
    name='hospital-hms.app',
    icon=None,
    bundle_identifier=None,
)
