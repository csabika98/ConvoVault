import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit3, Check, Trash2 } from "lucide-react";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemActions,
} from "@/components/ui/item";

function CharacterCard({
  character,
  onSelect,
  onDelete,
  onNameChange,
  selected = false,
}) {
  const { name, avatarUrl, initials } = character;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const inputRef = useRef(null);

  // Sync editName when name prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditName(name);
    }
  }, [name, isEditing]);

  // Auto-focus input
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditToggle = () => {
    if (isEditing) {
      if (editName.trim() && editName !== name) {
        onNameChange?.(editName);
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <Item
      variant="outline"
      className={`flex w-full flex-nowrap cursor-pointer transition-colors ${
        selected
          ? "bg-primary/5 border-primary/30"
          : ""
      }`}
      onClick={() => onSelect?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
    >
      <div className="shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{initials || <span className="text-xs">AI</span>}</AvatarFallback>
        </Avatar>
      </div>

      <ItemContent className="min-w-0 flex-1">
        <div className="flex min-h-[34px] w-full min-w-0 items-center">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-8 min-h-0 w-full min-w-0 px-2 text-sm"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditToggle();
                }
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditName(name);
                }
              }}
            />
          ) : (
            <ItemTitle className="min-w-0 w-full max-w-full">
              {name}
            </ItemTitle>
          )}
        </div>
      </ItemContent>

      <ItemActions className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleEditToggle();
          }}
          className="h-8 w-8 p-0"
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </ItemActions>
    </Item>
  );
}

export default CharacterCard;