import { motion } from 'framer-motion'

export function SectionHeader({ eyebrow, title, subtitle, light = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
    >
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider border ${
            light
              ? 'bg-white/10 text-white border-white/15'
              : 'bg-sb-ink/80 text-sb-frost/90 border-white/10'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-sb-glow animate-pulse" />
          {eyebrow}
        </span>
      )}
      <h2
        className={`mt-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
          light ? 'text-white' : 'text-white'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base md:text-lg leading-relaxed ${light ? 'text-white/75' : 'text-sb-muted'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
