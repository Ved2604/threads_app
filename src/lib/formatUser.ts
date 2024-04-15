import { Thread } from "@/models/threads.models"; 
import { formatthread } from "./formaththreads";
export const formatUser=(user:any)=>{
   return {
    id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    followers: user.followers,
    following: user.following,
    threads: async () => {
      const threads = await Thread.find({ owner: user._id });

      const threads_to_be_returned=threads.map(thread=>{
        return formatthread(thread)
      })

      return threads_to_be_returned;
    },
  };

}