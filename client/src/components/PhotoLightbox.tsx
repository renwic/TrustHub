import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PhotoInteractions from "@/components/PhotoInteractions";
import { X, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";

interface PhotoLightboxProps {
  photos: string[];
  descriptions: string[];
  initialPhotoIndex: number;
  isOpen: boolean;
  onClose: () => void;
  authorName?: string;
  profileName?: string;
  testimonialId?: number;
}

export default function PhotoLightbox({
  photos,
  descriptions,
  initialPhotoIndex,
  isOpen,
  onClose,
  authorName,
  profileName,
  testimonialId
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialPhotoIndex);
    setImageLoaded(false);
  }, [initialPhotoIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const goToNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setImageLoaded(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setImageLoaded(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Photo shared by ${authorName}`,
          text: descriptions[currentIndex] || `Photo from ${authorName}'s prop for ${profileName}`,
          url: photos[currentIndex]
        });
      } catch (err) {
        // Fallback to copy URL
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(photos[currentIndex]);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photos[currentIndex];
    link.download = `photo-${currentIndex + 1}-${authorName?.replace(/\s+/g, '-').toLowerCase()}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-full max-h-[95vh] p-0 bg-black/95 border-0">
        <DialogTitle className="sr-only">
          Photo by {authorName} from prop for {profileName}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {descriptions[currentIndex] || `Photo ${currentIndex + 1} of ${photos.length}`}
        </DialogDescription>
        <div className="relative w-full h-full flex flex-col">
          {/* Header with controls */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex-1">
                <h3 className="font-semibold text-lg truncate">
                  Photo by {authorName}
                </h3>
                {profileName && (
                  <p className="text-sm text-white/80">
                    From prop for {profileName}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {photos.length > 1 && (
                  <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                    {currentIndex + 1} of {photos.length}
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main image area */}
          <div className="flex-1 flex items-center justify-center relative p-4 pt-20 pb-24">
            {/* Navigation arrows */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 rounded-full w-12 h-12 disabled:opacity-30"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={goToNext}
                  disabled={currentIndex === photos.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 rounded-full w-12 h-12 disabled:opacity-30"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Loading state */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}

            {/* Main image */}
            <img
              src={photos[currentIndex]}
              alt={descriptions[currentIndex] || `Photo ${currentIndex + 1}`}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                setImageLoaded(true);
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'flex';
              }}
            />
            
            {/* Error fallback */}
            <div 
              className="flex flex-col items-center justify-center text-white/60 hidden"
              style={{display: 'none'}}
            >
              <X className="w-16 h-16 mb-4" />
              <p>Failed to load image</p>
            </div>
          </div>

          {/* Caption and interaction area */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6 text-white">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Photo interactions */}
              {testimonialId && (
                <PhotoInteractions
                  testimonialId={testimonialId}
                  photoIndex={currentIndex}
                  className="mb-4"
                />
              )}
              
              {/* Caption */}
              {descriptions[currentIndex] && (
                <p className="text-lg leading-relaxed">
                  {descriptions[currentIndex]}
                </p>
              )}
            </div>
          </div>

          {/* Thumbnail strip for multiple photos */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
              <div className="flex space-x-2 bg-black/50 backdrop-blur-sm rounded-full p-2">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setImageLoaded(false);
                    }}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                      index === currentIndex 
                        ? 'border-white scale-110' 
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}