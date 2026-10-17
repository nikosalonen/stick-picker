import { useEffect, useState } from "react";
import { copy } from "../copy";
import { CURVE_ORDER, CURVES, rateCurve } from "../data/curves";
import { useLang } from "../i18n";
import { FLEX_OPTIONS, recommend, SIZES, toInches, type Answers, type CurveId, type Preferences, type SizeCategory } from "../logic/recommend";
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
import { navigate, pathTo, resultPath } from "../router";

const SIZE_ORDER: SizeCategory[] = ["youth", "junior", "intermediate", "senior"];

export function Result({ answers, preferences }: { answers: Answers | null; preferences: Preferences }) {
  const { t, lang } = useLang();
  const [status, setStatus] = useState<"idle" | "copied" | "linkCopied">("idle");
  const [prefs, setPrefs] = useState<Preferences>(preferences);

  // A new link (for example after changing answers) brings its own favourites, or none.
  const linkKey = JSON.stringify([answers, preferences]);
  useEffect(() => setPrefs(preferences), [linkKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const updatePrefs = (next: Preferences) => {
    setPrefs(next);
    // Keep favourites in the link without a navigation, so the page doesn't jump to the top.
    if (answers) window.history.replaceState(null, "", resultPath(lang, answers, next));
  };

  useEffect(() => {
    if (!answers) navigate(pathTo(lang, "quiz", "age"), { replace: true });
  }, [answers, lang]);

  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  if (!answers) return null;
  const rec = recommend(answers, prefs);
  const curveRating = rateCurve(rec.curve, answers);
  const sizeChanged = rec.favourite.flex && rec.size !== rec.suggested.size;
  const flexWarning =
    rec.flexFit === "stiffer"
      ? t(copy.result.warnStiffer(rec.flexAfterCut, rec.targetFlex))
      : rec.flexFit === "softer"
        ? t(copy.result.warnSofter(rec.flexAfterCut, rec.targetFlex))
        : null;
  const young = answers.age === "under7" || answers.age === "7to9" || answers.age === "10to13";
  const handLetter = rec.hand === "left" ? "L" : rec.hand === "right" ? "R" : "L / R";
  const handText =
    rec.hand === "unsure" ? t(copy.result.handUnsure) : `${t(copy.quiz.hands[rec.hand])} (${handLetter})`;

  const rows: { icon: keyof typeof ICONS; label: string; value: string; note?: string; href?: string; plain?: boolean; warn?: boolean }[] = [
    {
      icon: "size",
      label: t(copy.label.size),
      value: `${t(copy.sizes[rec.size])} (${copy.sizeShort[rec.size]})`,
      note: sizeChanged ? t(copy.result.sizeChanged(rec.flex, t(copy.sizes[rec.size]))) : undefined,
      href: "#sizes",
    },
    rec.favourite.flex
      ? {
          icon: "flex",
          label: t(copy.label.flex),
          value: `${rec.flex} (${t(copy.result.yourPick)})`,
          note: `${t(copy.result.weSuggested(String(rec.suggested.flex)))}. ${flexWarning ?? t(copy.result.flexGood(rec.flexAfterCut, rec.targetFlex))}`,
          warn: rec.flexFit !== "good",
          href: "#flex",
        }
      : {
          icon: "flex",
          label: t(copy.label.flex),
          value: String(rec.flex),
          note: rec.flexRange[0] !== rec.flexRange[1] ? `${t(copy.result.alsoFine)}: ${rec.flexRange[0]}` : undefined,
          href: "#flex",
        },
    rec.favourite.curve
      ? {
          icon: "curve",
          label: t(copy.label.curve),
          value: `${rec.curve} (${t(copy.result.yourPick)})`,
          note: `${t(copy.explain.verdicts[curveRating.verdict])}: ${t(curveRating.reason)} ${t(copy.result.weSuggested(rec.suggested.curve))}.`,
          warn: curveRating.verdict === "notRecommended",
          href: "#curve",
        }
      : {
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
                {row.note && (
                  <span className="shopping-note" data-warn={row.warn || undefined}>
                    {row.note}
                  </span>
                )}
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
          <a className="button button-quiet" href={pathTo(lang, "quiz", "age")}>
            {t(copy.result.edit)}
          </a>
        </div>
        <Favourites
          prefs={prefs}
          suggestedFlex={rec.suggested.flex}
          suggestedCurve={rec.suggested.curve}
          answers={answers}
          onChange={updatePrefs}
        />
        <p className="visually-hidden" aria-live="polite">
          {status === "copied" ? t(copy.result.copied) : status === "linkCopied" ? t(copy.result.linkCopied) : ""}
        </p>
      </section>

      <h2 className="why-title">{t(copy.result.whyTitle)}</h2>
      <SizeChartSection rec={rec} answers={answers} />
      <LengthSection rec={rec} answers={answers} />
      <FlexSection rec={rec} answers={answers} />
      <CurveSection rec={rec} answers={answers} />
      <HandSection rec={rec} />
      <KickSection rec={rec} />
      <BrandSection rec={rec} />
      <MistakesSection />
    </main>
  );
}

/** Optional favourites. Experienced players often know their flex and curve already. */
function Favourites({
  prefs,
  suggestedFlex,
  suggestedCurve,
  answers,
  onChange,
}: {
  prefs: Preferences;
  suggestedFlex: number;
  suggestedCurve: CurveId;
  answers: Answers;
  onChange: (prefs: Preferences) => void;
}) {
  const { t } = useLang();
  const hasFavourites = prefs.flex !== undefined || prefs.curve !== undefined;
  return (
    <details className="favourites" open={hasFavourites || undefined}>
      <summary>{t(copy.result.favTitle)}</summary>
      <p className="muted">{t(copy.result.favBody)}</p>
      <div className="favourites-fields">
        <label className="field">
          <span>{t(copy.result.favFlex)}</span>
          <select
            value={prefs.flex ?? ""}
            onChange={(e) => onChange({ ...prefs, flex: e.target.value === "" ? undefined : Number(e.target.value) })}
          >
            <option value="">{t(copy.result.useSuggestion(String(suggestedFlex)))}</option>
            {FLEX_OPTIONS.map((flex) => (
              <option key={flex} value={flex}>
                Flex {flex} ({SIZE_ORDER.filter((size) => SIZES[size].flexes.includes(flex)).map((size) => copy.sizeShort[size]).join(" / ")})
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t(copy.result.favCurve)}</span>
          <select
            value={prefs.curve ?? ""}
            onChange={(e) => onChange({ ...prefs, curve: e.target.value === "" ? undefined : (e.target.value as CurveId) })}
          >
            <option value="">{t(copy.result.useSuggestion(suggestedCurve))}</option>
            {CURVE_ORDER.map((id) => (
              <option key={id} value={id}>
                {id}: {t(copy.explain.verdicts[rateCurve(id, answers).verdict]).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
      </div>
      {hasFavourites && (
        <button type="button" className="button button-quiet" onClick={() => onChange({})}>
          {t(copy.result.clearFavourites)}
        </button>
      )}
    </details>
  );
}
