# Setup Guide - Monorepo Demo

Hướng dẫn chi tiết để setup và sử dụng monorepo demo này.

## 🔧 Setup ban đầu

### 1. Clone và cài đặt

```bash
git clone <your-repo-url>
cd monorepo-demo
pnpm install
```

### 2. Cấu hình GitHub Repository

#### a. Cập nhật organization name

Thay thế `@your-org` và `your-org` trong các file sau:

- `.npmrc`: Dòng `@gitops-ziichat-app:registry=https://npm.pkg.github.com`
- `packages/*/package.json`: Trong `publishConfig.registry`
- `.github/workflows/release.yml`: Trong Docker image tags

#### b. Cấu hình GitHub Packages

1. Vào Settings > Actions > General
2. Trong "Workflow permissions", chọn "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"

#### c. Cấu hình Container Registry

1. Vào Settings > Actions > General
2. Đảm bảo "Allow GitHub Actions to create and approve pull requests" được bật
3. Container images sẽ tự động được push lên `ghcr.io`

### 3. Test local build

```bash
# Build tất cả packages
pnpm build

# Chạy API server
cd apps/api
pnpm dev
```

Truy cập http://localhost:3000 để kiểm tra API.

## 🚀 Quy trình phát triển

### 1. Tạo feature mới

```bash
# Tạo branch mới
git checkout -b feature/new-feature

# Thực hiện thay đổi...

# Tạo changeset
pnpm changeset
```

### 2. Changeset workflow

```bash
# Tạo changeset mới
pnpm changeset

# Chọn packages cần update version
# Chọn loại version bump (patch/minor/major)
# Viết mô tả thay đổi
```

### 3. Submit Pull Request

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

Tạo PR trên GitHub. CI sẽ tự động chạy.

### 4. Merge và Release

Khi merge PR vào `main`:

1. **Nếu có changesets**: GitHub Actions sẽ tạo "Release PR"
2. **Merge Release PR**: Sẽ trigger release process:
   - Update versions
   - Generate changelog
   - Publish packages lên GitHub Packages
   - Build và push Docker images
   - Tạo GitHub Release

## 🔄 Release Process

### Automatic Release (Khuyến nghị)

1. Merge code vào `main`
2. Nếu có changesets, bot sẽ tạo Release PR
3. Review và merge Release PR
4. Release tự động được tạo

### Manual Release

```bash
# Cập nhật versions
pnpm changeset version

# Commit version changes
git add .
git commit -m "chore: release packages"
git push

# Publish (sẽ được CI handle)
```

## 🐳 Docker Usage

### Local Development

```bash
# Build image
docker build -f apps/api/Dockerfile -t monorepo-demo-api .

# Run container
docker run -p 3000:3000 monorepo-demo-api

# Test
curl http://localhost:3000/health
```

### Production Images

Sau khi release, images sẽ có sẵn tại:

```bash
# Pull latest
docker pull ghcr.io/gitops-ziichat-app/monorepo-demo/api:latest

# Pull specific version
docker pull ghcr.io/gitops-ziichat-app/monorepo-demo/api:v1.0.0

# Run
docker run -p 3000:3000 ghcr.io/gitops-ziichat-app/monorepo-demo/api:latest
```

## 📦 Package Management

### Thêm dependency

```bash
# Thêm vào workspace root
pnpm add -w <package>

# Thêm vào specific package
pnpm add <package> --filter @gitops-ziichat-app/utils

# Thêm dev dependency
pnpm add -D <package> --filter @gitops-ziichat-app/api
```

### Workspace dependencies

```bash
# Sử dụng workspace dependency
pnpm add @gitops-ziichat-app/utils --filter @gitops-ziichat-app/api
```

## 🧪 Testing

### Thêm tests

1. Cài đặt test framework:
```bash
pnpm add -D vitest @vitest/ui --filter @gitops-ziichat-app/utils
```

2. Thêm test script vào `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

3. Cập nhật `turbo.json`:
```json
{
  "pipeline": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. pnpm install fails

```bash
# Clear cache
pnpm store prune

# Delete node_modules và reinstall
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install
```

#### 2. Build fails

```bash
# Clean và rebuild
pnpm clean
pnpm build
```

#### 3. Docker build fails

```bash
# Build với verbose output
docker build -f apps/api/Dockerfile -t monorepo-demo-api . --progress=plain
```

#### 4. GitHub Actions fails

- Kiểm tra permissions trong repository settings
- Đảm bảo secrets được cấu hình đúng
- Kiểm tra logs trong Actions tab

### Debug Commands

```bash
# Kiểm tra workspace
pnpm list -r

# Kiểm tra dependencies
pnpm why <package>

# Kiểm tra turbo cache
pnpm turbo build --dry-run

# Kiểm tra changeset status
pnpm changeset status
```

## 📋 Checklist

### Trước khi release

- [ ] Tất cả tests pass
- [ ] Build thành công
- [ ] Lint không có errors
- [ ] Changeset được tạo cho breaking changes
- [ ] README được cập nhật nếu cần
- [ ] Docker image build thành công

### Sau khi release

- [ ] GitHub Release được tạo
- [ ] Packages được publish lên GitHub Packages
- [ ] Docker images có sẵn trên ghcr.io
- [ ] Changelog được cập nhật
- [ ] Version tags được tạo

## 🎯 Best Practices

1. **Luôn tạo changeset** cho mọi thay đổi có ý nghĩa
2. **Sử dụng conventional commits** để dễ theo dõi
3. **Test local** trước khi push
4. **Review changesets** trong Release PR
5. **Monitor CI/CD** pipeline để phát hiện issues sớm
6. **Keep dependencies updated** thường xuyên
7. **Document breaking changes** chi tiết trong changesets

