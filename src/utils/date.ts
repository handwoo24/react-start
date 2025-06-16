import dayjs from "dayjs";

export const getDaysByWeeks = () => {
  const day = dayjs();
  const firstDayIndex = day.startOf("month").get("day");
  const daysInMonth = day.daysInMonth();

  const days = Array.from({ length: firstDayIndex }, () => 0).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return Array.from({ length: Math.ceil(days.length / 7) }, (_, w) =>
    days.slice(w * 7, w * 7 + 7)
  );
};
