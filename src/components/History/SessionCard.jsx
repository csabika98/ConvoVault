import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemActions,
} from "@/components/ui/item";

function SessionCard({
  title = "Session Title",
  counter = "1",
  sessionId,
  isActive = false,
  onSelect,
  onDelete,
}) {
  return (
    <Item
      variant="outline"
      className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
        isActive ? "ring-2 ring-ring" : ""
      }`}
      onClick={() => onSelect(sessionId)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(sessionId);
        }
      }}
    >
      <Badge variant="secondary" className="shrink-0 text-xs">
        #{counter}
      </Badge>

      <ItemContent className="min-w-0 flex-1 p-0">
        <ItemTitle className="truncate">{title}</ItemTitle>
      </ItemContent>

      <ItemActions className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full p-0 hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(sessionId);
          }}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </ItemActions>
    </Item>
  );
}

export default SessionCard;