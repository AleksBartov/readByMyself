import { StyleSheet, Text, useWindowDimensions } from "react-native";
import React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BORDER_RADIUS, CARD_HEIGHT, CARD_WIDTH } from "@/constants/data/DATA";
import { Colors } from "@/constants/Colors";

const Card = ({
  maxVisibleItems,
  dataLength,
  item,
  index,
  newData,
  setNewData,
  currentIndex,
  setCurrentIndex,
  animatedValue,
  rotateBack,
}) => {
  const { width } = useWindowDimensions();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const direction = useSharedValue(0);
  const rotateY = useSharedValue(0);

  useAnimatedReaction(
    () => rotateBack.value,
    (v) => {
      if (v === index) {
        rotateY.value = withSpring(180);
      }
    }
  );

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const isSwipeRight = e.translationX > 0;
      direction.value = isSwipeRight ? 1 : -1;

      if (currentIndex === index) {
        translateX.value = e.translationX;
        animatedValue.value = interpolate(
          Math.abs(e.translationX),
          [0, width],
          [index, index + 1]
        );
      }
    })
    .onEnd((e) => {
      if (currentIndex === index) {
        if (Math.abs(e.translationX) > 150 || Math.abs(e.velocityX) > 1000) {
          translateX.value = withTiming(width * direction.value, {}, () => {
            runOnJS(setNewData)([...newData, newData[currentIndex]]);
            runOnJS(setCurrentIndex)(currentIndex + 1);
          });
          animatedValue.value = withTiming(currentIndex + 1);
        } else {
          translateX.value = withSpring(0);
          animatedValue.value = withTiming(currentIndex);
        }
      }
    });

  const rStyle = useAnimatedStyle(() => {
    const currentItem = index === currentIndex;
    translateY.value = interpolate(
      animatedValue.value,
      [index - 1, index],
      [-40, 0]
    );
    const scale = interpolate(
      animatedValue.value,
      [index - 1, index],
      [0.9, 1]
    );
    const rotateZ = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [0, 20]
    );
    const opacity = interpolate(
      animatedValue.value + maxVisibleItems,
      [index, index + 1],
      [0, 1]
    );
    return {
      transform: [
        { perspective: 1000 },
        { translateX: translateX.value },
        { translateY: currentItem ? 0 : translateY.value },
        { scale: currentItem ? 1 : scale },
        { rotateZ: currentItem ? `${direction.value * rotateZ}deg` : "0deg" },
        { rotateY: `${rotateY.value}deg` },
      ],
      opacity: index < currentIndex + maxVisibleItems ? 1 : opacity,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const currentItem = index === currentIndex;
    translateY.value = interpolate(
      animatedValue.value,
      [index - 1, index],
      [-40, 0]
    );
    const scale = interpolate(
      animatedValue.value,
      [index - 1, index],
      [0.9, 1]
    );
    const rotateZ = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [0, 20]
    );
    const opacity = interpolate(
      animatedValue.value + maxVisibleItems,
      [index, index + 1],
      [0, 1]
    );
    return {
      transform: [
        { perspective: 1000 },
        { translateX: translateX.value },
        { translateY: currentItem ? 0 : translateY.value },
        { scale: currentItem ? 1 : scale },
        { rotateZ: currentItem ? `${direction.value * rotateZ}deg` : "0deg" },
        { rotateY: `${rotateY.value + 180}deg` },
      ],
      opacity: index < currentIndex + maxVisibleItems ? 1 : opacity,
    };
  });
  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        entering={FadeInDown.duration(
          index > maxVisibleItems + 1 ? 0 : index * 600
        )}
        style={{
          position: "absolute",
          justifyContent: "center",
          alignItems: "center",
          zIndex: dataLength - index,
        }}
      >
        <Animated.View
          style={[styles.container, { backgroundColor: item.bg }, rStyle]}
        >
          <Text
            style={{
              fontFamily: "Nunito_800ExtraBold",
              fontSize: 30,
              color: Colors.blue,
            }}
          >
            {item.text}
          </Text>
        </Animated.View>
        <Animated.View
          style={[styles.container, { backgroundColor: item.bg }, backStyle]}
        >
          <Text
            style={{
              fontFamily: "Nunito_800ExtraBold",
              fontSize: 30,
              color: Colors.blue,
            }}
          >
            back
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

export default Card;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS,
    backfaceVisibility: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.6,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
