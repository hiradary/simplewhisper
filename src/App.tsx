import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CopyIcon, MicIcon } from "@/components/ui/icon";
import logo from "@/assets/simplewhisper-logo.svg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";

export default function App() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleApiKeySubmit = () => {
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
      setShowApiKeyModal(false);
      toast.success("API Key set successfully!");
      startRecording();
    }
  };

  const getApiKey = () => {
    return localStorage.getItem("openai_api_key");
  };

  const checkApiKeyAndRecord = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setShowApiKeyModal(true);
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        sendAudioToWhisperAPI(audioBlob);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToWhisperAPI = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");
    formData.append("model", "whisper-1");

    try {
      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getApiKey()}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data: { text: string } = await response.json();
      setTranscript(data.text);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      setTranscript("Error transcribing audio. Please try again.");
    }
  };

  const copyTranscript = () => {
    navigator.clipboard
      .writeText(transcript)
      .then(() => {
        toast.success("Copied successfully!");
      })
      .catch((err: Error) => {
        console.error("Failed to copy transcript: ", err);
      });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground xl:py-10 py-4">
      <div className="flex flex-col items-center max-w-lg w-full space-y-6 px-4 flex-1">
        <img src={logo} className="w-80" />
        <div className="flex flex-col items-center justify-center space-y-2 flex-1">
          <Button
            size="lg"
            className="flex items-center gap-2 px-6 py-3 rounded-full"
            onClick={isRecording ? stopRecording : checkApiKeyAndRecord}
          >
            <MicIcon className="w-6 h-6" />
            {isRecording ? "Stop" : "Record"}
          </Button>
          <div className="text-muted-foreground text-sm">
            {isRecording
              ? "Recording... Click to stop."
              : "Click to start recording."}
          </div>
          {transcript && (
            <div className="rounded-md p-4 text-card-foreground max-w-lg bg-gray-100">
              <Button
                variant="outline"
                className="flex items-center text-muted-foreground hover:bg-muted/50 gap-2 mb-2"
                onClick={copyTranscript}
              >
                <CopyIcon className="size-5" />
                Copy
              </Button>
              <p className="w-full">{transcript}</p>
            </div>
          )}
        </div>
        <div className="w-full flex flex-col mt-4 gap-2">
          <div className="w-full flex items-center justify-center">
            <span className="text-gray-400 text-xs">
              Made with ❤️ by{" "}
              <a
                href="https://x.com/hiradary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:underline"
              >
                @hiradary
              </a>
              . Fully{" "}
              <a
                href="https://github.com/hiradary/simplewhisper"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:underline"
              >
                open-source
              </a>
              .
            </span>
          </div>

          <div className="text-xs text-muted-foreground text-center text-gray-400">
            We do not store your OpenAI API key or audio recordings. Audio is
            sent directly to OpenAI for transcription.
          </div>
        </div>
      </div>
      <Dialog open={showApiKeyModal} onOpenChange={setShowApiKeyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter OpenAI API Key</DialogTitle>
            <DialogDescription>
              Please enter your OpenAI API key to use the transcription service.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
          />
          <DialogFooter>
            <Button onClick={handleApiKeySubmit}>Set API Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </main>
  );
}
