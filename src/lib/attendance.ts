export function localDateKey(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { day: "2-digit", month: "2-digit", timeZone, year: "numeric" }).formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function localMinutes(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", minute: "2-digit", timeZone }).formatToParts(value);
  const get = (type: "hour" | "minute") => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}

export function parseClockMinutes(clock: string) {
  const [hour, minute] = clock.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) throw new Error("Invalid shift time.");
  return hour * 60 + minute;
}

export function calculateLateMinutes(now: Date, startTime: string, graceMinutes: number, timeZone: string) {
  return Math.max(0, localMinutes(now, timeZone) - parseClockMinutes(startTime) - graceMinutes);
}

export function calculateWorkedMinutes(checkIn: Date, checkOut: Date) {
  return Math.max(0, Math.floor((checkOut.getTime() - checkIn.getTime()) / 60_000));
}

export function resolveShiftWorkDate(now: Date, timeZone: string, endTime: string, isOvernight: boolean) {
  const localDate = localDateKey(now, timeZone);
  if (!isOvernight || localMinutes(now, timeZone) >= parseClockMinutes(endTime)) return localDate;
  const prior = new Date(`${localDate}T12:00:00Z`);
  prior.setUTCDate(prior.getUTCDate() - 1);
  return prior.toISOString().slice(0, 10);
}

export function isEligibleForAttendance(userActive: boolean, employmentStatus: "active" | "on_leave" | "inactive") {
  return userActive && employmentStatus !== "inactive";
}

export function ownsAttendanceRecord(sessionEmployeeId: string, recordEmployeeId: string) {
  return sessionEmployeeId === recordEmployeeId;
}
