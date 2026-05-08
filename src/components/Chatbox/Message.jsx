import * as AvatarPrimitive from "radix-ui";

function Message({ role, content, assistantAvatar, userAvatarUrl }) {
  const isUser = role === "user";

  return (
    <div className={`flex max-w-[85%] items-end gap-2 ${isUser ? "ml-auto" : ""}`}>
      {!isUser ? (
        <AssistantAvatar profile={assistantAvatar} />
      ) : null}

      <div className="rounded-xl bg-muted p-3 text-sm text-foreground">
        {content}
      </div>

      {isUser ? (
        <UserAvatar avatarUrl={userAvatarUrl} />
      ) : null}
    </div>
  );
}

export function AssistantAvatar({ profile }) {
  const fallback = profile?.avatarEmoji || "AI";

  return (
    <AvatarPrimitive.Avatar.Root className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
      <AvatarPrimitive.Avatar.Image
        className="h-full w-full object-cover"
        src={profile?.avatarUrl || undefined}
        alt={profile?.name ? `${profile.name} avatar` : "Assistant avatar"}
      />
      <AvatarPrimitive.Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
        {fallback}
      </AvatarPrimitive.Avatar.Fallback>
    </AvatarPrimitive.Avatar.Root>
  );
}

function UserAvatar({ avatarUrl }) {
  return (
    <AvatarPrimitive.Avatar.Root className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
      <AvatarPrimitive.Avatar.Image
        className="h-full w-full object-cover"
        src={avatarUrl || undefined}
        alt="Your avatar"
      />
      <AvatarPrimitive.Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        HU
      </AvatarPrimitive.Avatar.Fallback>
    </AvatarPrimitive.Avatar.Root>
  );
}

export default Message;
