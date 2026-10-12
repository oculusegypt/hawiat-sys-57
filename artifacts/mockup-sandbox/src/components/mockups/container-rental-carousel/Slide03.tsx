import { CalendarDays, ClipboardList, Workflow, ArrowUpRight, ShieldCheck } from "lucide-react";

const features = [
  { label: "جدولة الفرق", Icon: CalendarDays },
  { label: "أوامر عمل ميدانية", Icon: ClipboardList },
  { label: "متابعة التنفيذ", Icon: ShieldCheck },
];

export function Slide03() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        html, body, #root { width: 100%; height: 100%; margin: 0; overflow: hidden; }
        .cf-poster {
          width: 100vw; height: 100vh; position: relative; overflow: hidden; isolation: isolate;
          color: #faf7ef; background: #102d37; font-family: "IBM Plex Sans Arabic", sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .cf-photo { position: absolute; z-index: -3; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
        .cf-shade {
          position: absolute; z-index: -2; inset: 0;
          background:
            linear-gradient(180deg, rgba(9, 31, 43, .38) 0%, rgba(10, 35, 45, .16) 34%, rgba(8, 32, 40, .08) 52%, rgba(9, 34, 42, .58) 68%, rgba(8, 31, 39, .95) 100%),
            linear-gradient(90deg, rgba(11, 35, 46, .38), transparent 82%);
        }
        .cf-topline { position: absolute; top: 5.2%; left: 6.2%; right: 6.2%; display: flex; align-items: flex-start; justify-content: space-between; direction: ltr; }
        .cf-brand { display: flex; align-items: center; gap: clamp(8px, 1.2vw, 14px); direction: ltr; }
        .cf-brand-mark {
          width: clamp(37px, 5.2vw, 57px); height: clamp(37px, 5.2vw, 57px);
          border-radius: 13px; display: grid; place-items: center; color: #fff8ef; background: #e46942;
          transform: rotate(-7deg); box-shadow: 0 8px 24px rgba(8, 22, 27, .26);
        }
        .cf-brand-mark svg { width: 58%; height: 58%; transform: rotate(7deg); }
        .cf-brand-word { display: flex; flex-direction: column; line-height: 1.04; text-align: left; }
        .cf-brand-word strong { font-family: "Space Mono", monospace; font-size: clamp(14px, 2vw, 22px); letter-spacing: -.075em; color: #faf7ef; }
        .cf-brand-word small { margin-top: 5px; color: #f0a080; text-transform: uppercase; letter-spacing: .16em; font: 700 clamp(8px, 1vw, 11px)/1 "Space Mono", monospace; }
        .cf-slide-count { color: rgba(250,247,239,.9); font: 700 clamp(12px, 1.65vw, 18px)/1 "Space Mono", monospace; letter-spacing: .04em; padding-top: 8px; }
        .cf-slide-count::after { content: ""; display: block; height: 2px; width: 100%; margin-top: 9px; background: #e46942; }
        .cf-headline {
          position: absolute; top: 21.6%; right: 7%; width: 86%; margin: 0; text-align: right; direction: rtl;
          font-weight: 700; font-size: clamp(36px, 7.4vw, 82px); line-height: 1.22; letter-spacing: -.045em;
          text-shadow: 0 3px 24px rgba(4, 19, 27, .32);
        }
        .cf-headline .cf-accent { color: #ef916c; white-space: nowrap; }
        .cf-headline::before { content: ""; position: absolute; right: 0; top: -19px; width: clamp(34px, 4.3vw, 47px); height: 4px; background: #e46942; border-radius: 9px; }
        .cf-feature-row {
          position: absolute; top: 70%; left: 6.2%; right: 6.2%; display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(9px, 1.5vw, 17px); direction: rtl;
        }
        .cf-feature {
          min-height: clamp(98px, 15.3vw, 165px); padding: clamp(12px, 2vw, 22px) clamp(8px, 1.4vw, 16px);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(9px, 1.4vw, 16px);
          text-align: center; background: rgba(15, 53, 59, .77); border: 1px solid rgba(250, 247, 239, .22);
          border-radius: clamp(12px, 1.9vw, 21px); backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(4, 20, 27, .16);
        }
        .cf-feature:nth-child(2) { transform: translateY(-10px); }
        .cf-feature-icon {
          width: clamp(34px, 4.9vw, 53px); height: clamp(34px, 4.9vw, 53px); display: grid; place-items: center;
          border-radius: 50%; color: #f0a080; background: rgba(228, 105, 66, .14); border: 1px solid rgba(228, 105, 66, .46);
        }
        .cf-feature-icon svg { width: 56%; height: 56%; }
        .cf-feature-label { font-size: clamp(14px, 2.5vw, 27px); line-height: 1.35; font-weight: 600; color: #faf7ef; white-space: nowrap; }
        .cf-bottom { position: absolute; bottom: 5.2%; left: 6.2%; right: 6.2%; display: flex; align-items: center; justify-content: space-between; direction: rtl; }
        .cf-cta {
          min-height: clamp(46px, 6.8vw, 72px); padding: 0 clamp(18px, 3vw, 33px); display: inline-flex; align-items: center; justify-content: center;
          gap: 12px; border-radius: 999px; color: #fff8ef; background: #e46942; font-size: clamp(16px, 2.4vw, 26px);
          font-weight: 700; box-shadow: 0 9px 24px rgba(153, 64, 39, .22);
        }
        .cf-cta svg { width: clamp(17px, 2.2vw, 24px); height: clamp(17px, 2.2vw, 24px); }
        .cf-bottom-note { direction: ltr; font: 400 clamp(9px, 1.2vw, 13px)/1 "Space Mono", monospace; letter-spacing: .08em; color: rgba(250,247,239,.68); }
        @media (max-width: 520px) {
          .cf-headline { top: 23%; font-size: clamp(31px, 8.2vw, 43px); width: 88%; }
          .cf-feature-row { top: 70%; gap: 7px; }
          .cf-feature { min-height: 96px; padding: 9px 3px; border-radius: 12px; }
          .cf-feature-label { font-size: clamp(11px, 3.05vw, 15px); }
          .cf-feature-icon { width: 33px; height: 33px; }
          .cf-feature:nth-child(2) { transform: translateY(-7px); }
          .cf-bottom { bottom: 5%; }
        }
      `}</style>
      <main className="cf-poster" aria-label="CleanFlow Platform — الأسطول والفرق">
        <img
          className="cf-photo"
          src="/__mockup/ads/cleanflow-carousel/media/slide-03-fleet.jpg"
          alt="أسطول شاحنات وحاويات في ساحة تشغيل عند الغروب"
        />
        <div className="cf-shade" aria-hidden="true" />
        <header className="cf-topline">
          <div className="cf-brand" aria-label="CleanFlow Platform">
            <span className="cf-brand-mark" aria-hidden="true"><Workflow strokeWidth={2.1} /></span>
            <span className="cf-brand-word"><strong>CleanFlow</strong><small>Platform</small></span>
          </div>
          <span className="cf-slide-count">3/5</span>
        </header>
        <h1 className="cf-headline">
          أسطولك وفريقك<br /><span className="cf-accent">في المسار الصحيح.</span>
        </h1>
        <section className="cf-feature-row" aria-label="مزايا إدارة الأسطول والفرق">
          {features.map(({ label, Icon }) => (
            <article className="cf-feature" key={label}>
              <span className="cf-feature-icon" aria-hidden="true"><Icon strokeWidth={1.8} /></span>
              <span className="cf-feature-label">{label}</span>
            </article>
          ))}
        </section>
        <footer className="cf-bottom">
          <div className="cf-cta">شاهد النظام <ArrowUpRight aria-hidden="true" strokeWidth={1.8} /></div>
          <span className="cf-bottom-note">CLEANFLOW · PLATFORM</span>
        </footer>
      </main>
    </>
  );
}
