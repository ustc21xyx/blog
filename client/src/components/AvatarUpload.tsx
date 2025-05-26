import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface AvatarUploadProps {
  currentAvatar?: string;
  displayName: string;
  onAvatarChange: (file: File | null) => void;
  onAvatarUrl?: (url: string) => void;
  loading?: boolean;
}

const AvatarUpload = ({ 
  currentAvatar, 
  displayName, 
  onAvatarChange, 
  onAvatarUrl,
  loading = false 
}: AvatarUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isDragging, setIsDragging] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);

    onAvatarChange(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUrlSubmit = () => {
    if (!avatarUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(avatarUrl);
      setPreview(avatarUrl);
      onAvatarUrl?.(avatarUrl);
      setShowUrlInput(false);
      setAvatarUrl('');
      toast.success('Avatar URL updated');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const handleRemoveAvatar = () => {
    setPreview(null);
    onAvatarChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative group">
        <div
          className={`relative w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-600 overflow-hidden cursor-pointer transition-all duration-300 ${
            isDragging ? 'border-anime-purple-500 scale-105' : 'hover:border-anime-purple-400'
          } ${loading ? 'animate-pulse' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          {preview ? (
            <img
              src={preview}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-anime-purple-500 to-anime-pink-500 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {displayName[0]?.toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Remove Button */}
        {preview && !loading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveAvatar();
            }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          PNG, JPG, GIF up to 5MB
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="anime-button-secondary px-4 py-2 text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
        
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={loading}
          className="anime-button-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Use URL
        </button>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="w-full max-w-sm"
        >
          <div className="flex gap-2">
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Enter image URL..."
              className="anime-input text-sm flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUrlSubmit();
                }
              }}
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="anime-button-primary px-3 py-2 text-sm"
            >
              Set
            </button>
          </div>
        </motion.div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;