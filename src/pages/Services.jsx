import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  FileCheck,
  Globe,
  PenLine,
  Plane,
  Landmark,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Layers,
} from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { SectionHeader } from '../components/ui/SectionHeader'

const Services = () => {
  const mainServices = [
    {
      icon: GraduationCap,
      title: 'University admission guidance',
      desc: 'Shortlisting by intake, GRE/IELTS targets, departmental fit, and deadline orchestration.',
      points: ['Public vs private trade-offs', 'Course catalogue deep dive', 'Scholarship hooks'],
      grad: 'from-blue-600 to-indigo-700',
    },
    {
      icon: FileCheck,
      title: 'APS assistance',
      desc: 'Document sequencing, attestations, and interview confidence for APS workflows.',
      points: ['Checklist by province', 'Timeline buffers', 'Mock Q&A'],
      grad: 'from-cyan-600 to-blue-700',
    },
    {
      icon: Globe,
      title: 'Uni-Assist guidance',
      desc: 'VPD, programme-specific uploads, and error-free portal submissions.',
      points: ['Fee mapping', 'Retry-safe uploads', 'Status tracking'],
      grad: 'from-sky-600 to-cyan-700',
    },
    {
      icon: PenLine,
      title: 'SOP / CV assistance',
      desc: 'German-style clarity — evidence-led narrative, not generic templates.',
      points: ['Structural edits', 'Department tone match', 'Word-limit discipline'],
      grad: 'from-violet-600 to-indigo-700',
    },
    {
      icon: Plane,
      title: 'Visa guidance',
      desc: 'Appointment strategy, cover letter, finances narrative, and interview framing.',
      points: ['Embassy checklist', 'Blocked account timing', 'Insurance fit'],
      grad: 'from-emerald-600 to-teal-700',
    },
    {
      icon: Landmark,
      title: 'Blocked account guidance',
      desc: 'Provider comparison, transfer timing, and proof-of-funds presentation.',
      points: ['FX-aware planning', 'Account letter review', 'Contingency buffer'],
      grad: 'from-amber-600 to-orange-700',
    },
    {
      icon: Sparkles,
      title: 'AI resume enhancement',
      desc: 'ATS-aware passes + Germany-specific emphasis without breaking authenticity.',
      points: ['Keyword gap analysis', 'Achievement quantification', 'Multi-language CV'],
      grad: 'from-fuchsia-600 to-purple-700',
    },
    {
      icon: MessageCircle,
      title: 'Interview preparation',
      desc: 'Programme interviews, visa conversations, and scholarship panels.',
      points: ['Mock sessions', 'STAR stories', 'Culture cues'],
      grad: 'from-rose-600 to-red-700',
    },
  ]

  const timeline = [
    { title: 'Discovery call', detail: 'Goals, budget, and timeline realism.' },
    { title: 'Blueprint', detail: 'Shared Notion / PDF roadmap with owners and deadlines.' },
    { title: 'Execution sprints', detail: 'Weekly checkpoints until submission & visa.' },
    { title: 'Arrival', detail: 'Insurance, housing leads, and city onboarding.' },
  ]

  return (
    <div className="bg-sb-navy pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-sb-line bg-sb-hero py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-sb-mesh" />
        <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sb-frost">
            <Layers className="h-3.5 w-3.5 text-sb-glow" /> Consultancy services
          </motion.div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            Premium <span className="gradient-text">end-to-end</span> guidance
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sb-muted md:text-lg">
            Transparent scopes, milestone-based delivery, and tooling that keeps you ahead of embassies and portals.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="container mx-auto -mt-10 px-4 md:px-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          {mainServices.map((s) => (
            <GlassCard key={s.title} className="p-6 md:p-8">
              <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.grad} shadow-lg`}>
                <s.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sb-muted">{s.desc}</p>
              <ul className="mt-4 space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-sb-frost">
                    <span className="h-1.5 w-1.5 rounded-full bg-sb-glow" />
                    {p}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto mt-20 px-4 md:px-6">
        <SectionHeader
          eyebrow="How we work"
          title="Process you can actually follow"
          subtitle="No black boxes — each sprint ends with a visible artifact: PDF, portal screenshot, or embassy confirmation."
        />
        <div className="relative mx-auto max-w-3xl">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-sb-accent via-cyan-400/50 to-transparent md:left-1/2 md:-translate-x-1/2" />
          <div className="space-y-10">
            {timeline.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`relative flex flex-col gap-2 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12 md:text-left'}`}
              >
                <div className="absolute left-4 top-2 flex h-4 w-4 -translate-x-[7px] items-center justify-center rounded-full border-2 border-sb-accent bg-sb-navy md:left-1/2 md:-translate-x-1/2" />
                <span className="ml-10 text-xs font-bold uppercase tracking-widest text-sb-glow md:ml-0">Phase {i + 1}</span>
                <h4 className="ml-10 text-lg font-bold text-white md:ml-0">{t.title}</h4>
                <p className="ml-10 text-sm text-sb-muted md:ml-0">{t.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto mt-20 px-4 md:px-6">
        <div className="overflow-hidden rounded-3xl border border-sb-accent/30 bg-gradient-to-r from-sb-accent/15 to-cyan-500/10 px-8 py-10 text-center md:px-16">
          <h3 className="text-2xl font-bold text-white">Not sure which modules you need?</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-sb-muted">
            Start with a profile audit — we’ll propose a minimal path before you commit.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-semibold text-sb-navy transition hover:bg-sb-frost"
          >
            Talk to us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Services
