# Monorepo Demo - Complete CI/CD Pipeline

Đây là một kho lưu trữ demo hoàn chỉnh cho quy trình CI/CD của monorepo sử dụng:

- **pnpm** - Package manager hiệu quả
- **Turborepo** - Build system và workspace management
- **Changesets** - Versioning và changelog tự động
- **GitHub Actions** - CI/CD pipeline
- **Hono** - Modern web framework cho API
- **Docker** - Containerization

## 🏗️ Cấu trúc dự án

```
├── .github/
│   └── workflows/
│       ├── ci.yml          # CI workflow
│       └── release.yml     # Release workflow
├── .changeset/
│   ├── config.json         # Cấu hình Changesets
│   └── initial-release.md  # Changeset mẫu
├── apps/
│   └── api/                # Hono API server
│       ├── Dockerfile      # Multi-stage Docker build
│       ├── src/
│       │   └── index.ts    # API endpoints
│       └── package.json
├── packages/
│   ├── config/             # Shared configurations
│   │   ├── eslint.js       # ESLint config
│   │   ├── prettier.js     # Prettier config
│   │   └── tsconfig.json   # TypeScript config
│   └── utils/              # Shared utilities
│       ├── src/
│       │   └── index.ts    # Utility functions
│       └── package.json
├── .npmrc                  # npm/pnpm configuration
├── turbo.json              # Turborepo configuration
├── pnpm-workspace.yaml     # pnpm workspace config
└── package.json            # Root package.json
```

## 🚀 Bắt đầu

### Yêu cầu

- Node.js >= 18
- pnpm >= 8

### Cài đặt

```bash
# Clone repository
git clone <your-repo-url>
cd monorepo-demo

# Cài đặt dependencies
pnpm install
```

### Development

```bash
# Chạy tất cả packages ở chế độ development
pnpm dev

# Build tất cả packages
pnpm build

# Lint code
pnpm lint

# Type check
pnpm typecheck

# Clean build artifacts
pnpm clean
```

### API Development

```bash
# Chạy API server ở chế độ development
cd apps/api
pnpm dev

# API sẽ chạy tại http://localhost:3000
```

## 📦 Packages

### @gitops-ziichat-app/utils

Thư viện tiện ích chia sẻ với các functions:
- `formatDate()` - Format date to ISO string
- `generateId()` - Generate random ID
- `capitalize()` - Capitalize first letter
- `delay()` - Async delay function
- `isEmpty()` - Check if value is empty

### @gitops-ziichat-app/api

Hono API server với các endpoints:
- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /utils/id` - Generate random ID
- `POST /utils/capitalize` - Capitalize text
- `POST /utils/validate` - Validate if value is empty

### @gitops-ziichat-app/config

Shared configurations cho:
- ESLint
- Prettier
- TypeScript

## 🔄 Versioning & Release

### Tạo changeset

```bash
# Tạo changeset mới
pnpm changeset

# Hoặc tạo changeset với nội dung cụ thể
pnpm changeset add
```

### Version packages

```bash
# Cập nhật version dựa trên changesets
pnpm changeset version
```

### Publish packages

```bash
# Build và publish packages
pnpm release
```

## 🚢 CI/CD Pipeline

### Continuous Integration (CI)

Workflow `.github/workflows/ci.yml` sẽ chạy khi:
- Tạo Pull Request vào `main`
- Push code vào `main`

CI pipeline bao gồm:
1. Setup Node.js và pnpm
2. Cache dependencies
3. Install dependencies
4. Lint code
5. Type check
6. Build packages
7. Run tests

### Continuous Deployment (CD)

Workflow `.github/workflows/release.yml` sẽ chạy khi:
- Push code vào `main` branch

CD pipeline bao gồm:
1. Build packages
2. Tạo Release PR hoặc publish packages (dựa trên changesets)
3. Build và push Docker image lên GitHub Container Registry
4. Tạo GitHub Release với changelog

### Docker Images

Khi có version mới, Docker image sẽ được build và push với tags:
- `ghcr.io/gitops-ziichat-app/monorepo-demo/api:latest`
- `ghcr.io/gitops-ziichat-app/monorepo-demo/api:v1.0.0`

## 🐳 Docker

### Build locally

```bash
# Build Docker image
docker build -f apps/api/Dockerfile -t monorepo-demo-api .

# Run container
docker run -p 3000:3000 monorepo-demo-api
```

### Multi-stage build

Dockerfile sử dụng multi-stage build để tối ưu:
1. **Pruner stage**: Sử dụng `turbo prune` để tạo minimal workspace
2. **Installer stage**: Install dependencies và build
3. **Runner stage**: Production image với minimal footprint

## 📝 Cấu hình GitHub

### Secrets cần thiết

Để CI/CD hoạt động, cần cấu hình các secrets sau trong GitHub repository:

- `GITHUB_TOKEN` - Tự động có sẵn, dùng để publish packages và tạo releases

### GitHub Packages

Packages sẽ được publish lên GitHub Packages. Cần cấu hình:

1. Cập nhật `@gitops-ziichat-app` trong `.npmrc` thành organization name của bạn
2. Cập nhật `publishConfig.registry` trong các `package.json`

## 🛠️ Customization

### Thêm package mới

1. Tạo thư mục trong `packages/` hoặc `apps/`
2. Tạo `package.json` với workspace dependencies
3. Cập nhật `turbo.json` nếu cần custom pipeline
4. Thêm vào changeset config nếu cần ignore

### Thêm environment mới

1. Cập nhật GitHub Actions workflows
2. Thêm deployment steps trong `release.yml`
3. Cấu hình secrets và variables cần thiết

## 📚 Tài liệu tham khảo

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Hono Documentation](https://hono.dev/)

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Tạo changeset nếu cần: `pnpm changeset`
5. Push và tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

