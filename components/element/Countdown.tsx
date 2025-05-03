"use client";
import {
  type CSSProperties,
  type FC,
  useEffect,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { BlockBaseProps } from "@/types/blocks";
import { ApiCollections } from "@/types/api-collection";
import { AvailableLocales } from "@/lib/constants";

type DateKind = "day" | "hour" | "minute" | "second";

const ONE_SECOND = 1000;
const ONE_HOUR = ONE_SECOND * 60 * 60;
const ONE_DAY = ONE_HOUR * 24;

const DATES_LOCALE_BASES: Record<AvailableLocales, Record<DateKind, string>> = {
  "cz-CZ": { day: "den", hour: "hodin", minute: "minut", second: "sekund" },
  "en-US": { day: "day", hour: "hour", minute: "minute", second: "second" },
};
const DATES_EXCEPTIONS: Partial<
  Record<
    AvailableLocales,
    Partial<Record<DateKind, (amount: number) => string>>
  >
> = {
  "cz-CZ": {
    day: (amount) => {
      if (amount === 1) return "den";
      if (amount <= 4) return "dny";
      return "dní";
    },
  },
};

type CountdownProps = BlockBaseProps & {
  compact?: boolean;
} & ApiCollections["block_countdown"][number];

const getDateSuffix = (
  lang: AvailableLocales,
  amount: number,
  customPluralSuffix?: string | null
) => {
  switch (lang) {
    case "cz-CZ":
      if (amount == 1) return "a";
      if (amount <= 4 && amount > 0) return customPluralSuffix ?? "y";
      return "";
    case "en-US":
      if (amount == 1) return "";
      return customPluralSuffix ?? "s";
  }
};

function localizedText(
  lang: AvailableLocales,
  dateKind: DateKind,
  amount: number,
  customPluralSuffix?: string | null
) {
  const dateExceptionFunction = DATES_EXCEPTIONS[lang]?.[dateKind];
  if (dateExceptionFunction) {
    return dateExceptionFunction(amount);
  }

  const base = DATES_LOCALE_BASES[lang][dateKind];

  return base + getDateSuffix(lang, amount, customPluralSuffix);
}

const Countdown: FC<CountdownProps> = ({
  children,
  title,
  end_date: endDateString,
  hide_date: hideDateString,
  compact = false,
  custom_plural_date_suffix: customPluralSuffix,
  lang,
}) => {
  const [currDate, setCurrDate] = useState(new Date());
  endDateString = endDateString!; // To satisfy TypeScript
  hideDateString = hideDateString ?? endDateString;

  const hideDate = useMemo(() => new Date(hideDateString), [hideDateString]);

  useEffect(() => {
    if (Number(currDate) > Number(hideDate)) return;
    const i = setInterval(() => setCurrDate(new Date()), ONE_SECOND);
    return () => clearInterval(i);
  }, [currDate, hideDate]);

  lang = lang ?? "en-US";

  const endDate = new Date(endDateString);

  const timer = new Date(Number(endDate) - Number(currDate) - ONE_HOUR);

  const daysLeft = Math.floor(Math.abs(Number(timer) / ONE_DAY));

  const displayDataArray = [
    {
      id: "days",
      text: localizedText(lang, "day", daysLeft, customPluralSuffix),
      amount: daysLeft,
    },
    {
      id: "hours",
      text: localizedText(lang, "hour", timer.getHours(), customPluralSuffix),
      amount: timer.getHours(),
    },
    {
      id: "minutes",
      text: localizedText(
        lang,
        "minute",
        timer.getMinutes(),
        customPluralSuffix
      ),
      amount: timer.getMinutes(),
    },
    {
      id: "seconds",
      text: localizedText(
        lang,
        "second",
        timer.getSeconds(),
        customPluralSuffix
      ),
      amount: timer.getSeconds(),
    },
  ];

  if (daysLeft <= 0) {
    displayDataArray.shift();
  }
  return (
    <div className={cn("h-fit text-center w-full")}>
      {currDate < hideDate ? (
        <div
          className={cn("w-full h-fit m-auto flex flex-col items-center", {
            "sm:h-24 md:h-32 md:gap-4 lg:h-40 xl:h-auto": !compact,
          })}
        >
          <h4
            className={cn(
              "text-xl font-bold ",
              { "sm:text-3xl pb-6 ": !compact },
              { "pb-2": compact }
            )}
          >
            {title}
          </h4>

          <div
            className={cn(
              "flex flex-row justify-center gap-4 font-bold w-full",
              { "sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 ": !compact }
            )}
          >
            {displayDataArray.map(({ id, amount, text }) => (
              <div
                className="flex h-full w-full items-center justify-center font-title"
                key={id}
              >
                <div
                  className={cn(
                    "flex flex-col items-center justify-center text-3xl ",
                    { "xl:text-6xl": !compact }
                  )}
                >
                  <span className="countdown">
                    <span style={{ "--value": amount } as CSSProperties}></span>
                  </span>
                  <div
                    className={cn(" text-sm", {
                      "md:text-md xl:text-xl": !compact,
                    })}
                  >
                    {text}
                  </div>
                </div>
              </div>
            ))}
            {children}
          </div>
        </div>
      ) : (
        <>
          {/* TODO: Layout doesn't like to be rendered in client component. This should be fixed in the future. */}
          {/* {hide_layout_element && <Layout {...hide_layout_element} />} */}
        </>
      )}
    </div>
  );
};

export default Countdown;
