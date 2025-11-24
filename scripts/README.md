# Model Conversion Scripts

This directory contains scripts for converting the baby cry detector model to TensorFlow.js format.

## Quick Start

### Option 1: Automated Conversion (Recommended)

Run the automated conversion script:

```bash
python scripts/convert_model.py
```

This script will:
- ✓ Check if tensorflowjs is installed (installs if needed)
- ✓ Convert SavedModel to TensorFlow.js format
- ✓ Verify output files are created correctly
- ✓ Provide troubleshooting guidance if issues occur

### Option 2: Manual Conversion

If you prefer manual control:

1. Install tensorflowjs:
```bash
pip install tensorflowjs
```

2. Run the conversion:
```bash
tensorflowjs_converter \
  --input_format=tf_saved_model \
  --output_format=tfjs_layers_model \
  --signature_name=serving_default \
  public/models/saved_model \
  public/models/baby_cry_detector
```

## File Structure

**Input (SavedModel format):**
```
public/models/saved_model/
├── saved_model.pb          # Model architecture
├── fingerprint.pb          # Model fingerprint
└── variables/
    ├── variables.data-00000-of-00001
    └── variables.index
```

**Output (TensorFlow.js format):**
```
public/models/baby_cry_detector/
├── model.json              # Model architecture (JSON)
└── group1-shard1of1.bin    # Model weights (binary)
```

## Verification

After conversion, you should see:
- ✓ `public/models/baby_cry_detector/model.json` exists
- ✓ One or more `.bin` files in the same directory
- ✓ Console message: "Model loaded successfully" when running the app

## Troubleshooting

### Error: "SavedModel not found"
- Ensure files are in `public/models/saved_model/`
- Check that `saved_model.pb` exists

### Error: "tensorflowjs_converter not found"
- Install: `pip install tensorflowjs`
- Or run the automated script which installs it automatically

### Error: "Conversion failed"
- Check Python version (requires Python 3.7+)
- Verify all SavedModel files are present and not corrupted
- Try updating tensorflowjs: `pip install --upgrade tensorflowjs`

### Model loads but detection doesn't work
- Check browser console for errors
- Verify model input shape matches audio processing output
- See `MONETIZATION_ML_SETUP.md` for detailed testing instructions

## System Requirements

- Python 3.7 or higher
- pip (Python package manager)
- ~100MB free disk space for conversion
- Internet connection (for initial package installation)
