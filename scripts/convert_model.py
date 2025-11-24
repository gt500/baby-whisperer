#!/usr/bin/env python3
"""
Convert TensorFlow SavedModel to TensorFlow.js format
This script automates the conversion process for the baby cry detector model.
"""

import os
import sys
import subprocess

def check_tensorflowjs_installed():
    """Check if tensorflowjs_converter is installed"""
    try:
        result = subprocess.run(
            ['tensorflowjs_converter', '--version'],
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False

def install_tensorflowjs():
    """Install tensorflowjs package"""
    print("Installing tensorflowjs...")
    subprocess.run([sys.executable, '-m', 'pip', 'install', 'tensorflowjs'], check=True)
    print("✓ tensorflowjs installed successfully")

def convert_model():
    """Convert SavedModel to TensorFlow.js format"""
    # Paths
    saved_model_path = os.path.join('public', 'models', 'saved_model')
    output_path = os.path.join('public', 'models', 'baby_cry_detector')
    
    # Check if input exists
    if not os.path.exists(saved_model_path):
        print(f"❌ Error: SavedModel not found at {saved_model_path}")
        return False
    
    # Check if saved_model.pb exists
    if not os.path.exists(os.path.join(saved_model_path, 'saved_model.pb')):
        print(f"❌ Error: saved_model.pb not found in {saved_model_path}")
        return False
    
    print(f"Converting model from {saved_model_path} to {output_path}...")
    
    # Run conversion
    try:
        subprocess.run([
            'tensorflowjs_converter',
            '--input_format=tf_saved_model',
            '--output_format=tfjs_layers_model',
            '--signature_name=serving_default',
            saved_model_path,
            output_path
        ], check=True)
        
        print("✓ Conversion successful!")
        
        # Verify output files
        model_json = os.path.join(output_path, 'model.json')
        if os.path.exists(model_json):
            print(f"✓ Created: {model_json}")
            
            # Count .bin files
            bin_files = [f for f in os.listdir(output_path) if f.endswith('.bin')]
            print(f"✓ Created {len(bin_files)} weight file(s): {', '.join(bin_files)}")
            
            return True
        else:
            print(f"❌ Error: model.json not created at {model_json}")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Conversion failed: {e}")
        return False

def main():
    """Main conversion workflow"""
    print("=" * 60)
    print("Baby Cry Detector - Model Conversion Script")
    print("=" * 60)
    print()
    
    # Step 1: Check if tensorflowjs is installed
    if not check_tensorflowjs_installed():
        print("tensorflowjs not found. Installing...")
        try:
            install_tensorflowjs()
        except Exception as e:
            print(f"❌ Failed to install tensorflowjs: {e}")
            print("Please install manually: pip install tensorflowjs")
            return 1
    else:
        print("✓ tensorflowjs is already installed")
    
    print()
    
    # Step 2: Convert the model
    if convert_model():
        print()
        print("=" * 60)
        print("✓ SUCCESS! Model conversion complete")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Start your development server")
        print("2. The app will automatically load the TensorFlow.js model")
        print("3. Test the cry detection feature")
        print()
        return 0
    else:
        print()
        print("=" * 60)
        print("❌ FAILED - Conversion unsuccessful")
        print("=" * 60)
        print()
        print("Troubleshooting:")
        print("1. Ensure the SavedModel files are in public/models/saved_model/")
        print("2. Check that saved_model.pb exists")
        print("3. Verify variables/ folder contains the weight files")
        print()
        return 1

if __name__ == '__main__':
    sys.exit(main())
