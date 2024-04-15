import { formatthread } from "@/lib/formaththreads"
import { Thread } from "@/models/threads.models"
import { NextApiRequest, NextApiResponse } from "next" 
import jwt,{JwtPayload}  from "jsonwebtoken"
import { User } from "@/models/users.models"
import { Comment } from "@/models/comments.models"



export const ThreadSchemastring=`
    type Query{
        thread(id:ID!):Thread
        threads:[Thread!]
    }
    type Thread{
        id:ID!
        content:String!
        owner:User!
        liked_by: [User!]
        comments: [Comment!]
    }
    type Mutation{ 
       createThread(content: String!):Thread
       likeThread(threadId: ID!): String
       dislikeThread(threadId: ID!):String
       changeThread(threadId: ID!, content: String!):String
       deleteThread(threadId: ID!):String
    }
    `

export const thread=async ({id}:{id:string})=>{
    const thread_to_be_returned=await Thread.findById(id)

    return formatthread(thread_to_be_returned)
}

export const threads=async ()=>{
    const all_threads=await Thread.find().sort({updatedAt:-1}) 
    return all_threads.map(thread=>{
        return formatthread(thread)
    })
}

export const createThread=async({content}:{content:string},context:{req:NextApiRequest,res:NextApiResponse})=>{
    let accesstoken=context.req.cookies["accesstoken"] 
    

   if(!accesstoken){
    throw new Error('Login error')
   }
   const decodedToken = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload

  
  
  const loggedInUser = await User.findById(decodedToken?._id).select("-password -refreshToken") 

  

  if (!loggedInUser) {
            
    throw new Error("Invalid Access Token")
  } 

  if(!content){
    throw new Error("Content is require")
  }
  const new_thread=await Thread.create({
    content:content,
    owner:loggedInUser._id,
  })
  const thread=await Thread.findById(new_thread._id)
  if(!thread){throw new Error("Error while creating thread")}

  return formatthread(thread) 

} 

export const likeThread=async({threadId}:{threadId:number},context:{req:NextApiRequest,res:NextApiResponse})=>{ 
    let accesstoken=context.req.cookies["accesstoken"] 
    

   if(!accesstoken){
    throw new Error('Login error')
   }
   const decodedToken = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload

  
  
  const loggedInUser = await User.findById(decodedToken?._id).select("-password -refreshToken") 

  

  if (!loggedInUser) {
            
    throw new Error("Invalid Access Token")
  } 
  
  const threadliked=await Thread.findById(threadId) 

  if(!threadliked){
    throw new Error("The Thread doesn't exist")
  }
  
  //checing if the user has already like the thread 
  if(threadliked.liked_by.includes(loggedInUser._id)){
   throw new Error("You have already liked this thread") 
   } 
//adds the user to the liked by field 

  threadliked.liked_by.push(loggedInUser)
  threadliked.save() 

  return "Thread liked succesfully"
}

export const dislikeThread=async({threadId}:{threadId:number},context:{req:NextApiRequest,res:NextApiResponse})=>{
    let accesstoken=context.req.cookies["accesstoken"] 
    

    if(!accesstoken){
     throw new Error('Login error')
    }
    const decodedToken = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload
 
   
   
   const loggedInUser = await User.findById(decodedToken?._id).select("-password -refreshToken") 
 
   
 
   if (!loggedInUser) {
             
     throw new Error("Invalid Access Token")
   } 
  const thread_disliked=await Thread.findById(threadId)
  
  if(!thread_disliked.liked_by.includes(loggedInUser._id)){
   throw new Error("You haven't liked this thread before to dislike it") 
   }  

  thread_disliked.liked_by=thread_disliked.liked_by.filter((userId:any)=>!userId.equals(loggedInUser._id)) 

  await thread_disliked.save();

  return "Thread disliked succesfully"
   
}

export const changeThread=async({threadId,content}:{threadId:number, content:string},context:{req:NextApiRequest,res:NextApiResponse})=>{ 
    let accesstoken=context.req.cookies["accesstoken"] 
    
    if(!accesstoken){
     throw new Error('Login error')
    }
    const decodedToken = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload
    const loggedInUser = await User.findById(decodedToken?._id).select("-password -refreshToken") 
               
    if (!loggedInUser) {
     throw new Error("Invalid Access Token")
    } 

    if(!(threadId && content)){
        throw new Error("Thread ID and content are required")
    }
    const thread_to_be_updated=await Thread.findById(threadId) 

    
    if(!thread_to_be_updated){
        throw new Error("No such thread exists") 
    } 
    if(!thread_to_be_updated.owner.equals(loggedInUser._id)){
        throw new Error("You can't update someone else's thread")
    }
    
    thread_to_be_updated.content=content
    
    await thread_to_be_updated.save() 
    
    return "Thread updated succesfully" 
} 

export const deleteThread=async({threadId}:{threadId:number},context:{req:NextApiRequest}, )=>{  
    let accesstoken=context.req.cookies["accesstoken"] 
    
    if(!accesstoken){
     throw new Error('Login error')
    }
    const decodedToken = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload
    const loggedInUser = await User.findById(decodedToken?._id).select("-password -refreshToken") 
               
    if (!loggedInUser) {
     throw new Error("Invalid Access Token")
    } 

    const thread_to_be_deleted=await Thread.findOne({_id:threadId})

    if(!thread_to_be_deleted){
        throw new Error("The thread to be deleted doesnt't exist")

    } 
    if(!thread_to_be_deleted.owner.equals(loggedInUser._id)){
        throw new Error("You can't delete someone else's Thread") 
    }
    await Thread.deleteOne({_id:threadId})
    await Comment.deleteMany({parentThread:threadId})

    return "Thread deleted succesfully"
} 

