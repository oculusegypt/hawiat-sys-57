import { BarChart3, FileText, MessageCircle, ShieldCheck, Tags, Workflow } from "lucide-react";

const features = [
  { label: "عقود وفواتير", Icon: FileText },
  { label: "كتالوج وتسعير", Icon: Tags },
  { label: "تقارير أداء", Icon: BarChart3 },
  { label: "تراخيص وسلامة", Icon: ShieldCheck },
  { label: "مساعد ذكي ودعم مباشر", Icon: MessageCircle },
];

export function Slide04() {
  return (
    <main className="cf-stage">
      <article className="cf-poster" aria-label="CleanFlow Platform — أدوات الإدارة">
        <img className="cf-photo" src="/__mockup/ads/cleanflow-carousel/media/slide-04-platform.jpg" alt="مدير عمليات سعودي يحمل جهازاً لوحياً بجوار حاوية" />
        <div className="cf-shade" />
        <div className="cf-side-shade" />
        <div className="cf-brand" aria-label="CleanFlow Platform">
          <span className="cf-brand-mark"><Workflow aria-hidden="true" /></span>
          <span className="cf-wordmark"><strong>CleanFlow</strong><small>Platform</small></span>
        </div>
        <div className="cf-counter"><b>4</b> / 5</div>
        <header className="cf-hero-copy" dir="rtl">
          <div className="cf-eyebrow">إدارة تشغيلية أوضح</div>
          <h1>كل أدوات الإدارة<br /><span>في مكان واحد.</span></h1>
        </header>
        <div className="cf-device-screen" aria-hidden="true">
          <div className="cf-screen-top"><span className="cf-screen-logo" /><span className="cf-screen-dot" /></div>
          <div className="cf-screen-layout">
            <div className="cf-screen-nav"><i /><i /><i /><i /></div>
            <div className="cf-screen-main"><span className="cf-screen-line" /><div className="cf-screen-cards"><i /><i /><i /></div><div className="cf-screen-chart" /></div>
          </div>
        </div>
        <section className="cf-feature-panel" aria-label="ميزات المنصة" dir="rtl">
          {features.map(({ label, Icon }) => (
            <div className="cf-feature-row" key={label}>
              <span className="cf-feature-icon"><Icon aria-hidden="true" /></span>
              <span className="cf-feature-label">{label}</span>
            </div>
          ))}
        </section>
        <div className="cf-screen-note">تصوّر توضيحي للمنصة</div>
        <div className="cf-footer">
          <span className="cf-footer-mark"><Workflow aria-hidden="true" /></span>
          <span className="cf-footer-name">CleanFlow<small>PLATFORM</small></span>
        </div>
        <div className="cf-progress" aria-label="الشريحة الرابعة من خمس"><i /><i /><i /><i /><i /></div>
      </article>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
        .cf-stage{width:100vw;height:100dvh;display:grid;place-items:center;overflow:hidden;background:#102e37;font-family:"IBM Plex Sans Arabic",sans-serif;-webkit-font-smoothing:antialiased}
        .cf-poster{--teal:#153c3c;--coral:#e46942;--ivory:#faf7ef;position:relative;isolation:isolate;overflow:hidden;width:min(100vw,80dvh);height:min(100dvh,125vw);aspect-ratio:4/5;container-type:inline-size;color:var(--ivory);background:#102e37}
        .cf-photo{position:absolute;inset:0;z-index:-3;width:100%;height:100%;object-fit:cover;object-position:center}
        .cf-shade{position:absolute;inset:0;z-index:-2;background:linear-gradient(90deg,rgba(5,23,47,.24) 0%,rgba(5,23,47,.09) 48%,rgba(7,31,40,.04) 100%),linear-gradient(180deg,rgba(7,27,43,.20) 0%,transparent 24%,transparent 60%,rgba(7,31,40,.46) 100%)}
        .cf-side-shade{position:absolute;z-index:-1;inset:0 auto 0 0;width:61%;background:linear-gradient(90deg,rgba(7,27,49,.38),rgba(7,27,49,0));pointer-events:none}
        .cf-brand{position:absolute;top:5.1%;left:6%;display:flex;align-items:center;gap:1.15cqw;direction:ltr}
        .cf-brand-mark{display:grid;place-items:center;width:5.3cqw;height:5.3cqw;border-radius:1.25cqw;background:var(--coral);color:var(--ivory);transform:rotate(-7deg);box-shadow:0 1cqw 2.2cqw rgba(0,0,0,.22)}
        .cf-brand-mark svg{width:64%;height:64%;stroke-width:2.3}
        .cf-wordmark{display:flex;flex-direction:column;line-height:1;text-align:left}
        .cf-wordmark strong{color:#fffaf3;font:700 1.86cqw/1 "IBM Plex Sans Arabic",sans-serif;letter-spacing:-.035em}
        .cf-wordmark small{margin-top:.45cqw;color:#f4aa8e;font:600 1.02cqw/1 "IBM Plex Sans Arabic",sans-serif;letter-spacing:.14em;text-transform:uppercase}
        .cf-counter{position:absolute;top:5.1%;right:6%;direction:ltr;padding:.7cqw 1.5cqw .62cqw;border:1px solid rgba(250,247,239,.58);border-radius:999px;color:#fffaf3;font:600 1.5cqw/1 "IBM Plex Sans Arabic",sans-serif;letter-spacing:.04em;background:rgba(9,34,48,.24);backdrop-filter:blur(10px)}
        .cf-counter b{color:#f49a78;font-weight:700}
        .cf-hero-copy{position:absolute;top:19.6%;left:5.9%;width:58%;text-align:right}
        .cf-eyebrow{display:inline-flex;align-items:center;gap:.9cqw;margin-bottom:1.5cqw;color:#f1ba9f;font-size:1.38cqw;font-weight:600;letter-spacing:.06em}
        .cf-eyebrow:before{content:"";width:3.3cqw;height:1px;background:var(--coral)}
        .cf-hero-copy h1{margin:0;color:#fffaf3;font-size:6.65cqw;font-weight:700;line-height:1.2;letter-spacing:-.045em;text-wrap:balance;text-shadow:0 1cqw 2.4cqw rgba(0,0,0,.2)}
        .cf-hero-copy h1 span{color:#f08762}
        .cf-feature-panel{position:absolute;left:5.6%;bottom:9.3%;width:52.8%;padding:1.1cqw 2.1cqw;border:1px solid rgba(250,247,239,.7);border-radius:2.1cqw;color:#153c3c;background:rgba(250,247,239,.96);box-shadow:0 2.4cqw 6cqw rgba(3,18,32,.3)}
        .cf-feature-row{display:flex;align-items:center;gap:1.6cqw;min-height:7.8cqw;border-bottom:1px solid rgba(21,60,60,.12)}
        .cf-feature-row:last-child{border-bottom:0}
        .cf-feature-icon{flex:0 0 auto;display:grid;place-items:center;width:4.55cqw;height:4.55cqw;border-radius:1.15cqw;color:var(--coral);background:rgba(228,105,66,.105)}
        .cf-feature-icon svg{width:2.55cqw;height:2.55cqw;stroke-width:1.8}
        .cf-feature-label{font-size:1.92cqw;font-weight:600;line-height:1.35}
        .cf-device-screen{position:absolute;left:62.4%;top:41%;width:15.3%;height:10.3%;padding:.55cqw;overflow:hidden;border:.24cqw solid rgba(212,231,224,.8);border-radius:.65cqw;background:#eff3e9;box-shadow:0 .8cqw 2cqw rgba(0,0,0,.38);transform:rotate(-1deg)}
        .cf-screen-top{height:1.05cqw;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #d5dfd6}
        .cf-screen-logo{width:2.45cqw;height:.45cqw;border-radius:2px;background:#1c5550}
        .cf-screen-dot{width:.52cqw;height:.52cqw;border-radius:50%;background:var(--coral)}
        .cf-screen-layout{display:grid;grid-template-columns:1fr 1.2fr;gap:.48cqw;height:calc(100% - 1.05cqw);padding-top:.55cqw}
        .cf-screen-nav{display:flex;flex-direction:column;gap:.48cqw;padding:.35cqw;border-radius:.25cqw;background:#dfe8de}
        .cf-screen-nav i{height:.35cqw;border-radius:2px;background:#88a39a}
        .cf-screen-main{display:flex;flex-direction:column;gap:.48cqw}
        .cf-screen-line{width:66%;height:.42cqw;border-radius:3px;background:#9cb1a7}
        .cf-screen-cards{display:flex;gap:.35cqw}
        .cf-screen-cards i{flex:1;height:1.5cqw;border-radius:.2cqw;background:#dce7dc}
        .cf-screen-chart{position:relative;flex:1;min-height:1.8cqw;overflow:hidden;border-radius:.2cqw;background:#e1e9df}
        .cf-screen-chart:after{content:"";position:absolute;inset:36% 10% 15%;border-top:.2cqw solid #e46942;transform:skewY(-14deg)}
        .cf-screen-note{position:absolute;left:5.8%;bottom:5.4%;color:rgba(250,247,239,.82);font-size:1.14cqw;font-weight:500}
        .cf-footer{position:absolute;right:5.8%;bottom:4.6%;display:flex;align-items:center;gap:1.1cqw;color:rgba(250,247,239,.86);direction:ltr}
        .cf-footer-mark{width:2.65cqw;height:2.65cqw;display:grid;place-items:center;border-radius:.72cqw;color:#fffaf3;background:var(--coral)}
        .cf-footer-mark svg{width:68%;height:68%}
        .cf-footer-name{font:700 1.2cqw/1 "IBM Plex Sans Arabic",sans-serif}
        .cf-footer-name small{display:block;margin-top:.35cqw;color:#e8b49e;font-size:.78cqw;font-weight:500;letter-spacing:.12em}
        .cf-progress{position:absolute;bottom:1.9%;left:5.8%;display:flex;gap:.48cqw}
        .cf-progress i{display:block;width:2.6cqw;height:.3cqw;border-radius:9px;background:rgba(250,247,239,.42)}
        .cf-progress i:nth-child(4){background:var(--coral)}
        @media (max-aspect-ratio:4/5){.cf-poster{width:100vw;height:125vw}}
        @media (min-aspect-ratio:4/5){.cf-poster{width:80dvh;height:100dvh}}
      `}</style>
    </main>
  );
}
