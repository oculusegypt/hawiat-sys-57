import { Workflow } from "lucide-react";

const styles = {
  frame: {
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    boxSizing: "border-box" as const,
    display: "flex",
    flexDirection: "column" as const,
    padding: "7vh 7vw",
    background: "#153c3c",
    color: "#faf7ef",
    fontFamily: '"IBM Plex Sans Arabic", sans-serif',
    WebkitFontSmoothing: "antialiased" as const,
    textRendering: "optimizeLegibility" as const,
  },
  logo: {
    display: "flex",
    flex: "0 0 auto",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: "1.5vw",
    direction: "ltr" as const,
    whiteSpace: "nowrap" as const,
  },
  symbol: {
    display: "grid",
    width: "5.4vh",
    height: "5.4vh",
    placeItems: "center",
    borderRadius: "1.35vh",
    background: "#e46942",
    color: "#faf7ef",
  },
  brandName: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    gap: "0.05vh",
    lineHeight: 1.05,
  },
  brand: {
    color: "#faf7ef",
    fontSize: "3.25vw",
    fontWeight: 700,
    letterSpacing: "-0.055vw",
  },
  platform: {
    color: "#faf7ef",
    fontSize: "1.9vw",
    fontWeight: 500,
    letterSpacing: "0.08vw",
  },
  middle: {
    display: "flex",
    flex: "1 1 auto",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "3vh",
    direction: "rtl" as const,
    textAlign: "left" as const,
  },
  headline: {
    maxWidth: "100%",
    color: "#faf7ef",
    fontSize: "8.2vw",
    fontWeight: 700,
    lineHeight: 1.28,
    letterSpacing: "-0.12vw",
    textWrap: "balance" as const,
  },
  benefit: {
    maxWidth: "100%",
    color: "#faf7ef",
    fontSize: "3.35vw",
    fontWeight: 400,
    lineHeight: 1.65,
  },
  cta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "7.4vh",
    padding: "1.65vh 4vw",
    borderRadius: "1.1vh",
    background: "#e46942",
    color: "#153c3c",
    fontSize: "3.2vw",
    fontWeight: 700,
    lineHeight: 1.3,
    whiteSpace: "nowrap" as const,
  },
} as const;

export function Contracts() {
  return (
    <main lang="ar" dir="rtl" style={styles.frame} aria-label="CleanFlow Platform">
      <div style={styles.logo} aria-label="CleanFlow Platform">
        <span style={styles.symbol} aria-hidden="true">
          <Workflow style={{ width: "2.8vh", height: "2.8vh" }} strokeWidth={2.1} />
        </span>
        <span style={styles.brandName}>
          <strong style={styles.brand}>CleanFlow</strong>
          <small style={styles.platform}>Platform</small>
        </span>
      </div>
      <section style={styles.middle}>
        <div style={styles.headline} dir="rtl">عقودك وفواتيرك أوضح</div>
        <div style={styles.benefit} dir="rtl">تابع الاستحقاقات واضبط أسعار الباقات</div>
        <div style={styles.cta} dir="rtl">احجز عرضًا عمليًا</div>
      </section>
    </main>
  );
}
