import { copy } from "../copy";
import { useLang } from "../i18n";
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
  const { t } = useLang();
  return (
    <main className="guide">
      <header className="guide-head">
        <h1>{t(copy.guide.title)}</h1>
        <p className="lead">
          {t(copy.guide.lead)} <a href="#/quiz/age">{t(copy.home.start)}</a>
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
