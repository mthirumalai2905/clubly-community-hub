import { useState } from "react";
import { Send, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarDisplay } from "@/components/AvatarPicker";
import { useAuth } from "@/hooks/useAuth";
import { useFeedInteractions, FeedComment } from "@/hooks/useFeedInteractions";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface FeedCommentsProps {
  itemId: string;
  itemType: "event" | "club";
  isOpen: boolean;
  onClose: () => void;
}

export const FeedComments = ({ itemId, itemType, isOpen, onClose }: FeedCommentsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { comments, commentsLoading, addComment, deleteComment } = useFeedInteractions(itemId, itemType);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    await addComment(newComment);
    setNewComment("");
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="border-t border-border/50 bg-muted/30">
      {/* Comments list */}
      <div className="max-h-64 overflow-y-auto p-3 space-y-3">
        {commentsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwner={user?.id === comment.user_id}
              onDelete={() => deleteComment(comment.id)}
              onNavigate={(userId) => navigate(`/profile/${userId}`)}
            />
          ))
        )}
      </div>

      {/* Add comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="p-3 border-t border-border/50 flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1"
            disabled={submitting}
          />
          <Button type="submit" size="icon" disabled={!newComment.trim() || submitting}>
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      )}
    </div>
  );
};

interface CommentItemProps {
  comment: FeedComment;
  isOwner: boolean;
  onDelete: () => void;
  onNavigate: (userId: string) => void;
}

const CommentItem = ({ comment, isOwner, onDelete, onNavigate }: CommentItemProps) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  return (
    <div className="flex gap-2 group">
      <button onClick={() => onNavigate(comment.user_id)}>
        <AvatarDisplay
          avatarUrl={comment.profile?.avatar_url || null}
          username={comment.profile?.username}
          size="sm"
        />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(comment.user_id)}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            {comment.profile?.username || "User"}
          </button>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-foreground/80 break-words">{comment.content}</p>
      </div>
      {isOwner && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        >
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );
};
