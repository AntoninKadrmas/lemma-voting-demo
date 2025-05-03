import {
  useEffect,
  useState,
  isValidElement,
  cloneElement,
  ReactElement,
  CSSProperties,
} from "react";
import moment from "moment";

type CountdownStylerProps = {
  endTime: string;
  children: ReactElement<{ style?: CSSProperties }>;
};

export default function CountdownStyler({
  endTime,
  children,
}: CountdownStylerProps) {
  const [timeLeft, setTimeLeft] = useState(moment(endTime).diff(moment()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(moment(endTime).diff(moment()));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const total = 5 * 60 * 1000;
  const ratio = Math.max(0, Math.min(1, 1 - timeLeft / total));

  // Pulsing effect: Create smooth oscillation from -1 to 1
  const pulseEffect = Math.sin(ratio * Math.PI * 2);
  const intensity = Math.abs(pulseEffect); // Get the absolute value to avoid negative values

  // Gradual transition of color from white -> yellow -> red
  const timeRemainingPercentage = timeLeft / total;

  let red = 0;
  let green = 0;
  let blue = 0;

  // Logic for color transition (White -> Yellow -> Red)
  if (timeRemainingPercentage > 0.8) {
    // From white to yellow
    red = 255;
    green = Math.floor(255 * (1 - timeRemainingPercentage * 0.5)); // gradual green decrease to yellow
    blue = 0;
  } else if (timeRemainingPercentage > 0.4) {
    // From yellow to orange
    red = Math.floor(255 * (1 - timeRemainingPercentage * 0.5));
    green = Math.floor(255 * (timeRemainingPercentage * 0.5));
    blue = 0;
  } else {
    // From orange to red
    red = 255;
    green = Math.floor(255 * timeRemainingPercentage);
    blue = 0;
  }

  // Adjust the pulse interval speed as time gets closer to 0
  const pulseSpeedRatio = timeLeft <= 60000 ? 1 : ratio;
  const transitionSpeed = pulseSpeedRatio < 0.8 ? "2s" : "0.5s"; // Faster pulsing in the last minute

  // Make sure children are a valid React element
  if (!isValidElement(children)) {
    console.warn("CountdownStyler expects a valid React element.");
    return null;
  }

  // Apply dynamic styles
  const newStyle: CSSProperties = {
    ...((children as ReactElement<{ style?: CSSProperties }>).props.style ||
      {}),
    backgroundColor: `rgb(${red}, ${green}, ${blue})`,
    transition: `background-color ${transitionSpeed} ease-in-out`,
    opacity: 1 - intensity * 0.5, // Fade the element based on pulsing intensity
  };

  return cloneElement(children as ReactElement<{ style?: CSSProperties }>, {
    style: newStyle,
  });
}
