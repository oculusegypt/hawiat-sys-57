import { Workflow } from "lucide-react";

const palette = {
  background: "#f0eadc",
  teal: "#153c3c",
  coral: "#e46942",
  ivory: "#faf7ef",
};

export function Insights() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
      />
      <main
        lang="ar"
        dir="rtl"
        aria-label="إعلان CleanFlow Platform"
        style={{
          width: "100vw",
          height: "100vh",
          margin: 0,
          padding: "7vh 8vw",
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: palette.background,
          color: palette.teal,
          fontFamily: '"IBM Plex Sans Arabic", sans-serif',
          fontSynthesis: "none",
          textRendering: "optimizeLegibility",
        }}
      >
        <div
          aria-label="CleanFlow Platform"
          style={{
            display: "flex",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: "1.4vw",
            direction: "ltr",
            flex: "0 0 auto",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "6.2vw",
              height: "6.2vw",
              display: "grid",
              placeItems: "center",
              borderRadius: "1.55vw",
              background: palette.coral,
            }}
          >
            <Workflow
              style={{
                width: "3.55vw",
                height: "3.55vw",
                color: palette.ivory,
                strokeWidth: 2.3,
              }}
            />
          </span>
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              color: palette.teal,
              lineHeight: 1,
            }}
          >
            <strong
              style={{
                fontSize: "2.55vw",
                fontWeight: 700,
                letterSpacing: "-0.04em",
              }}
            >
              CleanFlow
            </strong>
            <small
              style={{
                marginTop: "0.55vh",
                fontSize: "1.38vw",
                fontWeight: 500,
                letterSpacing: "0.08em",
              }}
            >
              Platform
            </small>
          </span>
        </div>
        <section
          style={{
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "3.1vh",
            direction: "ltr",
          }}
        >
          <div
            style={{
              width: "100%",
              color: palette.teal,
              fontSize: "8.2vw",
              fontWeight: 700,
              lineHeight: 1.36,
              letterSpacing: "-0.045em",
              textAlign: "left",
              direction: "rtl",
            }}
          >
            قراراتك تبدأ من أرقام واضحة
          </div>
          <div
            style={{
              width: "100%",
              color: palette.teal,
              fontSize: "3.2vw",
              fontWeight: 500,
              lineHeight: 1.65,
              textAlign: "left",
              direction: "rtl",
            }}
          >
            تقارير، تراخيص سلامة، ومساعد ذكي
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "flex-start",
              marginTop: "1.2vh",
              padding: "1.8vh 4.6vw",
              borderRadius: "1.2vw",
              background: palette.coral,
              color: palette.ivory,
              fontSize: "2.9vw",
              fontWeight: 700,
              lineHeight: 1.35,
              whiteSpace: "nowrap",
              direction: "rtl",
            }}
          >
            استكشف المنصة
          </div>
        </section>
      </main>
    </>
  );
}

export default Insights;
