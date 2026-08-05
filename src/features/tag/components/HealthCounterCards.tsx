import { Check, X } from "lucide-react";
import type { QuotaCategory, QuotaCategoryConfig } from "../types/tag.types";
import { CounterCard } from "./CounterCard";

type HealthCard = QuotaCategoryConfig & { normal: number; damagedMissing: number };

type Props = {
  cards: HealthCard[];
  activeCategories: Set<QuotaCategory>;
  onToggle: (id: QuotaCategory) => void;
};

export function HealthCounterCards({ cards, activeCategories, onToggle }: Props) {
  return (
    <div className="counter-cards">
      {cards.map((card) => (
        <CounterCard
          key={card.id}
          label={card.label}
          selected={activeCategories.has(card.id)}
          onClick={() => onToggle(card.id)}
        >
          <div className="counter-breakdown">
            <span className="breakdown-normal">
              <Check size={14} /> {card.normal}
            </span>
            <span className="breakdown-damaged">
              <X size={14} /> {card.damagedMissing}
            </span>
          </div>
        </CounterCard>
      ))}
    </div>
  );
}
