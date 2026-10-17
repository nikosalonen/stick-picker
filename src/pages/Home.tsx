import { useState } from "react";
import { copy } from "../copy";
import { useLang } from "../i18n";
import { LABEL_PARTS, StickArt, type LabelPart } from "../components/art/StickArt";
import { pathTo } from "../router";

const EXAMPLE: Record<LabelPart, string> = { size: "JR", flex: "40", curve: "P92", hand: "L", length: '52"' };

export function Home() {
  const { t, lang } = useLang();
  const [active, setActive] = useState<LabelPart>("flex");

  const titles: Record<LabelPart, string> = {
    size: t(copy.label.size),
    flex: t(copy.label.flex),
    curve: t(copy.label.curve),
    hand: t(copy.label.hand),
    length: t(copy.label.length),
  };
  const bodies: Record<LabelPart, string> = {
    size: t(copy.label.sizeBody),
    flex: t(copy.label.flexBody),
    curve: t(copy.label.curveBody),
    hand: t(copy.label.handBody),
    length: t(copy.label.lengthBody),
  };

  return (
    <main className="home">
      <section className="hero">
        <h1>{t(copy.home.title)}</h1>
        <p className="lead">{t(copy.home.lead)}</p>
        <div className="button-row">
          <a className="button button-primary button-big" href={pathTo(lang, "quiz", "age")}>
            {t(copy.home.start)}
            <span className="button-note">{t(copy.home.startNote)}</span>
          </a>
          <a className="button button-big" href={pathTo(lang, "guide")}>
            {t(copy.home.guide)}
          </a>
        </div>
      </section>

      <section className="decoder" aria-labelledby="decoder-title">
        <h2 id="decoder-title">{t(copy.home.decoderTitle)}</h2>
        <p className="muted">{t(copy.home.decoderLead)}</p>
        <div className="decoder-stick">
          <StickArt values={EXAMPLE} active={active} onSelect={setActive} title={t(copy.home.decoderTitle)} partNames={titles} animateIn />
        </div>
        <div className="decoder-tabs" role="tablist" aria-label={t(copy.home.decoderTitle)}>
          {LABEL_PARTS.map((part) => (
            <button
              key={part}
              role="tab"
              id={`tab-${part}`}
              aria-selected={active === part}
              aria-controls="decoder-panel"
              className="decoder-tab"
              onClick={() => setActive(part)}
            >
              <span className="decoder-tab-value">{EXAMPLE[part]}</span>
              <span className="decoder-tab-name">{titles[part]}</span>
            </button>
          ))}
        </div>
        <div className="decoder-panel" id="decoder-panel" role="tabpanel" aria-labelledby={`tab-${active}`} aria-live="polite">
          <h3>
            {titles[active]}: <span className="decoder-panel-value">{EXAMPLE[active]}</span>
          </h3>
          <p>{bodies[active]}</p>
        </div>
      </section>

      <section className="faq" aria-labelledby="faq-title">
        <h2 id="faq-title">{t(copy.faqTitle)}</h2>
        <div className="faq-list">
          {copy.faq.map((item) => (
            <article key={item.anchor} className="faq-item">
              <h3>{t(item.question)}</h3>
              <p>{t(item.answer)}</p>
              <a href={`${pathTo(lang, "guide")}#${item.anchor}`}>{t(copy.faqMore)}</a>
            </article>
          ))}
        </div>
      </section>

      <section className="all-rounder">
        <h2>{t(copy.home.allRounderTitle)}</h2>
        <p>{t(copy.home.allRounderBody)}</p>
        <a className="button button-primary" href={pathTo(lang, "quiz", "age")}>
          {t(copy.home.start)}
        </a>
      </section>
    </main>
  );
}
