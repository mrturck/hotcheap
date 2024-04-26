import {Flights} from "~/app/_components/flights";
import {env} from "~/env";
import {type ApiFlight} from "~/server/api/routers/post";
import {api} from "~/trpc/server";

export const revalidate = 180;

export default async function Home() {
  const flights = await getData();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#c58055] to-[#300011] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Hot<span className="text-[hsl(0,100%,70%)]">&apos;n&apos;</span>Cheap
        </h1>
        <p className="text-center">
          Ryanair flights ranked by Summer Magic™️ (temp/price)
        </p>
        <p className="text-center">
          More features coming soon including weather forecast, date selection
          and origins other than Stansted. <br />
          <a
            className="font-semibold"
            target="_blank"
            href="https://docs.google.com/forms/d/e/1FAIpQLSfl_axOPN5Fil8s2CQ2tw9-AM9lNkLMq-CNjXGmlz9DcKvJFg/viewform?usp=sf_link"
          >
            Tell us or ask us anything ↗️
          </a>
        </p>
        <div className="text-center">
          Made by{" "}
          <a
            className="font-semibold"
            target="_blank"
            href="https://twitter.com/_oscarking_"
          >
            @_oscarking_
          </a>{" "}
          and{" "}
          <a
            className="font-semibold"
            target="_blank"
            href="https://twitter.com/rorhug"
          >
            @rorhug
          </a>
          .{" "}
          <a
            className="font-semibold"
            target="_blank"
            href="https://github.com/rorhug/hotcheap"
          >
            Open Source ↗️
          </a>
        </div>
        <div></div>

        <div className="min-w-full md:min-w-[700px] md:gap-8">
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
    return await api.post.getHotAndCheap();
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
