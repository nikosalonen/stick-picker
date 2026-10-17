import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg className="row-icon" viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

/** Small line icons for the shopping list rows. */
export const ICONS = {
  size: (
    <Icon>
      <path d="M3.5 12.5 L11 5 H19 V13 L11.5 20.5 Z" />
      <circle cx="15.5" cy="8.5" r="1.4" />
    </Icon>
  ),
  flex: (
    <Icon>
      <path d="M3 9 Q12 19 21 9" />
      <path d="M12 3 V9.5 M9.5 7 L12 9.5 L14.5 7" />
    </Icon>
  ),
  curve: (
    <Icon>
      <path d="M3 17 H11 Q17 17 20.5 10" />
      <circle cx="16" cy="9" r="2.2" />
    </Icon>
  ),
  hand: (
    <Icon>
      <path d="M17 3 L7 19 L3 20" />
      <circle cx="15" cy="6.5" r="2" />
      <circle cx="10" cy="14.5" r="2.4" className="row-icon-accent" />
    </Icon>
  ),
  length: (
    <Icon>
      <path d="M12 3 V21 M8.5 6.5 L12 3 L15.5 6.5 M8.5 17.5 L12 21 L15.5 17.5" />
    </Icon>
  ),
  kick: (
    <Icon>
      <path d="M7 3 Q9 13 13 18 L20 20" />
      <path d="M8.5 9 Q9.7 13.5 11.6 16" className="row-icon-accent-stroke" />
    </Icon>
  ),
  budget: (
    <Icon>
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7 V12 C5 13.7 8.1 15 12 15 S19 13.7 19 12 V7 M5 12 V17 C5 18.7 8.1 20 12 20 S19 18.7 19 17 V12" />
    </Icon>
  ),
};
