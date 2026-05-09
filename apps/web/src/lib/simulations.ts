export type SimStatus = 'matched' | 'pending' | 'declined'

export interface Simulation {
  id: string
  name: string
  role: string
  score: number
  status: SimStatus
  date: string
  duration: string
  turns: number
  scoreBreakdown: { axis: string; value: number }[]
  transcript: { from: 'you' | 'them'; text: string }[]
  verdict: string
  yourAgentNote: string
  theirAgentNote: string
}

export const SIMULATIONS: Simulation[] = [
  {
    id: 'maria-c',
    name: 'María C.',
    role: 'Founder · FinTech',
    score: 0.91,
    status: 'matched',
    date: 'Hoy · 14:32',
    duration: '4m 12s',
    turns: 12,
    scoreBreakdown: [
      { axis: 'Communication', value: 0.91 },
      { axis: 'Values', value: 0.88 },
      { axis: 'Domain', value: 0.84 },
      { axis: 'Pace', value: 0.96 },
    ],
    transcript: [
      { from: 'them', text: 'Veo que ambos venimos de open source. ¿Qué te lleva a buscar equipo ahora?' },
      { from: 'you', text: 'Quiero construir algo que importe. Solo es lento. ¿Vos?' },
      { from: 'them', text: 'Mismo. Pero priorizo culture-fit antes que stack. ¿Cómo manejás disagreement?' },
      { from: 'you', text: 'Directo, sin politiquería. Diff > consensus prematuro.' },
      { from: 'them', text: 'Compatibles. Marcando 0.91 en eje "communication style".' },
      { from: 'you', text: 'Te interesa el lado FinTech o más bien el problema de coordinación?' },
      { from: 'them', text: 'El problema. FinTech es vehículo, no destino.' },
    ],
    verdict: 'Alta probabilidad de colaboración productiva. Ambos priorizan transparencia sobre jerarquía.',
    yourAgentNote: 'María coincide en tu eje de "honestidad técnica" sin esfuerzo. Recomiendo introducción directa, sin filtros adicionales.',
    theirAgentNote: 'El agente de María reportó: "Comunicación clara, ego bajo, ambición consistente. Perfil raro."',
  },
  {
    id: 'diego-r',
    name: 'Diego R.',
    role: 'Tech Lead · OpenAI ex',
    score: 0.87,
    status: 'matched',
    date: 'Hoy · 11:08',
    duration: '3m 47s',
    turns: 10,
    scoreBreakdown: [
      { axis: 'Communication', value: 0.83 },
      { axis: 'Values', value: 0.92 },
      { axis: 'Domain', value: 0.95 },
      { axis: 'Pace', value: 0.78 },
    ],
    transcript: [
      { from: 'them', text: 'Veo overlap en infra. ¿Qué te excita técnicamente hoy?' },
      { from: 'you', text: 'Sistemas que aprenden de su propio uso. Vos?' },
      { from: 'them', text: 'Idem. ¿Producción real o investigación?' },
      { from: 'you', text: 'Producción que te obligue a pensar. Investigación pura me aburre.' },
      { from: 'them', text: 'Ahí estamos. Marco 0.95 en domain alignment.' },
    ],
    verdict: 'Match fuerte en valores y dominio. Pace ligeramente desalineado pero no bloqueante.',
    yourAgentNote: 'Diego es el tipo de IC senior que querés: opinionado, no político. Su pace es más metódico que el tuyo, ojo con eso.',
    theirAgentNote: 'El agente de Diego reportó: "Builder pragmático. Bajo riesgo de drama interpersonal."',
  },
  {
    id: 'sofia-b',
    name: 'Sofía B.',
    role: 'Designer · Linear',
    score: 0.82,
    status: 'pending',
    date: 'Ayer · 19:54',
    duration: '5m 03s',
    turns: 14,
    scoreBreakdown: [
      { axis: 'Communication', value: 0.88 },
      { axis: 'Values', value: 0.81 },
      { axis: 'Domain', value: 0.65 },
      { axis: 'Pace', value: 0.94 },
    ],
    transcript: [
      { from: 'them', text: 'Tu agente dice que valorás craft. Definimelo.' },
      { from: 'you', text: 'Hacer cosas que duren. Que no envejezcan mal.' },
      { from: 'them', text: 'OK. ¿Y el lado business? ¿Te interesa o lo tolerás?' },
      { from: 'you', text: 'Lo tolero. Honestamente.' },
      { from: 'them', text: 'Bien que lo digas. Acá hay match en craft pero gap en domain.' },
    ],
    verdict: 'Compatibilidad estética alta. Domain gap real — mejor para colaboraciones puntuales que partnership full-time.',
    yourAgentNote: 'Sofía tiene un nivel de standard visual que respetás. Pero ella opera en B2B SaaS y vos no. Useful para review, no como cofounder.',
    theirAgentNote: 'El agente de Sofía reportó: "Buen gusto, lejos del business core. Posible advisor."',
  },
  {
    id: 'lucas-m',
    name: 'Lucas M.',
    role: 'Founder · Climate',
    score: 0.74,
    status: 'pending',
    date: 'Ayer · 16:20',
    duration: '3m 22s',
    turns: 9,
    scoreBreakdown: [
      { axis: 'Communication', value: 0.71 },
      { axis: 'Values', value: 0.86 },
      { axis: 'Domain', value: 0.58 },
      { axis: 'Pace', value: 0.82 },
    ],
    transcript: [
      { from: 'them', text: 'Climate tech necesita más builders puros. ¿Te llama?' },
      { from: 'you', text: 'Me llama el problema. Lo que no sé es si tengo paciencia para ciclos de hardware.' },
      { from: 'them', text: 'Honesto. Eso ya es 80% del filtro.' },
    ],
    verdict: 'Valores alineados, dominio no. Útil como red, no como colaboración inmediata.',
    yourAgentNote: 'Lucas es alguien con quien deberías mantener relación. No es match operativo hoy, pero es un nodo valioso.',
    theirAgentNote: 'El agente de Lucas reportó: "Curioso pero no comprometido con climate. Puede cambiar."',
  },
  {
    id: 'ana-p',
    name: 'Ana P.',
    role: 'PM · Notion',
    score: 0.69,
    status: 'declined',
    date: 'Hace 2d · 09:11',
    duration: '2m 15s',
    turns: 7,
    scoreBreakdown: [
      { axis: 'Communication', value: 0.74 },
      { axis: 'Values', value: 0.62 },
      { axis: 'Domain', value: 0.71 },
      { axis: 'Pace', value: 0.68 },
    ],
    transcript: [
      { from: 'them', text: 'Buscás cofounder técnico, no PM.' },
      { from: 'you', text: 'Más bien sí. Pero me interesa entender cómo pensás producto.' },
      { from: 'them', text: 'Yo busco rol consolidado, no early. No vamos a estar alineados.' },
      { from: 'you', text: 'Honesto. Gracias.' },
    ],
    verdict: 'Stage mismatch. Sin acción recomendada.',
    yourAgentNote: 'Ana fue clara desde el turn 1. Tu agente respetó la señal y cerró rápido. No hay nada más acá.',
    theirAgentNote: 'El agente de Ana reportó: "Stage temprano, paso."',
  },
]

export function getSimulation(id: string) {
  return SIMULATIONS.find(s => s.id === id) ?? null
}
