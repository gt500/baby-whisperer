import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cryDatabase, categories, CryCategory } from "@/data/cryDatabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DatabaseViewProps {
  onBack: () => void;
}

const DatabaseView = ({ onBack }: DatabaseViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState<CryCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCryId, setSelectedCryId] = useState<string | null>(null);

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
                <Volume2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
                <DialogTitle className="text-2xl font-bold mb-4">
                  {selectedCry.name}
                </DialogTitle>
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
                    <Volume2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-1">Audio Pattern</div>
                      <div className="text-sm text-muted-foreground">{selectedCry.audioPattern}</div>
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
