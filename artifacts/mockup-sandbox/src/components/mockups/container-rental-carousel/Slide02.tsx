import { CalendarDays, Eye, MapPinned, Workflow, BellRing } from "lucide-react";

const features = [
  { label: "خريطة تفاعلية", Icon: MapPinned },
  { label: "تنبيهات فورية", Icon: BellRing },
  { label: "تتبع العميل", Icon: Eye },
  { label: "مواعيد مجدولة", Icon: CalendarDays },
];

const posterStyles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
  .cf-slide02-stage {
    position: fixed; inset: 0; display: grid; place-items: center;
    overflow: hidden; background: #102c30;
  }
  .cf-slide02 {
    container-type: inline-size; position: relative; isolation: isolate;
    width: min(100vw, 80vh); height: min(125vw, 100vh); aspect-ratio: 4 / 5;
    overflow: hidden; color: #faf7ef; background: #153c3c;
    font-family: 'IBM Plex Sans Arabic', sans-serif; -webkit-font-smoothing: antialiased;
  }
  .cf-slide02 *, .cf-slide02 *::before, .cf-slide02 *::after { box-sizing: border-box; }
  .cf-slide02-photo { position: absolute; z-index: -3; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 40% center; }
  .cf-slide02-grade {
    position: absolute; z-index: -2; inset: 0;
    background: linear-gradient(180deg, rgba(6,24,34,.50) 0%, rgba(9,27,35,.12) 29%, rgba(7,28,34,.04) 49%, rgba(7,25,30,.50) 67%, rgba(6,24,29,.74) 100%), linear-gradient(90deg, rgba(6,22,31,.28), transparent 70%);
  }
  .cf-slide02-grain {
    position: absolute; z-index: 4; inset: 0; pointer-events: none; opacity: .08;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.86' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.34'/%3E%3C/svg%3E");
    mix-blend-mode: soft-light;
  }
  .cf-slide02-masthead {
    position: absolute; top: 5.4%; left: 6.5%; right: 6.5%;
    display: flex; direction: ltr; align-items: flex-start; justify-content: space-between;
  }
  .cf-slide02-brand { display: inline-flex; align-items: center; gap: 1.4cqw; direction: ltr; }
  .cf-slide02-mark {
    display: grid; width: 6.1cqw; height: 6.1cqw; min-width: 28px; min-height: 28px;
    place-items: center; color: #faf7ef; background: #e46942; border-radius: 1.55cqw;
    transform: rotate(-6deg); box-shadow: 0 9px 24px rgba(13,22,23,.24);
  }
  .cf-slide02-mark svg { width: 66%; height: 66%; }
  .cf-slide02-wordmark { display: flex; flex-direction: column; line-height: 1; text-align: left; }
  .cf-slide02-wordmark strong { color: #faf7ef; font-size: 2.45cqw; font-weight: 700; letter-spacing: -.055em; }
  .cf-slide02-wordmark small { margin-top: .55cqw; color: #f0a184; font-size: 1.55cqw; font-weight: 600; letter-spacing: .17em; text-transform: uppercase; }
  .cf-slide02-count {
    display: flex; flex-direction: column; align-items: flex-end; gap: .95cqw;
    color: #faf7ef; font-size: 2.15cqw; font-weight: 600; letter-spacing: .09em; line-height: 1; direction: ltr;
  }
  .cf-slide02-count-rule { display: block; width: 5.1cqw; height: 2px; background: #e46942; }
  .cf-slide02-hero {
    position: absolute; top: 18.8%; right: 7%; width: 74%;
    text-align: right; direction: rtl; text-shadow: 0 3px 20px rgba(4,18,23,.34);
  }
  .cf-slide02-hero::before {
    content: ''; display: block; width: 7.2cqw; height: .72cqw; margin: 0 0 2.1cqw auto;
    border-radius: 9px; background: #e46942;
  }
  .cf-slide02-hero h1 {
    margin: 0; color: #faf7ef; font-size: 7.35cqw; font-weight: 700;
    letter-spacing: -.045em; line-height: 1.24;
  }
  .cf-slide02-panel {
    position: absolute; right: 5.7%; bottom: 5.6%; left: 5.7%; padding: 3.1cqw;
    border: 1px solid rgba(250,247,239,.22); border-radius: 3.1cqw;
    background: rgba(15,47,49,.94); box-shadow: 0 24px 64px rgba(3,15,19,.3), inset 0 1px rgba(255,255,255,.08);
    backdrop-filter: blur(10px);
  }
  .cf-slide02-features { display: grid; grid-template-columns: 1fr 1fr; gap: 1.45cqw; }
  .cf-slide02-feature {
    min-height: 12.7cqw; display: flex; align-items: center; gap: 2.15cqw; padding: 2.15cqw 2.35cqw;
    border: 1px solid rgba(250,247,239,.15); border-radius: 2.05cqw;
    background: rgba(250,247,239,.055); direction: rtl;
  }
  .cf-slide02-icon {
    width: 6.25cqw; height: 6.25cqw; min-width: 6.25cqw; display: grid; place-items: center;
    color: #e46942; border: 1px solid rgba(228,105,66,.55); border-radius: 1.8cqw; background: rgba(228,105,66,.09);
  }
  .cf-slide02-icon svg { width: 55%; height: 55%; stroke-width: 1.8; }
  .cf-slide02-feature strong { color: #faf7ef; font-size: 2.75cqw; font-weight: 600; letter-spacing: -.025em; line-height: 1.35; white-space: nowrap; }
  .cf-slide02-panel-footer {
    display: flex; align-items: center; justify-content: space-between; margin-top: 2.8cqw;
    padding-top: 2.2cqw; border-top: 1px solid rgba(250,247,239,.18);
  }
  .cf-slide02-track { display: flex; align-items: center; gap: 1.05cqw; direction: ltr; }
  .cf-slide02-track i { display: block; width: 4.5cqw; height: .55cqw; border-radius: 8px; background: rgba(250,247,239,.24); }
  .cf-slide02-track i.active { background: #e46942; }
  .cf-slide02-footer-count { color: rgba(250,247,239,.82); font-size: 1.8cqw; font-weight: 600; letter-spacing: .1em; direction: ltr; }
  @media (max-aspect-ratio: 4/5) { .cf-slide02 { width: 100vw; height: 125vw; } }
  @media (min-aspect-ratio: 4/5) { .cf-slide02 { width: 80vh; height: 100vh; } }
`;

export function Slide02() {
  return (
    <div className="cf-slide02-stage">
      <style>{posterStyles}</style>
      <main className="cf-slide02" lang="ar" dir="rtl" aria-label="CleanFlow Platform — الشريحة الثانية">
        <img
          className="cf-slide02-photo"
          src="/__mockup/ads/cleanflow-carousel/media/slide-02-operations.jpg"
          alt=""
        />
        <div className="cf-slide02-grade" />
        <header className="cf-slide02-masthead">
          <div className="cf-slide02-brand" aria-label="CleanFlow Platform">
            <span className="cf-slide02-mark" aria-hidden="true"><Workflow /></span>
            <span className="cf-slide02-wordmark"><strong>CleanFlow</strong><small>Platform</small></span>
          </div>
          <div className="cf-slide02-count"><span>2/5</span><i className="cf-slide02-count-rule" /></div>
        </header>
        <section className="cf-slide02-hero">
          <h1>من الطلب<br />إلى التنفيذ</h1>
        </section>
        <section className="cf-slide02-panel" aria-label="مزايا إدارة الطلبات">
          <div className="cf-slide02-features">
            {features.map(({ label, Icon }) => (
              <div className="cf-slide02-feature" key={label}>
                <span className="cf-slide02-icon" aria-hidden="true"><Icon /></span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
          <div className="cf-slide02-panel-footer">
            <div className="cf-slide02-track" aria-hidden="true">
              <i /><i className="active" /><i /><i /><i />
            </div>
            <span className="cf-slide02-footer-count">02 / 05</span>
          </div>
        </section>
        <div className="cf-slide02-grain" />
      </main>
    </div>
  );
}

export default Slide02;
