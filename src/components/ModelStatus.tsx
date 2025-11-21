import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { loadModel, getModelInfo } from "@/lib/modelInference";

const ModelStatus = () => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [modelInfo, setModelInfo] = useState<any>(null);

  useEffect(() => {
    const initModel = async () => {
      try {
        await loadModel();
        const info = getModelInfo();
        setModelInfo(info);
        
        // Check if model actually loaded
        if (info && info.loaded) {
          setStatus("loaded");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Failed to load model:", error);
        setStatus("error");
      }
    };

    initModel();
  }, []);

  if (status === "loading") {
    return (
      <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/30">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Loading AI Model...
      </Badge>
    );
  }

  if (status === "error") {
    return (
      <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/30">
        <AlertCircle className="w-3 h-3 mr-1" />
        Fallback Mode
      </Badge>
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
