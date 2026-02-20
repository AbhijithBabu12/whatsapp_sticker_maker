import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [maxDuration, setMaxDuration] = useState(17);
  const [quality, setQuality] = useState(60);
  const [speed, setSpeed] = useState(1.0);
  const [cropStart, setCropStart] = useState(0);
  const [cropEnd, setCropEnd] = useState('');

  const getQualityResolution = (q) => {
    if (q >= 20 && q <= 30) return '240p';
    if (q >= 31 && q <= 50) return '360p';
    if (q >= 51 && q <= 70) return '480p';
    if (q >= 71 && q <= 90) return '720p';
    if (q >= 91 && q <= 100) return '1080p';
    return 'Auto';
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setCropStart(0);
      setCropEnd('');
      setSpeed(1.0);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        
        // Get video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          const duration = Math.floor(video.duration);
          setVideoDuration(duration);
          setMaxDuration(Math.min(duration, 17));
          setCropEnd(duration.toString());
        };
        video.src = reader.result;
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a video file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('max_duration', maxDuration);
    formData.append('quality', quality);
    formData.append('speed', speed);
    formData.append('crop_start', cropStart);
    if (cropEnd) {
      formData.append('crop_end', cropEnd);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/convert`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to convert video. Make sure ffmpeg is installed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result && result.file_id) {
      window.open(`${API_BASE_URL}/download/${result.file_id}`, '_blank');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setVideoDuration(0);
    setResult(null);
    setError(null);
    setMaxDuration(17);
    setQuality(60);
    setSpeed(1.0);
    setCropStart(0);
    setCropEnd('');
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🎬 WhatsApp Sticker Maker</h1>
          <p>Convert your videos to WhatsApp stickers</p>
        </header>

        <div className="main-content">
          <div className="upload-section">
            <div className="upload-area">
              {!preview ? (
                <label htmlFor="file-upload" className="upload-label">
                  <div className="upload-icon">📁</div>
                  <p>Click to select a video file</p>
                  <p className="file-types">Supports: MP4, AVI, MOV, MKV, WEBM, GIF</p>
                  <input
                    id="file-upload"
                    type="file"
                    accept="video/*,.gif"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                </label>
              ) : (
                <div className="preview-container">
                  <video
                    src={preview}
                    controls
                    className="preview-video"
                  />
                  <button onClick={handleReset} className="remove-btn">
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            {file && (
              <div className="settings-panel">
                <h3 className="settings-title">⚙️ Conversion Settings</h3>
                
                <div className="setting-item">
                  <label>
                    Speed: {speed}x
                    <input
                      type="range"
                      min="0.25"
                      max="4"
                      step="0.25"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="slider"
                    />
                    <small>0.25x (slow) to 4x (fast)</small>
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    Crop Video (Time Range)
                  </label>
                  <div className="crop-controls">
                    <div className="crop-input-group">
                      <label className="crop-label">Start (seconds):</label>
                      <input
                        type="number"
                        min="0"
                        max={videoDuration}
                        step="0.1"
                        value={cropStart}
                        onChange={(e) => setCropStart(parseFloat(e.target.value) || 0)}
                        className="crop-input"
                      />
                    </div>
                    <div className="crop-input-group">
                      <label className="crop-label">End (seconds):</label>
                      <input
                        type="number"
                        min={cropStart}
                        max={videoDuration}
                        step="0.1"
                        value={cropEnd}
                        onChange={(e) => setCropEnd(e.target.value)}
                        placeholder={videoDuration.toString()}
                        className="crop-input"
                      />
                    </div>
                  </div>
                  <small>Leave end empty to use full video length</small>
                </div>

                <div className="setting-item">
                  <label>
                    Max Duration (seconds): {maxDuration}s
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={maxDuration}
                      onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                      className="slider"
                    />
                    <small>Maximum length for WhatsApp sticker</small>
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    Quality: {quality}
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="slider"
                    />
                    <div className="quality-info">
                      <small>Lower = smaller file size</small>
                      <span className="resolution-badge">
                        📐 Resolution: {getQualityResolution(quality)}
                      </span>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleConvert}
                  disabled={loading}
                  className="convert-btn"
                >
                  {loading ? 'Converting...' : 'Convert to Sticker'}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {result && (
            <div className="result-section">
              <div className="result-card">
                <h3>✅ Conversion Successful!</h3>
                <div className="result-info">
                  <p><strong>File Size:</strong> {result.size_kb} KB</p>
                  {result.warning && (
                    <p className="warning">
                      ⚠️ File exceeds WhatsApp's 1MB limit. Try reducing quality or duration.
                    </p>
                  )}
                </div>
                <button onClick={handleDownload} className="download-btn">
                  📥 Download Sticker
                </button>
                <button onClick={handleReset} className="reset-btn">
                  🔄 Convert Another
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="footer">
          <p>Made with ❤️ for WhatsApp sticker lovers</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
