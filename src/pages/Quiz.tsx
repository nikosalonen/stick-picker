import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { copy } from "../copy";
import { useLang, type Text } from "../i18n";
import {
  toInches,
  toLbs,
  typicalHeightCm,
  typicalWeightKg,
  type AgeGroup,
  type Answers,
  type Hand,
  type Level,
  type Position,
  type ShotStyle,
} from "../logic/recommend";
import { answersToQuery, go, QUIZ_STEPS, type QuizStep } from "../router";

export type Draft = Partial<Answers>;

const STORAGE_KEY = "stick-picker-draft";

export function loadDraft(): Draft {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Draft;
  } catch {
    return {};
  }
}

function saveDraft(draft: Draft) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // The quiz still works without storage; only reload loses the answers.
  }
}

/** Fills skipped answers with all-round defaults. */
function complete(draft: Draft): Answers {
  const age = draft.age ?? "adult";
  const young = age === "under7" || age === "7to9";
  const heightCm = draft.heightCm ?? typicalHeightCm(age);
  return {
    age,
    heightCm,
    weightKg: draft.weightKg ?? typicalWeightKg(heightCm),
    hand: draft.hand ?? "unsure",
    level: draft.level ?? (young ? "new" : "team"),
    position: draft.position ?? "unsure",
    shot: draft.shot ?? "unsure",
  };
}

const QUESTION_STEPS: QuizStep[] = QUIZ_STEPS.filter((s) => s !== "checkpoint");

export function Quiz({ step }: { step: QuizStep }) {
  const { t } = useLang();
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => saveDraft(draft), [draft]);
  // Move focus to the new question so screen reader and keyboard users follow along.
  useEffect(() => headingRef.current?.focus(), [step]);

  const update = (patch: Draft) => setDraft((d) => ({ ...d, ...patch }));
  const showResult = () => go(`/result?${answersToQuery(complete(draft))}`);
  const goStep = (s: QuizStep) => go(`/quiz/${s}`);
  const next = () => {
    const index = QUIZ_STEPS.indexOf(step);
    const following = QUIZ_STEPS[index + 1];
    if (following) goStep(following);
    else showResult();
  };
  const back = () => {
    const index = QUIZ_STEPS.indexOf(step);
    if (index === 0) go("/");
    else goStep(QUIZ_STEPS[index - 1]);
  };
  // Choosing an option moves on after a short pause, so the choice is visible first.
  const chooseAndNext = (patch: Draft, viaKeyboard: boolean) => {
    update(patch);
    if (!viaKeyboard) window.setTimeout(next, 220);
  };

  const questionNumber = QUESTION_STEPS.indexOf(step) + 1;
  const isOptional = step === "level" || step === "position" || step === "shot";
  const total = isOptional ? 6 : 3;

  let body: ReactNode;
  let title: Text;
  let hint: Text | null = null;
  let footer: ReactNode = null;

  switch (step) {
    case "age": {
      title = copy.quiz.ageTitle;
      hint = copy.quiz.ageHint;
      const ages = Object.keys(copy.quiz.ages) as AgeGroup[];
      body = (
        <Choices
          name="age"
          value={draft.age}
          options={ages.map((age) => ({ value: age, label: t(copy.quiz.ages[age]) }))}
          onChoose={(age, viaKeyboard) => {
            // Reset body numbers to typical values for the new age, unless already set.
            const heightCm = draft.age === age && draft.heightCm ? draft.heightCm : typicalHeightCm(age);
            chooseAndNext({ age, heightCm, weightKg: draft.age === age && draft.weightKg ? draft.weightKg : typicalWeightKg(heightCm) }, viaKeyboard);
          }}
          compact
        />
      );
      break;
    }
    case "body": {
      title = copy.quiz.bodyTitle;
      hint = copy.quiz.bodyHint;
      const age = draft.age ?? "adult";
      const heightCm = draft.heightCm ?? typicalHeightCm(age);
      const weightKg = draft.weightKg ?? typicalWeightKg(heightCm);
      const feet = Math.floor(toInches(heightCm) / 12);
      body = (
        <div className="sliders">
          <NumberSlider
            label={t(copy.quiz.height)}
            unit="cm"
            secondary={`${feet}'${toInches(heightCm) - feet * 12}"`}
            min={90}
            max={205}
            value={heightCm}
            onChange={(v) => update({ heightCm: v, weightKg })}
          />
          <NumberSlider
            label={t(copy.quiz.weight)}
            unit="kg"
            secondary={`${toLbs(weightKg)} lbs`}
            min={12}
            max={130}
            value={weightKg}
            onChange={(v) => update({ weightKg: v, heightCm })}
          />
        </div>
      );
      footer = (
        <button className="button button-primary" onClick={() => { update({ heightCm, weightKg }); next(); }}>
          {t(copy.quiz.next)}
        </button>
      );
      break;
    }
    case "hand": {
      title = copy.quiz.handTitle;
      hint = copy.quiz.handHint;
      const hands: Hand[] = ["left", "right", "unsure"];
      body = (
        <>
          <Choices
            name="hand"
            value={draft.hand}
            options={hands.map((hand) => ({
              value: hand,
              label: t(copy.quiz.hands[hand]),
              detail: t(copy.quiz.handsDetail[hand]),
              icon: hand === "unsure" ? undefined : <HandIcon hand={hand} />,
            }))}
            onChoose={(hand, viaKeyboard) => (hand === "unsure" ? update({ hand }) : chooseAndNext({ hand }, viaKeyboard))}
          />
          {draft.hand === "unsure" && (
            <aside className="tip">
              <h3>{t(copy.quiz.broomTitle)}</h3>
              <p>{t(copy.quiz.broomBody)}</p>
              <p className="muted">{t(copy.quiz.broomTip)}</p>
            </aside>
          )}
        </>
      );
      break;
    }
    case "checkpoint": {
      title = copy.quiz.checkpointTitle;
      body = (
        <>
          <p className="lead">{t(copy.quiz.checkpointBody)}</p>
          <div className="button-row">
            <button className="button button-primary button-big" onClick={showResult}>
              {t(copy.quiz.showResult)}
            </button>
            <button className="button button-big" onClick={next}>
              {t(copy.quiz.fineTune)}
            </button>
          </div>
        </>
      );
      footer = <span />;
      break;
    }
    case "level": {
      title = copy.quiz.levelTitle;
      const levels: Level[] = ["new", "team", "competitive"];
      body = (
        <Choices
          name="level"
          value={draft.level}
          options={levels.map((level) => ({
            value: level,
            label: t(copy.quiz.levels[level]),
            detail: t(copy.quiz.levelsDetail[level]),
          }))}
          onChoose={(level, viaKeyboard) => chooseAndNext({ level }, viaKeyboard)}
        />
      );
      break;
    }
    case "position": {
      title = copy.quiz.positionTitle;
      const positions: Position[] = ["forward", "defense", "unsure"];
      body = (
        <Choices
          name="position"
          value={draft.position}
          options={positions.map((position) => ({
            value: position,
            label: t(copy.quiz.positions[position]),
            detail: t(copy.quiz.positionsDetail[position]),
          }))}
          onChoose={(position, viaKeyboard) => chooseAndNext({ position }, viaKeyboard)}
        />
      );
      break;
    }
    case "shot": {
      title = copy.quiz.shotTitle;
      const shots: ShotStyle[] = ["quick", "power", "unsure"];
      body = (
        <Choices
          name="shot"
          value={draft.shot}
          options={shots.map((shot) => ({
            value: shot,
            label: t(copy.quiz.shots[shot]),
            detail: t(copy.quiz.shotsDetail[shot]),
          }))}
          onChoose={(shot, viaKeyboard) => {
            update({ shot });
            if (!viaKeyboard) window.setTimeout(() => go(`/result?${answersToQuery(complete({ ...draft, shot }))}`), 220);
          }}
        />
      );
      break;
    }
  }

  // Choice steps move on by themselves after a tap; the button is there for keyboard
  // users and for anyone who comes back to change an answer.
  const chosen = { age: draft.age, hand: draft.hand, level: draft.level, position: draft.position, shot: draft.shot } as Record<string, unknown>;
  if (!footer && chosen[step] !== undefined) {
    footer = (
      <button className="button button-primary" onClick={next}>
        {t(step === "shot" ? copy.quiz.showResult : copy.quiz.next)}
      </button>
    );
  }

  return (
    <main className="quiz">
      {step !== "checkpoint" && (
        <div className="progress" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} data-done={i < questionNumber || undefined} />
          ))}
        </div>
      )}
      {step !== "checkpoint" && <p className="quiz-count">{t(copy.quiz.stepOf(questionNumber, total))}</p>}
      <h1 ref={headingRef} tabIndex={-1} className="quiz-title">
        {t(title)}
      </h1>
      {hint && <p className="quiz-hint">{t(hint)}</p>}
      <div className="quiz-body">{body}</div>
      <div className="quiz-footer">
        <button className="button button-quiet" onClick={back}>
          {t(copy.quiz.back)}
        </button>
        {footer}
      </div>
    </main>
  );
}

type Option<T extends string> = { value: T; label: string; detail?: string; icon?: ReactNode };

function Choices<T extends string>({
  name,
  value,
  options,
  onChoose,
  compact = false,
}: {
  name: string;
  value: T | undefined;
  options: Option<T>[];
  onChoose: (value: T, viaKeyboard: boolean) => void;
  compact?: boolean;
}) {
  // Arrow keys move through radio buttons; that must not jump to the next question.
  const viaKeyboard = useRef(false);
  return (
    <div
      className={compact ? "choices choices-compact" : "choices"}
      role="radiogroup"
      onKeyDown={() => (viaKeyboard.current = true)}
      onPointerDown={() => (viaKeyboard.current = false)}
    >
      {options.map((option) => (
        <label key={option.value} className="choice" data-selected={value === option.value || undefined}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChoose(option.value, viaKeyboard.current)}
            // Clicking the already-selected option should still move on.
            onClick={() => value === option.value && !viaKeyboard.current && onChoose(option.value, false)}
          />
          {option.icon}
          <span className="choice-text">
            <span className="choice-label">{option.label}</span>
            {option.detail && <span className="choice-detail">{option.detail}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

function NumberSlider({
  label,
  unit,
  secondary,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  secondary: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="number-slider">
      <div className="number-slider-head">
        <span className="number-slider-label">{label}</span>
        <span className="number-slider-value">
          <button type="button" className="stepper" aria-label={`${label} −1`} onClick={() => onChange(clamp(value - 1))}>
            −
          </button>
          <output>
            {value}
            <small> {unit}</small>
          </output>
          <button type="button" className="stepper" aria-label={`${label} +1`} onClick={() => onChange(clamp(value + 1))}>
            +
          </button>
        </span>
        <span className="number-slider-secondary">{secondary}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        aria-valuetext={`${value} ${unit}`}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
      />
    </div>
  );
}

/** Two hands on a stick, showing which hand is lower. */
function HandIcon({ hand }: { hand: "left" | "right" }) {
  const flip = hand === "right";
  return (
    <svg className="hand-icon" viewBox="0 0 64 64" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M46 4 L22 52 L6 56" className="hand-icon-stick" />
      <circle cx="42" cy="13" r="6" className="hand-icon-top" />
      <circle cx="31" cy="34" r="7" className="hand-icon-low" />
    </svg>
  );
}
