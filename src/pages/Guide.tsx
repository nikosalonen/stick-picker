import { copy } from "../copy";
import { useLang } from "../i18n";
import { pathTo } from "../router";
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

export function Guide() {
  const { t, lang } = useLang();
  return (
    <main className="guide">
      <header className="guide-head">
        <h1>{t(copy.guide.title)}</h1>
        <p className="lead">
          {t(copy.guide.lead)} <a href={pathTo(lang, "quiz", "age")}>{t(copy.home.start)}</a>
        </p>
      </header>
      <SizeChartSection />
      <LengthSection />
      <FlexSection />
      <CurveSection />
      <HandSection />
      <KickSection />
      <BrandSection />
      <MistakesSection />
    </main>
  );
}
