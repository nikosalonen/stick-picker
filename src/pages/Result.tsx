import { useEffect, useState } from "react";
import { copy } from "../copy";
import { CURVES } from "../data/curves";
import { useLang } from "../i18n";
import { recommend, toInches, type Answers } from "../logic/recommend";
import { StickArt } from "../components/art/StickArt";
import {
  BrandSection,
  CurveSection,
  FlexSection,
  HandSection,
  KickSection,
  LengthSection,
  MistakesSection,
  SizeChartSection,
} from "../components/Sections";
import { ICONS } from "../components/art/icons";
import { go } from "../router";

export function Result({ answers }: { answers: Answers | null }) {
  const { t } = useLang();
  const [status, setStatus] = useState<"idle" | "copied" | "linkCopied">("idle");

  useEffect(() => {
    if (!answers) go("/quiz/age");
  }, [answers]);

  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  if (!answers) return null;
  const rec = recommend(answers);
  const young = answers.age === "under7" || answers.age === "7to9" || answers.age === "10to13";
  const handLetter = rec.hand === "left" ? "L" : rec.hand === "right" ? "R" : "L / R";
  const handText =
    rec.hand === "unsure" ? t(copy.result.handUnsure) : `${t(copy.quiz.hands[rec.hand])} (${handLetter})`;

  const rows: { icon: keyof typeof ICONS; label: string; value: string; note?: string; href?: string; plain?: boolean }[] = [
    { icon: "size", label: t(copy.label.size), value: `${t(copy.sizes[rec.size])} (${copy.sizeShort[rec.size]})`, href: "#sizes" },
    {
      icon: "flex",
      label: t(copy.label.flex),
      value: String(rec.flex),
      note: rec.flexRange[0] !== rec.flexRange[1] ? `${t(copy.result.alsoFine)}: ${rec.flexRange[0]}` : undefined,
      href: "#flex",
    },
    {
      icon: "curve",
      label: t(copy.label.curve),
      value: `${rec.curve}`,
      note: `${t(copy.result.otherNames)}: ${CURVES[rec.curve].otherNames}. ${t(copy.result.alsoFine)}: ${rec.curveAlternatives[0]}`,
      href: "#curve",
    },
    { icon: "hand", label: t(copy.label.hand), value: handText, href: "#hand" },
    {
      icon: "length",
      label: t(copy.label.length),
      value: t(copy.result.buyLength(rec.stockLengthIn)),
      note: rec.cutCm > 0 ? t(copy.result.cutTo(rec.lengthCm, toInches(rec.lengthCm))) : t(copy.result.noCut),
      href: "#length",
    },
    {
      icon: "kick",
      label: t(copy.label.kick),
      value: rec.kickMatters ? `${t(copy.kicksPlain[rec.kick])} (${t(copy.kicks[rec.kick]).toLowerCase()})` : t(copy.result.kickNoMatter),
      href: "#kick",
    },
    { icon: "budget", label: t(copy.result.budget), value: t(young ? copy.result.budgetKids : copy.result.budgetAdults), plain: true },
  ];

  const copyList = async () => {
    const text = [t(copy.result.title), ...rows.map((r) => `${r.label}: ${r.value}${r.note ? ` (${r.note})` : ""}`), window.location.href].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      window.prompt(t(copy.result.copy), text);
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: t(copy.appName), text: t(copy.result.title), url });
        return;
      } catch {
        // The person closed the share sheet; nothing else to do.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("linkCopied");
    } catch {
      window.prompt(t(copy.result.share), url);
    }
  };

  return (
    <main className="result">
      <header className="result-head">
        <h1>{t(copy.result.title)}</h1>
        <p className="lead">{t(copy.result.lead)}</p>
      </header>

      <div className="result-stick">
        <StickArt
          animateIn
          title={t(copy.result.yourStick)}
          values={{
            size: copy.sizeShort[rec.size],
            flex: String(rec.flex),
            curve: rec.curve,
            hand: rec.hand === "unsure" ? "L/R" : handLetter,
            length: `${rec.stockLengthIn}"`,
          }}
        />
      </div>

      <section className="shopping" aria-label={t(copy.result.title)}>
        <dl className="shopping-list">
          {rows.map((row) => (
            <div key={row.label} className="shopping-row" data-plain={row.plain || undefined}>
              <dt>
                {ICONS[row.icon]}
                {row.label}
              </dt>
              <dd>
                <span className="shopping-value">{row.value}</span>
                {row.note && <span className="shopping-note">{row.note}</span>}
              </dd>
              {row.href && (
                <button
                  type="button"
                  className="shopping-why"
                  onClick={() => document.querySelector(row.href!)?.scrollIntoView({ behavior: "smooth" })}
                >
                  {t(copy.result.why)}
                </button>
              )}
            </div>
          ))}
        </dl>
        <div className="button-row">
          <button className="button button-primary" onClick={copyList}>
            {status === "copied" ? t(copy.result.copied) : t(copy.result.copy)}
          </button>
          <button className="button" onClick={share}>
            {status === "linkCopied" ? t(copy.result.linkCopied) : t(copy.result.share)}
          </button>
          <a className="button button-quiet" href="#/quiz/age">
            {t(copy.result.edit)}
          </a>
        </div>
        <p className="visually-hidden" aria-live="polite">
          {status === "copied" ? t(copy.result.copied) : status === "linkCopied" ? t(copy.result.linkCopied) : ""}
        </p>
      </section>

      <h2 className="why-title">{t(copy.result.whyTitle)}</h2>
      <SizeChartSection rec={rec} answers={answers} />
      <LengthSection rec={rec} answers={answers} />
      <FlexSection rec={rec} answers={answers} />
      <CurveSection rec={rec} />
      <HandSection rec={rec} />
      <KickSection rec={rec} />
      <BrandSection rec={rec} />
      <MistakesSection />
    </main>
  );
}
