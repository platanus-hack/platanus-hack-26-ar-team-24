# Know A Human - Conecta con las personas correctas en la era de la IA

**Platanus Hack 26 | Team 24 | Buenos Aires | Track: Future**

<img src="./project-logo.png" alt="knowAhuman Logo" width="200" />

---

## Team

- **Marcos Penon** ([@mpenon4](https://github.com/mpenon4))
- **Roman Pedro Meclazcke** ([@romanmeclazcke](https://github.com/romanmeclazcke))
- **Lautaro Guiglioni** ([@Lautaroguiglioni](https://github.com/Lautaroguiglioni))
- **Alejandro Cafaro** ([@AleCafaro](https://github.com/AleCafaro))
- **Luca Saboredo** ([@Lucasaboredo](https://github.com/Lucasaboredo))

---

## El futuro no es solo saber crear, es saber con quien construir

Know A Human es una plataforma que conecta personas desde lo humano.

En un mundo donde la inteligencia artificial permite que cada vez mas personas puedan programar, disenar, crear y lanzar productos digitales, las habilidades tecnicas ya no son el unico diferencial.

Hoy el verdadero valor empieza a estar en encontrar personas compatibles: personas con valores, personalidad, creatividad, formas de pensar y objetivos alineados.

**Nuestro objetivo:** transformar el networking tradicional en conexiones humanas reales, ayudando a encontrar candidatos, socios, equipos y comunidades compatibles.

**Proba nuestra plataforma en vivo aca:**  
https://knewa-human.vercel.app/landing

---

## Por que necesitas votar por nosotros

### Un problema real, una nueva forma de conectar

La inteligencia artificial esta democratizando las habilidades tecnicas. Cada vez mas personas pueden crear productos, escribir codigo, disenar interfaces o automatizar tareas.

Pero eso abre una nueva pregunta:

**Si todos pueden construir con IA, que nos diferencia realmente?**

Know A Human responde a ese problema poniendo el foco en lo que la IA no puede copiar facilmente: la forma en que una persona piensa, crea, colabora y se relaciona.

---

### Networking real, no conexiones vacias

Hoy existen muchas plataformas para mostrar experiencia, estudios o habilidades tecnicas. Pero muy pocas ayudan a entender si dos personas realmente son compatibles para trabajar juntas, crear algo o formar un equipo.

Know A Human busca resolver eso conectando personas segun:

- Personalidad
- Valores
- Creatividad
- Compatibilidad
- Habilidades blandas
- Objetivos
- Forma de colaborar
- Forma de pensar

---

### Hecho para personas que quieren construir algo real

Nuestro enfoque esta pensado para emprendedores, desarrolladores, disenadores, recruiters, startups, equipos de hackaton y comunidades que necesitan encontrar personas compatibles para crear proyectos.

No se trata solo de encontrar a alguien que sepa hacer algo.

Se trata de encontrar a la persona correcta para construirlo con vos.

---

## Caracteristicas destacadas de Know A Human

| Funcionalidad | Por que importa |
|---|---|
| Perfil humano de cada persona | Permite conocer mas alla de las habilidades tecnicas tradicionales. |
| Compatibilidad entre usuarios | Ayuda a encontrar personas alineadas en valores, objetivos y formas de trabajo. |
| Enfoque en habilidades blandas | Destaca aspectos como comunicacion, creatividad, colaboracion y personalidad. |
| Ideal para formar equipos | Sirve para hackatones, startups, proyectos, comunidades y networking profesional. |
| Conexiones mas autenticas | Busca reemplazar el networking superficial por vinculos con mas sentido. |
| Pensado para la era de la IA | En un futuro donde todos pueden crear con IA, encontrar a las personas correctas sera clave. |

---

## Queremos tu apoyo

Estamos participando en esta hackathon para mostrar como la inteligencia artificial no solo puede ayudarnos a crear mas rapido, sino tambien a conectar mejor.

Creemos que el futuro no va a depender unicamente de quien sabe programar, disenar o construir.

El futuro va a depender de quien logra rodearse de las personas correctas.

**Vota por Know A Human y ayudanos a transformar el networking en compatibilidad humana.**

**Votanos aca:**  
https://hack.platan.us/26-ar/live?fbclid=PAdGRleARtsSBleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA8xMjQwMjQ1NzQyODc0MTQAAafXJTK4Q29uNLaJ3q74ys5MqLWX2kXvhJtTUaOcEuE8gD8bvR2SlW3M4DTlJw_aem_oH-RHqisRHi6WK2lH43h_Q

---

## Como Know A Human hace la diferencia

### Hoy

- La inteligencia artificial hace que las habilidades tecnicas sean cada vez mas accesibles.
- Crear productos digitales ya no depende solamente de saber programar.
- Muchas conexiones profesionales siguen siendo superficiales.
- Formar equipos compatibles sigue siendo dificil.
- El networking tradicional muchas veces se basa en contactos, no en compatibilidad real.

### Con Know A Human

- Ayudamos a encontrar personas compatibles para construir proyectos.
- Ponemos en valor las habilidades humanas que la IA no puede copiar facilmente.
- Facilitamos la formacion de equipos, comunidades y sociedades.
- Transformamos el networking en conexiones mas reales y utiles.
- Priorizamos personalidad, valores, creatividad y colaboracion.

---

## Nueva vision

En un futuro donde la inteligencia artificial potencia a todos, el verdadero diferencial sera encontrar a las personas correctas.

Know A Human nace con esa vision: ayudar a que las personas no solo se conecten por lo que saben hacer, sino por como piensan, como crean, como colaboran y como se relacionan.

---

## Frase principal

> **Know A Human conecta personas por lo que la inteligencia artificial no puede copiar facilmente:**  
> **su forma de pensar, crear, colaborar y relacionarse.**

---

## Publico objetivo

Know A Human esta pensado para:

- Emprendedores
- Desarrolladores
- Disenadores
- Startups
- Recruiters
- Equipos de hackaton
- Comunidades tecnologicas
- Personas que buscan socios
- Personas que quieren hacer networking real
- Personas que quieren construir proyectos con otros

---

# Parte tecnica

## Project Overview

Know A Human es una plataforma de matching inteligente entre talentos, profesionales, founders y startups.

El sistema permite crear perfiles de candidatos y startups, analizar compatibilidad y generar conexiones basadas en habilidades, experiencia, tecnologias y compatibilidad humana.

**Status:** MVP desarrollado para Platanus Hack 26.

---

## Architecture

```txt
knowAhuman/
├── services/api/                    # Backend Express + TypeScript
│   ├── src/
│   │   ├── controllers/             # Request handlers
│   │   ├── services/                # Business logic
│   │   ├── routes/                  # API endpoints
│   │   ├── middlewares/             # Auth, validation, errors
│   │   ├── config/                  # Supabase, environment
│   │   ├── types/                   # TypeScript interfaces
│   │   └── utils/                   # JWT, bcrypt, validators
│   ├── FRONTEND_API_GUIDE.md
│   └── package.json
│
├── apps/web/                        # Frontend Next.js
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── openclaw/                        # OpenClaw runtime
└── back/                            # Backend minimo para runtime
```

---

## Stack

- **Frontend:** Next.js
- **Backend:** Express + TypeScript
- **Database:** Supabase
- **Runtime IA:** OpenClaw
- **Deploy:** Vercel / Railway

---

## Seguridad

Este repositorio no debe incluir claves reales, tokens privados ni archivos `.env` con credenciales.

Para configurar el entorno local, usar los archivos de ejemplo y completar los valores reales solo en archivos locales ignorados por git.

Archivos de referencia:

- `.env.example`
- `.env.backend.template`
- `.env.frontend.template`
- `services/api/.env.example`
- `openclaw.runtime.env.example`

