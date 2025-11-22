import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Baby, Upload, CheckCircle2, XCircle, Play, Trash2, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cryDatabase, categories } from "@/data/cryDatabase";
import { Progress } from "@/components/ui/progress";

const AdminUpload = () => {
  const [user, setUser] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
        checkExistingFiles();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkExistingFiles = async () => {
    const status: Record<string, boolean> = {};
    
    for (const cry of cryDatabase) {
      const { data } = await supabase.storage
        .from('cry-audio')
        .list('', { search: `${cry.id}.mp3` });
      
      status[cry.id] = (data && data.length > 0) || false;
    }
    
    setUploadStatus(status);
  };

  const handleFileUpload = async (cryId: string, file: File) => {
    if (!file.type.includes('audio')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP3 audio file",
        variant: "destructive",
      });
      return;
    }

    setUploading(cryId);

    try {
      // Delete existing file if it exists
      await supabase.storage
        .from('cry-audio')
        .remove([`${cryId}.mp3`]);

      // Upload new file
      const { error } = await supabase.storage
        .from('cry-audio')
        .upload(`${cryId}.mp3`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      setUploadStatus(prev => ({ ...prev, [cryId]: true }));
      toast({
        title: "Success!",
        description: `Audio uploaded for ${cryDatabase.find(c => c.id === cryId)?.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(null);
      checkExistingFiles();
    }
  };

  const handlePlay = async (cryId: string) => {
    if (playing) {
      setPlaying(null);
      return;
    }

    const { data } = supabase.storage
      .from('cry-audio')
      .getPublicUrl(`${cryId}.mp3`);

    const audio = new Audio(data.publicUrl);
    setPlaying(cryId);

    audio.onended = () => setPlaying(null);
    audio.onerror = () => {
      setPlaying(null);
      toast({
        title: "Playback error",
        description: "Failed to play audio",
        variant: "destructive",
      });
    };

    audio.play();
  };

  const handleDelete = async (cryId: string) => {
    try {
      const { error } = await supabase.storage
        .from('cry-audio')
        .remove([`${cryId}.mp3`]);

      if (error) throw error;

      setUploadStatus(prev => ({ ...prev, [cryId]: false }));
      toast({
        title: "Deleted",
        description: "Audio file removed",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const uploadedCount = Object.values(uploadStatus).filter(Boolean).length;
  const totalCount = cryDatabase.length;
  const progress = (uploadedCount / totalCount) * 100;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10 shadow-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Audio Management</h1>
              <p className="text-sm text-muted-foreground">Upload cry samples</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="ghost">
              ← Back to App
            </Button>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-8 shadow-card mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Upload Progress</h2>
              <p className="text-muted-foreground">
                {uploadedCount} of {totalCount} audio files uploaded
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{Math.round(progress)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </motion.div>

        {/* Cry Types Grid */}
        {categories.filter(c => c.value !== 'all').map((category, idx) => {
          const criesInCategory = cryDatabase.filter(c => c.category === category.value);
          
          return (
            <motion.div
              key={category.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <h3 className="text-xl font-bold">{category.label}</h3>
                <span className="text-sm text-muted-foreground">
                  ({criesInCategory.filter(c => uploadStatus[c.id]).length}/{criesInCategory.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criesInCategory.map((cry) => (
                  <div
                    key={cry.id}
                    className="bg-card rounded-2xl p-6 shadow-card border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{cry.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {cry.description}
                        </p>
                      </div>
                      <div className="ml-2">
                        {uploadStatus[cry.id] ? (
                          <CheckCircle2 className="w-6 h-6 text-success" />
                        ) : (
                          <XCircle className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {uploadStatus[cry.id] ? (
                        <>
                          <Button
                            onClick={() => handlePlay(cry.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            disabled={playing === cry.id}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            {playing === cry.id ? "Playing..." : "Play"}
                          </Button>
                          <Button
                            onClick={() => handleDelete(cry.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => document.getElementById(`file-${cry.id}`)?.click()}
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={uploading === cry.id}
                        >
                          {uploading === cry.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          {uploading === cry.id ? "Uploading..." : "Upload MP3"}
                        </Button>
                      )}
                      <input
                        id={`file-${cry.id}`}
                        type="file"
                        accept="audio/mp3,audio/mpeg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(cry.id, file);
                          e.target.value = '';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </main>
    </div>
  );
};

export default AdminUpload;
