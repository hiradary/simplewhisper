/**
 * v0 by Vercel.
 * @see https://v0.dev/t/IiNWHamHHC9
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button";
import { MicIcon } from "@/components/ui/icon";

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="max-w-md w-full space-y-6 px-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Button
            size="lg"
            className="flex items-center gap-2 px-6 py-3 rounded-full"
          >
            <MicIcon className="w-6 h-6" />
            Record
          </Button>
          <div className="text-muted-foreground text-sm">
            Click to start recording
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 text-card-foreground">
          <div className="prose max-w-none">
            <p>Your transcription will be displayed here as you speak.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
