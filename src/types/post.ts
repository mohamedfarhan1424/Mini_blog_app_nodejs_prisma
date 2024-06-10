import { Category } from "./category";
import { Comment } from "./comment";
import { Like } from "./like";

export interface Post {
  id?: number;
  title: string;
  body: string;
  user_id: number;
  status?: PostStatus;
  likesCount?: number;
  dislikesCount?: number;
  categories?: Category[];
  comments?: Comment[];
  likes?: Like[];
  created_at?: Date;
  updated_at?: Date;
}

export enum PostStatus {
  DRAFT = "draft",
  ON_REVIEW = "on_review",
  ARCHIVED = "archived",
  PUBLISHED = "published",
}
