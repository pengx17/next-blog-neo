/* eslint-disable @next/next/no-page-custom-font */
export default async function Head() {
  return (
    <>
      <meta content="width=device-width, initial-scale=1" name="viewport" />

      {/* @ts-expect-error see https://beta.nextjs.org/docs/api-reference/file-conventions/head#supported-head-tags */}
      <link precedence="default" rel="icon" href="/favicon.jpeg" />
      <meta name="description" content="A personal blog by pengx17" />
      <title>pengx17</title>
      <meta
        name="twitter:card"
        content="https://avatars.githubusercontent.com/u/584378"
      />
    </>
  );
}
