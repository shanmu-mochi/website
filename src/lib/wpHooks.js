// shared by PaperPage and components/paper/TexBody (split out so fast-refresh lint stays clean)
import { useEffect, useState } from 'react'

export const sentences = (s) => s.split(/(?<!\b[A-Z]\.)(?<=[.;])\s+(?=[A-Z(])/).map((x) => x.trim()).filter(Boolean)

export function useSpy(ids) {
  const [on, setOn] = useState(ids[0])
  useEffect(() => {
    const pick = () => {
      let a = ids[0]
      for (const id of ids) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < window.innerHeight * 0.3) a = id }
      setOn(a)
    }
    pick()
    window.addEventListener('scroll', pick, { passive: true })
    return () => window.removeEventListener('scroll', pick)
  }, [ids])
  return on
}

// subtle reveal as blocks enter; nothing moves with reduced motion (CSS)
export function useReveal(root, dep) {
  useEffect(() => {
    const el = root.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
    el.querySelectorAll('.wp-rv').forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [root, dep])
}
