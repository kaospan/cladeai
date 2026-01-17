import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTrackComments, useAddComment, useDeleteComment, useCommentCount } from '@/hooks/api/useComments';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface CommentsSheetProps {
  trackId: string;
  trackTitle: string;
}

export function CommentsSheet({ trackId, trackTitle }: CommentsSheetProps) {
  const [open, setOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: comments = [], isLoading } = useTrackComments(trackId);
  const { data: commentCount = 0 } = useCommentCount(trackId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      await addComment.mutateAsync({
        trackId,
        content: newComment.trim(),
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment.mutateAsync({ commentId, trackId });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-muted-foreground hover:text-foreground"
        >
          <div className="p-3 rounded-full bg-muted/50 hover:bg-muted transition-all relative">
            <MessageCircle className="w-6 h-6" />
            {commentCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {commentCount > 99 ? '99+' : commentCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Comments</span>
        </motion.button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Comments on "{trackTitle}"
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(80vh-8rem)]">
          {/* Comments list */}
          <ScrollArea className="flex-1 py-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-4 w-full bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3 mb-4 group"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={comment.user_avatar_url} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {comment.user_display_name?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.user_display_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 mt-1 break-words">
                        {comment.content}
                      </p>
                    </div>

                    {user?.id === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive"
                        onClick={() => handleDelete(comment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </ScrollArea>

          {/* Comment input */}
          <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t border-border">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Add a comment..." : "Sign in to comment"}
              className="flex-1"
              disabled={!user || addComment.isPending}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!newComment.trim() || addComment.isPending}
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
