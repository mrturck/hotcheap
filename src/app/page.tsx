import { Flights } from "~/app/_components/flights";
import { env } from "~/env";
import { type ApiFlight } from "~/server/api/routers/post";
import { api } from "~/trpc/server";

export default async function Home() {
  const flights = await getData();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#c58055] to-[#300011] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Hot<span className="text-[hsl(0,100%,70%)]">&apos;n&apos;</span>Cheap
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          {/* <pre className="text-[8px]"></pre> */}
          <Flights flights={flights} />
        </div>
      </div>
    </main>
  );
}

async function getData() {
  if (process.env.CI) {
    return [];
  }

  if (process.env.NODE_ENV === "development") {
    const res = await api.post.getHotAndCheap();
    return res;
  } else {
    console.log("calling the server");
    const res = await fetch(
      env.DATASERVER_URL + "/api/flights?pwd=" + env.DATASERVER_PWD,
      {
        next: { revalidate: 180 },
      },
    );
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error("Failed to fetch data");
    }

    return (await res.json()) as ApiFlight[];
  }
}
