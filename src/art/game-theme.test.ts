import { describe, expect, it } from "vitest";
import { hexToChannels } from "./game-theme";

describe("hexToChannels", () => {
  it("turns hex colours into the channel list Tailwind reads", () => {
    expect(hexToChannels("#ff6a3d")).toBe("255 106 61");
    expect(hexToChannels("#fff")).toBe("255 255 255");
  });

  it("falls back to the default accent for broken values", () => {
    expect(hexToChannels("not a colour")).toBe("215 255 62");
  });
});
