import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Volume2, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cryDatabase, categories, CryCategory } from "@/data/cryDatabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


interface DatabaseViewProps {
  onBack: () => void;
}

const DatabaseView = ({ onBack }: DatabaseViewProps) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<CryCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCryId, setSelectedCryId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  

  const filteredCries = cryDatabase.filter((cry) => {
    const matchesCategory = selectedCategory === "all" || cry.category === selectedCategory;
    const matchesSearch = cry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cry.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedCry = cryDatabase.find((c) => c.id === selectedCryId);

  const categoryColors: Record<string, string> = {
    dunstan: "bg-accent/20 text-accent-foreground hover:bg-accent/30",
    hunger: "bg-warning/20 text-warning-foreground hover:bg-warning/30",
    pain: "bg-destructive/20 text-destructive-foreground hover:bg-destructive/30",
    sleep: "bg-[hsl(260,50%,90%)] text-[hsl(260,50%,30%)] hover:bg-[hsl(260,50%,80%)]",
    fussy: "bg-[hsl(40,60%,90%)] text-[hsl(40,60%,30%)] hover:bg-[hsl(40,60%,80%)]",
    attention: "bg-[hsl(200,60%,90%)] text-[hsl(200,60%,30%)] hover:bg-[hsl(200,60%,80%)]",
    overstimulation: "bg-[hsl(30,60%,90%)] text-[hsl(30,60%,30%)] hover:bg-[hsl(30,60%,80%)]",
    fear: "bg-[hsl(0,60%,90%)] text-[hsl(0,60%,30%)] hover:bg-[hsl(0,60%,80%)]",
  };

  const intensityColors = {
    low: "bg-success/20 text-success-foreground",
    medium: "bg-warning/20 text-warning-foreground",
    high: "bg-destructive/20 text-destructive-foreground",
  };

  const stopAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setPlayingAudioId(null);
    setLoadingAudioId(null);
  };

  // Play actual baby cry sound from storage (for card grid)
  const handlePlayCrySound = async (cryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const audioKey = `cry-${cryId}`;
    
    // Stop if playing the same one
    if (playingAudioId === audioKey || loadingAudioId === audioKey) {
      stopAudio();
      return;
    }

    // Stop any other playing audio
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }

    setLoadingAudioId(audioKey);
    setPlayingAudioId(null);

    try {
      // Check for exact file match in storage
      const { data: fileList } = await supabase.storage
        .from('cry-audio')
        .list('');

      const exactFileName = `${cryId}.mp3`;
      const fileExists = fileList?.some(file => file.name === exactFileName);

      if (!fileExists) {
        setLoadingAudioId(null);
        toast({
          title: "No Audio Available",
          description: "Cry sample not yet uploaded. Tap card to hear description.",
        });
        return;
      }

      const { data } = supabase.storage
        .from('cry-audio')
        .getPublicUrl(exactFileName);
      
      const audioUrl = data.publicUrl;
      console.log('Playing cry sound from storage:', audioUrl);

      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setPlayingAudioId(null);
        setLoadingAudioId(null);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        console.error('Audio playback error');
        setPlayingAudioId(null);
        setLoadingAudioId(null);
        setCurrentAudio(null);
        toast({
          title: "Playback Error",
          description: "Failed to play cry sound",
          variant: "destructive",
        });
      };

      setCurrentAudio(audio);
      setLoadingAudioId(null);
      setPlayingAudioId(audioKey);
      await audio.play();
    } catch (error) {
      console.error('Error playing cry sound:', error);
      setPlayingAudioId(null);
      setLoadingAudioId(null);
      toast({
        title: "Error",
        description: "Failed to load cry sound.",
        variant: "destructive",
      });
    }
  };

  // Play TTS description (for detail dialog)
  const handlePlayTTS = async (cryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const audioKey = `tts-${cryId}`;
    
    // Stop if playing the same one
    if (playingAudioId === audioKey || loadingAudioId === audioKey) {
      stopAudio();
      return;
    }

    // Stop any other playing audio
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }

    const cry = cryDatabase.find((c) => c.id === cryId);
    if (!cry) return;

    setLoadingAudioId(audioKey);
    setPlayingAudioId(null);

    try {
      const text = `${cry.name}. ${cry.description}. What to do: ${cry.solutions.join('. ')}`;

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'nova' }
      });

      if (error) {
        console.error('TTS error:', error);
        throw error;
      }

      if (!data?.audioContent) {
        throw new Error('No audio content returned from TTS');
      }

      // Convert base64 to audio
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('Playing TTS audio');

      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setPlayingAudioId(null);
        setLoadingAudioId(null);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        console.error('TTS playback error');
        setPlayingAudioId(null);
        setLoadingAudioId(null);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: "Playback Error",
          description: "Failed to play description",
          variant: "destructive",
        });
      };

      setCurrentAudio(audio);
      setLoadingAudioId(null);
      setPlayingAudioId(audioKey);
      await audio.play();
    } catch (error) {
      console.error('Error playing TTS:', error);
      setPlayingAudioId(null);
      setLoadingAudioId(null);
      toast({
        title: "Error",
        description: "Failed to load audio description.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cry Database</h1>
            <p className="text-muted-foreground">Browse all {cryDatabase.length} cry types</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search cries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 rounded-2xl bg-card border-border"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              className={`rounded-full whitespace-nowrap ${
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              }`}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredCries.length} {filteredCries.length === 1 ? "cry" : "cries"}
        </div>

        {/* Cry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCries.map((cry, index) => (
            <motion.div
              key={cry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedCryId(cry.id)}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-soft transition-all cursor-pointer border border-border hover:border-primary/30"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg">{cry.name}</h3>
                <Badge variant="outline" className={intensityColors[cry.intensity]}>
                  {cry.intensity}
                </Badge>
              </div>
              
              <Badge className={`${categoryColors[cry.category]} mb-3`}>
                {cry.category}
              </Badge>

              <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                <button
                  onClick={(e) => playingAudioId === `cry-${cry.id}` ? stopAudio(e) : handlePlayCrySound(cry.id, e)}
                  className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
                    playingAudioId === `cry-${cry.id}` 
                      ? 'bg-destructive/20 hover:bg-destructive/30' 
                      : 'hover:bg-primary/10'
                  }`}
                  title={playingAudioId === `cry-${cry.id}` ? 'Stop cry sound' : 'Play cry sound'}
                >
                  {loadingAudioId === `cry-${cry.id}` ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : playingAudioId === `cry-${cry.id}` ? (
                    <Square className="w-4 h-4 text-destructive fill-destructive" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-primary" />
                  )}
                </button>
                <span className="line-clamp-2">{cry.audioPattern}</span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {cry.description}
              </p>

              <div className="mt-4 text-xs text-primary font-medium">
                Tap to see solutions →
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No cries found matching your search.
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedCryId} onOpenChange={() => setSelectedCryId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          {selectedCry && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-2">
                  {selectedCry.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Details and solutions for {selectedCry.name} cry type
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className={categoryColors[selectedCry.category]}>
                    {selectedCry.category}
                  </Badge>
                  <Badge variant="outline" className={intensityColors[selectedCry.intensity]}>
                    {selectedCry.intensity.toUpperCase()} intensity
                  </Badge>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <button
                      onClick={(e) => playingAudioId === `tts-${selectedCry.id}` ? stopAudio(e) : handlePlayTTS(selectedCry.id, e)}
                      className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                        playingAudioId === `tts-${selectedCry.id}` 
                          ? 'bg-destructive/20 hover:bg-destructive/30' 
                          : 'hover:bg-primary/10'
                      }`}
                      title={playingAudioId === `tts-${selectedCry.id}` ? 'Stop description' : 'Listen to description'}
                    >
                      {loadingAudioId === `tts-${selectedCry.id}` ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : playingAudioId === `tts-${selectedCry.id}` ? (
                        <Square className="w-5 h-5 text-destructive fill-destructive" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-primary" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">Listen to Description</div>
                      <div className="text-sm text-muted-foreground">{selectedCry.audioPattern}</div>
                      <div className="text-xs text-primary mt-2">
                        {playingAudioId === `tts-${selectedCry.id}` ? 'Click to stop' : 'Click to hear description & solutions'}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCry.ageRange && (
                  <div className="text-sm">
                    <span className="font-semibold">Typical age:</span> {selectedCry.ageRange}
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedCry.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    What to do:
                  </h4>
                  <div className="space-y-2">
                    {selectedCry.solutions.map((solution, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 bg-accent/10 rounded-xl p-4 border border-accent/20"
                      >
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 text-accent-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed pt-0.5">{solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default DatabaseView;
