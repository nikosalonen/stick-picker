import type { ReactNode } from "react";
import { copy } from "../copy";
import { BRANDS, KICK_ORDER } from "../data/brands";
import { CURVES } from "../data/curves";
import { useLang } from "../i18n";
import { SIZES, type CurveId, type Recommendation, type SizeCategory } from "../logic/recommend";
import { CurveDrawing, FlexDemo, KickDiagram, LengthFigure } from "./Illustrations";
import { Scale } from "./Scale";

function Section({ id, title, aside, children }: { id: string; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="explain" id={id} aria-labelledby={`${id}-title`}>
      <div className="explain-text">
        <h2 id={`${id}-title`}>{title}</h2>
        {children}
      </div>
      {aside && <div className="explain-aside">{aside}</div>}
    </section>
  );
}

export function LengthSection({ rec }: { rec?: Recommendation }) {
  const { t } = useLang();
  const ratio = rec ? (rec.lengthCm - rec.lengthRangeCm[0]) / Math.max(1, rec.lengthRangeCm[1] - rec.lengthRangeCm[0]) : 0.3;
  return (
    <Section
      id="length"
      title={t(copy.explain.lengthTitle)}
      aside={<LengthFigure ratio={ratio} chin={t(copy.explain.chin)} nose={t(copy.explain.nose)} />}
    >
      <p>{t(copy.explain.lengthBody)}</p>
      <p>{t(copy.explain.lengthMore)}</p>
      {rec && (
        <Scale
          min={rec.lengthRangeCm[0] - 6}
          max={rec.lengthRangeCm[1] + 6}
          value={rec.lengthCm}
          range={rec.lengthRangeCm}
          leftLabel={t(copy.explain.shorterControl)}
          rightLabel={t(copy.explain.longerReach)}
          valueLabel={`${rec.lengthCm} cm`}
          ariaLabel={`${rec.lengthCm} cm, ${rec.lengthRangeCm[0]}–${rec.lengthRangeCm[1]} cm`}
        />
      )}
    </Section>
  );
}

const SIZE_ORDER: SizeCategory[] = ["youth", "junior", "intermediate", "senior"];

export function FlexSection({ rec }: { rec?: Recommendation }) {
  const { t } = useLang();
  const zones = SIZE_ORDER.map((size) => {
    const flexes = SIZES[size].flexes;
    return { from: flexes[0] - 2, to: flexes[flexes.length - 1] + 2, label: copy.sizeShort[size] };
  });
  const demoFlexes = rec ? [rec.flex, rec.flex >= 85 ? 40 : 100] : [40, 85];
  return (
    <Section
      id="flex"
      title={t(copy.explain.flexTitle)}
      aside={
        <>
          <h3 className="aside-title">{t(copy.explain.tryFlex)}</h3>
          <FlexDemo flexes={demoFlexes} label={t(copy.explain.pushLabel)} result={(cm, flex) => t(copy.explain.pushResult(cm, flex))} />
        </>
      }
    >
      <p>{t(copy.explain.flexBody)}</p>
      <p>{t(copy.explain.flexRule)}</p>
      <p>{t(copy.explain.flexCut)}</p>
      {rec && (
        <>
          <Scale
            min={5}
            max={108}
            value={rec.flex}
            range={rec.flexRange}
            zones={zones}
            leftLabel={t(copy.explain.softer)}
            rightLabel={t(copy.explain.stiffer)}
            valueLabel={`Flex ${rec.flex}`}
            ariaLabel={`Flex ${rec.flex}`}
          />
          {rec.cutCm > 0 && <p className="callout">{t(copy.explain.flexAfter(rec.flex, rec.flexAfterCut))}</p>}
        </>
      )}
    </Section>
  );
}

export function KickSection({ rec }: { rec?: Recommendation }) {
  const { t } = useLang();
  return (
    <Section id="kick" title={t(copy.explain.kickTitle)}>
      <p>{t(copy.explain.kickBody)}</p>
      <div className="kick-options">
        {KICK_ORDER.map((kick) => (
          <div key={kick} className="kick-option" data-match={rec?.kick === kick || undefined}>
            <KickDiagram kick={kick} />
            <div>
              <h3>{t(copy.kicksPlain[kick])}</h3>
              <p className="kick-name">{t(copy.kicks[kick])}</p>
              <p>{t(copy.kicksBody[kick])}</p>
              {rec?.kick === kick && <p className="match-badge">{t(copy.explain.recommended)}</p>}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function CurveSection({ rec }: { rec?: Recommendation }) {
  const { t } = useLang();
  const ids: CurveId[] = rec ? [rec.curve, ...rec.curveAlternatives] : ["P92", "P88", "P28", "P14"];
  return (
    <Section id="curve" title={t(copy.explain.curveTitle)}>
      <p>{t(copy.explain.curveBody)}</p>
      <p className="note">{t(copy.explain.curveTip)}</p>
      <div className="curves">
        {ids.map((id, index) => {
          const curve = CURVES[id];
          const isPick = rec && index === 0;
          return (
            <article key={id} className="curve-card" data-match={isPick || undefined}>
              <header>
                <h3>{id}</h3>
                {isPick && <span className="match-badge">{t(copy.explain.recommended)}</span>}
              </header>
              <CurveDrawing curve={curve} heel={t(copy.explain.heel)} toe={t(copy.explain.toe)} />
              <p>{t(curve.summary)}</p>
              <dl className="facts">
                <div>
                  <dt>{t(copy.explain.location)}</dt>
                  <dd>{t(curve.location)}</dd>
                </div>
                <div>
                  <dt>{t(copy.explain.face)}</dt>
                  <dd>{t(curve.face)}</dd>
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
        <summary>{t(copy.explain.lie)}?</summary>
        <p>{t(copy.explain.lieBody)}</p>
      </details>
    </Section>
  );
}

export function HandSection() {
  const { t } = useLang();
  return (
    <Section id="hand" title={t(copy.explain.handTitle)}>
      <p>{t(copy.explain.handBody)}</p>
      <aside className="tip">
        <h3>{t(copy.quiz.broomTitle)}</h3>
        <p>{t(copy.quiz.broomBody)}</p>
      </aside>
      <h3>{t(copy.explain.gripTitle)}</h3>
      <p>{t(copy.explain.gripBody)}</p>
    </Section>
  );
}

export function BrandSection({ rec }: { rec?: Recommendation }) {
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
                  {t(copy.kicksPlain[kick])}
                  <span className="th-sub">{t(copy.kicks[kick])}</span>
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
                          <span className="models">{family.models.join(", ")}</span>
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

export function SizeChartSection() {
  const { t } = useLang();
  return (
    <Section id="sizes" title={t(copy.explain.sizesTitle)}>
      <p>{t(copy.explain.sizesBody)}</p>
      <div className="brand-table-wrap" tabIndex={0} role="region" aria-labelledby="sizes-title">
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
      </div>
    </Section>
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
