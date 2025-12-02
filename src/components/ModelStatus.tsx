import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadModel, getModelInfo, resetModelState, getLoadError } from "@/lib/modelInference";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ModelStatus = () => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const initModel = async () => {
    setStatus("loading");
    setErrorMessage(null);
    
    try {
      await loadModel();
      const info = getModelInfo();
      
      if (info && info.loaded) {
        setStatus("loaded");
        setErrorMessage(null);
      } else {
        setStatus("error");
        setErrorMessage(info?.error || getLoadError() || "Unknown error");
      }
    } catch (error) {
      console.error("[ModelStatus] Failed to load model:", error);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    resetModelState();
    await initModel();
    setIsRetrying(false);
  };

  useEffect(() => {
    initModel();
  }, []);

  if (status === "loading" || isRetrying) {
    return (
      <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/30">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        {isRetrying ? "Retrying..." : "Loading AI Model..."}
      </Badge>
    );
  }

  if (status === "error") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/30 cursor-help">
                <AlertCircle className="w-3 h-3 mr-1" />
                Fallback Mode
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={handleRetry}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm font-medium mb-1">Model Loading Failed</p>
            <p className="text-xs text-muted-foreground">{errorMessage || "Unknown error"}</p>
            <p className="text-xs mt-1">Click refresh to retry</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge variant="outline" className="bg-success/10 text-success-foreground border-success/30">
      <CheckCircle2 className="w-3 h-3 mr-1" />
      AI Ready
    </Badge>
  );
};

export default ModelStatus;
