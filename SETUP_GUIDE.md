# Setup Guide para knowAhuman - Local Development

## Para tus amigos: Cómo desplegar localmente

### Requisitos Previos
- Node.js 18+ instalado
- Cuenta de Supabase (gratis en supabase.com)
- Git

### Paso 1: Clonar el repositorio
```bash
git clone <repo-url>
cd platanus-hack-26-ar-team-24
npm install
```

### Paso 2: Instalar dependencias de ambas partes

**Frontend:**
```bash
cd apps/web
npm install
cd ../..
```

**Backend:**
```bash
cd services/api
npm install
cd ../..
```

### Paso 3: Configurar Supabase (IMPORTANTE)

1. **Crear cuenta gratis en https://supabase.com**

2. **Crear un nuevo proyecto** (Região: us-east-1 o la que prefieras)

3. **En Supabase Console → SQL Editor:**
   - Copiar el contenido de `services/api/database.sql`
   - Ejecutar el script completo para crear todas las tablas

4. **Obtener tus credenciales:**
   - Ir a Settings → API
   - Copiar: `Project URL` y `Anon Key`
   - Copiar: `Service Role Key` (abajo, con cuidado - es privado)

5. **Habilitar Google OAuth en Supabase:**
   - Auth → Providers → Google
   - Habilitar y completar con credenciales de Google Cloud Console

6. **Deshabilitaciones de RLS (para desarrollo local):**
   - En SQL Editor de Supabase, ejecutar:
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE candidate_profiles DISABLE ROW LEVEL SECURITY;
   ALTER TABLE startup_profiles DISABLE ROW LEVEL SECURITY;
   ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
   ALTER TABLE ai_agents DISABLE ROW LEVEL SECURITY;
   ALTER TABLE github_profiles DISABLE ROW LEVEL SECURITY;
   ALTER TABLE linkedin_profiles DISABLE ROW LEVEL SECURITY;
   ```

### Paso 4: Configurar Variables de Entorno

**Frontend - apps/web/.env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=knowAhuman
NEXT_PUBLIC_SUPABASE_URL=<tu-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

**Backend - services/api/.env:**
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key_12345_change_in_production
JWT_EXPIRES_IN=7d
SUPABASE_URL=<tu-supabase-url>
SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_KEY=<tu-service-key>
OPENAI_API_KEY=sk-placeholder-openai-key
ANTHROPIC_API_KEY=sk-ant-placeholder-anthropic-key
CORS_ORIGIN=http://localhost:3001
REDIS_URL=redis://localhost:6379
```

### Paso 5: Ejecutar la aplicación

**Terminal 1 - Backend:**
```bash
cd services/api
npm run dev
# Esperar: "Server running on http://localhost:3000"
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
# Esperar: "Ready in X.XXs"
```

### Paso 6: Acceder a la aplicación
```
http://localhost:3001
```

## Flujo de Prueba

1. **Crear cuenta como Talent (Job Seeker):**
   - Ir a homepage
   - Click "Busco sumarme a una startup"
   - Login con Google
   - Completar perfil (Bio, Skills, Experience, Technologies)

2. **Crear cuenta como Founder:**
   - Ir a homepage  
   - Click "Busco gente para mi startup"
   - Login con Google
   - Completar perfil (Nombre startup, Descripción, Stack, Culture values)
   - Click "Buscar matches con agentes IA"

## Troubleshooting

### Error: "Error: connect ECONNREFUSED"
- Backend no está corriendo
- Asegurate de ejecutar `npm run dev` en `services/api`

### Error: "POST /auth/register 401"
- SUPABASE_SERVICE_KEY incorrecto o vacío
- Verificar que el `.env` del backend tenga la key correcta

### Error: "nextauth: session is undefined"
- Frontend no tiene credenciales de Supabase
- Verificar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`

### Los perfiles no se guardan
- RLS está habilitado en Supabase
- Ejecutar los comandos de `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` en SQL Editor

### Google login no funciona
- Google OAuth no está habilitado en Supabase
- Ir a Auth → Providers → Google y habilitar

## Documentación Completa

- **Backend API:** `/services/api/FRONTEND_API_GUIDE.md`
- **Database Schema:** `/services/api/database.sql`
- **Project Info:** `/CLAUDE.md`

## Soporte

Si tus amigos tienen problemas:
1. Chequear que Node.js sea 18+
2. Revisar que Supabase esté correctamente configurado
3. Leer los logs de error en ambas terminales
4. Verificar que las variables de entorno sean correctas

---

**Creado para knowAhuman Hackathon 2026**
