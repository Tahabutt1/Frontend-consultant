import { motion } from 'framer-motion'
import { Shield, Eye, Compass, Users, TrendingUp } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { SectionHeader } from '../components/ui/SectionHeader'

const About = () => {
  const team = [
    { name: 'Elena Voss', role: 'Head of Admissions Strategy', tag: 'Berlin', emoji: 'EV' },
    { name: 'Jonas Weber', role: 'APS & Uni-Assist Lead', tag: 'Munich', emoji: 'JW' },
    { name: 'Priya Nair', role: 'Visa & Finance', tag: 'Remote EU', emoji: 'PN' },
    { name: 'Marcus Stein', role: 'AI & Document Systems', tag: 'Frankfurt', emoji: 'MS' },
  ]

  const milestones = [
    { year: '2016', event: 'MRTK counselling practice founded' },
    { year: '2019', event: 'Germany-exclusive desk launched' },
    { year: '2022', event: 'AI document lab & partner university tours' },
    { year: '2024', event: 'StudyBridge OS — unified student tracker' },
    { year: '2026', event: 'EU mobility expansion & enterprise uni tie-ups' },
  ]

  const stats = [
    { icon: Users, value: '40+', label: 'Specialists & fellows' },
    { icon: TrendingUp, value: '120+', label: 'Intakes managed / year' },
    { icon: Shield, value: '100%', label: 'SLA on response windows' },
  ]

  return (
    <div className="bg-sb-navy pb-20">
      <section className="relative overflow-hidden border-b border-sb-line bg-sb-hero py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-sb-mesh" />
        <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-[0.25em] text-sb-glow"
          >
            About MRTK StudyBridge Germany
          </motion.p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            Transparency-first <span className="gradient-text">education consultancy</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sb-muted md:text-lg">
            We’re a Berlin-rooted team of strategists, former international students, and visa specialists —
            building predictable paths from first call to enrolment.
          </p>
        </div>
      </section>

      <section className="container mx-auto mt-16 px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <GlassCard className="p-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sb-accent to-blue-700">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Mission</h2>
            <p className="mt-3 text-sb-muted leading-relaxed">
              Demystify German admissions for international students through honest scoping, obsessive documentation,
              and tech-assisted workflows — so talent, not paperwork, becomes the bottleneck.
            </p>
          </GlassCard>
          <GlassCard className="p-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Vision</h2>
            <p className="mt-3 text-sb-muted leading-relaxed">
              Become the most trusted EU study bridge for emerging markets — measured by admit quality, visa success,
              and graduate outcomes — not brochure promises.
            </p>
          </GlassCard>
        </div>
      </section>

      <section className="container mx-auto mt-20 px-4 md:px-6">
        <SectionHeader
          eyebrow="Traction"
          title="Numbers that keep us accountable"
          subtitle="Trust is cumulative — we publish operational metrics to our partner schools and cohort leads."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((s) => (
            <GlassCard key={s.label} className="flex flex-col items-center p-8 text-center">
              <s.icon className="h-8 w-8 text-sb-glow" />
              <p className="mt-4 text-3xl font-extrabold text-white">{s.value}</p>
              <p className="mt-1 text-sm text-sb-muted">{s.label}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mt-20 border-y border-sb-line bg-sb-deep py-20">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            eyebrow="Timeline"
            title="How StudyBridge evolved"
            subtitle="From boutique counselling to a full-stack mobility platform."
          />
          <div className="relative mx-auto max-w-2xl space-y-8">
            <div className="absolute left-[11px] top-0 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-sb-accent to-transparent md:left-1/2 md:-translate-x-1/2" />
            {milestones.map((m) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative flex gap-6 md:justify-center"
              >
                <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-sb-accent bg-sb-deep md:absolute md:left-1/2 md:-translate-x-1/2" />
                <div className="glass-panel flex-1 rounded-2xl p-5 md:max-w-md md:flex-initial md:w-[calc(50%-2rem)] md:odd:mr-auto md:odd:text-right md:even:ml-auto md:even:text-left">
                  <p className="text-sm font-bold text-sb-glow">{m.year}</p>
                  <p className="mt-1 font-semibold text-white">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto mt-20 px-4 md:px-6">
        <SectionHeader
          eyebrow="Team"
          title="People behind your file"
          subtitle="Distributed across Germany with one shared QA bar for every submission."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <GlassCard key={member.name} className="p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sb-accent/40 to-sb-ink text-lg font-bold text-white">
                {member.emoji}
              </div>
              <h3 className="mt-4 font-bold text-white">{member.name}</h3>
              <p className="text-sm text-sb-glow">{member.role}</p>
              <p className="mt-1 text-xs text-sb-muted">{member.tag}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="container mx-auto mt-20 px-4 md:px-6">
        <SectionHeader
          eyebrow="Principles"
          title="What we will always do"
          subtitle="Non-negotiables that shape every student relationship."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: 'Radical clarity', d: 'Written scopes, fixed review rounds, and no hidden service modules.' },
            { t: 'Data-informed empathy', d: 'Policies change — we monitor embassies & uni portals weekly.' },
            { t: 'Outcome ethics', d: 'We’d rather defer an application than ship a hopeful lie.' },
          ].map((v) => (
            <GlassCard key={v.t} className="p-6">
              <h3 className="text-lg font-bold text-white">{v.t}</h3>
              <p className="mt-2 text-sm text-sb-muted">{v.d}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  )
}

export default About
