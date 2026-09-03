import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Clock, MessageCircle, Send, HelpCircle } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  const contactCards = [
    {
      icon: MapPin,
      title: 'Studios',
      lines: ['Berlin HQ · Remote worldwide', 'By appointment only'],
      grad: 'from-blue-600 to-indigo-600',
    },
    {
      icon: Mail,
      title: 'Email',
      lines: ['hello@mrtk-studybridge.de', 'admissions@mrtk-studybridge.de'],
      grad: 'from-cyan-600 to-blue-600',
    },
    {
      icon: Clock,
      title: 'Office hours',
      lines: ['Mon–Fri 09:00–18:00 CET', 'Emergency line for active clients'],
      grad: 'from-violet-600 to-purple-700',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      lines: ['Concierge for quick questions', 'Typical reply under 6h business time'],
      grad: 'from-emerald-600 to-teal-600',
    },
  ]

  const faqs = [
    { q: 'Do you guarantee admission?', a: 'No ethical consultant can. We optimise documents and probability with transparent milestones.' },
    { q: 'How fast is the first response?', a: 'Within 48 hours for new enquiries — often same day in peak intake weeks.' },
    { q: 'Is the AI assistant on the website the same engine as Pro?', a: 'Public chat is guidance-grade; enrolled students unlock deeper case context.' },
    { q: 'Can you help if I already started alone?', a: 'Yes — we audit what’s done and rescue timelines mid-flight.' },
  ]

  return (
    <div className="bg-sb-navy pb-20">
      <section className="relative overflow-hidden border-b border-sb-line bg-sb-hero py-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-sb-mesh" />
        <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-white md:text-5xl"
          >
            <span className="gradient-text">Concierge</span> support
          </motion.h1>
          <p className="mx-auto mt-4 max-w-2xl text-sb-muted">
            Premium, minimal-friction contact — tell us your intake and programme class; we route you to the right specialist.
          </p>
        </div>
      </section>

      <section className="container mx-auto -mt-8 px-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((c) => (
            <GlassCard key={c.title} className="p-5">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${c.grad}`}>
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-3 font-bold text-white">{c.title}</h3>
              {c.lines.map((line) => (
                <p key={line} className="mt-1 text-sm text-sb-muted">
                  {line}
                </p>
              ))}
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="container mx-auto mt-16 px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white">Send a brief</h2>
            <p className="mt-1 text-sm text-sb-muted">We’ll reply with next steps — no obligation.</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sb-muted">Full name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-sb-muted/60 outline-none ring-sb-accent/40 focus:ring-2"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sb-muted">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-sb-muted/60 outline-none ring-sb-accent/40 focus:ring-2"
                    placeholder="you@email.com"
                  />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sb-muted">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-sb-muted/60 outline-none ring-sb-accent/40 focus:ring-2"
                    placeholder="+49 · optional"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sb-muted">Subject</label>
                  <input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-sb-muted/60 outline-none ring-sb-accent/40 focus:ring-2"
                    placeholder="e.g. Winter 2027 MSc Mechanical"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sb-muted">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-sb-muted/60 outline-none ring-sb-accent/40 focus:ring-2"
                  placeholder="Programme interest, academics snapshot, and timeline…"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sb-accent to-blue-600 py-3.5 text-sm font-semibold text-white shadow-sb-glow transition hover:brightness-110 sm:w-auto sm:px-8"
              >
                <Send className="h-4 w-4" /> Submit
              </button>
            </form>
          </GlassCard>

          <div className="space-y-6">
            <div className="glass-panel flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-sb-ink/50 p-8 text-center">
              <MapPin className="h-10 w-10 text-sb-glow" />
              <p className="mt-4 font-semibold text-white">Map embed</p>
              <p className="mt-1 text-sm text-sb-muted">Berlin · Interactive map placeholder</p>
            </div>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-center text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp — priority consult
            </a>
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <HelpCircle className="h-4 w-4 text-sb-glow" /> FAQ preview
              </div>
              <ul className="mt-4 space-y-4 text-left text-sm text-sb-muted">
                {faqs.map((f) => (
                  <li key={f.q}>
                    <span className="font-medium text-sb-frost">{f.q}</span>
                    <p className="mt-1">{f.a}</p>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
