import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Check, X, Loader2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cryDatabase } from "@/data/cryDatabase";
import { toast } from "sonner";

interface Contribution {
  id: string;
  audio_url: string;
  detected_cry_type: string | null;
  user_verified_type: string | null;
  is_correct: boolean | null;
  confidence: number | null;
  duration_seconds: number | null;
  status: string;
  created_at: string;
}

export const ContributionsReview = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  const fetchContributions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('cry_contributions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setContributions(data || []);
    } catch (err) {
      console.error('Error fetching contributions:', err);
      toast.error("Failed to load contributions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [statusFilter]);

  const handlePlay = async (audioUrl: string, id: string) => {
    if (playing === id) {
      setPlaying(null);
      return;
    }

    const audio = new Audio(audioUrl);
    setPlaying(id);
    
    audio.onended = () => setPlaying(null);
    audio.onerror = () => {
      setPlaying(null);
      toast.error("Failed to play audio");
    };
    
    audio.play();
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from('cry_contributions')
        .update({ 
          status, 
          reviewed_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      setContributions(prev => 
        prev.map(c => c.id === id ? { ...c, status, reviewed_at: new Date().toISOString() } : c)
      );
      toast.success(`Contribution ${status}`);
    } catch (err) {
      console.error('Error updating contribution:', err);
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const getCryName = (cryId: string | null) => {
    if (!cryId) return 'Unknown';
    const cry = cryDatabase.find(c => c.id === cryId);
    return cry?.name || cryId;
  };

  const stats = {
    total: contributions.length,
    pending: contributions.filter(c => c.status === 'pending').length,
    approved: contributions.filter(c => c.status === 'approved').length,
    rejected: contributions.filter(c => c.status === 'rejected').length,
    verified: contributions.filter(c => c.is_correct !== null).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="bg-warning/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="bg-success/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-success">{stats.approved}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </div>
        <div className="bg-destructive/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
          <div className="text-sm text-muted-foreground">Rejected</div>
        </div>
        <div className="bg-accent/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-accent">{stats.verified}</div>
          <div className="text-sm text-muted-foreground">User Verified</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filter by status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={fetchContributions} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Contributions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : contributions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No contributions found
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {contributions.map((contribution) => (
              <motion.div
                key={contribution.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Play Button */}
                    <Button
                      onClick={() => handlePlay(contribution.audio_url, contribution.id)}
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0"
                    >
                      <Play className={`w-4 h-4 ${playing === contribution.id ? 'text-primary' : ''}`} />
                    </Button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">
                          {getCryName(contribution.detected_cry_type)}
                        </span>
                        {contribution.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {(contribution.confidence * 100).toFixed(0)}%
                          </Badge>
                        )}
                        <Badge 
                          variant={
                            contribution.status === 'approved' ? 'default' :
                            contribution.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {contribution.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{new Date(contribution.created_at).toLocaleDateString()}</span>
                        {contribution.duration_seconds && (
                          <span>{contribution.duration_seconds.toFixed(1)}s</span>
                        )}
                        {contribution.is_correct !== null && (
                          <span className={contribution.is_correct ? 'text-success' : 'text-warning'}>
                            User: {contribution.is_correct ? 'Correct' : getCryName(contribution.user_verified_type)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {contribution.status === 'pending' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        onClick={() => updateStatus(contribution.id, 'approved')}
                        variant="outline"
                        size="sm"
                        disabled={updating === contribution.id}
                        className="border-success/50 hover:bg-success/10"
                      >
                        {updating === contribution.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 text-success" />
                        )}
                      </Button>
                      <Button
                        onClick={() => updateStatus(contribution.id, 'rejected')}
                        variant="outline"
                        size="sm"
                        disabled={updating === contribution.id}
                        className="border-destructive/50 hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
