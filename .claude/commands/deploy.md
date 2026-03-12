Prepare this project for deployment. Target: "$ARGUMENTS"

## Build for production:
```bash
npm run build          # Compiles TypeScript + bundles React
npm run build:server   # Compiles server only
```

Output: `dist/client/` (static frontend), `dist/server/` (Node.js backend)

## Production server setup:
Update `src/server/index.ts` to serve the built client in production:

```ts
import path from "path";
import { fileURLToPath } from "url";

// After tRPC middleware, add:
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientPath = path.join(__dirname, "../client");
  app.use(express.static(clientPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}
```

## Environment variables for production:
```
NODE_ENV=production
MONGODB_URI=<production-mongodb-uri>
PORT=4000
JWT_SECRET=<strong-random-secret>
```

## Deploy targets:

### Railway / Render:
- Set build command: `npm run build`
- Set start command: `npm start`
- Add environment variables in dashboard
- Add MongoDB add-on or use MongoDB Atlas

### Docker:
Create a `Dockerfile`:
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

### VPS (manual):
```bash
git pull
npm ci
npm run build
pm2 restart app  # or: node dist/server/index.js
```
