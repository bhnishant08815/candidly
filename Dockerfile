# StrataHire Test Automation - Docker Image
# Run Playwright tests in a consistent environment (CI or local)
# Base image includes Node.js and Chromium/Firefox/WebKit

FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies (production + dev for test deps)
RUN npm ci

# Copy test resources (resumes, etc.)
COPY test-resources/ ./test-resources/

# Copy source code
COPY config/ ./config/
COPY pages/ ./pages/
COPY tests/ ./tests/
COPY utils/ ./utils/
COPY global-teardown.ts ./
COPY playwright.config.ts ./
COPY tsconfig.json ./

# Optional: copy .env if present (CI usually injects env vars)
# COPY .env .env

# Default: run all tests (override with docker run or compose)
ENV CI=1
CMD ["npx", "playwright", "test", "--reporter=list"]
