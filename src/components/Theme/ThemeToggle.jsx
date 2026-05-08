import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/Theme/use-theme";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        type="button"
        variant={theme === "light" ? "default" : "outline"}
        onClick={() => setTheme("light")}
      >
        <Sun data-icon="inline-start" />
        Light
      </Button>
      <Button
        type="button"
        variant={theme === "dark" ? "default" : "outline"}
        onClick={() => setTheme("dark")}
      >
        <Moon data-icon="inline-start" />
        Dark
      </Button>
      <Button
        type="button"
        variant={theme === "system" ? "default" : "outline"}
        onClick={() => setTheme("system")}
      >
        System
      </Button>
    </div>
  );
}

export default ThemeToggle;
