import { Flights } from "~/app/_components/flights";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#6d4202] to-[#300011] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Cheap<span className="text-[hsl(0,100%,70%)]">&apos;n&apos;</span>Hot
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          {/* <pre className="text-[8px]"></pre> */}
          <Flights />
        </div>
      </div>
    </main>
  );
}
