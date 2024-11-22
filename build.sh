#!/bin/bash

# 设置变量
EXTENSION_NAME="markdownEye"
VERSION=$(grep '"version"' manifest.json | cut -d'"' -f4)
BUILD_DIR="build"
DIST_DIR="dist"

# 创建必要的目录
rm -rf $BUILD_DIR $DIST_DIR
mkdir -p $BUILD_DIR $DIST_DIR

# 复制文件到构建目录
cp -r manifest.json background.js content.js popup.html popup.js styles.css icons lib $BUILD_DIR/

# 创建zip包
cd $BUILD_DIR
zip -r "../$DIST_DIR/${EXTENSION_NAME}_v${VERSION}.zip" ./*

# 返回原目录并清理
cd ..
rm -rf $BUILD_DIR

echo "打包完成！发布包位于: $DIST_DIR/${EXTENSION_NAME}_v${VERSION}.zip"
