import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function SessionCard({
  title = "Card Title",
  description = "This is the card description.",
  counter = "1",
  sessionId,
  isActive = false,
  onSelect,
  /*onDelete*/
}) {

  return (
    <Card
      className={`relative group cursor-pointer transition-colors ${
        isActive ? "ring-2 ring-ring" : ""
      }`}
      onClick={() => onSelect?.(sessionId)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.(sessionId);
        }
      }}
    >
      {/* Top-right counter */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="secondary" className="text-xs">#{counter}</Badge>
      </div>

      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="pb-12 pt-0">
        <CardDescription>{description}</CardDescription>
        <p className="mt-2 text-xs text-muted-foreground">Session: {sessionId}</p>
      </CardContent>

      {/* Bottom-right delete button - hidden until hover */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-4 right-4 h-8 w-8 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10"
        onClick={(event) => event.stopPropagation()}
        /*onClick={onDelete}*/
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </Card>
  );
}

export default SessionCard;
