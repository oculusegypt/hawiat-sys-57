import { ArrowLeft, Workflow } from "lucide-react";

export function Slide01() {
  return (
    <main className="cf-slide01-stage" aria-label="CleanFlow Platform — الشريحة 1 من 5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .cf-slide01-stage, .cf-slide01-stage * { box-sizing: border-box; }
        .cf-slide01-stage {
          --cf-teal: #153c3c;
          --cf-coral: #e46942;
          --cf-ivory: #faf7ef;
          display: grid;
          width: 100vw;
          height: 100dvh;
          place-items: center;
          overflow: hidden;
          background: var(--cf-teal);
          font-family: 'IBM Plex Sans Arabic', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .cf-slide01-poster {
          container-type: inline-size;
          position: relative;
          width: min(100vw, 80dvh);
          aspect-ratio: 4 / 5;
          overflow: hidden;
          isolation: isolate;
          background: #102d35;
          color: var(--cf-ivory);
        }
        .cf-slide01-photo {
          position: absolute;
          z-index: -3;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
        }
        .cf-slide01-grade {
          position: absolute;
          z-index: -2;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(8, 27, 40, .57) 0%, rgba(9, 32, 43, .30) 34%, rgba(12, 33, 38, .08) 53%, rgba(8, 24, 32, .22) 70%, rgba(7, 24, 34, .86) 100%),
            linear-gradient(90deg, rgba(10, 31, 42, .18), transparent 60%);
        }
        .cf-slide01-topline {
          position: absolute;
          top: 5.2%;
          right: 7.4%;
          left: 7.4%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          direction: ltr;
        }
        .cf-slide01-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          direction: ltr;
        }
        .cf-slide01-symbol {
          display: grid;
          width: 48px;
          height: 48px;
          place-items: center;
          transform: rotate(-7deg);
          border-radius: 13px;
          background: var(--cf-coral);
          color: var(--cf-ivory);
          box-shadow: 0 8px 24px rgba(4, 24, 32, .24);
        }
        .cf-slide01-symbol svg { width: 27px; height: 27px; }
        .cf-slide01-brand-name {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1;
        }
        .cf-slide01-brand-name strong {
          color: var(--cf-ivory);
          font-family: 'Space Mono', monospace;
          font-size: clamp(14px, 3.1cqw, 21px);
          font-weight: 700;
          letter-spacing: -.07em;
        }
        .cf-slide01-brand-name small {
          margin-top: 5px;
          color: #f0a083;
          font-family: 'Space Mono', monospace;
          font-size: clamp(8px, 1.65cqw, 11px);
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .cf-slide01-count {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 7px;
          color: rgba(250, 247, 239, .94);
          font-family: 'Space Mono', monospace;
          font-size: clamp(12px, 2.5cqw, 17px);
          font-weight: 700;
          letter-spacing: .025em;
          direction: ltr;
        }
        .cf-slide01-count::after {
          width: 28px;
          height: 2px;
          content: '';
          background: var(--cf-coral);
        }
        .cf-slide01-copy {
          position: absolute;
          top: 18.2%;
          right: 8%;
          left: 8%;
          text-align: right;
          direction: rtl;
        }
        .cf-slide01-headline {
          margin: 0;
          color: var(--cf-ivory);
          font-size: clamp(38px, 7.1cqw, 78px);
          font-weight: 700;
          letter-spacing: -.055em;
          line-height: 1.23;
          text-wrap: balance;
          text-shadow: 0 3px 24px rgba(5, 20, 29, .25);
        }
        .cf-slide01-headline span { display: block; }
        .cf-slide01-headline .cf-slide01-accent { color: #f08a64; }
        .cf-slide01-support {
          max-width: 86%;
          margin: 3.1% 0 0 auto;
          color: rgba(250, 247, 239, .94);
          font-size: clamp(17px, 3.2cqw, 29px);
          font-weight: 500;
          line-height: 1.65;
          text-wrap: pretty;
          text-shadow: 0 2px 14px rgba(5, 20, 29, .56);
        }
        .cf-slide01-cta {
          position: absolute;
          right: 8%;
          bottom: 9.1%;
          display: inline-flex;
          min-height: 7.3%;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 0 26px;
          border: 1px solid rgba(255, 226, 211, .36);
          border-radius: 999px;
          background: var(--cf-coral);
          color: var(--cf-ivory);
          box-shadow: 0 13px 32px rgba(7, 23, 32, .35);
          font-size: clamp(16px, 3.25cqw, 28px);
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
        }
        .cf-slide01-cta svg {
          width: clamp(17px, 2.5cqw, 23px);
          height: clamp(17px, 2.5cqw, 23px);
          flex: none;
        }
        .cf-slide01-progress {
          position: absolute;
          right: 8%;
          bottom: 4.6%;
          left: 8%;
          display: flex;
          gap: 7px;
          direction: ltr;
        }
        .cf-slide01-progress span {
          height: 3px;
          flex: 1;
          border-radius: 9px;
          background: rgba(250, 247, 239, .32);
        }
        .cf-slide01-progress span:first-child { background: var(--cf-coral); }
        @media (max-width: 520px) {
          .cf-slide01-symbol { width: 39px; height: 39px; border-radius: 11px; }
          .cf-slide01-symbol svg { width: 23px; height: 23px; }
          .cf-slide01-brand { gap: 9px; }
          .cf-slide01-headline { font-size: clamp(35px, 8.4cqw, 45px); }
          .cf-slide01-support { max-width: 95%; font-size: clamp(16px, 4.2cqw, 20px); }
          .cf-slide01-cta { min-height: 8%; padding-inline: 19px; font-size: clamp(15px, 4.1cqw, 19px); }
        }
      `}</style>
      <article className="cf-slide01-poster" dir="rtl">
        <img
          className="cf-slide01-photo"
          src="/__mockup/ads/cleanflow-carousel/media/slide-01-hero.jpg"
          alt="شاحنة رافعة وحاوية في موقع إنشاء بالرياض"
        />
        <div className="cf-slide01-grade" aria-hidden="true" />

        <header className="cf-slide01-topline">
          <div className="cf-slide01-count" aria-label="الشريحة 1 من 5">1/5</div>
          <div className="cf-slide01-brand" aria-label="CleanFlow Platform">
            <span className="cf-slide01-symbol" aria-hidden="true">
              <Workflow strokeWidth={2.1} />
            </span>
            <span className="cf-slide01-brand-name">
              <strong>CleanFlow</strong>
              <small>Platform</small>
            </span>
          </div>
        </header>

        <section className="cf-slide01-copy">
          <h1 className="cf-slide01-headline">
            <span>النظام الذكي</span>
            <span>لإدارة تأجير</span>
            <span className="cf-slide01-accent">الحاويات</span>
          </h1>
          <p className="cf-slide01-support">طلباتك، أسطولك، عقودك وفواتيرك في منصة واحدة.</p>
        </section>

        <div className="cf-slide01-cta">
          <span>اطلب عرضًا تجريبيًا</span>
          <ArrowLeft aria-hidden="true" strokeWidth={2} />
        </div>
        <div className="cf-slide01-progress" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>
      </article>
    </main>
  );
}
