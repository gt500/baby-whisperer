import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play, Pause, Scissors, Upload, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Segment {
  id: string;
  start: number;
  end: number;
  cryType: string;
  color: string;
}

const cryTypes = [
  { id: "neh", name: "Neh (Hungry)" },
  { id: "owh", name: "Owh (Sleepy)" },
  { id: "heh", name: "Heh (Discomfort)" },
  { id: "eairh", name: "Eairh (Gas)" },
  { id: "eh", name: "Eh (Burp)" },
];

const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];

export default function AudioSegmentation() {
  const navigate = useNavigate();
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [markingStart, setMarkingStart] = useState<number | null>(null);
  const [selectedCryType, setSelectedCryType] = useState<string>("neh");
  const [uploading, setUploading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    loadAudio();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (audioBuffer) {
      drawWaveform();
    }
  }, [audioBuffer, segments, currentTime]);

  const loadAudio = async () => {
    try {
      const response = await fetch("/source-audio/dunstan_sounds.mp3");
      const arrayBuffer = await response.arrayBuffer();
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      toast.success("Audio loaded successfully");
    } catch (error) {
      console.error("Error loading audio:", error);
      toast.error("Failed to load audio");
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !audioBuffer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = "hsl(var(--background))";
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < width; i++) {
      const min = Math.min(...Array.from(data.slice(i * step, (i + 1) * step)));
      const max = Math.max(...Array.from(data.slice(i * step, (i + 1) * step)));
      
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();

    // Draw segments
    segments.forEach((segment) => {
      const startX = (segment.start / duration) * width;
      const endX = (segment.end / duration) * width;
      
      ctx.fillStyle = segment.color + "40";
      ctx.fillRect(startX, 0, endX - startX, height);
      
      ctx.strokeStyle = segment.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, height);
      ctx.stroke();

      // Draw label
      ctx.fillStyle = segment.color;
      ctx.font = "12px sans-serif";
      ctx.fillText(segment.cryType, startX + 5, 15);
    });

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = "hsl(var(--destructive))";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  };

  const togglePlayPause = () => {
    if (!audioBuffer || !audioContextRef.current) return;

    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
    } else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      startTimeRef.current = audioContextRef.current.currentTime - currentTime;
      source.start(0, currentTime);
      
      sourceNodeRef.current = source;
      setIsPlaying(true);

      source.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      const updateTime = () => {
        if (audioContextRef.current && isPlaying) {
          const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
          setCurrentTime(Math.min(elapsed, duration));
          requestAnimationFrame(updateTime);
        }
      };
      updateTime();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / rect.width) * duration;

    if (markingStart === null) {
      setMarkingStart(clickTime);
      toast.info("Click again to set end point");
    } else {
      const start = Math.min(markingStart, clickTime);
      const end = Math.max(markingStart, clickTime);
      
      const newSegment: Segment = {
        id: `${selectedCryType}-${Date.now()}`,
        start,
        end,
        cryType: selectedCryType,
        color: colors[segments.length % colors.length],
      };
      
      setSegments([...segments, newSegment]);
      setMarkingStart(null);
      toast.success(`Segment marked for ${selectedCryType}`);
    }
  };

  const exportAndUpload = async () => {
    if (!audioBuffer || segments.length === 0) {
      toast.error("Please mark at least one segment");
      return;
    }

    setUploading(true);
    
    try {
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      for (const segment of segments) {
        const startSample = Math.floor(segment.start * audioBuffer.sampleRate);
        const endSample = Math.floor(segment.end * audioBuffer.sampleRate);
        const length = endSample - startSample;

        const segmentBuffer = offlineContext.createBuffer(
          audioBuffer.numberOfChannels,
          length,
          audioBuffer.sampleRate
        );

        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          const segmentData = segmentBuffer.getChannelData(channel);
          
          for (let i = 0; i < length; i++) {
            segmentData[i] = channelData[startSample + i];
          }
        }

        // Convert to WAV blob
        const wav = audioBufferToWav(segmentBuffer);
        const blob = new Blob([wav], { type: "audio/wav" });
        
        // Upload to Supabase
        const fileName = `${segment.cryType}.mp3`;
        const { error } = await supabase.storage
          .from("cry-audio")
          .upload(fileName, blob, {
            upsert: true,
            contentType: "audio/wav",
          });

        if (error) throw error;
        toast.success(`Uploaded ${segment.cryType}`);
      }

      toast.success("All segments uploaded successfully!");
      setTimeout(() => navigate("/admin-upload"), 1500);
    } catch (error) {
      console.error("Error uploading segments:", error);
      toast.error("Failed to upload segments");
    } finally {
      setUploading(false);
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    setUint16(buffer.numberOfChannels * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    // Write audio data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return arrayBuffer;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin-upload")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-primary">Audio Segmentation Tool</h1>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-6">
            <div>
              <Label>Waveform</Label>
              <canvas
                ref={canvasRef}
                width={1200}
                height={200}
                className="w-full border rounded-lg cursor-crosshair bg-background"
                onClick={handleCanvasClick}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={togglePlayPause} size="lg">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              <div className="flex-1">
                <Input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.01"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Label>Cry Type:</Label>
              <Select value={selectedCryType} onValueChange={setSelectedCryType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cryTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setMarkingStart(null)}>
                <Scissors className="h-4 w-4 mr-2" />
                {markingStart !== null ? "Cancel Marking" : "Mark Segment"}
              </Button>
            </div>

            <div>
              <Label>Segments ({segments.length})</Label>
              <div className="space-y-2 mt-2">
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    style={{ borderLeft: `4px solid ${segment.color}` }}
                  >
                    <div>
                      <div className="font-medium">{segment.cryType}</div>
                      <div className="text-sm text-muted-foreground">
                        {segment.start.toFixed(2)}s - {segment.end.toFixed(2)}s ({(segment.end - segment.start).toFixed(2)}s)
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSegments(segments.filter((s) => s.id !== segment.id))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={exportAndUpload}
              disabled={segments.length === 0 || uploading}
              size="lg"
              className="w-full"
            >
              <Upload className="h-5 w-5 mr-2" />
              {uploading ? "Uploading..." : `Export & Upload ${segments.length} Segments`}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
