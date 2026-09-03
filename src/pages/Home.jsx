import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Plane,
  GraduationCap,
  MapPin,
  Sparkles,
  BookOpen,
  FileText,
  Shield,
  Building2,
  LineChart,
  Bot,
  CheckCircle2,
} from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { SectionHeader } from '../components/ui/SectionHeader'
import { TypingHeadline } from '../components/ui/TypingHeadline'
import HeroOffersPopups from '../components/payments/HeroOffersPopups'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
}

const Home = () => {
  const [tipIndex, setTipIndex] = useState(0)
  const [storyIndex, setStoryIndex] = useState(0)

  const whyGermany = [
    { icon: GraduationCap, title: 'World-class degrees', desc: 'Globally recognised programs with strong industry ties.', grad: 'from-blue-500 to-indigo-600' },
    { icon: LineChart, title: 'Affordable excellence', desc: 'Low or no tuition at public universities — exceptional ROI.', grad: 'from-cyan-500 to-blue-600' },
    { icon: Plane, title: 'EU mobility', desc: 'Travel, intern, and build a career across Europe.', grad: 'from-indigo-500 to-violet-600' },
    { icon: Sparkles, title: 'Innovation economy', desc: 'Home to engineering, AI, and automotive pioneers.', grad: 'from-sky-500 to-blue-600' },
  ]

  const servicesPreview = [
    { icon: BookOpen, title: 'University admissions', desc: 'Shortlists, deadlines, and Uni-Assist navigation.' },
    { icon: Shield, title: 'APS & documentation', desc: 'Checklists and reviews that reduce rejection risk.' },
    { icon: FileText, title: 'SOP / CV / resume', desc: 'Narratives aligned with German admissions culture.' },
    { icon: MapPin, title: 'Visa & blocked account', desc: 'Embassy prep, financial proof, and timelines.' },
  ]

  const universities = [
    { name: 'TU Munich', tag: 'Engineering · Research', flag: 'DE' },
    { name: 'RWTH Aachen', tag: 'STEM · Industry', flag: 'DE' },
    { name: 'Uni Heidelberg', tag: 'Life sciences', flag: 'DE' },
    { name: 'LMU Munich', tag: 'Liberal arts · Sciences', flag: 'DE' },
    { name: 'TU Berlin', tag: 'Urban tech hub', flag: 'DE' },
    { name: 'KIT Karlsruhe', tag: 'Computer science', flag: 'DE' },
  ]

  const processSteps = [
    { step: '01', title: 'Profile & goals', desc: 'We map your academics, budget, and target intake.' },
    { step: '02', title: 'Application stack', desc: 'Documents, APS/Uni-Assist, and department-specific requirements.' },
    { step: '03', title: 'Admissions & visa', desc: 'Interview prep, embassy workflow, and arrival planning.' },
    { step: '04', title: 'Liftoff', desc: 'Housing tips, insurance, and onboarding in Germany.' },
  ]

  const tips = [
    'Start your APS file 4–6 months before your target intake.',
    'German cover letters favour clarity — avoid fluff.',
    'Keep a single source of truth for all portal passwords and PDFs.',
    'Block account timing matters: align it with your visa appointment slot.',
  ]

  const stories = [
    {
      name: 'A. Rahman',
      program: 'M.Sc. Mechanical · RWTH',
      quote: 'StudyBridge turned a overwhelming document list into a week-by-week plan. I received two admits.',
    },
    {
      name: 'S. Khan',
      program: 'M.Sc. Data Science · Berlin',
      quote: 'The AI resume pass caught gaps my generic template missed — huge for Uni-Assist.',
    },
    {
      name: 'L. Verma',
      program: 'B.Sc. CS · Munich',
      quote: 'Visa prep was calm and structured; I walked into the embassy fully prepared.',
    },
  ]

  const stats = [
    { n: '2.5k+', l: 'Students counselled' },
    { n: '180+', l: 'Partner faculty intros' },
    { n: '94%', l: 'Visa success (rolling)' },
    { n: '48h', l: 'Avg. first response' },
  ]

  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 4500)
    return () => clearInterval(t)
  }, [tips.length])

  useEffect(() => {
    const t = setInterval(() => setStoryIndex((i) => (i + 1) % stories.length), 6000)
    return () => clearInterval(t)
  }, [stories.length])

  return (
    <div className="overflow-x-hidden bg-sb-navy">
      {/* Promotional popups overlay (left + right rail banners + delayed centre modal).
          Mounted at the top of the hero so dismissals + animations are scoped to the
          home route and don't affect any other page. */}
      <HeroOffersPopups />

      {/* Hero */}
      <section className="relative min-h-screen bg-sb-hero">
        <div className="pointer-events-none absolute inset-0 bg-sb-mesh" />
        <div className="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full bg-sb-accent/20 blur-[100px] animate-sb-float" />
        <div className="pointer-events-none absolute -right-20 bottom-32 h-80 w-80 rounded-full bg-cyan-500/15 blur-[90px] animate-sb-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-4 pb-24 pt-28 text-center md:px-6 lg:px-8 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 self-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sb-frost backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            Accepting 2026 winter & summer intakes
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
          >
            <TypingHeadline
              id="home-hero"
              playOnce
              segments={[
                { text: 'Your Germany Study' },
                { text: ' Journey Starts Here', className: 'gradient-text' },
              ]}
              speedMs={55}
              startDelayMs={350}
              className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-base text-sb-muted md:text-xl"
          >
            MRTK StudyBridge Germany is your premium launchpad — admissions strategy, APS & Uni-Assist,
            visa workflows, and AI-assisted documents in one seamless experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sb-accent to-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-sb-glow transition hover:brightness-110"
            >
              Book consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10"
            >
              Explore services
            </Link>
          </motion.div>

          {/* Floating preview cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-14 grid gap-4 sm:grid-cols-3"
          >
            {[
              { t: 'Live intake tracker', s: 'Deadlines synced to your profile', i: LineChart },
              { t: 'Document vault', s: 'Versioned PDFs & attestations', i: FileText },
              { t: 'AI assistant', s: 'Policy-aware answers 24/7', i: Bot },
            ].map((c, idx) => (
              <div
                key={c.t}
                className="glass-panel flex flex-col items-center gap-2 rounded-2xl p-5 text-center transition hover-lift"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <c.i className="h-8 w-8 text-sb-glow" />
                <p className="font-semibold text-white">{c.t}</p>
                <p className="text-xs text-sb-muted">{c.s}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Germany */}
      <section className="relative border-y border-sb-line bg-sb-deep py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            eyebrow="Why Germany"
            title="The smartest EU study destination"
            subtitle="Engineering rigour, public university value, and a passport to the European job market."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyGermany.map((item) => (
              <GlassCard key={item.title} className="p-6">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.grad} shadow-lg`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-sb-muted">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-20 md:py-28 bg-sb-navy">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            eyebrow="Our services"
            title="Everything between dream and departure gate"
            subtitle="Modular support — pick full journey or specific milestones."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {servicesPreview.map((s) => (
              <GlassCard key={s.title} className="p-6">
                <s.icon className="mb-4 h-8 w-8 text-sb-glow" />
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-sb-muted">{s.desc}</p>
              </GlassCard>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-2xl border border-sb-accent/40 bg-sb-accent/10 px-6 py-3 text-sm font-semibold text-sb-glow transition hover:bg-sb-accent/20"
            >
              View all services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Universities */}
      <section className="border-y border-sb-line bg-gradient-to-b from-sb-deep to-sb-ink py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            eyebrow="Showcase"
            title="Universities we map every semester"
            subtitle="Illustrative spotlight — your shortlist is personalised to grades, language level, and budget."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {universities.map((u) => (
              <motion.div key={u.name} {...fadeUp} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <Building2 className="h-6 w-6 text-sb-glow" />
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-sb-muted">{u.flag}</span>
                </div>
                <p className="mt-4 text-lg font-bold text-white">{u.name}</p>
                <p className="text-sm text-sb-muted">{u.tag}</p>
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sb-accent/10 blur-2xl transition group-hover:bg-sb-accent/20" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process + tracking / AI row */}
      <section className="py-20 md:py-28 bg-sb-navy">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeader
                eyebrow="Process"
                title="Your timeline, crystal clear"
                subtitle="Four phases from discovery to landing — no guesswork."
              />
              <div className="space-y-6">
                {processSteps.map((p) => (
                  <motion.div key={p.step} {...fadeUp} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sb-accent to-blue-700 text-sm font-bold text-white">
                      {p.step}
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <h4 className="font-bold text-white">{p.title}</h4>
                      <p className="mt-1 text-sm text-sb-muted">{p.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="glass-panel rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sb-glow">
                  <LineChart className="h-4 w-4" /> Live tracking preview
                </div>
                <p className="mt-2 text-sm text-sb-muted">Dashboard-style milestones — same logic our counsellors use.</p>
                <div className="mt-6 space-y-3">
                  {['Profile complete', 'APS documents', 'Uni-Assist submitted', 'Visa interview'].map((label, i) => (
                    <div key={label} className="flex items-center gap-3">
                      <CheckCircle2 className={`h-5 w-5 ${i < 2 ? 'text-emerald-400' : 'text-white/20'}`} />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-sb-muted">
                          <span>{label}</span>
                          <span>{i < 2 ? 'Done' : 'Queued'}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sb-accent to-cyan-400"
                            style={{ width: i < 2 ? '100%' : i === 2 ? '35%' : '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-panel rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sb-glow">
                  <Bot className="h-4 w-4" /> AI assistant preview
                </div>
                <p className="mt-2 text-sm text-sb-muted">
                  Ask intake-specific questions — tied to your documents and our Germany playbook (chat on public pages).
                </p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-sb-navy/80 p-4 text-sm text-sb-frost">
                  <span className="text-sb-muted">You · </span>
                  When should I book my blocked account for a July appointment?
                  <div className="mt-3 border-l-2 border-sb-accent pl-3 text-sb-muted">
                    <span className="font-medium text-white">StudyBridge AI · </span>
                    Typically 3–4 weeks before your visa slot, after admission confirmation — we’ll align dates in your tracker.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success stories + tips carousel */}
      <section className="border-y border-sb-line bg-sb-deep py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeader
                eyebrow="Stories"
                title="Students who crossed the bridge"
                subtitle="Real outcomes — anonymised initials, real programmes."
              />
              <GlassCard className="p-8">
                <p className="text-lg text-sb-frost">“{stories[storyIndex].quote}”</p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                  <div>
                    <p className="font-bold text-white">{stories[storyIndex].name}</p>
                    <p className="text-sm text-sb-muted">{stories[storyIndex].program}</p>
                  </div>
                  <div className="flex gap-1">
                    {stories.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Story ${i + 1}`}
                        onClick={() => setStoryIndex(i)}
                        className={`h-2 w-2 rounded-full transition ${i === storyIndex ? 'bg-sb-glow w-6' : 'bg-white/25'}`}
                      />
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
            <div>
              <SectionHeader
                eyebrow="Tips"
                title="Application tips rotation"
                subtitle="Micro-insights while you browse — the same advice we give in kickoff calls."
              />
              <div className="glass-panel rounded-3xl p-8">
                <Sparkles className="h-8 w-8 text-amber-300" />
                <p className="mt-6 text-lg font-medium text-white">{tips[tipIndex]}</p>
                <div className="mt-8 flex justify-center gap-2">
                  {tips.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Tip ${i + 1}`}
                      onClick={() => setTipIndex(i)}
                      className={`h-2 w-2 rounded-full ${i === tipIndex ? 'bg-white' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 md:py-24 bg-sb-navy">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <motion.div key={s.l} {...fadeUp} className="text-center">
                <p className="text-3xl font-extrabold text-white md:text-4xl">{s.n}</p>
                <p className="mt-2 text-sm text-sb-muted">{s.l}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resume enhancer */}
      <section className="border-y border-sb-line bg-gradient-to-r from-sb-ink via-sb-deep to-sb-ink py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-8 md:flex md:items-center md:justify-between md:p-12">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-sb-glow">Resume enhancer</p>
              <h3 className="mt-3 text-2xl font-bold text-white md:text-3xl">AI-assisted CV & SOP refinement</h3>
              <p className="mt-3 text-sb-muted">
                Structural fixes, German-style clarity, and keyword alignment — before you pay application fees.
              </p>
            </div>
            <Link
              to="/services"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sb-accent to-cyan-500 px-8 py-4 text-sm font-semibold text-white shadow-sb-glow transition hover:brightness-110 md:mt-0"
            >
              See AI workflow <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-sb-navy py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.12),_transparent_60%)]" />
        <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Ready to architect your German admit?</h2>
          <p className="mx-auto mt-4 max-w-xl text-sb-muted">
            Book a strategy call — we’ll audit your profile and send a roadmap within 48 hours.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-semibold text-sb-navy shadow-sb-card transition hover:bg-sb-frost"
            >
              Start now <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              WhatsApp concierge
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
