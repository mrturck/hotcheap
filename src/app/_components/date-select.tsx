import dayjs from "dayjs"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"

export const DateSelect = ({
  date,
  airport,
}: {
  date: Date
  airport: string
}) => {
  const daysArray = Array.from({ length: 5 }, (_, i) => i)
  const days = daysArray.map((i) => dayjs().add(i, "day"))

  return (
    <div className="flex w-full items-center overflow-x-scroll">
      <Tabs value={dayjs(date).format("YYYY-MM-DD")} className="w-full pb-3">
        <TabsList className="w-full">
          {days.map((day) => {
            const str = day.format("YYYY-MM-DD")

            return (
              <Link
                key={str}
                href={{
                  pathname: `/origin/${airport}/${str}`,
                }}
                className="flex-1"
              >
                <TabsTrigger value={str} className="w-full">
                  {day.format("ddd DD")}
                </TabsTrigger>
              </Link>
            )
          })}
        </TabsList>
      </Tabs>
    </div>
  )
}
