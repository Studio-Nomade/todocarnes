FROM mcr.microsoft.com/playwright:v1.61.1-jammy
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Estas variables se inlinean en el bundle del navegador durante el build.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/db/package.json ./packages/db/package.json
RUN pnpm install --frozen-lockfile --filter todocarnes --filter @todocarnes/admin...

COPY . .
RUN pnpm turbo run build --filter=@todocarnes/admin

EXPOSE 3000
CMD ["pnpm", "--filter", "@todocarnes/admin", "start"]
