import mongoose,{Schema} from "mongoose";

const threadSchema=new Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }, 
    liked_by:[{
       type: Schema.Types.ObjectId,
       ref: "User"
    }],
    
},{
    timestamps:true
}) 

export const Thread=mongoose.models.Thread || mongoose.model("Thread", threadSchema)