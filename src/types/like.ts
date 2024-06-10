export interface Like {
  id?: number;
  post_id: number;
  user_id: number;
  type: LikeType;
  created_at?: Date;
  updated_at?: Date;
}

export enum LikeType {
  LIKE = "like",
  DISLIKE = "dislike",
}
