import { parseISO, format } from "date-fns";

export function Date({ dateString }: { dateString: string }) {
  const date = parseISO(dateString);
  return <span>{format(date, "LLLL d, yyyy")}</span>;
}
