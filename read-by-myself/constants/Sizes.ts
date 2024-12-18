import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const CARD_WIDTH = width * 0.75;
export const CARD_HEIGHT = CARD_WIDTH * 1.618;

export const BORDER_RADIUS = 25;

export const CARDS = new Array(1).fill(null).map((_, i) => {
  return { id: i + 1, text: "молоко" };
});
