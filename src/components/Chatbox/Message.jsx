import * as AvatarPrimitive from "radix-ui";
import { Card, CardContent } from "@/components/ui/card";

function Message({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`flex max-w-[85%] items-end gap-2 ${isUser ? "ml-auto" : ""}`}>
      {!isUser ? (
        <AvatarPrimitive.Avatar.Root className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <AvatarPrimitive.Avatar.Image
            className="aspect-square h-full w-full"
            src=""
            alt="Assistant avatar"
          />
          <AvatarPrimitive.Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            AI
          </AvatarPrimitive.Avatar.Fallback>
        </AvatarPrimitive.Avatar.Root>
      ) : null}

      <Card className={`w-fit ${isUser ? "bg-muted" : "bg-card"}`}>
        <CardContent
          className={`whitespace-pre-wrap px-3 py-2 text-foreground ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {content}
        </CardContent>
      </Card>

      {isUser ? (
        <AvatarPrimitive.Avatar.Root className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <AvatarPrimitive.Avatar.Image
            className="aspect-square h-full w-full"
            src=""
            alt="Human avatar"
          />
          <AvatarPrimitive.Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            HU
          </AvatarPrimitive.Avatar.Fallback>
        </AvatarPrimitive.Avatar.Root>
      ) : null}
    </div>
  );
}

export default Message;
