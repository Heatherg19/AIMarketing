// scenes.jsx — 9 scenes, Southern Trust Lending 40s promo
// Brand: Green #3F5F55, Cream #F4EFE7, Gold #D6B25E, Sage #83E3DE

const GREEN = '#3F5F55';
const CREAM = '#F4EFE7';
const GOLD  = '#D6B25E';
const SAGE  = '#83E3DE';
const SERIF = '"Playfair Display", "Cormorant Garamond", Georgia, serif';
const SANS  = '"Lato", "Montserrat", Inter, system-ui, sans-serif';
const MONO  = '"JetBrains Mono", ui-monospace, monospace';

// ── Standard VO size for every scene (except Scene 8 logo lockup) ───────────
const VO_SIZE = 76;
const VO_MAXWIDTH = 1500;

// ── Helpers ─────────────────────────────────────────────────────────────────
function VignetteBg({ color = GREEN }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: color }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
      }}/>
    </div>
  );
}

function FilmGrain() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      opacity: 0.05,
      mixBlendMode: 'overlay',
      background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>")`,
    }}/>
  );
}

function Scene({ start, end, children, crossfade = 0.35 }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const exitStart = Math.max(0, duration - crossfade);
        let opacity = 1;
        if (localTime < crossfade) opacity = localTime / crossfade;
        else if (localTime > exitStart) opacity = 1 - (localTime - exitStart) / crossfade;
        return (
          <div style={{ position: 'absolute', inset: 0, opacity, willChange: 'opacity' }}>
            {children}
          </div>
        );
      }}
    </Sprite>
  );
}

function Mark({ size = 300, opacity = 1 }) {
  // Use the lockup-onwhite (white background full lockup) so the mark is
  // never placed on green-on-green. Caller is responsible for putting it on
  // a cream/white surface.
  return (
    <img
      src="uploads/magnolia-mark.png"
      alt=""
      style={{ width: size, height: size, display: 'block', opacity }}
    />
  );
}

// Full lockup (mark + wordmark, white background built in)
function Lockup({ width = 600, opacity = 1, variant = 'onwhite' }) {
  const src = variant === 'green'
    ? 'uploads/logo-lockup-green.png'
    : 'uploads/lockup-onwhite.png';
  return (
    <img
      src={src}
      alt="Southern Trust Lending"
      style={{ width, display: 'block', opacity }}
    />
  );
}

// VO caption — always white italic serif, centered, same size everywhere.
// Word-by-word reveal synced to speech cadence.
function VO({ text, startDelay = 0.2, wordStep = 0.14, y = '50%', shadow = true }) {
  const { localTime } = useSprite();
  const words = text.split(' ');
  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: y,
      transform: 'translate(-50%, -50%)',
      maxWidth: VO_MAXWIDTH,
      textAlign: 'center',
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontWeight: 500,
      fontSize: VO_SIZE,
      color: '#FFFFFF',
      letterSpacing: '-0.005em',
      lineHeight: 1.18,
      textShadow: shadow ? '0 4px 28px rgba(0,0,0,0.55), 0 0 8px rgba(0,0,0,0.4)' : 'none',
    }}>
      {words.map((w, i) => {
        const t = clamp((localTime - startDelay - i * wordStep) / 0.55, 0, 1);
        const op = Easing.easeOutCubic(t);
        const ty = (1 - op) * 18;
        return (
          <span key={i} style={{
            display: 'inline-block',
            opacity: op,
            transform: `translateY(${ty}px)`,
            willChange: 'transform, opacity',
            marginRight: i < words.length - 1 ? '0.32em' : 0,
          }}>{w}</span>
        );
      })}
    </div>
  );
}

// Inline video bg, seeks with timeline
function VideoBg({ src, sceneStart, sceneEnd, filter = 'saturate(1.05)', kenBurns = true }) {
  const videoRef = React.useRef(null);
  const { time } = useTimeline();
  React.useEffect(() => {
    const v = videoRef.current; if (!v) return;
    const local = time - sceneStart;
    if (local >= -0.5 && local <= (sceneEnd - sceneStart + 0.5)) {
      if (v.readyState >= 2 && Math.abs(v.currentTime - local) > 0.4) {
        try { v.currentTime = Math.max(0, local); } catch {}
      }
      v.play().catch(()=>{});
    } else { try { v.pause(); } catch {} }
  }, [time, sceneStart, sceneEnd]);
  const { localTime, duration } = useSprite();
  const p = duration > 0 ? localTime / duration : 0;
  const scale = kenBurns ? (1.02 + 0.08 * p) : 1;
  return (
    <video
      ref={videoRef} src={src}
      muted playsInline preload="auto" autoPlay loop
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover',
        filter,
        transform: `scale(${scale})`,
        transformOrigin: 'center',
      }}
    />
  );
}

// ── SCENE 1 — Cinematic opener ─────────────────────────────────────────────
// Warm, filtered establishing shot of a southern home. Cream wash burns off
// (like waking from white). The magnolia mark blooms in front-and-center
// with gold rings rippling outward. Wordmark resolves beneath. VO settles low.
function Scene1({ start, end }) {
  return (
    <Scene start={start} end={end}>
      {/* Cinematic background — neighborhood video, warm filter, slow push */}
      <div style={{ position: 'absolute', inset: 0, background: '#1a1f1a', overflow: 'hidden' }}>
        <Sprite start={start} end={end}>
          {({ localTime, duration }) => {
            const p = duration > 0 ? localTime / duration : 0;
            const scale = 1.06 + 0.10 * p;
            return (
              <video
                src="uploads/u8651859535_modern_southern_home_white_painted_brick_black_sh_c272cb1c-db6e-45a9-9cd4-948452c8b801_3.mp4"
                muted playsInline
                ref={(el) => {
                  if (el && Math.abs(el.currentTime - localTime) > 0.1) {
                    el.currentTime = Math.min(localTime, 4.5);
                  }
                }}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transform: `scale(${scale})`,
                  transformOrigin: 'center 60%',
                  filter: 'saturate(0.55) contrast(1.05) brightness(0.5) sepia(0.35)',
                }}
              />
            );
          }}
        </Sprite>

        {/* Cream wash that burns off — gives a "wake from white" feel */}
        <Sprite start={start} end={end}>
          {({ localTime }) => {
            const t = clamp(localTime / 0.7, 0, 1);
            const op = 1 - Easing.easeOutCubic(t);
            return (
              <div style={{
                position: 'absolute', inset: 0,
                background: CREAM, opacity: op,
              }}/>
            );
          }}
        </Sprite>

        {/* center pocket darkening for lockup legibility */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.55) 100%)',
        }}/>

        {/* expanding gold rings from center */}
        <Sprite start={start + 0.4} end={end}>
          {({ localTime }) => {
            const rings = [0, 0.45, 0.9, 1.35];
            return (
              <div style={{ position: 'absolute', inset: 0 }}>
                {rings.map((delay, i) => {
                  const rt = clamp((localTime - delay) / 1.8, 0, 1);
                  if (rt <= 0) return null;
                  const size = 80 + rt * 1400;
                  const op = (1 - rt) * 0.55;
                  return (
                    <div key={i} style={{
                      position: 'absolute',
                      left: '50%', top: '50%',
                      width: size, height: size,
                      marginLeft: -size/2, marginTop: -size/2,
                      borderRadius: '50%',
                      border: `1.5px solid ${GOLD}`,
                      opacity: op,
                    }}/>
                  );
                })}
              </div>
            );
          }}
        </Sprite>
      </div>

      {/* Magnolia mark — bold central bloom with glow */}
      <Sprite start={start + 0.2} end={end}>
        {({ localTime }) => {
          const markT = clamp(localTime / 0.8, 0, 1);
          const markOp = Easing.easeOutCubic(markT);
          const markS = 0.3 + 0.7 * Easing.easeOutBack(markT);
          const breathe = 1 + Math.sin(localTime * 1.4) * 0.015;
          const glowT = clamp((localTime - 0.4) / 0.6, 0, 1);
          const glow = Easing.easeOutCubic(glowT);

          return (
            <div style={{
              position: 'absolute',
              left: '50%', top: '44%',
              transform: `translate(-50%, -50%) scale(${markS * breathe})`,
              opacity: markOp,
              filter: `drop-shadow(0 0 ${36 * glow}px rgba(214,178,94,${0.7 * glow})) drop-shadow(0 12px 30px rgba(0,0,0,0.5))`,
            }}>
              <Mark size={260} />
            </div>
          );
        }}
      </Sprite>

      {/* Wordmark + gold rule resolve below mark */}
      <Sprite start={start + 1.0} end={end}>
        {({ localTime }) => {
          const wmT = clamp(localTime / 0.8, 0, 1);
          const wmOp = Easing.easeOutCubic(wmT);
          const wmY = (1 - Easing.easeOutCubic(wmT)) * 28;

          const ruleT = clamp((localTime - 0.2) / 0.9, 0, 1);
          const ruleP = Easing.easeInOutCubic(ruleT);

          return (
            <div style={{
              position: 'absolute',
              left: '50%', top: '70%',
              transform: 'translate(-50%, -50%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 22,
            }}>
              <div style={{
                width: 320 * ruleP, height: 1.5,
                background: `linear-gradient(90deg, transparent 0%, ${GOLD} 20%, ${GOLD} 80%, transparent 100%)`,
                boxShadow: `0 0 8px ${GOLD}`,
              }}/>
              <div style={{
                opacity: wmOp,
                transform: `translateY(${wmY}px)`,
                textAlign: 'center',
                textShadow: '0 4px 24px rgba(0,0,0,0.7)',
              }}>
                <div style={{
                  fontFamily: SERIF, fontSize: 70, color: CREAM,
                  lineHeight: 1, letterSpacing: '0.06em', fontWeight: 500,
                }}>SOUTHERN TRUST</div>
                <div style={{
                  fontFamily: SERIF, fontSize: 32, color: CREAM,
                  letterSpacing: '0.42em', fontWeight: 500, lineHeight: 1,
                  marginTop: 16, paddingLeft: '0.42em',
                  opacity: 0.92,
                }}>LENDING</div>
              </div>
            </div>
          );
        }}
      </Sprite>

      {/* VO — settles low */}
      <Sprite start={start + 1.6} end={end}>
        {({ localTime }) => {
          const text = 'In the South, the path to homeownership';
          const words = text.split(' ');
          return (
            <div style={{
              position: 'absolute',
              left: '50%', top: '90%',
              transform: 'translate(-50%, -50%)',
              maxWidth: VO_MAXWIDTH,
              textAlign: 'center',
              fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500,
              fontSize: 36, color: CREAM,
              lineHeight: 1.18, letterSpacing: '-0.005em',
              opacity: 0.85,
              textShadow: '0 4px 20px rgba(0,0,0,0.7)',
            }}>
              {words.map((w, i) => {
                const t = clamp((localTime - i * 0.1) / 0.5, 0, 1);
                const op = Easing.easeOutCubic(t);
                const ty = (1 - op) * 12;
                return (
                  <span key={i} style={{
                    display: 'inline-block',
                    opacity: op, transform: `translateY(${ty}px)`,
                    marginRight: i < words.length - 1 ? '0.3em' : 0,
                  }}>{w}</span>
                );
              })}
            </div>
          );
        }}
      </Sprite>

      <FilmGrain />
    </Scene>
  );
}

// ── SCENE 2 — Southern neighborhood ─────────────────────────────────────────
function Scene2({ start, end }) {
  return (
    <Scene start={start} end={end}>
      <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
        <Sprite start={start} end={end}>
          <VideoBg
            src="uploads/u8651859535_video_of_a_southern_baton_rouge_neighborhood_home_ee549f9c-ad26-4d45-8c81-5d5b292e86cf_2.mp4"
            sceneStart={start} sceneEnd={end}
            filter="saturate(1.0) contrast(1.0) brightness(0.85)"
            kenBurns={false}
          />
        </Sprite>
        {/* darker center pocket for text legibility — keep VO readable */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.35) 100%)',
        }}/>
      </div>
      <Sprite start={start} end={end}>
        <VO text="isn't just a transaction. It's a milestone years in the making." />
      </Sprite>
      <FilmGrain />
    </Scene>
  );
}

// ── SCENE 3 — Portrait video panel left, VO + wordmark right ────────────────
function Scene3({ start, end }) {
  return (
    <Scene start={start} end={end}>
      <VignetteBg color={GREEN} />

      {/* Portrait video panel on the left, sized to fit 2:3 aspect */}
      <Sprite start={start} end={end}>
        {({ localTime }) => {
          const t = clamp(localTime / 0.7, 0, 1);
          const op = Easing.easeOutCubic(t);
          const tx = (1 - Easing.easeOutCubic(t)) * -60;
          return (
            <div style={{
              position: 'absolute',
              left: 140, top: '50%',
              transform: `translate(${tx}px, -50%)`,
              opacity: op,
              width: 620, height: 860,
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(214,178,94,0.25)',
            }}>
              <Sprite start={start} end={end}>
                <VideoBg
                  src="uploads/u8651859535_side_view_wide_angle_of_a_couple_meeting_with_a_l_bbdc4fb7-786c-4a1e-bef9-ebd0c07686c6_2.mp4"
                  sceneStart={start} sceneEnd={end}
                  filter="saturate(1.05) contrast(1.03) brightness(0.92)"
                  kenBurns={false}
                />
              </Sprite>
              {/* very subtle vignette on the panel */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.3) 100%)',
                pointerEvents: 'none',
              }}/>
            </div>
          );
        }}
      </Sprite>

      {/* Right side — VO only (wordmark removed per direction) */}
      <Sprite start={start} end={end}>
        {({ localTime }) => {
          const ruleT = clamp((localTime - 1.0) / 0.8, 0, 1);
          const ruleP = Easing.easeInOutCubic(ruleT);

          const text = "At Southern Trust Lending, we understand that.";
          const words = text.split(' ');

          return (
            <div style={{
              position: 'absolute',
              left: 860, right: 100, top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex', flexDirection: 'column',
              gap: 48,
              alignItems: 'flex-start',
            }}>
              {/* VO */}
              <div style={{
                fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500,
                fontSize: 76, color: CREAM,
                lineHeight: 1.18, letterSpacing: '-0.005em',
                maxWidth: 880,
              }}>
                {words.map((w, i) => {
                  const t = clamp((localTime - i * 0.13) / 0.55, 0, 1);
                  const op = Easing.easeOutCubic(t);
                  const ty = (1 - op) * 14;
                  return (
                    <span key={i} style={{
                      display: 'inline-block',
                      opacity: op, transform: `translateY(${ty}px)`,
                      marginRight: i < words.length - 1 ? '0.32em' : 0,
                    }}>{w}</span>
                  );
                })}
              </div>

              {/* gold rule */}
              <div style={{
                width: 220 * ruleP, height: 2,
                background: GOLD, boxShadow: `0 0 10px ${GOLD}`,
              }}/>
            </div>
          );
        }}
      </Sprite>
      <FilmGrain />
    </Scene>
  );
}

// ── SCENE 4 — Journey: three icons (supporting visual only) ─────────────────
function JourneyIcon({ glyph, activeAt, localTime, x, w }) {
  const t = clamp((localTime - activeAt) / 0.5, 0, 1);
  const op = Easing.easeOutCubic(t);
  const scale = 0.7 + 0.3 * Easing.easeOutBack(t);
  return (
    <div style={{
      position: 'absolute', left: x, top: 0, width: w, height: 160,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: op, transform: `scale(${scale})`, transformOrigin: 'center top',
    }}>
      <div style={{
        width: 132, height: 132, borderRadius: '50%',
        background: CREAM, border: `2px solid ${GOLD}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 28px rgba(0,0,0,0.28)',
      }}>
        {glyph}
      </div>
    </div>
  );
}

function Scene4({ start, end }) {
  return (
    <Scene start={start} end={end}>
      <VignetteBg color={GREEN} />
      <Sprite start={start} end={end}>
        {({ localTime }) => {
          const lineT = clamp((localTime - 0.5) / 2.8, 0, 1);
          const lineP = Easing.easeInOutCubic(lineT);

          const IconHandshake = (
            <svg width="62" height="62" viewBox="0 0 64 64" fill="none">
              <path d="M10 32 L22 22 L30 28 L40 22 L54 32 L46 40 L32 32 L22 40 Z"
                    fill={GREEN} opacity="0.15"/>
              <path d="M10 32 L20 24 M22 40 L32 32 L40 38 M40 22 L54 32 L46 40 L32 32"
                    stroke={GREEN} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
              <circle cx="32" cy="32" r="3" fill={GOLD}/>
            </svg>
          );
          const IconHouse = (
            <svg width="62" height="62" viewBox="0 0 64 64" fill="none">
              <path d="M10 30 L32 12 L54 30 L54 52 L10 52 Z"
                    fill={GREEN} opacity="0.15"/>
              <path d="M10 30 L32 12 L54 30 M14 30 L14 52 L50 52 L50 30"
                    stroke={GREEN} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
              <rect x="26" y="38" width="12" height="14" stroke={GREEN} strokeWidth="2.5" fill="none"/>
              <path d="M8 32 L32 12 L56 32" stroke={GOLD} strokeWidth="1.5" opacity="0.5"/>
            </svg>
          );
          const IconHeart = (
            <svg width="62" height="62" viewBox="0 0 64 64" fill="none">
              <path d="M32 52 C 32 52, 12 40, 12 26 C 12 19, 17 14, 23 14 C 28 14, 32 18, 32 22 C 32 18, 36 14, 41 14 C 47 14, 52 19, 52 26 C 52 40, 32 52, 32 52 Z"
                    fill={GREEN} opacity="0.15"
                    stroke={GREEN} strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="32" cy="32" r="3" fill={GOLD}/>
            </svg>
          );

          const cx = 960, spacing = 360, iconW = 200;
          const xs = [cx - spacing - iconW/2, cx - iconW/2, cx + spacing - iconW/2];
          const lineY = 880;

          return (
            <div style={{ position: 'absolute', inset: 0 }}>
              {/* the line */}
              <div style={{
                position: 'absolute',
                left: xs[0] + iconW/2, top: lineY, height: 2,
                width: (xs[2] + iconW/2) - (xs[0] + iconW/2),
                background: 'rgba(244,239,231,0.15)',
              }}/>
              <div style={{
                position: 'absolute',
                left: xs[0] + iconW/2, top: lineY, height: 2,
                width: ((xs[2] + iconW/2) - (xs[0] + iconW/2)) * lineP,
                background: GOLD, boxShadow: `0 0 12px ${GOLD}`,
              }}/>
              {/* icons, below line */}
              <div style={{ position: 'absolute', left: 0, top: lineY - 66, width: '100%', height: 180 }}>
                <JourneyIcon glyph={IconHandshake} activeAt={0.7} localTime={localTime} x={xs[0]} w={iconW}/>
                <JourneyIcon glyph={IconHouse}     activeAt={1.7} localTime={localTime} x={xs[1]} w={iconW}/>
                <JourneyIcon glyph={IconHeart}     activeAt={2.7} localTime={localTime} x={xs[2]} w={iconW}/>
              </div>
            </div>
          );
        }}
      </Sprite>

      <Sprite start={start} end={end}>
        <VO text="We walk the path with you, from first conversation to closing day and beyond." y="42%"/>
      </Sprite>

      <FilmGrain />
    </Scene>
  );
}

// ── SCENE 5 — Louisiana outline, gold on green ──────────────────────────────
function Scene5({ start, end }) {
  return (
    <Scene start={start} end={end}>
      <VignetteBg color={GREEN} />

      <Sprite start={start} end={end}>
        {({ localTime }) => {
          const drawT = clamp(localTime / 1.0, 0, 1);
          const drawP = Easing.easeInOutCubic(drawT);
          const brT = clamp((localTime - 0.9) / 0.4, 0, 1);
          const brOp = Easing.easeOutCubic(brT);
          const brScale = 0.4 + 0.6 * Easing.easeOutBack(brT);

          const ripples = [0, 0.7, 1.4];
          const rippleBase = 1.3;

          // Baton Rouge — south-central Louisiana (a touch north + east of NOLA)
          const BR_X = '53%';
          const BR_Y = '60%';

          // Neighboring state dots — pop in around "Licensed across the South"
          // Coordinates are % within the 560x560 outline container, where
          // Louisiana roughly occupies the center. Negative or >100 sit outside it.
          // Left side (Texas): Houston, Dallas, San Antonio
          // Right side (MS/AL/GA/FL): Jackson, Birmingham, Atlanta, Mobile, Pensacola
          const dots = [
            // [x%, y%, delay]
            // West of LA (Texas)
            { x: 6,  y: 70, t: 0.0,  label: 'Houston' },
            { x: 2,  y: 50, t: 0.18, label: 'Dallas' },
            { x: -4, y: 78, t: 0.36, label: 'San Antonio' },
            // East of LA (MS / AL / GA / FL)
            { x: 70, y: 56, t: 0.08, label: 'Jackson' },
            { x: 88, y: 54, t: 0.26, label: 'Birmingham' },
            { x: 95, y: 78, t: 0.44, label: 'Mobile' },
            { x: 102,y: 46, t: 0.52, label: 'Atlanta' },
          ];
          const dotsBase = 1.05; // localTime when "Licensed" lands

          return (
            <div style={{ position: 'absolute', inset: 0 }}>
              {/* Outline container, sized smaller so VO has room */}
              <div style={{
                position: 'absolute',
                left: '50%', top: '54%',
                transform: 'translate(-50%, -50%)',
                width: 560, height: 560,
                opacity: 0.9,
              }}>
                <div style={{
                  position: 'absolute', inset: 0, opacity: drawP,
                  filter: `drop-shadow(0 0 24px rgba(214,178,94,0.5))`,
                }}>
                  <img
                    src="uploads/louisiana-new.png"
                    alt=""
                    style={{
                      width: '100%', height: '100%', objectFit: 'contain',
                      // Black → GOLD
                      filter: 'invert(73%) sepia(30%) saturate(570%) hue-rotate(358deg) brightness(94%) contrast(88%)',
                    }}
                  />
                </div>

                {/* ripples expanding outward from BR */}
                {ripples.map((offset, i) => {
                  const rt = ((localTime - rippleBase - offset) / 2.6) % 1;
                  if (rt < 0 || rt > 1) return null;
                  const rsize = 50 + rt * 520;
                  const rop = (1 - rt) * 0.55;
                  return (
                    <div key={i} style={{
                      position: 'absolute',
                      left: BR_X, top: BR_Y,
                      width: rsize, height: rsize,
                      marginLeft: -rsize/2, marginTop: -rsize/2,
                      borderRadius: '50%',
                      border: `1.5px solid ${GOLD}`,
                      opacity: rop,
                    }}/>
                  );
                })}

                {/* Neighboring state dots */}
                {dots.map((d, i) => {
                  const t = clamp((localTime - dotsBase - d.t) / 0.45, 0, 1);
                  const op = Easing.easeOutCubic(t);
                  const scale = 0.3 + 0.7 * Easing.easeOutBack(t);
                  // soft pulse after appearance
                  const pulse = 1 + 0.15 * Math.sin((localTime - dotsBase - d.t) * 4);
                  return (
                    <div key={i} style={{
                      position: 'absolute',
                      left: `${d.x}%`, top: `${d.y}%`,
                      width: 12, height: 12,
                      marginLeft: -6, marginTop: -6,
                      borderRadius: '50%',
                      background: CREAM,
                      boxShadow: `0 0 14px ${GOLD}, 0 0 4px ${CREAM}`,
                      opacity: op * 0.95,
                      transform: `scale(${scale * (t >= 1 ? pulse : 1)})`,
                      border: `1.5px solid ${GOLD}`,
                    }}/>
                  );
                })}

                {/* BR dot */}
                <div style={{
                  position: 'absolute',
                  left: BR_X, top: BR_Y,
                  width: 24, height: 24,
                  marginLeft: -12, marginTop: -12,
                  borderRadius: '50%', background: GOLD,
                  boxShadow: `0 0 28px ${GOLD}, 0 0 8px #fff`,
                  opacity: brOp,
                  transform: `scale(${brScale})`,
                  border: `2px solid ${CREAM}`,
                }}/>
              </div>
            </div>
          );
        }}
      </Sprite>

      <Sprite start={start} end={end}>
        <VO text="Rooted in Baton Rouge. Licensed across the South." y="14%"/>
      </Sprite>

      <FilmGrain />
    </Scene>
  );
}

// ── SCENE 6 — Family at new home ────────────────────────────────────────────
function Scene6({ start, end }) {
  return (
    <Scene start={start} end={end}>
      <div style={{ position: 'absolute', inset: 0, background: '#111' }}>
        <Sprite start={start} end={end}>
          <VideoBg
            src="uploads/u8651859535_family_standing_in_front_of_a_new_home_they_just__38854234-f317-489f-82b9-674e73c0653c_1.mp4"
            sceneStart={start} sceneEnd={end}
            filter="saturate(1.08) contrast(1.03) brightness(0.78)"
          />
        </Sprite>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
        }}/>
      </div>

      {/* Gold accent bar bottom + "Beyond the closing." */}
      <Sprite start={start + 0.3} end={end}>
        {({ localTime }) => {
          const t = clamp(localTime / 0.7, 0, 1);
          const p = Easing.easeOutCubic(t);
          const bop = Easing.easeOutCubic(clamp((localTime - 0.5) / 0.6, 0, 1));
          return (
            <>
              <div style={{
                position: 'absolute', left: 0, bottom: 140,
                height: 3, width: `${p * 100}%`,
                background: GOLD, boxShadow: `0 0 18px ${GOLD}`,
              }}/>
              <div style={{
                position: 'absolute',
                left: '50%', bottom: 70,
                transform: `translate(-50%, ${(1-bop)*10}px)`,
                opacity: bop,
                fontFamily: SERIF, fontStyle: 'italic',
                fontSize: 32, fontWeight: 500, color: CREAM,
                letterSpacing: '0.04em',
                textShadow: '0 2px 10px rgba(0,0,0,0.6)',
              }}>
                Beyond the closing.
              </div>
            </>
          );
        }}
      </Sprite>

      <Sprite start={start} end={end}>
        <VO text="Built on relationships that outlast the loan." y="50%"/>
      </Sprite>

      <FilmGrain />
    </Scene>
  );
}

// ── SCENE 7 — Brand statement on cream ──────────────────────────────────────
function Scene7({ start, end }) {
  // Same VO style, but on cream so text must switch to GREEN (per brand: cream
  // replaces green as canvas; the spec says white behind green logo, so we
  // honor legibility here by using GREEN text on cream).
  const line = 'This is what lending should look like.';
  const words = line.split(' ');
  return (
    <Scene start={start} end={end}>
      <div style={{ position: 'absolute', inset: 0, background: CREAM }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(214,178,94,0.08) 0%, transparent 65%)',
        }}/>
      </div>

      {/* small mark top */}
      <Sprite start={start} end={end}>
        {({ localTime }) => {
          const t = clamp((localTime - 0.1) / 0.6, 0, 1);
          const op = Easing.easeOutCubic(t);
          return (
            <div style={{
              position: 'absolute', left: '50%', top: 220,
              transform: `translate(-50%, ${(1-op)*8}px)`,
              opacity: op * 0.9,
            }}>
              <Mark size={96} />
            </div>
          );
        }}
      </Sprite>

      <Sprite start={start + 0.2} end={end}>
        {({ localTime }) => (
          <div style={{
            position: 'absolute',
            left: '50%', top: '54%',
            transform: 'translate(-50%, -50%)',
            maxWidth: VO_MAXWIDTH,
            textAlign: 'center',
            fontFamily: SERIF, fontStyle: 'italic',
            fontSize: VO_SIZE, fontWeight: 500,
            color: GREEN,
            lineHeight: 1.18,
            letterSpacing: '-0.005em',
          }}>
            {words.map((w, i) => {
              const t = clamp((localTime - i * 0.18) / 0.55, 0, 1);
              const op = Easing.easeOutCubic(t);
              const ty = (1 - op) * 20;
              return (
                <span key={i} style={{
                  display: 'inline-block',
                  opacity: op, transform: `translateY(${ty}px)`,
                  marginRight: i < words.length - 1 ? '0.32em' : 0,
                }}>{w}</span>
              );
            })}
          </div>
        )}
      </Sprite>

      {/* gold rule */}
      <Sprite start={start + 1.6} end={end}>
        {({ localTime }) => {
          const t = clamp(localTime / 0.8, 0, 1);
          const p = Easing.easeInOutCubic(t);
          return (
            <div style={{
              position: 'absolute',
              left: '50%', top: '68%', transform: 'translateX(-50%)',
              width: 420 * p, height: 2,
              background: GOLD, boxShadow: `0 0 10px ${GOLD}`,
            }}/>
          );
        }}
      </Sprite>
    </Scene>
  );
}

// ── SCENE 8 — Logo lockup on cream ──────────────────────────────────────────
function Scene8({ start, end }) {
  return (
    <Scene start={start} end={end}>
      <div style={{ position: 'absolute', inset: 0, background: CREAM }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(214,178,94,0.12) 0%, transparent 65%)',
        }}/>
      </div>

      <Sprite start={start} end={end}>
        {({ localTime }) => {
          const lockT = clamp(localTime / 1.0, 0, 1);
          const lockOp = Easing.easeOutCubic(lockT);
          const lockS = 0.92 + 0.08 * Easing.easeOutCubic(lockT);

          const lineT = clamp((localTime - 1.6) / 0.9, 0, 1);
          const lineP = Easing.easeInOutCubic(lineT);

          const breathe = Math.sin(localTime * 0.9) * 0.005;

          return (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 36,
            }}>
              <div style={{
                opacity: lockOp,
                transform: `scale(${lockS + breathe})`,
              }}>
                <Lockup width={760} variant="onwhite" />
              </div>

              <div style={{
                width: 520 * lineP, height: 2,
                background: GOLD, boxShadow: `0 0 14px ${GOLD}`,
                marginTop: -8,
              }}/>
            </div>
          );
        }}
      </Sprite>
    </Scene>
  );
}

// ── SCENE 9 — Tagline hold on WHITE ─────────────────────────────────────────
function Scene9({ start, end }) {
  return (
    <Scene start={start} end={end}>
      <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF' }}>
        <div style={{ position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(63,95,85,0.06) 100%)' }}/>
      </div>

      <Sprite start={start} end={end}>
        {({ localTime }) => {
          const breathe = 1 + Math.sin(localTime * 0.9) * 0.006;
          const tagT = clamp((localTime - 0.5) / 0.9, 0, 1);
          const tagOp = Easing.easeOutCubic(tagT);
          const tagY = (1 - Easing.easeOutCubic(tagT)) * 18;

          const accT = clamp((localTime - 1.1) / 0.9, 0, 1);
          const accP = Easing.easeInOutCubic(accT);

          const markT = clamp(localTime / 0.9, 0, 1);
          const markOp = Easing.easeOutCubic(markT);

          return (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 44,
            }}>
              <div style={{
                position: 'relative',
                transform: `scale(${breathe})`,
                opacity: markOp,
              }}>
                <Lockup width={620} variant="onwhite" />
              </div>

              <div style={{
                opacity: tagOp,
                transform: `translateY(${tagY}px)`,
                display: 'flex', alignItems: 'center', gap: 26,
                marginTop: 18,
              }}>
                <div style={{ width: 70 * accP, height: 1, background: GOLD, opacity: accP }}/>
                <div style={{
                  fontFamily: SERIF, fontStyle: 'italic',
                  fontSize: 48, color: GREEN, fontWeight: 400,
                  letterSpacing: '0.01em', whiteSpace: 'nowrap',
                }}>
                  Where your home journey begins.
                </div>
                <div style={{ width: 70 * accP, height: 1, background: GOLD, opacity: accP }}/>
              </div>
            </div>
          );
        }}
      </Sprite>
    </Scene>
  );
}

// ── Music bed — upbeat, rhythmic, hits scene boundaries ─────────────────────
function MusicBed() {
  const { time, playing } = useTimeline();
  const ctxRef = React.useRef(null);
  const masterRef = React.useRef(null);
  const busRef = React.useRef(null);
  const padRef = React.useRef(null);
  const scheduledRef = React.useRef(new Set());

  const ensureAudio = React.useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterRef.current = master;

    // Reverb
    const convolver = ctx.createConvolver();
    const len = ctx.sampleRate * 1.6;
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.3);
      }
    }
    convolver.buffer = impulse;
    const wet = ctx.createGain(); wet.gain.value = 0.28;
    const dry = ctx.createGain(); dry.gain.value = 0.85;
    const bus = ctx.createGain();
    bus.connect(dry); dry.connect(master);
    bus.connect(convolver); convolver.connect(wet); wet.connect(master);
    busRef.current = bus;

    // Pad drone — uplifting D major, stacks 1-3-5
    const padGain = ctx.createGain();
    padGain.gain.value = 0;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 2200; padFilter.Q.value = 0.5;
    padGain.connect(padFilter); padFilter.connect(bus);
    padRef.current = padGain;

    [146.83, 220.00, 293.66, 369.99].forEach((f, i) => {
      const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = f;
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 1.006;
      const g = ctx.createGain(); g.gain.value = 0.09 + (i === 0 ? 0.08 : 0);
      o1.connect(g); o2.connect(g);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.18 + i * 0.05;
      const lfoG = ctx.createGain(); lfoG.gain.value = 0.015;
      lfo.connect(lfoG); lfoG.connect(g.gain);
      g.connect(padGain);
      o1.start(); o2.start(); lfo.start();
    });

    return ctx;
  }, []);

  // Pluck synth for melody
  const playPluck = React.useCallback((freq, when, dur = 0.9, vel = 0.3) => {
    const ctx = ctxRef.current; if (!ctx || !busRef.current) return;
    const t = Math.max(ctx.currentTime + 0.005, when);
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(vel, t + 0.006);
    out.gain.exponentialRampToValueAtTime(0.0002, t + dur);

    const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = 'sine';     o2.frequency.value = freq * 2;
    const g2 = ctx.createGain(); g2.gain.value = 0.3; o2.connect(g2);
    const filt = ctx.createBiquadFilter(); filt.type = 'lowpass';
    filt.frequency.setValueAtTime(Math.min(freq * 9, 7000), t);
    filt.frequency.exponentialRampToValueAtTime(Math.max(freq * 3, 900), t + dur);
    filt.Q.value = 0.6;
    o1.connect(filt); g2.connect(filt);
    filt.connect(out); out.connect(busRef.current);
    o1.start(t); o2.start(t);
    o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }, []);

  // Bass kick — gives upbeat pulse
  const playKick = React.useCallback((when, vel = 0.35) => {
    const ctx = ctxRef.current; if (!ctx || !masterRef.current) return;
    const t = Math.max(ctx.currentTime + 0.005, when);
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g); g.connect(masterRef.current);
    o.start(t); o.stop(t + 0.4);
  }, []);

  // Gentle shaker-like noise burst
  const playTick = React.useCallback((when, vel = 0.07) => {
    const ctx = ctxRef.current; if (!ctx || !busRef.current) return;
    const t = Math.max(ctx.currentTime + 0.005, when);
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3000;
    const g = ctx.createGain(); g.gain.value = vel;
    src.connect(f); f.connect(g); g.connect(busRef.current);
    src.start(t);
  }, []);

  // Play/pause master envelope
  const lastPlay = React.useRef(false);
  React.useEffect(() => {
    if (playing && !lastPlay.current) {
      const ctx = ensureAudio();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    }
    lastPlay.current = playing;
    const ctx = ctxRef.current; if (!ctx || !masterRef.current) return;
    const now = ctx.currentTime;
    masterRef.current.gain.cancelScheduledValues(now);
    if (playing) {
      masterRef.current.gain.linearRampToValueAtTime(0.55, now + 0.3);
      padRef.current?.gain.cancelScheduledValues(now);
      padRef.current?.gain.linearRampToValueAtTime(0.75, now + 0.8);
    } else {
      masterRef.current.gain.linearRampToValueAtTime(0, now + 0.2);
    }
  }, [playing, ensureAudio]);

  // Score — 120 BPM, half-beat = 0.25s, beat = 0.5s
  // Upbeat pluck pattern + kick on each scene change (every 4s), with a
  // shaker pulse on every beat. Resolves into a pad swell for the lockup.
  // Freqs (D major): D4=293.66 F#4=369.99 A4=440 B4=493.88 D5=587.33 F#5=739.99 A5=880 D6=1174.66
  const SCORE = React.useMemo(() => {
    const out = [];
    // Shaker on every beat 0..40s
    for (let t = 0; t < 40; t += 0.5) {
      out.push({ type: 'tick', when: t, vel: t % 1 === 0 ? 0.08 : 0.05 });
    }
    // Kick on scene beats + offbeats
    const kicks = [
      0.0, 2.0,
      4.0, 6.0,
      8.0, 10.0, 12.0,
      13.0, 15.0, 17.0,
      18.0, 20.0,
      22.0, 24.0,
      26.0, 27.5, 29.0,
      30.0, 32.0, 34.0, // lockup swells
      36.0, 38.0,
    ];
    kicks.forEach(w => out.push({ type: 'kick', when: w, vel: 0.4 }));
    // Pluck melody — cheerful arpeggios, scene-aware
    const plucks = [
      // Scene 1 (0-4): gentle intro arpeggio
      [0.0, 293.66, 1.2, 0.24],
      [0.75, 440.00, 1.0, 0.22],
      [1.5, 587.33, 1.2, 0.22],
      [2.5, 440.00, 1.0, 0.20],
      // Scene 2 (4-8): open up
      [4.0, 369.99, 1.0, 0.26],
      [4.75, 587.33, 1.0, 0.24],
      [5.5, 739.99, 1.2, 0.22],
      [6.5, 440.00, 1.0, 0.22],
      [7.25, 293.66, 1.0, 0.20],
      // Scene 3 (8-13): brand intro
      [8.0, 440.00, 1.0, 0.28],
      [8.75, 554.37, 1.0, 0.24],
      [9.5, 659.25, 1.0, 0.24],
      [10.5, 493.88, 1.0, 0.22],
      [11.5, 440.00, 1.0, 0.22],
      [12.25, 587.33, 1.2, 0.24],
      // Scene 4 (13-18): journey, climbing
      [13.0, 293.66, 0.9, 0.26],
      [13.75, 369.99, 0.9, 0.24],
      [14.5, 440.00, 0.9, 0.24],
      [15.0, 554.37, 0.9, 0.24],
      [15.75, 587.33, 0.9, 0.24],
      [16.5, 739.99, 1.0, 0.26],
      [17.25, 587.33, 1.0, 0.22],
      // Scene 5 (18-22): rooted
      [18.0, 293.66, 1.2, 0.26],
      [18.75, 440.00, 1.0, 0.22],
      [19.5, 587.33, 1.2, 0.24],
      [20.5, 440.00, 1.0, 0.22],
      [21.25, 369.99, 1.0, 0.22],
      // Scene 6 (22-26): warmth
      [22.0, 440.00, 1.0, 0.26],
      [22.75, 554.37, 1.0, 0.22],
      [23.5, 659.25, 1.2, 0.24],
      [24.5, 554.37, 1.0, 0.22],
      [25.25, 440.00, 1.0, 0.22],
      // Scene 7 (26-30): statement — purposeful
      [26.0, 369.99, 1.4, 0.28],
      [27.0, 554.37, 1.4, 0.26],
      [28.0, 587.33, 1.4, 0.26],
      [29.0, 739.99, 1.4, 0.28],
      // Scene 8 (30-36): swell + resolve
      [30.0, 293.66, 2.0, 0.30],
      [30.75, 440.00, 2.0, 0.28],
      [31.5, 587.33, 2.5, 0.30],
      [32.5, 739.99, 2.0, 0.28],
      [33.5, 880.00, 2.5, 0.30],
      [34.5, 1174.66, 2.2, 0.28],
      // Scene 9 (36-40): tagline, softer
      [36.0, 587.33, 2.5, 0.24],
      [37.0, 440.00, 2.0, 0.20],
      [38.0, 369.99, 2.0, 0.18],
    ];
    plucks.forEach(([w, f, d, v]) => out.push({ type: 'pluck', when: w, freq: f, dur: d, vel: v }));
    return out;
  }, []);

  // Lookahead scheduler
  React.useEffect(() => {
    if (!playing) return;
    const ctx = ctxRef.current; if (!ctx) return;
    const lookahead = 0.4;
    SCORE.forEach((n, i) => {
      if (scheduledRef.current.has(i)) return;
      const delta = n.when - time;
      if (delta >= -0.02 && delta <= lookahead) {
        const at = ctx.currentTime + Math.max(0, delta);
        if (n.type === 'tick') playTick(at, n.vel);
        else if (n.type === 'kick') playKick(at, n.vel);
        else if (n.type === 'pluck') playPluck(n.freq, at, n.dur, n.vel);
        scheduledRef.current.add(i);
      }
    });
  }, [time, playing, SCORE, playPluck, playKick, playTick]);

  // Reset on seek back
  const prevT = React.useRef(0);
  React.useEffect(() => {
    if (time < prevT.current - 0.3) scheduledRef.current = new Set();
    prevT.current = time;
  }, [time]);

  return null;
}

// Small label top-right
function SceneLabels({ cues }) {
  const t = useTime();
  const cur = cues.find(c => t >= c.start && t < c.end) || cues[cues.length - 1];
  return (
    <div style={{
      position: 'absolute', right: 40, top: 36,
      display: 'flex', alignItems: 'center', gap: 14,
      fontFamily: MONO, fontSize: 11, letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: 'rgba(200,200,200,0.6)',
      zIndex: 40, mixBlendMode: 'difference',
    }}>
      <span>{String(cur.idx).padStart(2,'0')} · {cur.label}</span>
    </div>
  );
}

function TimestampLabel() {
  const t = useTime();
  React.useEffect(() => {
    const sec = Math.floor(t);
    const el = document.querySelector('[data-video-root]');
    if (el) el.setAttribute('data-screen-label', `t=${sec}s`);
  }, [Math.floor(t)]);
  return null;
}

// ── Voiceover — Web Speech API TTS synced to timeline scenes ────────────────
const VO_SCRIPT = [
  { start: 0,  end: 4,  text: "In the south, the path to homeownership" },
  { start: 4,  end: 8,  text: "isn't just a transaction. It's a milestone years in the making." },
  { start: 8,  end: 13, text: "At Southern Trust Lending, we understand that." },
  { start: 13, end: 18, text: "We walk the path with you, from first conversation to closing day and beyond." },
  { start: 18, end: 22, text: "Rooted in Baton Rouge, licensed across the south." },
  { start: 22, end: 26, text: "Built on relationships that outlast the loan." },
  { start: 26, end: 30, text: "This is what lending should look like." },
  { start: 30, end: 34, text: "Where your home journey begins." },
];

function Voiceover() {
  const { time, playing } = useTimeline();
  const prevSceneRef  = React.useRef(-2);
  const prevPlayingRef = React.useRef(false);

  const getVoice = React.useCallback(() => {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      // Prefer warm male en-US voices — browser-dependent
      voices.find(v => v.name === 'Google US English') ||
      voices.find(v => /David|Tom|James|Arthur/i.test(v.name) && v.lang.startsWith('en')) ||
      voices.find(v => v.lang === 'en-US' && !/Samantha|Victoria|Karen|Zoe|Fiona|Moira|Tessa|Veena/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith('en-US')) ||
      null
    );
  }, []);

  const speakLine = React.useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate   = 0.82;  // warm, unhurried southern pacing
    u.pitch  = 0.88;  // lower pitch for male voice
    u.volume = 1.0;
    const voice = getVoice();
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  }, [getVoice]);

  React.useEffect(() => {
    if (!window.speechSynthesis) return;

    const sceneIdx = VO_SCRIPT.findIndex(s => time >= s.start && time < s.end);
    const justStarted = playing && !prevPlayingRef.current;
    const sceneChanged = sceneIdx !== prevSceneRef.current;

    if (!playing) {
      if (prevPlayingRef.current) window.speechSynthesis.cancel();
    } else if (justStarted || sceneChanged) {
      if (sceneIdx >= 0) speakLine(VO_SCRIPT[sceneIdx].text);
      else window.speechSynthesis.cancel();
    }

    prevSceneRef.current  = sceneIdx;
    prevPlayingRef.current = playing;
  }, [time, playing, speakLine]);

  // Preload voices list (Chrome requires a dummy call first)
  React.useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        window.speechSynthesis.getVoices();
      });
    }
  }, []);

  return null;
}

Object.assign(window, {
  Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9,
  SceneLabels, TimestampLabel, MusicBed, Voiceover,
  GREEN, CREAM, GOLD, SAGE, SERIF, SANS, MONO,
});
