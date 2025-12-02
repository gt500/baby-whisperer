import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Baby, Upload, CheckCircle2, XCircle, Play, Trash2, LogOut, Loader2, FolderUp, AlertCircle, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cryDatabase, categories } from "@/data/cryDatabase";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminUpload = () => {
  const [user, setUser] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResults, setBulkResults] = useState<{ matched: string[]; unmatched: string[]; success: string[]; failed: string[] } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const verifyAdminAccess = async (session: any) => {
      if (!session) {
        navigate("/login");
        return false;
      }

      // Verify admin role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin');

      if (error) {
        console.error('Error checking admin role:', error);
        toast({
          title: "Error",
          description: "Failed to verify admin access",
          variant: "destructive",
        });
        navigate('/');
        return false;
      }

      if (!roles || roles.length === 0) {
        toast({
          title: "Access Denied",
          description: "Admin privileges required",
          variant: "destructive",
        });
        navigate('/');
        return false;
      }

      return true;
    };

    const initializePage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const isAdmin = await verifyAdminAccess(session);
      if (!isAdmin || !isMounted) return;

      setUser(session!.user);
      await checkExistingFiles();
    };

    initializePage();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/login");
        return;
      }
      
      // Only re-verify on sign in events, not on token refresh
      if (event === 'SIGNED_IN' && isMounted) {
        const isAdmin = await verifyAdminAccess(session);
        if (!isAdmin) return;
        
        setUser(session!.user);
        await checkExistingFiles();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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

  const handleBulkUpload = async (files: FileList) => {
    setBulkUploading(true);
    setBulkProgress(0);
    
    const matched: string[] = [];
    const unmatched: string[] = [];
    const success: string[] = [];
    const failed: string[] = [];

    // Create a map of possible filename patterns to cry IDs
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fileName = file.name.toLowerCase().replace(/\.mp3$/i, '');
      
      // Try to match filename to cry ID
      const matchedCry = cryDatabase.find(cry => {
        const cryId = cry.id.toLowerCase();
        const cryName = cry.name.toLowerCase();
        
        // Match by ID or by name (remove special characters and spaces)
        return fileName === cryId || 
               fileName.replace(/[^a-z0-9]/g, '') === cryId.replace(/[^a-z0-9]/g, '') ||
               fileName.replace(/[^a-z0-9]/g, '').includes(cryId.replace(/[^a-z0-9]/g, ''));
      });

      if (matchedCry) {
        matched.push(file.name);
        
        try {
          // Delete existing file if it exists
          await supabase.storage
            .from('cry-audio')
            .remove([`${matchedCry.id}.mp3`]);

          // Upload new file
          const { error } = await supabase.storage
            .from('cry-audio')
            .upload(`${matchedCry.id}.mp3`, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (error) throw error;
          
          success.push(`${file.name} → ${matchedCry.name}`);
        } catch (error: any) {
          failed.push(`${file.name}: ${error.message}`);
        }
      } else {
        unmatched.push(file.name);
      }

      setBulkProgress(((i + 1) / totalFiles) * 100);
    }

    setBulkResults({ matched, unmatched, success, failed });
    setBulkUploading(false);
    
    // Refresh the status
    await checkExistingFiles();

    toast({
      title: "Bulk upload complete",
      description: `${success.length} files uploaded successfully`,
    });
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
            <Button onClick={() => navigate("/audio-segmentation")} variant="secondary">
              <Scissors className="w-4 h-4 mr-2" />
              Audio Segmentation
            </Button>
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

        {/* Bulk Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-3xl p-8 shadow-card mb-8 border-2 border-accent/30"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FolderUp className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-bold">Bulk Upload</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Upload all 17 MP3 files at once. Files will be automatically matched based on filename.
              </p>
              <div className="text-sm text-muted-foreground space-y-1 bg-card/50 rounded-lg p-4">
                <p className="font-semibold mb-2">Filename matching tips:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Exact ID match: <code className="bg-muted px-2 py-0.5 rounded">neh.mp3</code></li>
                  <li>Name match: <code className="bg-muted px-2 py-0.5 rounded">hungry.mp3</code> or <code className="bg-muted px-2 py-0.5 rounded">neh-hungry.mp3</code></li>
                  <li>Spaces and dashes are ignored: <code className="bg-muted px-2 py-0.5 rounded">sharp pain.mp3</code></li>
                </ul>
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <Button
                onClick={() => document.getElementById('bulk-upload')?.click()}
                size="lg"
                className="w-full md:w-auto bg-gradient-to-r from-accent to-accent-hover text-accent-foreground shadow-soft hover:scale-105 transition-all h-14 px-8"
                disabled={bulkUploading}
              >
                {bulkUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading... {Math.round(bulkProgress)}%
                  </>
                ) : (
                  <>
                    <FolderUp className="w-5 h-5 mr-2" />
                    Select 17 Files
                  </>
                )}
              </Button>
              <input
                id="bulk-upload"
                type="file"
                accept="audio/mp3,audio/mpeg"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleBulkUpload(files);
                  }
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          {/* Bulk Upload Progress */}
          {bulkUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6"
            >
              <Progress value={bulkProgress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground mt-2">
                Processing files... {Math.round(bulkProgress)}%
              </p>
            </motion.div>
          )}

          {/* Bulk Upload Results */}
          <AnimatePresence>
            {bulkResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Upload Results</h3>
                  <Button
                    onClick={() => setBulkResults(null)}
                    variant="ghost"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>

                {bulkResults.success.length > 0 && (
                  <Alert className="bg-success/10 border-success/30">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Successfully uploaded ({bulkResults.success.length}):</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        {bulkResults.success.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {bulkResults.unmatched.length > 0 && (
                  <Alert className="bg-warning/10 border-warning/30">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Could not match ({bulkResults.unmatched.length}):</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        {bulkResults.unmatched.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {bulkResults.failed.length > 0 && (
                  <Alert className="bg-destructive/10 border-destructive/30">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Failed to upload ({bulkResults.failed.length}):</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        {bulkResults.failed.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
