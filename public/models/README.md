# Baby Cry Detection Model Setup

## Convert Your Model

The uploaded `baby_cry_detector.h5` file needs to be converted to TensorFlow.js format before it can run in the browser.

### Installation

```bash
pip install tensorflowjs
```

### Conversion Command

```bash
tensorflowjs_converter --input_format=keras baby_cry_detector.h5 ./public/models/baby_cry_detector
```

This will create:
- `model.json` - Model architecture
- `group1-shard1of1.bin` - Model weights

### Expected Structure

```
public/models/
├── baby_cry_detector/
│   ├── model.json
│   └── group1-shard1of1.bin
├── baby_cry_detector.h5 (original)
└── README.md
```

### Fallback Mode

Until the model is converted, the app will run in "Fallback Mode" which uses audio characteristics (volume, energy) to simulate cry detection. This allows you to test the UI and functionality while preparing the real model.
