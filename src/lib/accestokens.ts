import { User } from "@/models/users.models" 


export const generateAccessAndRefereshTokens = async(userId:number) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
  
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false }) 
  
        
  
        return {accessToken, refreshToken}
  
  
    } catch (error) {
        throw new Error("Something went wrong while generating referesh and access token")
    }
  }