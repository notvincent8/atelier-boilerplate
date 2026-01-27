import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useRef } from "react"
import FollowCursor from "@/components/common/FollowCursor.tsx"
import { Scene } from "./components/common/Scene.tsx"

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } })

      tl.from("[data-anim='title']", {
        yPercent: 110,
        duration: 1.2,
        delay: 0.3,
      })
        .from(
          "[data-anim='rule']",
          {
            scaleX: 0,
            duration: 1,
            ease: "power2.inOut",
          },
          "-=0.5",
        )
        .from(
          "[data-anim='tagline']",
          {
            opacity: 0,
            y: 8,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.3",
        )
        .from(
          "[data-anim='hint']",
          {
            opacity: 0,
            duration: 1,
            ease: "none",
          },
          "-=0.2",
        )
    },
    { scope: containerRef },
  )

  return (
    <Scene className="relative select-none">
      <FollowCursor />
      <div ref={containerRef} className="flex flex-col items-center gap-6">
        <div className="overflow-hidden">
          <h1
            data-anim="title"
            className="text-[clamp(3rem,12vw,9rem)] leading-none tracking-[-0.03em]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Atelier
          </h1>
        </div>

        <hr data-anim="rule" className="w-24 border-0 border-t border-white/25 origin-center" />

        <p data-anim="tagline" className="font-mono text-xs tracking-[0.3em] uppercase text-white/50">
          Creative boilerplate
        </p>

        <p data-anim="hint" className="fixed bottom-8 font-mono text-[10px] tracking-[0.2em] uppercase text-white/20">
          Start building &mdash; delete this page
        </p>
      </div>
    </Scene>
  )
}

export default App
