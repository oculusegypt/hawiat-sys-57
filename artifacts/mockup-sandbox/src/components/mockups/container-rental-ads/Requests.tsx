import { Workflow } from "lucide-react";

const palette = {
  teal: "#153c3c",
  coral: "#e46942",
  ivory: "#faf7ef",
};

export function Requests() {
  return (
    <main
      lang="ar"
      dir="rtl"
      style={{
        boxSizing: "border-box",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        padding: "7.5vh 8vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: palette.teal,
        color: palette.ivory,
        fontFamily: '"IBM Plex Sans Arabic", sans-serif',
      }}
    >
      <div
        aria-label="CleanFlow Platform"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.45vw",
          alignSelf: "flex-start",
          direction: "ltr",
          height: "5.6vh",
          flex: "0 0 auto",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: "5.6vh",
            height: "5.6vh",
            borderRadius: "1.25vh",
            display: "grid",
            placeItems: "center",
            background: palette.coral,
          }}
        >
          <Workflow
            size="2.9vh"
            strokeWidth={2.3}
            color={palette.ivory}
          />
        </span>
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            lineHeight: 1,
            gap: "0.42vh",
            color: palette.ivory,
          }}
        >
          <strong
            style={{
              fontFamily: '"IBM Plex Sans Arabic", sans-serif',
              fontSize: "2.8vw",
              fontWeight: 700,
              letterSpacing: "-0.035em",
            }}
          >
            CleanFlow
          </strong>
          <small
            style={{
              fontFamily: '"IBM Plex Sans Arabic", sans-serif',
              fontSize: "1.65vw",
              fontWeight: 500,
              letterSpacing: "0.015em",
            }}
          >
            Platform
          </small>
        </span>
      </div>
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "2.15vh",
          marginTop: "auto",
          marginBottom: "6.5vh",
          direction: "rtl",
          textAlign: "left",
        }}
      >
        <div
          style={{
            maxWidth: "82vw",
            color: palette.ivory,
            fontSize: "10.6vw",
            fontWeight: 700,
            lineHeight: 1.35,
            letterSpacing: "-0.045em",
            textAlign: "left",
            textWrap: "balance",
          }}
        >
          كل طلب حاوية في مساره
        </div>
        <div
          style={{
            maxWidth: "82vw",
            color: palette.ivory,
            fontSize: "3.35vw",
            fontWeight: 400,
            lineHeight: 1.65,
            textAlign: "left",
          }}
        >
          خريطة، تنبيهات، وتتبع العميل بلا تسجيل
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "flex-start",
            marginTop: "1.3vh",
            padding: "1.85vh 4.1vw",
            borderRadius: "1.15vh",
            background: palette.ivory,
            color: palette.teal,
            fontSize: "3.25vw",
            fontWeight: 700,
            lineHeight: 1.35,
            whiteSpace: "nowrap",
          }}
        >
          اطلب عرضًا عمليًا
        </div>
      </section>
    </main>
  );
}
