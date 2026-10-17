import { useEffect, useState } from "react";
import { copy } from "../copy";
import { CURVE_ORDER, CURVES, rateCurve } from "../data/curves";
import { useLang } from "../i18n";
import { STOCK_STICKS } from "../data/stock";
import { candidatesFor, type Candidate } from "../logic/candidates";
import { KickGlyph } from "../components/art/KickShot";
import { curveMadeIn, FLEX_OPTIONS, recommend, SIZE_ORDER, toInches, type Answers, type CurveId, type Preferences, type SizeCategory } from "../logic/recommend";
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
  const range = (values: number[], unit = "") =>
    values.length > 1 ? `${values[0]}–${values[values.length - 1]}${unit}` : `${values[0]}${unit}`;
  const flexRange = range(rec.flexes);
  const lengthRange = range(rec.lengthsIn, '"');
  const sizeName = t(copy.sizes[rec.size]);
  const candidates = candidatesFor(rec, answers);
  const curveChoices = [rec.curve, ...rec.curveAlternatives.slice(0, 1)];
  const handLetter = rec.hand === "left" ? "L" : rec.hand === "right" ? "R" : "L / R";
  const handText =
    rec.hand === "unsure" ? t(copy.result.handUnsure) : `${t(copy.quiz.hands[rec.hand])} (${handLetter})`;

  const rows: { icon: keyof typeof ICONS; label: string; value: string; note?: string; href?: string; plain?: boolean; warn?: boolean }[] = [
    {
      icon: "size",
      label: t(copy.label.size),
      value: listJoin(
        rec.sizes.map((size) => `${t(copy.sizes[size])} (${copy.sizeShort[size]})`),
        t(copy.result.or),
      ),
      note: sizeChanged
        ? t(copy.result.sizeChanged(rec.flex, t(copy.sizes[rec.size])))
        : rec.sizes.length > 1
          ? t(copy.result.sizeNaming)
          : undefined,
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
          value: flexRange,
          note:
            rec.flexes.length > 1
              ? t(copy.result.flexRangeNote(listJoin(rec.flexes.map(String), t(copy.result.or)), rec.targetFlex))
              : t(copy.result.flexSingleNote(rec.flex, rec.targetFlex)),
          href: "#flex",
        },
    rec.unavailableCurve
      ? {
          icon: "curve",
          label: t(copy.label.curve),
          value: rec.curve,
          note: t(copy.result.curveNotMade(rec.unavailableCurve, sizeName, rec.curve)),
          warn: true,
          href: "#curve",
        }
      : rec.favourite.curve
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
          value: listJoin(curveChoices, t(copy.result.or)),
          note: curveChoices.map((id) => `${id} = ${CURVES[id].otherNames}`).join(". "),
          href: "#curve",
        },
    { icon: "hand", label: t(copy.label.hand), value: handText, href: "#hand" },
    {
      icon: "length",
      label: t(copy.label.length),
      value: t(copy.result.uncutLength(lengthRange)),
      note: rec.needsExtension
        ? t(copy.result.needsExtension)
        : t(copy.result.cutTo(rec.lengthCm, toInches(rec.lengthCm))),
      warn: rec.needsExtension,
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
    const text = [
      t(copy.result.title),
      ...rows.map((r) => `${r.label}: ${r.value}${r.note ? ` (${r.note})` : ""}`),
      `${t(copy.result.candidatesTitle)}: ${candidates.map((c) => `${c.model.brand} ${c.model.family} ${c.model.name}`).join(", ")}`,
      window.location.href,
    ].join("\n");
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
            size: rec.sizes.map((size) => copy.sizeShort[size]).join("/"),
            flex: flexRange,
            curve: rec.curve,
            hand: rec.hand === "unsure" ? "L/R" : handLetter,
            length: lengthRange,
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
        <Candidates candidates={candidates} />
        <Favourites
          prefs={prefs}
          suggestedFlex={rec.suggested.flex}
          suggestedCurve={rec.suggested.curve}
          size={rec.size}
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
  size,
  answers,
  onChange,
}: {
  prefs: Preferences;
  suggestedFlex: number;
  suggestedCurve: CurveId;
  size: SizeCategory;
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
                Flex {flex} ({whereSold(flex)})
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
            {CURVE_ORDER.filter((id) => curveMadeIn(id, size)).map((id) => (
              <option key={id} value={id}>
                {id}: {t(copy.explain.verdicts[rateCurve(id, answers).verdict]).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
      </div>
      {CURVE_ORDER.some((id) => !curveMadeIn(id, size)) && (
        <p className="small muted">
          {t(copy.result.curvesNotMade(t(copy.sizes[size]), CURVE_ORDER.filter((id) => !curveMadeIn(id, size)).join(", ")))}
        </p>
      )}
      {hasFavourites && (
        <button type="button" className="button button-quiet" onClick={() => onChange({})}>
          {t(copy.result.clearFavourites)}
        </button>
      )}
    </details>
  );
}

/** Where a flex is sold, for example "JR 52\", INT 57\"". */
function whereSold(flex: number): string {
  return SIZE_ORDER.flatMap((size) => {
    const lengths = [...new Set(STOCK_STICKS.filter((s) => s.size === size && s.flex === flex).map((s) => s.lengthIn))].sort((a, b) => a - b);
    return lengths.length > 0 ? [`${copy.sizeShort[size]} ${lengths.map((l) => `${l}"`).join("/")}`] : [];
  }).join(", ");
}

/** "A, B and C" */
function listJoin(items: string[], and: string): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

/** Real models in the recommended size and flex range, to look for in the shop. */
function Candidates({ candidates }: { candidates: Candidate[] }) {
  const { t } = useLang();
  if (candidates.length === 0) return null;
  return (
    <section className="candidates" aria-labelledby="candidates-title">
      <h2 id="candidates-title">{t(copy.result.candidatesTitle)}</h2>
      <p className="muted">{t(copy.result.candidatesBody)}</p>
      <ul className="candidate-list">
        {candidates.map(({ model, flexes, sizes, kickMatch }) => (
          <li key={`${model.brand}-${model.name}`} className="candidate" data-match={kickMatch || undefined}>
            <KickGlyph kick={model.kick} />
            <div className="candidate-text">
              <span className="candidate-brand">
                {model.brand} {model.family}
              </span>
              <strong className="candidate-name">{model.name}</strong>
              <span className="candidate-meta">
                {sizes.map((size) => t(copy.sizes[size])).join(" / ")}, flex {flexes.join(", ")}. {t(copy.kicksPlain[model.kick])}.
              </span>
            </div>
            <span className="tier-pill" data-tier={model.tier}>
              {t(copy.result.tiers[model.tier])}
            </span>
          </li>
        ))}
      </ul>
      <p className="small muted">{t(copy.result.candidatesNote)}</p>
    </section>
  );
}
