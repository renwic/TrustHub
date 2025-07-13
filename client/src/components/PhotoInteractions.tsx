import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoInteractionsProps {
  testimonialId: number;
  photoIndex: number;
  className?: string;
}

interface PhotoLike {
  id: number;
  userId: string;
  createdAt: string;
}

interface PhotoComment {
  id: number;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function PhotoInteractions({ testimonialId, photoIndex, className }: PhotoInteractionsProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Fetch likes
  const { data: likes = [] } = useQuery<PhotoLike[]>({
    queryKey: [`/api/photos/${testimonialId}/${photoIndex}/likes`],
    enabled: isAuthenticated,
  });

  // Fetch comments
  const { data: comments = [] } = useQuery<PhotoComment[]>({
    queryKey: [`/api/photos/${testimonialId}/${photoIndex}/comments`],
    enabled: isAuthenticated,
  });

  // Check if current user liked this photo
  const userLiked = likes.some(like => like.userId === user?.id);

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/api/photos/${testimonialId}/${photoIndex}/like`, {
        method: "POST",
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/photos/${testimonialId}/${photoIndex}/likes`]
      });
      // Also invalidate PopRep scores
      queryClient.invalidateQueries({
        queryKey: ["/api/profiles"]
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest(`/api/photos/${testimonialId}/${photoIndex}/comment`, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/photos/${testimonialId}/${photoIndex}/comments`]
      });
      // Also invalidate PopRep scores
      queryClient.invalidateQueries({
        queryKey: ["/api/profiles"]
      });
      setNewComment("");
      toast({
        title: "Comment added!",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like photos.",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment on photos.",
        variant: "destructive",
      });
      return;
    }
    if (!newComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment before posting.",
        variant: "destructive",
      });
      return;
    }
    commentMutation.mutate(newComment.trim());
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return past.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Interaction buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={cn(
              "flex items-center space-x-2 transition-all duration-300 hover:scale-105",
              userLiked 
                ? "text-red-500 hover:text-red-600 bg-red-500/10" 
                : "text-white/70 hover:text-red-500 hover:bg-red-500/10"
            )}
          >
            <Heart className={cn(
              "w-5 h-5 transition-all duration-300", 
              userLiked && "fill-current scale-110"
            )} />
            <span className="font-medium">{likes.length}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className={cn(
              "flex items-center space-x-2 transition-all duration-300 hover:scale-105",
              showComments 
                ? "text-blue-400 bg-blue-400/10" 
                : "text-white/70 hover:text-blue-400 hover:bg-blue-400/10"
            )}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{comments.length}</span>
          </Button>
        </div>

        {/* Loading indicator */}
        {likeMutation.isPending && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
      </div>

      {/* Likes summary */}
      {likes.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-white/80">
            {likes.length === 1 
              ? "1 like" 
              : `${likes.length} likes`}
          </p>
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="space-y-3">
          {/* Comments list */}
          {comments.length > 0 && (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-white">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-white/70 bg-black/20 px-2 py-1 rounded-full">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-white/95 leading-relaxed break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state for comments */}
          {showComments && comments.length === 0 && (
            <div className="text-center py-6">
              <MessageCircle className="w-8 h-8 text-white/40 mx-auto mb-2" />
              <p className="text-sm text-white/60">No comments yet. Be the first to comment!</p>
            </div>
          )}

          {/* Add comment form */}
          <form onSubmit={handleComment} className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a thoughtful comment..."
                className="bg-white/15 border-white/30 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-pink-400 pr-12 py-3 rounded-xl shadow-lg backdrop-blur-sm"
                maxLength={500}
                disabled={commentMutation.isPending}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-white/50">
                {newComment.length}/500
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || commentMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {commentMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}