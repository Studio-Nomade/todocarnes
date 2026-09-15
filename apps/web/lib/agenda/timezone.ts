function timezoneParts(value: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const valueByType = new Map(parts.map((part) => [part.type, part.value]));
  const relevantTypes = ["year", "month", "day", "hour", "minute", "second"] as const;
  return relevantTypes.map((type) => Number(valueByType.get(type)));
}

export function zonedDateTimeToUtc(day: string, time: string, timezone: string) {
  const [year, month, date] = day.split("-").map(Number);
  const [hour, minute, second = 0] = time.split(":").map(Number);
  const desired = Date.UTC(year, month - 1, date, hour, minute, second);
  let guess = desired;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const [shownYear, shownMonth, shownDay, shownHour, shownMinute, shownSecond] = timezoneParts(new Date(guess), timezone);
    const shown = Date.UTC(shownYear, shownMonth - 1, shownDay, shownHour, shownMinute, shownSecond);
    guess += desired - shown;
  }

  return new Date(guess);
}
