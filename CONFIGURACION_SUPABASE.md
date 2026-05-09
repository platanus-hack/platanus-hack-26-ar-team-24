# Configuración de Supabase - Paso a Paso

**Status:** ✅ Credenciales configuradas
**Proyecto Supabase:** gdnidbojzllvnuacbikk

---

## ✅ Lo que ya se hizo

1. ✅ Creado archivo `.env` con tus credenciales
2. ✅ Backend compilado y listo
3. ✅ Script SQL preparado

---

## 📋 Qué Falta: Ejecutar el Script SQL

### Paso 1: Abre tu Proyecto Supabase

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto "gdnidbojzllvnuacbikk"
3. En el panel izquierdo, busca **SQL Editor**

### Paso 2: Crear Nueva Query

Dentro de SQL Editor:
1. Click en **+ New Query** (arriba a la derecha)
2. O click en **New** y selecciona **SQL Query**

### Paso 3: Copiar el Script

El script a ejecutar es este (copia todo):

```sql
-- Platanus Hack Backend - Database Schema
-- Run this script in Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can only read their own messages
CREATE POLICY "Users can read own messages"
  ON public.chat_messages
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can insert their own messages
CREATE POLICY "Users can insert own messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON public.chat_messages
  FOR DELETE
  USING (auth.uid()::text = user_id::text);
```

### Paso 4: Pega en SQL Editor

En el área de texto de SQL Editor:
1. Pega todo el script
2. Deberías ver el código resaltado en colores

### Paso 5: Ejecuta

Click en el botón **RUN** (arriba a la derecha)

Esperarás a ver:

```
✅ Success
executed successfully
```

### Paso 6: Verifica

En el panel izquierdo de Supabase:
1. Ve a **Database** → **Tables**
2. Deberías ver 2 nuevas tablas:
   - ✅ `users`
   - ✅ `chat_messages`

Si las ves, ¡está todo bien! ✅

---

## 🔍 ¿Qué Hace el Script?

### Tabla `users`
Almacena información de usuarios:
- `id` - ID único (UUID)
- `email` - Email (único)
- `username` - Nombre de usuario
- `password_hash` - Contraseña hasheada
- `created_at` - Fecha de creación
- `updated_at` - Última actualización

### Tabla `chat_messages`
Almacena mensajes de chat:
- `id` - ID único del mensaje
- `user_id` - ID del usuario que envió (referencia a `users`)
- `content` - Contenido del mensaje
- `created_at` - Fecha de envío

### Índices
Se crean para **velocidad de búsqueda**:
- Email en users
- user_id en messages
- created_at en messages

### RLS (Row Level Security)
Políticas de **seguridad**:
- Cada usuario solo ve sus propios datos
- Solo puede insertar/eliminar sus propios mensajes

---

## ✅ Verificación: Tests

Una vez que ejecutes el SQL, puedes testear desde tu terminal:

### 1. Inicia el Backend

```bash
cd services/api
npm run dev
```

Deberías ver:
```
✅ Server running on http://localhost:3000
📝 Environment: development
🔗 CORS origin: http://localhost:3001
```

### 2. Test: Registrarse

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "username": "testuser"
  }'
```

**Deberías recibir:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "550e8400-...",
      "email": "test@example.com",
      "username": "testuser",
      "created_at": "2024-05-09T...",
      "updated_at": "2024-05-09T..."
    }
  },
  "error": null,
  "timestamp": "2024-05-09T..."
}
```

Si ves esto, ¡todo funciona! ✅

### 3. Test: Obtener Perfil

Usa el token del paso anterior:

```bash
TOKEN="eyJhbGc..."

curl -X GET http://localhost:3000/user/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Deberías recibir:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-...",
    "email": "test@example.com",
    "username": "testuser",
    "created_at": "2024-05-09T...",
    "updated_at": "2024-05-09T..."
  },
  "error": null,
  "timestamp": "2024-05-09T..."
}
```

### 4. Test: Enviar Mensaje

```bash
curl -X POST http://localhost:3000/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "¡Hola! El backend funciona!"
  }'
```

**Deberías recibir:**
```json
{
  "success": true,
  "data": {
    "id": "msg-uuid",
    "user_id": "550e8400-...",
    "content": "¡Hola! El backend funciona!",
    "created_at": "2024-05-09T..."
  },
  "error": null,
  "timestamp": "2024-05-09T..."
}
```

---

## 🔐 Tus Credenciales (Guardadas)

```
📝 Archivo: services/api/.env

SUPABASE_URL=https://gdnidbojzllvnuacbikk.supabase.co
JWT_SECRET=platanus_hack_secret_key_change_in_production_2024
```

✅ Guardadas en `.env` (no se pusheará a Git)

---

## 🚀 Resumen de Pasos

1. ✅ **Credenciales guardadas** - En `.env`
2. ⏳ **Ejecutar SQL** - En Supabase SQL Editor (ES EL SIGUIENTE PASO)
3. ⏳ **Iniciar Backend** - `npm run dev`
4. ⏳ **Conectar Frontend** - Al `http://localhost:3000`

---

## ❓ Solución de Problemas

### Error: "relation \"users\" does not exist"
**Solución:** Ejecuta el script SQL en Supabase primero

### Error: "Invalid credentials"
**Solución:** Verifica que el SUPABASE_URL y las keys estén correctas en `.env`

### Error: "jwt malformed"
**Solución:** El JWT_SECRET en `.env` debe coincidir con el que usaste para generar el token

### Error: "CORS error"
**Solución:** Verifica que CORS_ORIGIN en `.env` sea la URL de tu frontend

---

## 📞 Próximos Pasos

1. **Ejecuta el SQL** (arriba en este documento)
2. **Inicia el backend** con `npm run dev`
3. **Testa los endpoints** con los ejemplos curl
4. **Conecta tu frontend** a `http://localhost:3000`
5. **Conecta tu IA service** a `/ai/*` endpoints

---

## ✨ Listo

Una vez que ejecutes el SQL y veas las 2 tablas en Supabase, ¡tu backend está 100% operacional! 🚀

Si necesitas ayuda, revisa:
- `README.md` - Documentación completa
- `DEVELOPMENT.md` - Cómo agregar features
- `API_BLUEPRINT.md` - Diagramas visuales
