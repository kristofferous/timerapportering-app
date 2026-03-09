#!/usr/bin/env bash
# Installs Timerapportering and registers it with GNOME/freedesktop launchers.
# Run from the project root after: pnpm tauri build

set -euo pipefail

APP_NAME="timerapportering"
DISPLAY_NAME="Timerapportering"
BINARY_SRC="src-tauri/target/release/app"
ICON_SRC="src-tauri/icons/128x128.png"

BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/128x128/apps"
INSTALL_PATH="$BIN_DIR/$APP_NAME"
DESKTOP_FILE="$APP_DIR/$APP_NAME.desktop"

if [[ ! -f "$BINARY_SRC" ]]; then
  echo "Error: Binary not found at $BINARY_SRC"
  echo "Run 'pnpm tauri build' first."
  exit 1
fi

# Create dirs
mkdir -p "$BIN_DIR" "$APP_DIR" "$ICON_DIR"

# Copy binary
cp "$BINARY_SRC" "$INSTALL_PATH"
chmod +x "$INSTALL_PATH"
echo "Installed binary → $INSTALL_PATH"

# Copy icon
if [[ -f "$ICON_SRC" ]]; then
  cp "$ICON_SRC" "$ICON_DIR/$APP_NAME.png"
  echo "Installed icon   → $ICON_DIR/$APP_NAME.png"
fi

# Write .desktop file
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=$DISPLAY_NAME
Comment=Timeregistrering for frilanser
Exec=$INSTALL_PATH
Icon=$APP_NAME
Terminal=false
Categories=Office;ProjectManagement;
Keywords=time;timer;rapport;timeregistrering;
StartupWMClass=timerapportering
EOF

chmod +x "$DESKTOP_FILE"
echo "Installed .desktop → $DESKTOP_FILE"

# Update desktop database so GNOME search finds it
if command -v update-desktop-database &>/dev/null; then
  update-desktop-database "$APP_DIR"
  echo "Updated desktop database."
fi

# Update icon cache
if command -v gtk-update-icon-cache &>/dev/null; then
  gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
fi

echo ""
echo "Done! Launch '$DISPLAY_NAME' from GNOME Activities (Super key) or run:"
echo "  $INSTALL_PATH"
