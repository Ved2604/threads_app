import {NextApiRequest, NextApiResponse} from "next"
import { User } from "@/models/users.models"
import jwt,{JwtPayload} from 'jsonwebtoken'
import { Comment } from "@/models/comments.models"
import { formatComment } from "@/lib/formatComment"



export const CommentSchemastring=`
   type Comment{
        id:ID!
        content:String!
        postedby:User!
        parentThread:Thread! 
        createdAt:String!
    } 
    type Mutation{
        createComment(content:String!,parentThread:ID!):Comment
        updateComment(content:String!,commentId:ID!):String
        deleteComment(commentId:ID!):String
    }
`

export const createComment=async({content,parentThread}:{content:string,parentThread:string},context:{req:NextApiRequest,res:NextApiResponse})=>{  
    let accesstoken=context.req.cookies["accesstoken"] 
    
    if(!accesstoken){
     throw new Error('Login error')
    }
    const decodedToken = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload
    const loggedInUser = await User.findById(decodedToken?._id).select("-password -refreshToken") 
               
    if (!loggedInUser) {
     throw new Error("Invalid Access Token")
    } 
    
    if(!(content && parentThread)){
        throw new Error("Need content and parentthread to add a comment")
    } 
    const comment_created=await Comment.create({
        content:content,
        parentThread:parentThread,
        postedby:loggedInUser._id,
    })
    const comment=await Comment.findById(comment_created) 
    
    if(!comment){
        throw new Error("Error creating the comment") 
    } 
    return formatComment(comment)
}

export const updateComment=async ({content,commentId}:{content:string,commentId:number},context:{req:NextApiRequest,res:NextApiResponse})=>{
    let accesstoken=context.req.cookies["accesstoken"] 
    
    if(!accesstoken){
     throw new Error ('Login error')
    }
    const decodedToken = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload
    const loggedInUser = await User.findById(decodedToken?._id).select("-password -refreshToken") 
               
    if (!loggedInUser) {
     throw new Error("Invalid Access Token")
    } 
    if(!(content && commentId)){
      throw new Error("Content and CommentId are both required")   
    } 
    const comment_to_be_updated=await Comment.findById(commentId)
    
    if(!comment_to_be_updated){
        throw new Error("No Such Comment exists") 
    }
    /*
    // if(!comment_to_be_updated.postedby.equals(loggedInUser._id)){
        throw new Error("")
    }*/ 
    if(!comment_to_be_updated.postedby.equals(loggedInUser._id)){
        throw new Error("You can't update someone else's comment") 
    } 
    comment_to_be_updated.content=content;

    await comment_to_be_updated.save() 

    const comment=await Comment.findById(comment_to_be_updated._id) 

    if(!comment){
        throw new Error("Something went wrong while updating the comment") 
    }

    return "Comment updated Succesfully"  
} 

export const deleteComment=async({commentId}:{commentId:number},context:{req:NextApiRequest,res:NextApiResponse})=>{ 
    let accesstoken=context.req.cookies["accesstoken"] 
    
    if(!accesstoken){
     throw new Error('Login error')
    }
    const decodedToken = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload
    const loggedInUser = await User.findById(decodedToken?._id).select("-password -refreshToken") 
               
    if (!loggedInUser) {
     throw new Error("Invalid Access Token")
    } 
    if(!commentId){
        throw new Error("Id required to delete the comment")
    } 
    const comment_to_be_deleted=await Comment.findById(commentId)

    if(!comment_to_be_deleted){
        throw new Error("The comment that you wish to delete doesn't exist") 
    }
    
    if(!comment_to_be_deleted.postedby.equals(loggedInUser._id)){
        throw new Error("You can't delete someone else's comment") 
    } 
    
    await Comment.deleteOne({_id:commentId})
    
    return "Deleted the comment succesfully"
}
