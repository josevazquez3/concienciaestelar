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

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

**Importante:** reiniciá `npm run dev` cada vez que cambies `.env.local`.
