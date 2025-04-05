import { useState } from "react";
import { postsApi } from "@/lib/api-client";
import { Icon } from "@/components/ui/icons";

interface PostFormProps {
  userId: string;
  onPostSuccess?: () => void;
  replyToId?: string;
  placeholder?: string;
}

export function PostForm({
  userId,
  onPostSuccess,
  replyToId,
  placeholder = "What's happening?",
}: PostFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      if (replyToId) {
        // Create a reply to an existing post
        await postsApi.createReply(userId, replyToId, content);
      } else {
        // Create a new post
        await postsApi.createPost(userId, content);
      }

      // Clear the form and call success callback
      setContent("");
      if (onPostSuccess) {
        onPostSuccess();
      }
    } catch (err) {
      setError("Failed to create post. Please try again.");
      console.error("Post creation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const charLimit = 280;
  const remainingChars = charLimit - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <form onSubmit={handleSubmit} className="border-b border-border p-4">
      <div className="flex space-x-3">
        {/* User avatar */}
        <div className="flex-shrink-0">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
            {/* User avatar would go here if available */}
          </div>
        </div>

        {/* Input area */}
        <div className="min-w-0 flex-1">
          <textarea
            className="w-full resize-none bg-transparent px-0 py-2 text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            placeholder={placeholder}
            rows={3}
            maxLength={charLimit}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />

          {/* Divider */}
          <div className="mb-2 mt-3 h-px w-full bg-border"></div>

          {/* Actions and submit button */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2 text-primary">
              <button
                type="button"
                className="rounded-full p-2 hover:bg-primary/10"
              >
                <Icon name="image" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Character count */}
              <div
                className={
                  remainingChars < 20 ? "text-red-500" : "text-muted-foreground"
                }
              >
                {remainingChars}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || isOverLimit || !content.trim()}
                className="rounded-full bg-primary px-4 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : replyToId ? "Reply" : "Post"}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
        </div>
      </div>
    </form>
  );
}
