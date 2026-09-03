import { motion } from 'framer-motion'
import { GraduationCap, MapPin, BookOpen, Plane, Quote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassCard'
import { SectionHeader } from '../components/ui/SectionHeader'

const stories = [
  {
    name: 'Ayesha K.',
    origin: 'Lahore · Computer Science',
    outcome: 'MSc Informatics, TU Munich',
    highlight: 'CGPA 2.7 on 4.0 — APS cleared in one pass, Uni-Assist voucher timing aligned with winter intake.',
    tags: ['APS', 'Uni-Assist', 'STEM'],
  },
  {
    name: 'Hassan R.',
    origin: 'Karachi · Mechanical Engineering',
    outcome: 'MSc RWTH Aachen',
    highlight: 'Used English-medium MOI where the programme allowed it; parallel IELTS plan as backup until PDF rules locked.',
    tags: ['MOI', 'Masters'],
  },
  {
    name: 'Sara M.',
    origin: 'Islamabad · Business Analytics',
    outcome: 'MSc Frankfurt School pathway',
    highlight: 'Two-year gap framed with work + certifications; blocked account and visa timeline sequenced with admissions.',
    tags: ['Study gap', 'Visa', 'Finance'],
  },
  {
    name: 'Omar T.',
    origin: 'Remote · Data Science',
    outcome: 'MSc FU Berlin',
    highlight: 'Course-to-module mapping for SOP and CV; direct application outside Uni-Assist where applicable.',
    tags: ['SOP', 'Program fit'],
  },
]

const highlights = [
  { value: '500+', label: 'Germany dossiers reviewed' },
  { value: '35+', label: 'Partner & target universities' },
  { value: 'High', label: 'Visa prep satisfaction (cohort surveys)' },
]

const SuccessStories = () => {
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
            Outcomes · MRTK StudyBridge Germany
          </motion.p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            Success <span className="gradient-text">stories</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sb-muted md:text-lg">
            Real paths from Pakistan and beyond to German universities — built on documentation discipline, honest
            scoping, and timelines that respect APS, Uni-Assist, and embassy realities.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sb-accent to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sb-glow transition hover:brightness-110"
            >
              Start your story
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View services
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto mt-16 px-4 md:px-6">
        <SectionHeader
          eyebrow="Impact"
          title="What success looks like on our desk"
          subtitle="Anonymised composites inspired by typical StudyBridge journeys — every admit still depends on your file, programme rules, and official decisions."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {highlights.map((h) => (
            <GlassCard key={h.label} className="p-8 text-center">
              <p className="text-3xl font-extrabold text-white">{h.value}</p>
              <p className="mt-2 text-sm text-sb-muted">{h.label}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="container mx-auto mt-20 px-4 md:px-6">
        <SectionHeader
          eyebrow="Journeys"
          title="Student pathways we are proud to support"
          subtitle="Names and details are illustrative; your timeline will be tailored after profile review."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {stories.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="relative h-full overflow-hidden p-8">
                <Quote className="absolute right-6 top-6 h-10 w-10 text-sb-accent/20" aria-hidden />
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-sb-glow">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {s.outcome}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{s.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-sb-muted">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-sb-accent" />
                  {s.origin}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-sb-frost/90">{s.highlight}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-sb-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-20 border-y border-sb-line bg-sb-deep py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sb-accent to-cyan-600 shadow-sb-glow">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white md:text-3xl">Your chapter is next</h2>
            <p className="mt-4 text-sb-muted">
              Share your CGPA, English proof path, and target intake — we map APS, Uni-Assist or direct applications,
              finances, and visa milestones in one coherent plan.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sb-accent to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
              >
                <Plane className="h-4 w-4" />
                Book a consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SuccessStories
