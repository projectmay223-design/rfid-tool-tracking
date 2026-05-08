FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm@10

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./

COPY lib/db/package.json ./lib/db/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/rfid-tracker/package.json ./artifacts/rfid-tracker/

# Install all dependencies (including devDeps needed for build + db push)
RUN rm -rf node_modules pnpm-lock.yaml && pnpm install --no-optional=false

# Copy all source files
COPY . .

# Build frontend (PORT not needed for build; BASE_PATH defaults to /)
RUN pnpm install --no-optional=false && NODE_ENV=production pnpm --filter @workspace/rfid-tracker run build

# Build backend
RUN pnpm --filter @workspace/api-server run build

EXPOSE 8080

# Run DB migration then start server
CMD sh -c "pnpm --filter @workspace/db run push && NODE_ENV=production node --enable-source-maps ./artifacts/api-server/dist/index.mjs"
