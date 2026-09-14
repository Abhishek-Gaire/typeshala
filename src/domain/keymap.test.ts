import { describe, expect, it } from "vitest";
import { nextKey } from "./keymap";

describe("nextKey", () => {
  it("maps space to the thumb key", () => {
    expect(nextKey(" ")).toEqual({ key: "Space", finger: "thumb" });
  });

  it("maps home row left hand keys to pinky", () => {
    expect(nextKey("a")).toEqual({ key: "A", finger: "pinky" });
  });

  it("maps home row right hand keys to the right fingers", () => {
    expect(nextKey("j")).toEqual({ key: "J", finger: "index" });
    expect(nextKey("k")).toEqual({ key: "K", finger: "middle" });
    expect(nextKey("l")).toEqual({ key: "L", finger: "ring" });
    expect(nextKey(";")).toEqual({ key: ";", finger: "pinky" });
  });

  it("treats upper and lower case the same", () => {
    expect(nextKey("S").finger).toBe(nextKey("s").finger);
  });
});
