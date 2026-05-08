import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
  ItemActions,
  ItemMedia,
} from "@/components/ui/item";
import { Bot } from "lucide-react";

function CharacterCard({
  character,
  onSelect,
  onDelete,
  selected = false,
}) {
  const {
    name,
    description,
    avatarUrl,
    initials,
  } = character;

  return (
    <Item
      variant={selected ? "muted" : "outline"}
      size="default"
      className="w-full"
      onClick={onSelect}
    >
      <ItemMedia variant="icon" className="shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{initials || <Bot className="h-5 w-5" />}</AvatarFallback>
        </Avatar>
      </ItemMedia>

      <ItemContent className="min-w-0 flex-1">
        <ItemTitle className="truncate">{name}</ItemTitle>
        <ItemDescription className="line-clamp-2">
          {description}
        </ItemDescription>
      </ItemContent>

      <ItemActions className="shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          Delete
        </Button>
      </ItemActions>
    </Item>
  );
}

export default CharacterCard;