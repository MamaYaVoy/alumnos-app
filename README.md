# hola-render-fp — App de Alumnos con BD

App Node.js + PostgreSQL desplegada en Render con dos entornos: **PRE** y **PRO**.

---

## Estructura del proyecto

```
hola-render-fp/
├── app.js          ← Servidor Express (backend + HTML)
├── package.json    ← Dependencias Node
├── init_db.sql     ← Script SQL para crear la tabla e insertar datos
├── test_render.py  ← Tests automáticos con pytest
└── README.md
```

---

## Paso a paso para desplegar

### 1. Crear la base de datos PostgreSQL en Render

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Clic en **New → PostgreSQL**
3. Ponle nombre: `hola-render-db`
4. Plan: **Free**
5. Clic en **Create Database**
6. Guarda los datos de conexión que aparecen:
   - **Internal Database URL** (para los servicios dentro de Render)
   - **External Database URL** (para conectarte desde tu PC con pgAdmin)

---

### 2. Crear la tabla desde pgAdmin (o DBeaver)

1. Abre **pgAdmin** en tu PC
2. Clic derecho en *Servers* → **Register → Server**
3. Rellena con los datos de la **External Database URL**:
   - Host: `<host>.render.com`
   - Port: `5432`
   - Database: `<nombre_bd>`
   - Username: `<usuario>`
   - Password: `<contraseña>`
   - En *SSL* → pon **Require**
4. Conecta, abre el **Query Tool** y ejecuta el contenido de `init_db.sql`

---

### 3. Subir el nuevo código a GitHub

```bash
# Desde la carpeta del proyecto
git add app.js package.json init_db.sql test_render.py README.md
git commit -m "feat: migrar a Node.js + PostgreSQL, tabla alumnos"
git push origin pre      # primero a la rama pre
```

---

### 4. Crear los Web Services en Render (sustituye a los Static Sites)

> Hay que **eliminar** los Static Sites anteriores y crear **Web Services**.

Para cada entorno (PRE y PRO):

1. **New → Web Service**
2. Conecta el repo `hola-render-fp`
3. Configura:

| Campo | PRE | PRO |
|---|---|---|
| Name | `hola-render-pre` | `hola-render-pro` |
| Branch | `pre` | `main` |
| Runtime | **Node** | **Node** |
| Build Command | `npm install` | `npm install` |
| Start Command | `node app.js` | `node app.js` |
| Environment | PreProducción | Producción |

4. En **Environment Variables** de cada servicio, añade:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | (pega la **Internal Database URL** de Render) |
| `ENTORNO` | `PRE` o `PRO` según el servicio |

---

### 5. Verificar el despliegue

Abre las URLs en el navegador:
- PRE: `https://hola-render-pre-id8t.onrender.com`
- PRO: `https://hola-render-pro-g2vn.onrender.com`

Deberías ver la tabla con los alumnos.

---

### 6. Pasar los tests

```bash
# En tu PC
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install pytest requests

pytest test_render.py -v
```

---

### 7. Despliegue en PRO (tras pasar los tests en PRE)

```bash
git checkout main
git merge pre
git push origin main
```

Render desplegará automáticamente el servicio PRO.

---

## Variables de entorno necesarias

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de conexión PostgreSQL (la da Render) |
| `ENTORNO` | `PRE` o `PRO` (lo ponéis vosotros) |
| `PORT` | Lo inyecta Render automáticamente |
