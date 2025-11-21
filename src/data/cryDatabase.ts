export type CryCategory = 
  | "dunstan"
  | "hunger"
  | "pain"
  | "sleep"
  | "fussy"
  | "attention"
  | "overstimulation"
  | "fear";

export interface CryType {
  id: string;
  name: string;
  category: CryCategory;
  audioPattern: string;
  intensity: "low" | "medium" | "high";
  description: string;
  solutions: string[];
  ageRange?: string;
}

export const cryDatabase: CryType[] = [
  // Dunstan Basic Sounds (0-3 months)
  {
    id: "neh",
    name: "Neh (Hungry)",
    category: "dunstan",
    audioPattern: "Short 'neh' sound with tongue at roof of mouth",
    intensity: "medium",
    description: "Sucking reflex creates 'neh' sound. Most common in first 3 months.",
    solutions: [
      "Offer breast or bottle immediately",
      "Check last feeding time",
      "Ensure proper latch"
    ],
    ageRange: "0-3 months"
  },
  {
    id: "owh",
    name: "Owh (Sleepy)",
    category: "dunstan",
    audioPattern: "Yawning reflex creates oval mouth shape - 'owh' sound",
    intensity: "low",
    description: "Yawning reflex signals tiredness. Baby needs rest.",
    solutions: [
      "Create calm, dark environment",
      "Swaddle baby gently",
      "Use white noise",
      "Rock or sway gently"
    ],
    ageRange: "0-3 months"
  },
  {
    id: "heh",
    name: "Heh (Discomfort)",
    category: "dunstan",
    audioPattern: "Breathy 'heh' with chest movement",
    intensity: "medium",
    description: "Indicates physical discomfort - too hot, cold, or needs position change.",
    solutions: [
      "Check diaper and change if needed",
      "Adjust clothing/temperature",
      "Change baby's position",
      "Burp if recently fed"
    ],
    ageRange: "0-3 months"
  },
  {
    id: "eairh",
    name: "Eairh (Lower Gas)",
    category: "dunstan",
    audioPattern: "Strained sound from lower belly",
    intensity: "medium",
    description: "Indicates gas or bowel movement is coming. Lower belly discomfort.",
    solutions: [
      "Bicycle baby's legs",
      "Gentle tummy massage clockwise",
      "Hold in 'colic hold' position",
      "Apply warm compress to tummy"
    ],
    ageRange: "0-3 months"
  },
  {
    id: "eh",
    name: "Eh (Burp Needed)",
    category: "dunstan",
    audioPattern: "Short 'eh' burst, air trying to escape",
    intensity: "low",
    description: "Air trapped in chest. Baby needs to burp.",
    solutions: [
      "Hold baby upright against shoulder",
      "Pat back gently",
      "Try different burping positions",
      "Pause feeding if actively eating"
    ],
    ageRange: "0-3 months"
  },
  
  // Extended Hunger Cries
  {
    id: "rhythmic-hunger",
    name: "Rhythmic Hunger Cry",
    category: "hunger",
    audioPattern: "Repetitive pattern: cry-pause-cry-pause",
    intensity: "medium",
    description: "Classic hunger cry. Escalates if not fed.",
    solutions: [
      "Feed immediately",
      "Check if cluster feeding time",
      "Ensure adequate milk supply"
    ]
  },
  {
    id: "frantic-hunger",
    name: "Frantic Hunger",
    category: "hunger",
    audioPattern: "Continuous, high-pitched, desperate",
    intensity: "high",
    description: "Baby is very hungry and upset. Feed immediately.",
    solutions: [
      "Calm baby before feeding if too upset",
      "Feed on demand",
      "Note time between feedings"
    ]
  },
  
  // Pain & Distress
  {
    id: "sharp-pain",
    name: "Sharp Pain Cry",
    category: "pain",
    audioPattern: "Sudden, high-pitched shriek",
    intensity: "high",
    description: "Indicates sharp or sudden pain. Long piercing cry followed by breath hold.",
    solutions: [
      "Check for injury or pinching",
      "Examine skin, clothing, diaper area",
      "Call doctor if cry persists",
      "Comfort and soothe baby"
    ]
  },
  {
    id: "illness-cry",
    name: "Illness/Fever Cry",
    category: "pain",
    audioPattern: "Weak, continuous whimpering",
    intensity: "medium",
    description: "Different from normal cries. May indicate illness.",
    solutions: [
      "Check temperature",
      "Look for other symptoms",
      "Contact pediatrician",
      "Keep baby hydrated"
    ]
  },
  {
    id: "colic-cry",
    name: "Colic Cry",
    category: "pain",
    audioPattern: "Intense, inconsolable for 3+ hours",
    intensity: "high",
    description: "Occurs at same time daily. Baby pulls legs to chest.",
    solutions: [
      "Use the '5 S's' method",
      "Try gripe water (consult doctor)",
      "Rule out allergies/reflux",
      "Seek support - colic is temporary"
    ]
  },
  
  // Sleep-Related
  {
    id: "overtired",
    name: "Overtired Cry",
    category: "sleep",
    audioPattern: "Escalating, frantic, difficult to soothe",
    intensity: "high",
    description: "Passed the sleepy window. Now too tired to settle.",
    solutions: [
      "Dim lights immediately",
      "Swaddle and rock",
      "Use white noise",
      "Avoid overstimulation"
    ]
  },
  {
    id: "sleep-transition",
    name: "Sleep Transition Cry",
    category: "sleep",
    audioPattern: "Brief bursts while sleeping",
    intensity: "low",
    description: "Normal during sleep cycles. Usually self-soothes.",
    solutions: [
      "Wait before intervening",
      "Use pacifier if needed",
      "Gentle pat or shush",
      "Don't fully wake baby"
    ]
  },
  
  // Fussy & Attention
  {
    id: "bored",
    name: "Bored/Lonely Cry",
    category: "attention",
    audioPattern: "Intermittent, stops when picked up",
    intensity: "low",
    description: "Wants interaction and stimulation.",
    solutions: [
      "Engage with baby",
      "Change scenery",
      "Play or sing",
      "Provide age-appropriate toys"
    ]
  },
  {
    id: "overstimulated",
    name: "Overstimulation Cry",
    category: "overstimulation",
    audioPattern: "Whiny, turning head away",
    intensity: "medium",
    description: "Too much noise, light, or activity. Needs calm.",
    solutions: [
      "Move to quiet, dim space",
      "Reduce stimulation",
      "Gentle rocking",
      "Allow wind-down time"
    ]
  },
  {
    id: "scared",
    name: "Scared/Startled Cry",
    category: "fear",
    audioPattern: "Sudden, loud shriek after startling",
    intensity: "high",
    description: "Response to loud noise or sudden movement.",
    solutions: [
      "Hold close and reassure",
      "Speak soothingly",
      "Rock gently",
      "Minimize sudden movements"
    ]
  },
  {
    id: "separation",
    name: "Separation Anxiety",
    category: "attention",
    audioPattern: "Escalating when parent leaves sight",
    intensity: "medium",
    description: "Developmental milestone around 6-8 months.",
    solutions: [
      "Practice short separations",
      "Stay calm and reassuring",
      "Develop goodbye routine",
      "Return as promised"
    ]
  }
];

export const categories: { value: CryCategory | "all"; label: string; color: string }[] = [
  { value: "all", label: "All Sounds", color: "bg-primary" },
  { value: "dunstan", label: "Dunstan Basics", color: "bg-accent" },
  { value: "hunger", label: "Hunger", color: "bg-warning" },
  { value: "pain", label: "Pain/Distress", color: "bg-destructive" },
  { value: "sleep", label: "Sleep", color: "bg-[hsl(260,50%,70%)]" },
  { value: "fussy", label: "Fussy", color: "bg-[hsl(40,60%,70%)]" },
  { value: "attention", label: "Attention", color: "bg-[hsl(200,60%,70%)]" },
  { value: "overstimulation", label: "Overstimulation", color: "bg-[hsl(30,60%,70%)]" },
  { value: "fear", label: "Fear/Scared", color: "bg-[hsl(0,60%,70%)]" },
];
