import Link from "next/link";

export default function About() {
  return (
    <>
      <h1 className="font-serif text-4xl font-bold my-4">About</h1>
      <h3 className="text-xl my-4">
        A{" "}
        <ruby>
          Senior
          <rt>中年</rt>
        </ruby>{" "}
        Frontend Developer
      </h3>

      <h3 className="my-4">
        <Link className="underline" href="/posts/weekly">{"My Weekly"}</Link>
      </h3>
    </>
  );
}
