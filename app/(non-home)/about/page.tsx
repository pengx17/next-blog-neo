import LinkPreview from "../../components/link-preview";

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
        <a href="https://pengx17.github.io/" target="_blank" rel="noreferrer">
          Archived Blog
        </a>
      </h3>

      <LinkPreview url="https://twitter.com/pengx17" />
    </>
  );
}
