FROM node:20-slim

RUN npm install -g pnpm@10

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY pnpm-lock.yaml ./

COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/rfid-tracker/package.json ./artifacts/rfid-tracker/
COPY scripts/package.json ./scripts/

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Copy all source files
COPY . .

# Build frontend
RUN NODE_ENV=production pnpm --filter @workspace/rfid-tracker run build

# Build backend
RUN pnpm --filter @workspace/api-server run build

EXPOSE 8080

CMD ["sh", "-c", "pnpm --filter @workspace/db run push && NODE_ENV=production node --enable-source-maps ./artifacts/api-server/dist/index.mjs"]
