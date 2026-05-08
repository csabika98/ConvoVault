import { Settings, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/context/profile/useProfile";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/Theme/ThemeToggle";

function SettingsSheet() {
  const { userAvatarUrl, setUserAvatarUrl } = useProfile();

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setUserAvatarUrl(reader.result);
      }
    });
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          className="absolute right-4 top-4 z-10"
          aria-label="Open settings"
          title="Settings"
        >
          <Settings />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Customize your chat experience.</SheetDescription>
        </SheetHeader>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Profile</h3>
            <p className="text-xs text-muted-foreground">
              Manage how you appear in chat.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
            <Avatar className="size-12">
              <AvatarImage src={userAvatarUrl || undefined} alt="Your avatar" />
              <AvatarFallback>HU</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-sm font-medium">Your avatar</div>
              <div className="text-xs text-muted-foreground">
                Used for your messages in chat.
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <label>
                <Upload data-icon="inline-start" />
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                />
              </label>
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!userAvatarUrl}
              onClick={() => setUserAvatarUrl("")}
            >
              Remove
            </Button>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Appearance</h3>
            <p className="text-xs text-muted-foreground">
              Choose how ConvoVault looks on this device.
            </p>
          </div>
          <ThemeToggle />
        </section>
      </SheetContent>
    </Sheet>
  );
}

export default SettingsSheet;
