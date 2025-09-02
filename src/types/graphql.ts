export type User={
    id:string;
    name:string;
    email:string;
    role:string;
    // posts: [PostWithoutUser]
}
export type Message = {
  id: string;
  text: any;
  user: User;
};
type PostWithoutUser = {
    id: string;
    title: string;
    content: string
  }
export type Post = {
  id: string;
  title: string;
  content: string;
  author: User;
};

export type FeedData = {
  feed: Post[];
};