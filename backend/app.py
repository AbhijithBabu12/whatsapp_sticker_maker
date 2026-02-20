from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import subprocess
import uuid
from werkzeug.utils import secure_filename
import tempfile

app = Flask(__name__)
# Enable CORS - Update origins for production
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "https://*.netlify.app",
            "https://*.netlify.com"
        ]
    }
})

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
MAX_DURATION = 17  # seconds
MAX_SIZE = 512  # pixels
MAX_FILE_SIZE = 1024 * 1024  # 1 MB

# Allowed video extensions
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm', 'gif'}

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def video_to_whatsapp_sticker(input_video_path, output_webp_path, max_duration=17, quality=60, speed=1.0, crop_start=0, crop_end=None):
    """
    Convert video to WhatsApp sticker using ffmpeg
    """
    try:
        # Build filter chain
        filters = []
        
        # Speed filter (setpts)
        if speed != 1.0:
            filters.append(f"setpts={1.0/speed}*PTS")
        
        # Scale and pad
        filters.append(f"scale={MAX_SIZE}:{MAX_SIZE}:force_original_aspect_ratio=decrease")
        filters.append(f"pad={MAX_SIZE}:{MAX_SIZE}:(ow-iw)/2:(oh-ih)/2:color=0x00000000")
        filters.append("fps=10")
        
        filter_chain = ",".join(filters)
        
        # Build command
        command = [
            "ffmpeg",
            "-y",
            "-i", input_video_path,
        ]
        
        # Add crop/trim if specified
        if crop_start > 0 or crop_end:
            if crop_end:
                duration = crop_end - crop_start
            else:
                duration = max_duration
            command.extend(["-ss", str(crop_start)])
            command.extend(["-t", str(min(duration, max_duration))])
        else:
            command.extend(["-t", str(max_duration)])
        
        # Add video filters
        command.extend(["-vf", filter_chain])
        
        # Add output options
        command.extend([
            "-loop", "0",
            "-an",
            "-vsync", "0",
            "-c:v", "libwebp",
            "-lossless", "0",
            "-q:v", str(quality),
            "-compression_level", "6",
            "-preset", "picture",
            output_webp_path
        ])
        
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True
        )
        
        return True, None
    except subprocess.CalledProcessError as e:
        return False, str(e.stderr)
    except Exception as e:
        return False, str(e)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Server is running"})

@app.route('/api/convert', methods=['POST'])
def convert_video():
    """Convert uploaded video to WhatsApp sticker"""
    try:
        # Check if file is present
        if 'video' not in request.files:
            return jsonify({"error": "No video file provided"}), 400
        
        file = request.files['video']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Allowed: mp4, avi, mov, mkv, webm, gif"}), 400
        
        # Get optional parameters
        max_duration = int(request.form.get('max_duration', MAX_DURATION))
        quality = int(request.form.get('quality', 60))
        speed = float(request.form.get('speed', 1.0))
        crop_start = float(request.form.get('crop_start', 0))
        crop_end_str = request.form.get('crop_end', '')
        crop_end = float(crop_end_str) if crop_end_str else None
        
        # Validate parameters
        speed = max(0.25, min(4.0, speed))  # Limit speed between 0.25x and 4x
        crop_start = max(0, crop_start)
        if crop_end and crop_end <= crop_start:
            crop_end = None
        
        # Generate unique filenames
        file_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        input_path = os.path.join(UPLOAD_FOLDER, f"{file_id}.{file_ext}")
        output_path = os.path.join(OUTPUT_FOLDER, f"{file_id}.webp")
        
        # Save uploaded file
        file.save(input_path)
        
        # Convert to sticker
        success, error = video_to_whatsapp_sticker(
            input_path,
            output_path,
            max_duration=max_duration,
            quality=quality,
            speed=speed,
            crop_start=crop_start,
            crop_end=crop_end
        )
        
        if not success:
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            return jsonify({"error": f"Conversion failed: {error}"}), 500
        
        # Check file size
        file_size = os.path.getsize(output_path)
        file_size_kb = file_size / 1024
        
        # Clean up input file
        if os.path.exists(input_path):
            os.remove(input_path)
        
        return jsonify({
            "success": True,
            "file_id": file_id,
            "filename": f"{file_id}.webp",
            "size_kb": round(file_size_kb, 2),
            "size_bytes": file_size,
            "warning": file_size > MAX_FILE_SIZE
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/download/<file_id>', methods=['GET'])
def download_sticker(file_id):
    """Download the converted sticker"""
    try:
        file_path = os.path.join(OUTPUT_FOLDER, f"{file_id}.webp")
        
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        return send_file(
            file_path,
            mimetype='image/webp',
            as_attachment=True,
            download_name='sticker.webp'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/cleanup/<file_id>', methods=['DELETE'])
def cleanup_file(file_id):
    """Clean up generated sticker file"""
    try:
        file_path = os.path.join(OUTPUT_FOLDER, f"{file_id}.webp")
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({"success": True, "message": "File deleted"}), 200
        else:
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Flask server...")
    print("📁 Upload folder:", os.path.abspath(UPLOAD_FOLDER))
    print("📁 Output folder:", os.path.abspath(OUTPUT_FOLDER))
    app.run(debug=True, host='0.0.0.0', port=5000)
