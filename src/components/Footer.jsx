import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const Footer = () => {
  const navigate = useNavigate()
  const currentYear = new Date().getFullYear()

  const go = (path) => () => navigate(path)

  return (
    <footer className="relative border-t border-sb-line bg-gradient-to-b from-sb-deep to-sb-navy text-sb-frost">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sb-accent/40 to-transparent" />
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sb-accent to-cyan-500 shadow-sb-glow">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight text-white">MRTK StudyBridge</p>
                <p className="text-xs font-medium uppercase tracking-widest text-sb-muted">Germany</p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-sb-muted">
              Premium consultancy for studying in Germany — admissions, APS, Uni-Assist, visas, and AI-assisted
              application tools. Your European education journey, orchestrated with clarity and care.
            </p>
            <div className="flex gap-3 pt-2">
              {['Li', 'X', 'In', 'Gh'].map((label, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label="Social"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-sb-frost transition hover:border-sb-accent/40 hover:bg-white/10"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Explore</h3>
            <ul className="mt-4 space-y-2">
              {[
                ['Home', '/'],
                ['Services', '/services'],
                ['About', '/about'],
                ['Success stories', '/success-stories'],
                ['Contact', '/contact'],
              ].map(([label, path]) => (
                <li key={path}>
                  <button
                    type="button"
                    onClick={go(path)}
                    className="text-sm text-sb-muted transition hover:text-white"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
            <div className="mt-4 space-y-2 text-sm text-sb-muted">
              <p>Consultations by appointment</p>
              <p>hello@mrtk-studybridge.de</p>
              <p>Berlin · Remote worldwide</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-sb-line pt-8 text-center text-xs text-sb-muted">
          <p>&copy; {currentYear} MRTK StudyBridge Germany. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
