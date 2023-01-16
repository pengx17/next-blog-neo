import { parseISO, format } from "date-fns";

export default function Date({ dateString }) {
  const date = parseISO(dateString);
  return <span>{format(date, "LLLL d, yyyy")}</span>;
}
