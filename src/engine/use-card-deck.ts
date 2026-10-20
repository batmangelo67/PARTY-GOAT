import { useEffect, useRef, useState } from "react";
import type { PackOf } from "../content/schema";
import { useT } from "../i18n/use-t";
import { deckBack, deckForward, needsNewCard, type Deck } from "./deck";
import { drawItem } from "./draw-item";
import { errorMessage, logError } from "./logger";

export interface PromptCard {
  id: string;
  text: string;
}

// A back/forward stack of prompt cards drawn without repeats; draws the first card once `enabled`.
export function useCardDeck(packs: PackOf<"prompts">[], enabled: boolean) {
  const t = useT();
  const [deck, setDeck] = useState<Deck<PromptCard>>({ cards: [], index: 0 });
  const [drawing, setDrawing] = useState(false);
  const [failure, setFailure] = useState("");
  const started = useRef(false);

  const forward = async () => {
    if (deck.cards.length > 0 && !needsNewCard(deck)) return setDeck(deckForward(deck));
    setDrawing(true);
    try {
      const { item } = await drawItem(packs);
      setDeck((current) => deckForward(current, { id: item.id, text: item.text }));
      setFailure("");
    } catch (error) {
      logError("Drawing a card", error);
      setFailure(t("error.drawFailed", { reason: errorMessage(error) }));
    } finally {
      setDrawing(false);
    }
  };

  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;
    void forward();
  });

  return {
    cards: deck.cards,
    card: deck.cards[deck.index],
    index: deck.index,
    drawing,
    failure,
    forward,
    back: () => setDeck(deckBack(deck)),
  };
}
