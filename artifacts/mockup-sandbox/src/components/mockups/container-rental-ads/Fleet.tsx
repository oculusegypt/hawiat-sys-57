import { Workflow } from "lucide-react";

export function Fleet() {
  return (
    <main className="fleet-ad">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap');

        .fleet-ad,
        .fleet-ad * {
          box-sizing: border-box;
        }

        .fleet-ad {
          width: 100vw;
          height: 100vh;
          padding: 7vh 7vw;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          background: #faf7ef;
          color: #153c3c;
          font-family: "IBM Plex Sans Arabic", sans-serif;
        }

        .fleet-ad__logo {
          display: flex;
          align-items: center;
          gap: 1.1vw;
          align-self: flex-start;
          direction: ltr;
        }

        .fleet-ad__symbol {
          width: 5.4vh;
          height: 5.4vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border-radius: 1.35vh;
          background: #e46942;
          color: #faf7ef;
        }

        .fleet-ad__symbol svg {
          width: 2.6vh;
          height: 2.6vh;
          stroke-width: 2.3;
        }

        .fleet-ad__brand {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          color: #153c3c;
          line-height: 1.04;
        }

        .fleet-ad__brand strong {
          font-size: 2.6vh;
          font-weight: 700;
          letter-spacing: -0.035em;
        }

        .fleet-ad__brand small {
          margin-top: 0.28vh;
          font-size: 1.35vh;
          font-weight: 500;
          letter-spacing: 0.03em;
        }

        .fleet-ad__middle {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2.65vh;
          margin-bottom: 5vh;
        }

        .fleet-ad__headline {
          max-width: 86vw;
          font-size: 7.5vw;
          font-weight: 700;
          line-height: 1.26;
          letter-spacing: -0.045em;
          text-align: left;
          text-wrap: balance;
        }

        .fleet-ad__benefit {
          max-width: 84vw;
          color: #153c3c;
          font-size: 3.35vw;
          font-weight: 400;
          line-height: 1.65;
          text-align: left;
        }

        .fleet-ad__cta {
          min-height: 7.2vh;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 1vh;
          padding: 0 4vw;
          border-radius: 1.2vh;
          background: #e46942;
          color: #faf7ef;
          font-size: 3.3vw;
          font-weight: 700;
          line-height: 1;
          text-align: left;
          white-space: nowrap;
        }
      `}</style>
      <div className="fleet-ad__logo" aria-label="CleanFlow Platform">
        <span className="fleet-ad__symbol" aria-hidden="true">
          <Workflow
            aria-hidden="true"
            strokeWidth={2.3}
            style={{ width: "2.6vh", height: "2.6vh" }}
          />
        </span>
        <span className="fleet-ad__brand">
          <strong>CleanFlow</strong>
          <small>Platform</small>
        </span>
      </div>
      <section className="fleet-ad__middle">
        <div className="fleet-ad__headline" dir="rtl">
          أسطولك ومواعيدك في لوحة واحدة
        </div>
        <div className="fleet-ad__benefit" dir="rtl">
          جدولة الفرق، أوامر العمل، ومتابعة التنفيذ
        </div>
        <div className="fleet-ad__cta" dir="rtl">
          شاهد المنصة
        </div>
      </section>
    </main>
  );
}
