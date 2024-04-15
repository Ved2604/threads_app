import { User } from "@/models/users.models" 
import { Comment } from "@/models/comments.models" 
import { formatComment } from "./formatComment" 
import { formatUser } from "./formatUser"

export const formatthread=(thread:any)=>{
   return{
    id:thread._id,
    content: thread.content,
    owner:async ()=>{
        const user=await User.findById(thread.owner)
        return formatUser(user)
    },
    liked_by: ()=>{
        const users_who_liked=thread.liked_by
        return users_who_liked.map(async (userid:any)=>{
            const user=await User.findById(userid)
            return formatUser(user)
        })
    },
    comments: async () => {
        const comments = await Comment.find({ parentThread: thread._id });
        return comments.map((comment: any) => {
            return formatComment(comment);
        });
    }
    }
   }
