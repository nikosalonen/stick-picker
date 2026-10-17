import { useState, type ReactNode } from "react";
import { copy } from "../copy";
import { BRANDS, KICK_ORDER } from "../data/brands";
import { CURVES } from "../data/curves";
import { useLang } from "../i18n";
import { SIZES, toInches, type Answers, type CurveId, type Recommendation, type SizeCategory } from "../logic/recommend";
import { BladeTopDown, FaceIcon } from "./art/BladeTopDown";
import { FlexBench } from "./art/FlexBench";
import { KickGlyph, KickShot } from "./art/KickShot";
import { LengthExamples, LengthFigure } from "./art/LengthFigure";
import { holdingViewBox, HoldingPlayer } from "./art/Player";
import { FlexChart } from "./charts/FlexChart";
import { SizeChart } from "./charts/SizeChart";
import { TableView } from "./charts/chartKit";

function Section({
  id,
  title,
  aside,
  below,
  children,
}: {
  id: string;
  title: string;
  aside?: ReactNode;
  below?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="explain" id={id} aria-labelledby={`${id}-title`}>
      <div className="explain-text">
        <h2 id={`${id}-title`}>{title}</h2>
        {children}
      </div>
      {aside && <div className="explain-aside">{aside}</div>}
      {below && <div className="explain-below">{below}</div>}
    </section>
  );
}

type Props = { rec?: Recommendation; answers?: Answers };

const isChild = (answers?: Answers) => (answers ? answers.heightCm < 150 : false);

export function LengthSection({ rec, answers }: Props) {
  const { t } = useLang();
  const ratio = rec ? (rec.lengthCm - rec.lengthRangeCm[0]) / Math.max(1, rec.lengthRangeCm[1] - rec.lengthRangeCm[0]) : 0.35;
  return (
    <Section
      id="length"
      title={t(copy.explain.lengthTitle)}
      aside={
        <LengthFigure
          ratio={ratio}
          child={isChild(answers)}
          chin={t(copy.explain.chin)}
          nose={t(copy.explain.nose)}
          heightLabel={answers ? `${answers.heightCm} cm` : undefined}
          stickLabel={rec ? `≈ ${rec.lengthCm} cm` : undefined}
        />
      }
    >
      <p>{t(copy.explain.lengthBody)}</p>
      <p>{t(copy.explain.lengthMore)}</p>
      {rec && (
        <p className="callout">
          {t(copy.explain.lengthYours(rec.lengthCm, toInches(rec.lengthCm), rec.stockLengthIn, rec.cutCm))}
        </p>
      )}
      <LengthExamples
        examples={[
          { key: "short", label: t(copy.explain.tooShort), ok: false, topRatio: 0.6 },
          { key: "right", label: t(copy.explain.justRight), ok: true, topRatio: 0.86 },
          { key: "long", label: t(copy.explain.tooLong), ok: false, topRatio: 1.06 },
        ]}
      />
    </Section>
  );
}

export function FlexSection({ rec, answers }: Props) {
  const { t } = useLang();
  const compare = rec ? (rec.flex >= 85 ? 40 : 100) : 85;
  const benches = rec
    ? [
        { flex: rec.flex, accent: true },
        { flex: compare, accent: false },
      ]
    : [
        { flex: 40, accent: true },
        { flex: compare, accent: false },
      ];
  return (
    <Section
      id="flex"
      title={t(copy.explain.flexTitle)}
      aside={
        <>
          <h3 className="aside-title">{t(copy.explain.tryFlex)}</h3>
          <FlexBench
            flexes={benches}
            pushLabel={t(copy.explain.pushLabel)}
            stickLabel={(flex) => (rec && flex === rec.flex ? t(copy.explain.benchYours(flex)) : `Flex ${flex}`)}
          />
          <p className="small muted">{t(copy.explain.benchNote)}</p>
        </>
      }
      below={<FlexChart rec={rec} weightKg={answers?.weightKg} />}
    >
      <p>{t(copy.explain.flexBody)}</p>
      <p>{t(copy.explain.flexRule)}</p>
      <p>{t(copy.explain.flexCut)}</p>
      {rec && rec.cutCm > 0 && <p className="callout">{t(copy.explain.flexAfter(rec.flex, rec.flexAfterCut))}</p>}
    </Section>
  );
}

export function KickSection({ rec }: Props) {
  const { t } = useLang();
  const [shotToken, setShotToken] = useState(0);
  return (
    <Section id="kick" title={t(copy.explain.kickTitle)}>
      <p>{t(copy.explain.kickBody)}</p>
      <div className="kick-play">
        <button className="button" onClick={() => setShotToken((n) => n + 1)}>
          <span className="button-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16">
              <path d="M4 2.5 L13 8 L4 13.5 Z" />
            </svg>
          </span>
          {t(copy.explain.playShots)}
        </button>
        <span className="small muted">{t(copy.explain.playShotsHint)}</span>
      </div>
      <div className="kick-options">
        {KICK_ORDER.map((kick) => (
          <article key={kick} className="kick-option" data-match={rec?.kick === kick || undefined}>
            <KickShot kick={kick} shotToken={shotToken} accent={rec?.kick === kick} />
            <header>
              <h3>{t(copy.kicksPlain[kick])}</h3>
              {rec?.kick === kick && <span className="match-badge">{t(copy.explain.recommended)}</span>}
            </header>
            <p className="kick-name">{t(copy.kicks[kick])}</p>
            <p>{t(copy.kicksBody[kick])}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function CurveSection({ rec }: Props) {
  const { t } = useLang();
  const ids: CurveId[] = rec ? [rec.curve, ...rec.curveAlternatives] : ["P92", "P88", "P28", "P14"];
  return (
    <Section id="curve" title={t(copy.explain.curveTitle)}>
      <p>{t(copy.explain.curveBody)}</p>
      <p className="note">{t(copy.explain.curveTip)}</p>
      <div className="curves">
        {ids.map((id, index) => {
          const curve = CURVES[id];
          const isPick = Boolean(rec && index === 0);
          return (
            <article key={id} className="curve-card" data-match={isPick || undefined}>
              <header>
                <h3>{id}</h3>
                {isPick && <span className="match-badge">{t(copy.explain.recommended)}</span>}
              </header>
              <BladeTopDown curve={curve} heel={t(copy.explain.heel)} toe={t(copy.explain.toe)} accent={isPick} />
              <p>{t(curve.summary)}</p>
              <dl className="facts">
                <div>
                  <dt>{t(copy.explain.location)}</dt>
                  <dd>{t(curve.location)}</dd>
                </div>
                <div>
                  <dt>{t(copy.explain.face)}</dt>
                  <dd className="face-fact">
                    <FaceIcon face={curve.faceKind} />
                    {t(curve.face)}
                  </dd>
                </div>
                <div>
                  <dt>{t(copy.explain.lie)}</dt>
                  <dd>{curve.lie}</dd>
                </div>
              </dl>
              <p className="muted small">
                {t(copy.explain.sameAs)}: {curve.sameAs}
              </p>
              <p className={curve.beginnerFriendly ? "tag tag-good" : "tag"}>
                {t(curve.beginnerFriendly ? copy.explain.beginner : copy.explain.notBeginner)}
              </p>
            </article>
          );
        })}
      </div>
      <details className="more">
        <summary>{t(copy.explain.lieQuestion)}</summary>
        <p>{t(copy.explain.lieBody)}</p>
        <p>{t(copy.explain.faceBody)}</p>
      </details>
    </Section>
  );
}

export function HandSection({ rec }: Props) {
  const { t } = useLang();
  const hands = ["left", "right"] as const;
  return (
    <Section
      id="hand"
      title={t(copy.explain.handTitle)}
      aside={
        <div className="hand-figures">
          {hands.map((hand) => (
            <figure key={hand} className="hand-figure" data-match={rec?.hand === hand || undefined}>
              <svg viewBox={holdingViewBox(hand)} aria-hidden="true">
                <HoldingPlayer hand={hand} />
              </svg>
              <figcaption>
                <strong>{t(copy.quiz.hands[hand])}</strong>
                <span>{t(copy.quiz.handsDetail[hand])}</span>
              </figcaption>
            </figure>
          ))}
          <p className="small muted hand-figures-note">{t(copy.explain.seenFromBehind)}</p>
        </div>
      }
    >
      <p>{t(copy.explain.handBody)}</p>
      <BroomTip />
      <h3>{t(copy.explain.gripTitle)}</h3>
      <p>{t(copy.explain.gripBody)}</p>
    </Section>
  );
}

/** The broom test with a picture of it. */
export function BroomTip({ extra }: { extra?: ReactNode }) {
  const { t } = useLang();
  return (
    <aside className="tip tip-with-art">
      <svg viewBox={holdingViewBox("left")} aria-hidden="true" className="tip-art">
        <HoldingPlayer hand="left" tool="broom" />
      </svg>
      <div>
        <h3>{t(copy.quiz.broomTitle)}</h3>
        <p>{t(copy.quiz.broomBody)}</p>
        {extra}
      </div>
    </aside>
  );
}

export function BrandSection({ rec }: Props) {
  const { t } = useLang();
  return (
    <Section id="brands" title={t(copy.explain.brandsTitle)}>
      <p>{t(copy.explain.brandsBody)}</p>
      <div className="brand-table-wrap" tabIndex={0} role="region" aria-labelledby="brands-title">
        <table className="brand-table">
          <thead>
            <tr>
              <th scope="col">
                <span className="visually-hidden">{t(copy.explain.brandsTitle)}</span>
              </th>
              {KICK_ORDER.map((kick) => (
                <th key={kick} scope="col" data-match={rec?.kick === kick || undefined}>
                  <span className="th-with-glyph">
                    <KickGlyph kick={kick} />
                    <span>
                      {t(copy.kicksPlain[kick])}
                      <span className="th-sub">{t(copy.kicks[kick])}</span>
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BRANDS.map((brand) => (
              <tr key={brand.name}>
                <th scope="row">{brand.name}</th>
                {KICK_ORDER.map((kick) => {
                  const family = brand.families[kick];
                  return (
                    <td key={kick} data-match={rec?.kick === kick || undefined}>
                      {family ? (
                        <>
                          <strong>{family.name}</strong>
                          <span className="models">
                            {family.models.map((model, i) => (
                              <span key={model} className="model">
                                <span className="tier-dots" aria-label={t(copy.explain.tiers[Math.min(2, i)])}>
                                  {[0, 1, 2].map((dot) => (
                                    <span key={dot} data-on={dot < 3 - i || undefined} />
                                  ))}
                                </span>
                                {model}
                              </span>
                            ))}
                          </span>
                        </>
                      ) : (
                        <span className="muted small">{t(copy.explain.noFamily)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted tier-legend">
        <span className="tier-dots" aria-hidden="true">
          <span data-on />
          <span data-on />
          <span data-on />
        </span>
        {t(copy.explain.tiers[0])}
        <span className="tier-dots" aria-hidden="true">
          <span data-on />
          <span data-on />
          <span />
        </span>
        {t(copy.explain.tiers[1])}
        <span className="tier-dots" aria-hidden="true">
          <span data-on />
          <span />
          <span />
        </span>
        {t(copy.explain.tiers[2])}
      </p>
      {BRANDS.filter((b) => b.note).map((b) => (
        <p key={b.name} className="small muted">
          {b.name}: {t(b.note!)}
        </p>
      ))}
      <h3>{t(copy.explain.tiersTitle)}</h3>
      <p>{t(copy.explain.tiersBody)}</p>
      <p className="small muted">{t(copy.explain.brandsUpdated)}</p>
    </Section>
  );
}

const SIZE_ORDER: SizeCategory[] = ["youth", "junior", "intermediate", "senior"];

export function SizeChartSection({ rec, answers }: Props) {
  const { t } = useLang();
  return (
    <Section
      id="sizes"
      title={t(rec ? copy.explain.sizeYoursTitle : copy.explain.sizesTitle)}
      below={<SizeChart heightCm={answers?.heightCm} size={rec?.size} table={<SizeTable />} />}
    >
      <p>{t(copy.explain.sizesBody)}</p>
    </Section>
  );
}

function SizeTable() {
  const { t } = useLang();
  return (
      <TableView summary={t(copy.charts.showTable)}>
        <table className="size-table">
          <thead>
            <tr>
              <th scope="col">{t(copy.explain.colSize)}</th>
              <th scope="col">{t(copy.explain.colAge)}</th>
              <th scope="col">{t(copy.explain.colHeight)}</th>
              <th scope="col">{t(copy.explain.colLength)}</th>
              <th scope="col">{t(copy.explain.colFlex)}</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_ORDER.map((size) => {
              const spec = SIZES[size];
              const lengths = spec.stockLengthsIn;
              return (
                <tr key={size}>
                  <th scope="row">
                    {t(copy.sizes[size])} <span className="muted">({copy.sizeShort[size]})</span>
                  </th>
                  <td>{t(copy.explain.sizeAges[size])}</td>
                  <td>
                    {spec.heightCm[0]}–{spec.heightCm[1]} cm
                  </td>
                  <td>
                    {lengths[0]}–{lengths[lengths.length - 1]}"
                  </td>
                  <td>
                    {spec.flexes[0]}–{spec.flexes[spec.flexes.length - 1]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableView>
  );
}

export function MistakesSection() {
  const { t } = useLang();
  return (
    <Section id="mistakes" title={t(copy.explain.mistakesTitle)}>
      <ul className="mistakes">
        {copy.explain.mistakes.map((m) => (
          <li key={m.en}>{t(m)}</li>
        ))}
      </ul>
    </Section>
  );
}
