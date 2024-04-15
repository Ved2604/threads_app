import type { NextApiRequest, NextApiResponse } from "next";   
import { execute,parse } from "graphql"; 
import { makeExecutableSchema } from "@graphql-tools/schema"; 
import { connect } from "@/lib/dbconfig";
import { UserSchemastring,changePassword, followUser, login, logout, signup,unfollowUser, user, users,loggedInUser } from "@/graphql_module/user.grapqhl";
import { ThreadSchemastring, changeThread, createThread, deleteThread, dislikeThread, likeThread, thread, threads } from "@/graphql_module/thread.grapqhl";
import { CommentSchemastring, createComment, deleteComment, updateComment } from "@/graphql_module/comment.grapqhl";


const root={
  signup:signup,
  login:login,
  followUser:followUser,
  unfollowUser:unfollowUser,
  logout:logout,
  changePassword:changePassword,
  user:user,
  users:users,
  loggedInUser:loggedInUser, 
  thread:thread,
  threads:threads,
  createThread:createThread,
  likeThread:likeThread,
  dislikeThread:dislikeThread,
  changeThread:changeThread,
  deleteThread:deleteThread,
  createComment:createComment,
  updateComment:updateComment,
  deleteComment:deleteComment
}


export default async (req: NextApiRequest, res: NextApiResponse) => { 

    await connect();
    if(req.method=='GET'){
        res.send('db connected succesfully')
    }
    if ( req.method === 'POST') {
      const { query, variables } = req.body; 

      const context={res,req}
      ;

const schema=makeExecutableSchema({
  typeDefs:[UserSchemastring,ThreadSchemastring,CommentSchemastring],
})
  
      // Process the GraphQL query
      const result = await execute({
        schema,
        document: parse(query),
        variableValues: variables,
        rootValue:root,
        contextValue:context
      });
  
      res.status(200).json(result);
    } else {
      res.setHeader('Allow', ['POST','GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  };   