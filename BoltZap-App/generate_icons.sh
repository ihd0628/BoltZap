#!/bin/bash
ICON_SRC="assets/icon-1024.png"
ICON_DIR="ios/BoltZap/Images.xcassets/AppIcon.appiconset"

echo "Generating icons..."

# 20pt
sips -z 40 40 "$ICON_SRC" --out "$ICON_DIR/Icon-App-20x20@2x.png"
sips -z 60 60 "$ICON_SRC" --out "$ICON_DIR/Icon-App-20x20@3x.png"

# 29pt
sips -z 58 58 "$ICON_SRC" --out "$ICON_DIR/Icon-App-29x29@2x.png"
sips -z 87 87 "$ICON_SRC" --out "$ICON_DIR/Icon-App-29x29@3x.png"

# 40pt
sips -z 80 80 "$ICON_SRC" --out "$ICON_DIR/Icon-App-40x40@2x.png"
sips -z 120 120 "$ICON_SRC" --out "$ICON_DIR/Icon-App-40x40@3x.png"

# 60pt
sips -z 120 120 "$ICON_SRC" --out "$ICON_DIR/Icon-App-60x60@2x.png"
sips -z 180 180 "$ICON_SRC" --out "$ICON_DIR/Icon-App-60x60@3x.png"

# Marketing
cp "$ICON_SRC" "$ICON_DIR/Icon-App-1024x1024.png"

echo "✅ Icons generated!"
