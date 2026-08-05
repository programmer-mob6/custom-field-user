import type { QuotaCategory, QuotaCategoryConfig } from "../types/tag.types";
import { CounterCard } from "./CounterCard";

type LicenseCard = QuotaCategoryConfig & { active: number; total: number };

type Props = {
  cards: LicenseCard[];
  activeCategories: Set<QuotaCategory>;
  onToggle: (id: QuotaCategory) => void;
};

export function LicenseCounterCards({ cards, activeCategories, onToggle }: Props) {
  return (
    <div className="counter-cards">
      {cards.map((card) => (
        <CounterCard
          key={card.id}
          label={card.label}
          selected={activeCategories.has(card.id)}
          onClick={() => onToggle(card.id)}
        >
          <div className="counter-value">
            {card.active} / {card.total}
          </div>
        </CounterCard>
      ))}
    </div>
  );
}
