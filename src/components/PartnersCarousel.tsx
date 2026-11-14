"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import type { Locale } from "@/lib/i18n";

export interface CarouselPartner {
  id: number;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  descAZ: string | null;
  descEN: string | null;
  descRU: string | null;
  categoryAZ: string | null;
  categoryEN: string | null;
  categoryRU: string | null;
  suppliesAZ: string | null;
  suppliesEN: string | null;
  suppliesRU: string | null;
}

const LABELS: Record<Locale, Record<string, string>> = {
  en: { about: "About", supplies: "Supplies to CyberSpace", visit: "Visit website", prev: "Previous partner", next: "Next partner", label: "Partner carousel" },
  az: { about: "Haqqında", supplies: "CyberSpace-ə təchiz edir", visit: "Vebsayta keç", prev: "Əvvəlki tərəfdaş", next: "Növbəti tərəfdaş", label: "Tərəfdaşlar karuseli" },
  ru: { about: "О компании", supplies: "Поставляет CyberSpace", visit: "Перейти на сайт", prev: "Предыдущий партнёр", next: "Следующий партнёр", label: "Карусель партнёров" },
};

const pick = (p: CarouselPartner, field: "desc" | "category" | "supplies", lang: Locale) => {
  const U = lang.toUpperCase() as "EN" | "AZ" | "RU";
  const get = (l: string) => p[`${field}${l}` as keyof CarouselPartner] as string | null;
  return get(U) || get("EN") || get("AZ") || get("RU") || "";
};

function Logo({ p }: { p: CarouselPartner }) {
  const [failed, setFailed] = useState(false);
  if (!p.logoUrl || failed) return <span className="pcar__fallback">{p.name}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={p.logoUrl}
      alt=""
      draggable={false}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

// Motion tuning (px per second)
const AUTO_SPEED = 22; // slow idle rotation
const HOVER_SPEED = 90; // max speed with the cursor at an edge
const DEAD_ZONE = 0.18; // fraction of width around the center where hover does nothing
const EASE = 3.2; // velocity smoothing (higher = snappier)
const SCALE_MAX = 1.4;
const SCALE_MIN = 0.82;

export default function PartnersCarousel({
  partners,
  lang,
}: {
  partners: CarouselPartner[];
  lang: Locale;
}) {
  const L = LABELS[lang];
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [selected, setSelected] = useState<CarouselPartner | null>(null);

  // Enough copies that the track always overfills the viewport -> seamless wrap with no gap.
  const copies = Math.max(3, Math.ceil(14 / Math.max(partners.length, 1)));
  const items = Array.from({ length: copies }, (_, c) => partners.map((p) => ({ p, c }))).flat();

  // Animation state lives in a ref: no React re-render per frame.
  const st = useRef({
    pos: 0, // scroll offset in px
    vel: 0, // current velocity (px/s)
    target: AUTO_SPEED, // desired velocity from hover / auto
    goal: null as number | null, // eased scroll target (keyboard focus)
    focused: false,
    dragging: false,
    captured: false,
    pointerId: 0,
    moved: 0,
    lastX: 0,
    lastT: 0,
    dragVel: 0,
    hovering: false,
    visible: true,
    reduced: false,
    setW: 0,
    itemStride: 0,
  });

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track || !partners.length) return;
    const first = itemRefs.current[0];
    const second = itemRefs.current[1];
    if (!first) return;
    const a = first.offsetLeft;
    const stride = second ? second.offsetLeft - a : first.offsetWidth;
    st.current.itemStride = stride;
    st.current.setW = stride * partners.length;
  }, [partners.length]);

  useEffect(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track || !partners.length) return;
    const s = st.current;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    s.reduced = mq.matches;
    const onMq = () => (s.reduced = mq.matches);
    mq.addEventListener("change", onMq);

    measure();
    // Start with the first partner centered.
    s.pos = -(vp.clientWidth / 2 - (itemRefs.current[0]?.offsetWidth ?? 0) / 2) + s.setW;
    const ro = new ResizeObserver(measure);
    ro.observe(vp);

    const io = new IntersectionObserver(([e]) => (s.visible = e.isIntersecting), { threshold: 0 });
    io.observe(vp);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!s.visible || document.hidden || !s.setW) return;

      if (!s.dragging) {
        if (s.goal !== null) {
          // Keyboard focus: glide the focused logo to the center, no jump.
          const diff = s.goal - s.pos;
          s.pos += diff * Math.min(1, 6 * dt);
          s.vel = 0;
          if (Math.abs(diff) < 0.5) s.goal = null;
        } else {
          const target = s.reduced || s.focused ? 0 : s.target;
          s.vel += (target - s.vel) * Math.min(1, EASE * dt);
          s.pos += s.vel * dt;
        }
      }
      // Wrap into [setW, 2*setW) so there is always content on both sides.
      if (s.pos >= 2 * s.setW) {
        s.pos -= s.setW;
        if (s.goal !== null) s.goal -= s.setW;
      } else if (s.pos < s.setW) {
        s.pos += s.setW;
        if (s.goal !== null) s.goal += s.setW;
      }

      track.style.transform = `translate3d(${-s.pos}px,0,0)`;

      const mid = vp.clientWidth / 2;
      const reach = Math.max(vp.clientWidth * 0.5, 1);
      for (const el of itemRefs.current) {
        if (!el) continue;
        const center = el.offsetLeft + el.offsetWidth / 2 - s.pos;
        const d = Math.min(Math.abs(center - mid) / reach, 1);
        const k = 1 - d * d; // eased: stays big near center, falls off at edges
        const scale = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * k;
        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.opacity = String(0.55 + 0.45 * k);
        el.style.zIndex = String(Math.round(k * 10));
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, [partners.length, measure]);

  // ── Pointer handling: hover steering (mouse) + drag/swipe (touch, pen, mouse drag) ──
  const onPointerMove = (e: React.PointerEvent) => {
    const s = st.current;
    const vp = viewportRef.current;
    if (!vp) return;
    if (s.dragging) {
      const dx = e.clientX - s.lastX;
      const dtm = Math.max(e.timeStamp - s.lastT, 1);
      s.pos -= dx;
      s.moved += Math.abs(dx);
      // Capture only once it is a real drag, so a plain click still reaches the logo button.
      if (!s.captured && s.moved > 6) {
        s.captured = true;
        vp.setPointerCapture?.(s.pointerId);
      }
      s.dragVel = (-dx / dtm) * 1000;
      s.lastX = e.clientX;
      s.lastT = e.timeStamp;
      return;
    }
    if (e.pointerType !== "mouse") return;
    s.hovering = true;
    const r = vp.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
    const m = Math.max(0, (Math.abs(x) - DEAD_ZONE / 2) / (0.5 - DEAD_ZONE / 2));
    // Cursor on the right => carousel moves right (content slides right); left => left.
    // Inside the center dead zone the carousel eases to a stop (no jerk).
    s.target = m === 0 ? 0 : -Math.sign(x) * m * HOVER_SPEED;
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    st.current.hovering = false;
    st.current.target = AUTO_SPEED; // back to slow automatic rotation
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const s = st.current;
    s.dragging = true;
    s.moved = 0;
    s.lastX = e.clientX;
    s.lastT = e.timeStamp;
    s.dragVel = 0;
    s.pointerId = e.pointerId;
    s.captured = false;
  };
  const endDrag = () => {
    const s = st.current;
    if (!s.dragging) return;
    s.dragging = false;
    s.vel = s.dragVel; // inertia: eases back to the target speed
  };

  const nudge = (dir: 1 | -1) => {
    const s = st.current;
    s.vel = dir * s.itemStride * 3.2; // glides roughly one logo
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") nudge(1);
    if (e.key === "ArrowLeft") nudge(-1);
  };

  const onItemFocus = (i: number) => {
    const s = st.current;
    const vp = viewportRef.current;
    const el = itemRefs.current[i];
    if (!vp || !el) return;
    vp.scrollLeft = 0; // native focus-scroll must not fight the transform
    s.focused = true;
    s.goal = el.offsetLeft + el.offsetWidth / 2 - vp.clientWidth / 2;
  };
  const onItemBlur = () => {
    st.current.focused = false;
  };

  const open = (p: CarouselPartner) => {
    if (st.current.moved > 6) return; // it was a drag, not a click
    setSelected(p);
  };

  if (!partners.length) return null;

  const sel = selected;
  return (
    <>
      <div className="pcar" role="region" aria-roledescription="carousel" aria-label={L.label} onKeyDown={onKey}>
        <button type="button" className="pcar__nav pcar__nav--prev" aria-label={L.prev} onClick={() => nudge(-1)}>
          <ChevronLeft size={18} />
        </button>
        <div
          ref={viewportRef}
          className="pcar__viewport"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerDown={onPointerDown}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div ref={trackRef} className="pcar__track">
            {items.map(({ p, c }, i) => {
              const real = c === 1; // middle copy is the accessible/tabbable set (always on screen)
              return (
                <button
                  key={`${p.id}-${c}`}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  className="pcar__item"
                  aria-label={p.name}
                  aria-hidden={real ? undefined : true}
                  tabIndex={real ? 0 : -1}
                  onFocus={() => onItemFocus(i)}
                  onBlur={onItemBlur}
                  onClick={() => open(p)}
                >
                  <span className="pcar__logo">
                    <Logo p={p} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <button type="button" className="pcar__nav pcar__nav--next" aria-label={L.next} onClick={() => nudge(1)}>
          <ChevronRight size={18} />
        </button>
      </div>

      <Dialog open={!!sel} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent size="default">
          {sel && (
            <>
              <DialogHeader>
                <div className="pmodal__head">
                  <span className="pmodal__logo">
                    <Logo p={sel} />
                  </span>
                  <div>
                    <DialogTitle style={{ fontSize: 18 }}>{sel.name}</DialogTitle>
                    {pick(sel, "category", lang) ? (
                      <DialogDescription>
                        <span className="pmodal__cat">{pick(sel, "category", lang)}</span>
                      </DialogDescription>
                    ) : (
                      <DialogDescription className="sr-only">{sel.name}</DialogDescription>
                    )}
                  </div>
                </div>
              </DialogHeader>
              <DialogBody>
                {pick(sel, "desc", lang) && (
                  <section className="pmodal__sec">
                    <h4>{L.about}</h4>
                    <p>{pick(sel, "desc", lang)}</p>
                  </section>
                )}
                {pick(sel, "supplies", lang) && (
                  <section className="pmodal__sec">
                    <h4>{L.supplies}</h4>
                    <p>{pick(sel, "supplies", lang)}</p>
                  </section>
                )}
                {sel.websiteUrl && (
                  <a
                    className="btn btn--outline btn--sm pmodal__link"
                    href={sel.websiteUrl.startsWith("http") ? sel.websiteUrl : `https://${sel.websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {L.visit} <ExternalLink size={14} />
                  </a>
                )}
              </DialogBody>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
