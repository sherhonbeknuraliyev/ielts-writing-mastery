---
name: ci-cd-pipeline
description: CI/CD pipeline patterns for this fullstack project. Use when setting up GitHub Actions, deployment pipelines, or automating builds/tests for the Express + tRPC + MongoDB + React + React Native stack.
---

# CI/CD Pipeline

## GitHub Actions — Main CI

File: `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test
        env:
          MONGODB_URI: mongodb://localhost:27017/test

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
```

## Mobile CI (Expo)

File: `.github/workflows/mobile.yml`

```yaml
name: Mobile CI
on:
  push:
    paths: [src/mobile/**, src/shared/**]
  pull_request:
    paths: [src/mobile/**, src/shared/**]

jobs:
  mobile-check:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: src/mobile
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run typecheck
      - run: npx expo-doctor
```

## Docker Production Build

File: `Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 4000
CMD ["npm", "start"]
```

## Environment Strategy
- **dev**: `.env` (local, gitignored)
- **CI**: GitHub Actions secrets → env vars
- **prod**: Platform env vars (Railway, Render, etc.)

Never commit `.env`. Always commit `.env.example`.
