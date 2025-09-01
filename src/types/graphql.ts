export type User={
    id:string;
    name:string;
    email:string;
    role:string;
}
export type Message = {
  id: string;
  text: any;
  user: User;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  author: User;
};

export type FeedData = {
  feed: Post[];
};