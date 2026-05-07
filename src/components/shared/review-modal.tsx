import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { socialService } from "@/services/social.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingUid: string;
  serviceName: string;
}

export function ReviewModal({ isOpen, onClose, bookingUid, serviceName }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }
    
    setSubmitting(true);
    try {
      await socialService.createReview({
        bookingUid,
        rating,
        comment,
        images
      });
      toast.success("Review submitted! Thank you.");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const addImageUrl = () => {
    if (imageUrlInput && images.length < 5) {
      setImages([...images, imageUrlInput]);
      setImageUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-card rounded-3xl overflow-hidden shadow-2xl border border-glass-border"
      >
        <div className="p-6 border-b border-glass-border flex justify-between items-center bg-muted/50">
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Leave a Review</h2>
            <p className="text-xs font-medium text-foreground/60 mt-1">for {serviceName}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-background flex items-center justify-center hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3 flex flex-col items-center">
            <label className="text-sm font-bold text-foreground/60">How was your experience?</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={cn(
                      "h-10 w-10 transition-colors",
                      (hoverRating || rating) >= star ? "fill-accent text-accent" : "text-muted-foreground fill-muted"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80">Share your thoughts</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked (or didn't like)..."
              className="w-full h-32 p-4 bg-background border border-glass-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-foreground/80 flex items-center justify-between">
              Attach Photos
              <span className="text-xs text-foreground/40">{images.length}/5</span>
            </label>
            
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-glass-border">
                    <img src={img} alt="review attachment" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 h-5 w-5 bg-black/50 rounded-full flex items-center justify-center text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {images.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste image URL here..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 h-10 px-3 text-sm bg-background border border-glass-border rounded-lg"
                />
                <Button type="button" onClick={addImageUrl} variant="outline" className="h-10 px-4">
                  Add
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-muted/30 border-t border-glass-border">
          <Button 
            className="w-full h-12 rounded-xl font-bold text-base" 
            onClick={handleSubmit} 
            disabled={rating === 0 || submitting}
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Review"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
