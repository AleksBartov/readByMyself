import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  Canvas,
  interpolateColors,
  LinearGradient,
  Rect,
  vec,
} from "@shopify/react-native-skia";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Voice from "@react-native-voice/voice";

import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Card from "@/components/card/Card";
import { CARDS } from "@/constants/data/DATA";
import { Colors } from "@/constants/Colors";

const startColors = [
  "rgba(34, 193, 195, 0.4)",
  "rgba(34,193,195,0.4)",
  "rgba(63,94,251,1)",
  "rgba(253,29,29,0.4)",
];
const endColors = [
  "rgba(0,212,255,0.4)",
  "rgba(253,187,45,0.4)",
  "rgba(252,70,107,1)",
  "rgba(252,176,69,0.4)",
];

const index = () => {
  const { width, height } = useWindowDimensions();

  let [started, setStarted] = useState(false);
  let [results, setResults] = useState([""]);

  // cards variables and data
  const [newData, setNewData] = useState([...CARDS]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animatedValue = useSharedValue(0);
  const [startRec, setStartRec] = useState(false);
  const rotateBack = useSharedValue(newData.length);

  const MAX = 5;

  // colors background logic
  const colorsIndex = useSharedValue(0);

  useEffect(() => {
    colorsIndex.value = withRepeat(
      withTiming(startColors.length - 1, {
        duration: 7000,
      }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    // if (index === currentIndex) startSpeechToText();
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startSpeechToText = async () => {
    await Voice.start("ru");
    console.log("test started");
    setStarted(true);
  };

  const stopSpeechToText = async () => {
    await Voice.stop();
    console.log("test stopted");
    setStarted(false);
  };

  const onSpeechResults = (result) => {
    let word = newData[animatedValue.value].text.toLowerCase();
    if (result.value[0].split(" ").length === 1) {
      if (result.value[0].split(" ")[0].toLowerCase() === word) {
        setStartRec(false); // for button icon change
        stopSpeechToText();
        rotateBack.value = animatedValue.value;
      }
    } else {
      if (result.value[0].split(" ").indexOf(word) !== -1) {
        setStartRec(false);
        stopSpeechToText();
      }
    }
    setResults(result.value);
    console.log([...result.value]);
  };

  const onSpeechError = (error) => {
    console.log(error);
  };

  const gradientColors = useDerivedValue(() => {
    return [
      interpolateColors(colorsIndex.value, [0, 1, 2, 3], startColors),
      interpolateColors(colorsIndex.value, [0, 1, 2, 3], endColors),
    ];
  });

  return (
    <>
      <Canvas style={{ flex: 1 }}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, height)}
            colors={gradientColors}
          />
        </Rect>
      </Canvas>
      <View
        style={{
          ...StyleSheet.absoluteFill,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {newData.map((item, index) => {
          if (index > currentIndex + MAX || index < currentIndex) {
            return null;
          }
          return (
            <Card
              key={index}
              maxVisibleItems={MAX}
              dataLength={newData.length}
              item={item}
              index={index}
              newData={newData}
              setNewData={setNewData}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              animatedValue={animatedValue}
              rotateBack={rotateBack}
            />
          );
        })}
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 30,
          width: width,
          height: 60,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: Colors.orange,
            width: 70,
            height: 70,
            borderRadius: 35,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            if (!startRec) {
              startSpeechToText();
              setStartRec(!startRec);
            } else {
              stopSpeechToText();
              setStartRec(!startRec);
            }
          }}
        >
          {startRec ? (
            <MaterialIcons name="pause" size={44} color={Colors.white} />
          ) : (
            <MaterialIcons
              name="keyboard-voice"
              size={44}
              color={Colors.white}
            />
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

export default index;

const styles = StyleSheet.create({});
