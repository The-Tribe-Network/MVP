import type { CommentWithStats } from "@/lib/api/comments";

/**
 * UI-friendly Comment interface
 * Matches the Comment interface expected by CommentItem component
 */
export interface CommentUIData {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
  isLiked?: boolean;
}

/**
 * Transform API comment data (CommentWithStats) to UI-friendly Comment interface
 * Eliminates duplication between index.tsx and comments-section.tsx
 */
export function transformCommentForUI(comment: CommentWithStats): CommentUIData {
  return {
    id: comment.id,
    author: {
      id: comment.author.id,
      name: comment.author.name || 'Unknown',
      username: comment.author.username ? `@${comment.author.username}` : '@user',
      avatar: comment.author.image || '/placeholder.svg',
    },
    content: comment.content,
    timestamp: comment.createdAt,
    likes: comment.likeCount,
    isLiked: comment.isLiked,
  };
}

/**
 * Transform array of API comments to UI-friendly format
 */
export function transformCommentsForUI(comments: CommentWithStats[]): CommentUIData[] {
  return comments.map(transformCommentForUI);
}
