Help the user set up this project for the first time.

1. Check if `.env` exists. If not, copy from `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Check if MongoDB is running:
   ```bash
   mongosh --eval "db.runCommand({ ping: 1 })" --quiet
   ```
   If not running, tell the user to start MongoDB first.

4. Seed the database:
   ```bash
   npm run db:seed
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Report the URLs:
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - Health: http://localhost:4000/api/health
