import SessionCard from "./SessionCard";
import { Separator } from "@/components/ui/separator";

function History() {

  return (
    <>
      <div className="h-full min-h-0 w-full bg-background p-1">
        <h1 className="mb-4">History</h1>
        <Separator className="mb-6" />
          <div className="flex flex-col gap-4 max-w-6xl mx-auto w-full">
            <SessionCard counter="1"/>
            <SessionCard counter="2"/>
        </div>
      </div>
    </>
  )
}

export default History;
