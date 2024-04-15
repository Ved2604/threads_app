import { User } from "@/models/users.models"
import { formatUser } from "./formatUser" 
import { Thread } from "@/models/threads.models"
import { formatthread } from "./formaththreads"

export const formatComment=(comment:any)=>{ 
    return { 
        id:comment._id,
        content:comment.content,
        postedby:async()=>{
            const user=await User.findById(comment.postedby)
            return formatUser(user)
        },
        createdAt:comment.createdAt.toLocaleDateString(),
        parentThread:async ()=>{
            const thread=await Thread.findById(comment.parentThread) 
            if(!thread){
                throw new Error("Parent Thread not found")
            }
            return formatthread(thread)
        }
    }

} 