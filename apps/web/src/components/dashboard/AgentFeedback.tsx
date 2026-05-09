import { Quote, Sparkles, AlertCircle, Lightbulb } from 'lucide-react'

const INSIGHTS = [
  {
    type: 'pattern',
    icon: <Sparkles size={14} />,
    accent: 'text-purple-300',
    border: 'border-purple-400/20',
    title: 'Patrón detectado',
    body: 'Tendés a conectar mejor con perfiles introspectivos que valoran la honestidad técnica. 9 de tus últimas 12 conexiones lo confirman.',
  },
  {
    type: 'insight',
    icon: <Lightbulb size={14} />,
    accent: 'text-amber-300',
    border: 'border-amber-400/20',
    title: 'Insight nuevo',
    body: 'En conversaciones, tu agente nota que evitás topics de management. Considerá perfiles individual contributor para mayor afinidad.',
  },
  {
    type: 'warning',
    icon: <AlertCircle size={14} />,
    accent: 'text-cyan-300',
    border: 'border-cyan-400/20',
    title: 'Calibración sugerida',
    body: 'Tu score con perfiles "vendedores" cae a 0.31 promedio. Tu agente recomienda filtrar founders no-técnicos por defecto.',
  },
]

export default function AgentFeedback() {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Big quote */}
      <div className="col-span-12 lg:col-span-7 glass-panel rounded-2xl p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse at 30% 0%, rgba(168,85,247,0.15), transparent 60%)',
          }}
        />
        <Quote size={28} className="text-purple-400/40 mb-4 relative" />
        <p className="font-serif text-2xl sm:text-3xl text-white leading-snug mb-6 relative">
          &ldquo;Te observé en 47 conversaciones. Hablás como alguien que
          <span className="italic text-purple-300"> ya construyó cosas</span> — y
          buscás eso del otro lado.&rdquo;
        </p>
        <div className="flex items-center gap-3 relative">
          <div
            className="w-8 h-8 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #a78bfa, transparent 70%)',
            }}
          />
          <div>
            <p className="text-sm text-white">Tu agente IA</p>
            <p className="text-[11px] text-zinc-500 font-mono">v2.1 · entrenado hace 2h</p>
          </div>
        </div>
      </div>

      {/* Insights stack */}
      <div className="col-span-12 lg:col-span-5 space-y-3">
        {INSIGHTS.map((it, i) => (
          <div
            key={i}
            className={`glass-panel rounded-xl p-5 border ${it.border}`}
          >
            <div className={`flex items-center gap-2 mb-2 ${it.accent}`}>
              {it.icon}
              <span className="text-[10px] font-mono uppercase tracking-wider">{it.title}</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{it.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
