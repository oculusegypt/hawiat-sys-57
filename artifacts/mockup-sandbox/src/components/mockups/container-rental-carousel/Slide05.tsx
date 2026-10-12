import { ArrowLeft, Workflow } from "lucide-react";

export function Slide05() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
      />
      <main className="cf-slide05" lang="ar" dir="rtl" aria-label="إعلان CleanFlow Platform">
        <img
          className="cf-slide05__photo"
          src="/__mockup/ads/cleanflow-carousel/media/slide-05-cta.jpg"
          alt=""
        />
        <div className="cf-slide05__grade" aria-hidden="true" />

        <div className="cf-slide05__brand" aria-label="CleanFlow Platform">
          <span className="cf-slide05__mark" aria-hidden="true">
            <Workflow strokeWidth={2.1} />
          </span>
          <span className="cf-slide05__wordmark">
            <strong>CleanFlow</strong>
            <small>Platform</small>
          </span>
        </div>

        <div className="cf-slide05__counter" aria-label="الشريحة الخامسة من خمس">5/5</div>

        <section className="cf-slide05__copy">
          <h1>
            <span>ابدأ التحول الرقمي</span>
            <span className="cf-slide05__accent">الآن.</span>
          </h1>
          <p>أدر الحاويات والطلبات والعملاء من منصة واحدة.</p>
        </section>

        <div className="cf-slide05__edge" aria-hidden="true" />
        <div className="cf-slide05__cta">
          <ArrowLeft aria-hidden="true" strokeWidth={2.1} />
          <span>احجز عرضًا تجريبيًا</span>
        </div>

        <style>{`
          .cf-slide05, .cf-slide05 * { box-sizing: border-box; }
          .cf-slide05 {
            --cf-ivory: #faf7ef;
            --cf-coral: #e46942;
            position: relative;
            isolation: isolate;
            container-type: size;
            width: min(100vw, 80dvh);
            height: min(100dvh, 125vw);
            aspect-ratio: 4 / 5;
            overflow: hidden;
            background: #071a31;
            color: var(--cf-ivory);
            font-family: "IBM Plex Sans Arabic", sans-serif;
            font-synthesis: none;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
          }
          .cf-slide05__photo, .cf-slide05__grade {
            position: absolute;
            z-index: -1;
            inset: 0;
            width: 100%;
            height: 100%;
          }
          .cf-slide05__photo {
            z-index: -2;
            object-fit: cover;
            object-position: center;
          }
          .cf-slide05__grade {
            background:
              linear-gradient(180deg, rgba(4, 17, 36, .48) 0%, rgba(5, 22, 42, .08) 39%, rgba(3, 17, 31, .04) 68%, rgba(3, 15, 28, .53) 100%),
              linear-gradient(90deg, rgba(4, 18, 35, .20), transparent 73%);
          }
          .cf-slide05__brand {
            position: absolute;
            top: 5.1%;
            left: 7.2%;
            display: flex;
            align-items: center;
            gap: 14px;
            direction: ltr;
            color: var(--cf-ivory);
          }
          .cf-slide05__mark {
            display: grid;
            width: 61px;
            height: 61px;
            place-items: center;
            border-radius: 17px;
            background: var(--cf-coral);
            box-shadow: 0 12px 30px rgba(3, 14, 27, .25);
            transform: rotate(-5deg);
          }
          .cf-slide05__mark svg { width: 34px; height: 34px; transform: rotate(5deg); }
          .cf-slide05__wordmark { display: flex; flex-direction: column; line-height: 1; text-align: left; }
          .cf-slide05__wordmark strong {
            font-family: "IBM Plex Sans Arabic", sans-serif;
            font-size: 25px;
            font-weight: 700;
            letter-spacing: -.055em;
          }
          .cf-slide05__wordmark small {
            margin-top: 6px;
            color: #f0a184;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: .19em;
            text-transform: uppercase;
          }
          .cf-slide05__counter {
            position: absolute;
            top: 5.35%;
            right: 7.2%;
            display: flex;
            min-width: 74px;
            height: 42px;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(250, 247, 239, .42);
            border-radius: 999px;
            background: rgba(7, 26, 49, .18);
            color: var(--cf-ivory);
            direction: ltr;
            font-size: 17px;
            font-weight: 600;
            letter-spacing: .035em;
            backdrop-filter: blur(8px);
          }
          .cf-slide05__copy {
            position: absolute;
            top: 25.2%;
            right: 7.2%;
            width: 85.6%;
            text-align: right;
          }
          .cf-slide05__copy h1 {
            display: flex;
            flex-direction: column;
            gap: .01em;
            margin: 0;
            color: var(--cf-ivory);
            font-size: clamp(42px, 8.15cqw, 88px);
            font-weight: 700;
            line-height: 1.36;
            letter-spacing: -.035em;
            text-shadow: 0 4px 20px rgba(2, 13, 27, .22);
          }
          .cf-slide05__accent { color: var(--cf-coral); }
          .cf-slide05__copy p {
            max-width: 93%;
            margin: 35px 0 0 auto;
            color: rgba(250, 247, 239, .93);
            font-size: clamp(22px, 4.15cqw, 45px);
            font-weight: 500;
            line-height: 1.62;
            text-shadow: 0 3px 16px rgba(2, 13, 27, .38);
          }
          .cf-slide05__cta {
            position: absolute;
            bottom: 9.1%;
            left: 7.2%;
            display: inline-flex;
            min-height: 94px;
            align-items: center;
            gap: 22px;
            padding: 0 35px 0 30px;
            border: 1px solid rgba(255, 225, 208, .28);
            border-radius: 18px;
            background: var(--cf-coral);
            box-shadow: 0 15px 36px rgba(3, 14, 27, .32);
            color: #fffaf3;
            direction: rtl;
            font-size: clamp(23px, 3.6cqw, 38px);
            font-weight: 700;
            white-space: nowrap;
          }
          .cf-slide05__cta svg { width: 27px; height: 27px; flex: none; }
          .cf-slide05__edge {
            position: absolute;
            bottom: 7.15%;
            left: 7.2%;
            width: 135px;
            height: 2px;
            background: rgba(228, 105, 66, .9);
            transform-origin: left center;
            transform: rotate(-2deg);
          }
          @media (max-width: 560px) {
            .cf-slide05__brand { gap: 9px; }
            .cf-slide05__mark { width: 43px; height: 43px; border-radius: 12px; }
            .cf-slide05__mark svg { width: 26px; height: 26px; }
            .cf-slide05__wordmark strong { font-size: 18px; }
            .cf-slide05__wordmark small { margin-top: 4px; font-size: 9px; }
            .cf-slide05__counter { min-width: 59px; height: 34px; font-size: 14px; }
            .cf-slide05__copy { top: 24%; }
            .cf-slide05__copy h1 { font-size: clamp(38px, 8.2cqw, 58px); }
            .cf-slide05__copy p { margin-top: 19px; font-size: clamp(20px, 4.2cqw, 27px); }
            .cf-slide05__cta { min-height: 67px; gap: 12px; padding-inline: 20px; border-radius: 13px; font-size: clamp(20px, 3.8cqw, 27px); }
            .cf-slide05__cta svg { width: 21px; height: 21px; }
            .cf-slide05__edge { width: 88px; }
          }
        `}</style>
      </main>
    </>
  );
}
