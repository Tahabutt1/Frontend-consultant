import { motion } from 'framer-motion'

export function GlassCard({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.25 } } : undefined}
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.05] backdrop-blur-xl shadow-sb-float ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
