import { NextApiRequest,NextApiResponse } from "next";
import { User } from "@/models/users.models";
import { generateAccessAndRefereshTokens } from "@/lib/accestokens";
import jwt, { JwtPayload } from "jsonwebtoken";
import { formatUser } from "@/lib/formatUser";


export const UserSchemastring=`
    type Query{
      user(username:String!):User
      users: [User]
      loggedInUser:User
    } 
    type Mutation{
       signup(username:String!,email:String!,password:String!):String
       login(username:String,email:String,password:String!):User
       followUser(user_followed:String!):String 
       unfollowUser(user_unfollowed:String!):String
       logout:String
       changePassword(new_password:String!,old_password:String!):String
    }
    type User{
        id: ID!,
        username:String!
        email: String!
        followers: [String!]
        following:[String!]
        threads: [Thread!]        
        avatar:String
    }`
    
export const signup=async ({username,email,password}:{username:string,email:string,password:string})=>{ 
    if (
    [email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new Error("All fields are required")
  }     
    const existedUser = await User.findOne({
    $or: [{ username }, { email }]
   }) 
    if (existedUser){
  throw new Error("A User with this email or username already exists") 
  }
 let avatar=`https://robohash.org/${username}` 

    const newuser = await User.create({
   username:username.toLowerCase(),
   email,
   password,
   avatar
    }) 
  
    const createdUser = await User.findById(newuser._id).select(
  "-password -refreshToken"
   ) 
   if (!createdUser) {
    throw new Error("Something went wrong while registering the user")
   } 

   return "User has been registered succesfully" 
}

export const login=async({username,email,password}:{username:string,email:string,password:string},context: { res: NextApiResponse })=>{ 
  if (!username && !email) {
    throw new Error("username or email is required") 
  }
  const user = await User.findOne({
  $or: [{username}, {email}]
  }) 
  if (!user) {
    throw new Error("User does not exist")
  } 
  const isPasswordValid = await user.isPasswordCorrect(password) 
  if(!isPasswordValid){
    throw new Error("incorrect password") 
  }
  const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id) 

  
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken") 
   
  const accessTokenCookie = `accesstoken=${accessToken};HttpOnly; Secure;SameSite=None;Max-Age=100000`;
  const refreshTokenCookie = `refreshtoken=${refreshToken};HttpOnly; Secure;SameSite=None;Max-Age=100000`;

  context.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

  return formatUser(loggedInUser)

} 

export const followUser=async({user_followed}:{user_followed:string},context:{req:NextApiRequest})=>{ 
  
   let accesstoken=context.req.cookies["accesstoken"] 
    

   if(!accesstoken){
    throw new Error('Login error')
   }
   const decodedToken = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload

  
  
  const loggedInUser = await User.findById(decodedToken?._id).select("-password -refreshToken") 

  

  if (!loggedInUser) {
            
    throw new Error("Invalid Access Token")
  } 
   const userToFollow = await User.findOne({ username:user_followed})  
     if (!userToFollow) {
     throw new Error("User to follow not found");
  }  
  if(loggedInUser._id.equals(userToFollow._id)){
    throw new Error(`You can't follow yourself`)
  }
  if (loggedInUser.following.includes(userToFollow._id)) {
    throw new Error("You are already following this user");
  } 
  loggedInUser.following.push(userToFollow); 

  userToFollow.followers.push(loggedInUser); 

  await loggedInUser.save();
  await userToFollow.save()


   return `You succesfully followed ${user_followed}`

}

export const unfollowUser = async ({ user_unfollowed }: { user_unfollowed: string }, context: { req: NextApiRequest }) => {
  
  let accesstoken = context.req.cookies["accesstoken"];

  if (!accesstoken) {
    throw new Error('Login error');
  }

  const decodedToken = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;

  const loggedInUser = await User.findById(decodedToken?._id).select("-password -refreshToken");

  if (!loggedInUser) {
    throw new Error("Invalid Access Token");
  }

  const userToUnfollow = await User.findOne({ username: user_unfollowed });

  if (!userToUnfollow) {
    throw new Error("User to unfollow not found");
  }

  if (loggedInUser._id.equals(userToUnfollow._id)) {
    throw new Error(`You can't unfollow yourself`);
  }

  if (!loggedInUser.following.includes(userToUnfollow._id)) {
    throw new Error("You are not following this user");
  }

  const loggedInUserIndex = loggedInUser.following.indexOf(userToUnfollow._id);
  const userToUnfollowIndex = userToUnfollow.followers.indexOf(loggedInUser._id);

  loggedInUser.following.splice(loggedInUserIndex, 1);
  userToUnfollow.followers.splice(userToUnfollowIndex, 1);

  await loggedInUser.save();
  await userToUnfollow.save();

  return `You have successfully unfollowed ${user_unfollowed}`;
}

export const logout = async (_:any,context: { req: NextApiRequest, res: NextApiResponse }) => {
  

  context.res.setHeader('Set-Cookie', [
    `accesstoken=; HttpOnly; Secure; SameSite=None; Max-Age=0`,
    `refreshtoken=; HttpOnly; Secure; SameSite=None; Max-Age=0`
  ]); 

  

  return 'Logged out successfully';
}


export const changePassword = async ({ new_password, old_password }: { new_password: string, old_password: string }, context: { req: NextApiRequest, res: NextApiResponse }) => {
  const accessToken = context.req.cookies["accesstoken"];
  if(!old_password){
      throw new Error("Old password is required")
  }
  if (!accessToken) {
      throw new Error('Login error');
  }

  const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;

  const loggedInUser = await User.findById(decodedToken?._id);

  if (!loggedInUser) {
      throw new Error("Invalid Access Token");
  }

  const isOldPasswordValid = await loggedInUser.isPasswordCorrect(old_password);

  if (!isOldPasswordValid) {
      throw new Error("Incorrect old password");
  }

  if (new_password.length < 6) {
      throw new Error("New password must be at least 6 characters");
  }

  loggedInUser.password = new_password;

  await loggedInUser.save();

  context.res.setHeader('Set-Cookie', [
      `accesstoken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
      `refreshtoken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
  ]);

  return "Password changed successfully and logged out";
}

export const user = async ({ username }: { username: string }) => {
  let user = await User.findOne({ username }).select("-password -refreshToken");
  if (!user) {
    throw new Error("No such user found");
  }

  return formatUser(user);
}

export const users=async()=>{
  const Users=await User.find();

  const Users_to_be_returned= Users.map(user=>{  
        
   return formatUser(user) 
    
  })
  return Users_to_be_returned
} 

export const loggedInUser=async(_:any,context:{ req: NextApiRequest, res: NextApiResponse })=>{
  let accesstoken=context.req.cookies["accesstoken"] 
    

  if(!accesstoken){
   throw new Error('Login error')
  }
  const decodedToken = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload

 
 
 const loggedInUser = await User.findById(decodedToken?._id).select("-password -refreshToken") 

 

 if (!loggedInUser) {
           
   throw new Error("Invalid Access Token")
 } 

 return formatUser(loggedInUser)
}