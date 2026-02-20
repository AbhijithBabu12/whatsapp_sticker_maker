# WhatsApp Sticker Maker 🎬

A full-stack web application to convert video files into WhatsApp stickers. Built with Flask (backend) and React (frontend).

## Features

- 📹 Upload video files (MP4, AVI, MOV, MKV, WEBM, GIF)
- 🎨 Convert videos to WhatsApp-compatible WebP stickers
- ⚙️ Adjustable quality and duration settings
- 📱 Optimized for WhatsApp's 1MB file size limit
- 🎯 Real-time preview and download

## Prerequisites

Before running the application, make sure you have:

1. **Python 3.8+** installed
2. **Node.js 16+** and npm installed
3. **FFmpeg** installed and accessible in your system PATH

### Installing FFmpeg

**Windows:**
- Download from [FFmpeg website](https://ffmpeg.org/download.html)
- Extract and add to PATH, or use chocolatey: `choco install ffmpeg`

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install ffmpeg
```

## Project Structure

```
sticker_making_and_video_editing/
├── backend/
│   ├── app.py              # Flask backend server
│   ├── requirements.txt    # Python dependencies
│   ├── uploads/           # Temporary upload folder (auto-created)
│   └── outputs/           # Generated stickers folder (auto-created)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json       # Node dependencies
└── README.md
```

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

## Running the Application

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd backend
python app.py
```

The Flask server will start on `http://localhost:5000`

### Step 2: Start the Frontend Development Server

Open a **new terminal** and run:

```bash
cd frontend
npm start
```

The React app will automatically open in your browser at `http://localhost:3000`

## Usage

1. **Upload a Video**: Click the upload area and select a video file
2. **Adjust Settings** (optional):
   - **Max Duration**: Set maximum duration in seconds (default: 17s)
   - **Quality**: Adjust quality slider (lower = smaller file size)
3. **Convert**: Click "Convert to Sticker" button
4. **Download**: Once conversion is complete, click "Download Sticker"
5. **Use in WhatsApp**: 
   - Open WhatsApp
   - Go to any chat
   - Tap the emoji icon → Stickers → Add sticker
   - Select the downloaded `.webp` file

## API Endpoints

### `GET /api/health`
Health check endpoint

### `POST /api/convert`
Convert video to sticker
- **Body**: `multipart/form-data`
  - `video`: Video file
  - `max_duration`: (optional) Maximum duration in seconds
  - `quality`: (optional) Quality value (20-100)

### `GET /api/download/<file_id>`
Download converted sticker

### `DELETE /api/cleanup/<file_id>`
Delete generated sticker file

## Troubleshooting

### FFmpeg not found
- Make sure FFmpeg is installed and added to your system PATH
- Test by running `ffmpeg -version` in terminal

### Port already in use
- Backend: Change port in `backend/app.py` (line: `app.run(..., port=5000)`)
- Frontend: React will prompt to use a different port automatically

### CORS errors
- Make sure backend is running before starting frontend
- Check that backend URL in `frontend/src/App.js` matches your backend port

### File size too large
- Reduce the `max_duration` setting
- Lower the `quality` value
- Use shorter video clips

## Production Deployment

For production:

1. **Backend**: Use a production WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

2. **Frontend**: Build the React app:
```bash
cd frontend
npm run build
```
Serve the `build` folder with a web server like Nginx or serve it from your Flask app.

## License

MIT License - Feel free to use and modify!

## Support

If you encounter any issues, please check:
- FFmpeg installation
- Python and Node.js versions
- File permissions for uploads/outputs folders
