import { ConfettiBurst } from "./confetti";
import { Goat, type GoatMood } from "./goat";

// The goat reacting to the end of a round: a party with confetti, or a shocked face.
export function Celebration({ mood }: { mood: Extract<GoatMood, "party" | "shock"> }) {
  return (
    <div className="flex justify-center pt-4">
      <Goat mood={mood} size={104} className={`pop-in text-accent ${mood === "shock" ? "wiggle" : ""}`} />
      {mood === "party" && <ConfettiBurst />}
    </div>
  );
}

// The explosion: two shock rings behind the shocked goat.
export function Explosion() {
  return (
    <div className="relative mx-auto mt-4 grid h-36 w-36 place-items-center">
      <span aria-hidden className="shock-ring absolute inset-0 rounded-full border-[6px] border-danger opacity-0" />
      <span aria-hidden className="shock-ring absolute inset-0 rounded-full border-4 border-game opacity-0 [animation-delay:160ms]" />
      <Goat mood="shock" size={120} className="wiggle text-accent" />
    </div>
  );
}
