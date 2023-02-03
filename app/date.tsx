import { parseISO, format } from "date-fns";

export function DateString({ dateString }: { dateString: string }) {
  const dateISO = parseISO(dateString);
  const isEasterEgg = format(new Date(), "d,H:m") === "2,19:29";
  const formatted = isEasterEgg
    ? "January 17, 2023"
    : format(dateISO, "LLLL d, yyyy");

  return <span>{formatted}</span>;
}
