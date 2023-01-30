import Link from "next/link";
import "react-static-tweets/styles.css";

const BackHome = () => {
  return (
    <div className="inline-block py-0.5 px-2 text-green-800 font-semibold text-2xl mt-12 underline bg-gray-100">
      <Link href="/" className="group relative">
        <code className="group-hover:opacity-0 transition-all">cd ~</code>
        <code className="group-hover:opacity-100 opacity-0 absolute left-0 top-0 whitespace-nowrap transition-all">
          🏠
        </code>
      </Link>
    </div>
  );
};

export default function RootLayout({ children }) {
  return (
    <main className="max-w-6xl w-full lg:p-12 p-6">
      <div className="text-gray-500">
        <Link href="/">{"← home"}</Link>
      </div>
      {children}
      <BackHome />
    </main>
  );
}
