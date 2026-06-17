# Consciencia Estelar

Plataforma de membresía con landing page, autenticación y dashboard de módulos.

## Variables de entorno

Copiá `.env.example` a `.env.local` y completá con tus credenciales reales.

### Neon PostgreSQL (obligatorio para login)

1. Entrá a [Neon Console](https://console.neon.tech)
2. Abrí tu proyecto → **Connect**
3. Copiá las dos URLs:
   - **Pooled connection** → `DATABASE_URL`
   - **Direct connection** → `DIRECT_URL`

Ejemplo de formato (con tus datos reales):

```env
DATABASE_URL="postgresql://usuario:clave@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://usuario:clave@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### Crear tablas en Neon

```bash
npx prisma db execute --file ./migration.sql --schema prisma/schema.prisma
```

### NextAuth

```env
AUTH_SECRET="secreto-largo-aleatorio"
AUTH_URL="http://localhost:3000"
```

### Vercel Blob (archivos, próxima etapa)

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

## Usuario admin por defecto

Después de ejecutar `migration.sql`:

- **Email:** `admin@conscienciaestelar.com`
- **Contraseña:** `Admin123!`

## Despliegue en Vercel (producción)

### 1. Variables de entorno en Vercel

En **Project → Settings → Environment Variables**, agregá estas (Production):

| Variable en Vercel | Valor |
|---------------------|-------|
| `DATABASE_URL` | `POSTGRES_PRISMA_URL` de Neon (conexión **pooled**, con `-pooler`) |
| `DIRECT_URL` | `POSTGRES_URL_NON_POOLING` o `DATABASE_URL_UNPOOLED` (sin `-pooler`) |
| `AUTH_SECRET` | Secreto largo aleatorio (mín. 32 caracteres) |
| `AUTH_URL` | `https://concienciaestelar.vercel.app` (tu dominio real) |

> Si Neon está conectado a Vercel, copiá el **valor** de `POSTGRES_PRISMA_URL` a `DATABASE_URL` y el de `POSTGRES_URL_NON_POOLING` a `DIRECT_URL`. Prisma **no** lee `POSTGRES_*` automáticamente.

### 2. Migraciones en la base de producción

En Neon → **SQL Editor**, o desde tu máquina con `.env.local` apuntando a prod:

```bash
npm run db:migrate
npm run db:migrate:settings
npm run db:migrate:messages
npm run db:migrate:payment
npm run db:migrate:videos
```

Sin la tabla `User` y el admin seed, el login **siempre falla**.

### 3. Redeploy

Después de cambiar variables: **Deployments → Redeploy**.

### 4. Credenciales admin (tras migration.sql)

- **Email:** `admin@conscienciaestelar.com`
- **Contraseña:** `Admin123!`

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

**Importante:** reiniciá `npm run dev` cada vez que cambies `.env.local`.
