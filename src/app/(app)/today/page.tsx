import { SetPageTitle } from "../page-title-context";
import { getTodaysCalls } from "@/lib/today-data";
import { DayProgress } from "@/components/day-progress";
import { CallQueue } from "@/components/call-queue";
import { PageHeader } from "@/components/ui";

// The day's call list: what to ring, how far through you are, and nothing else.
export default async function TodayPage() {
  const { queue, doneToday, remaining, target, mode } = await getTodaysCalls();
  const personal = mode === "personal";

  return (
    <>
      <SetPageTitle title="Today's Calls" />
      <PageHeader
        title="Today's Calls"
        description="Leads waiting on a first call, oldest first."
      />

      <div className="flex flex-col gap-4">
        <DayProgress done={doneToday} target={target} remaining={remaining} personal={personal} />
        <CallQueue leads={queue} personal={personal} />
      </div>
    </>
  );
}
