import mongoose,{Schema} from "mongoose";

const commentSchema=new Schema({
    content:{
        type:String,
        required:true,
    },
    parentThread:{
        type:Schema.Types.ObjectId,
        ref:"Thread"
    }, 
    postedby:{
        type:Schema.Types.ObjectId,
        ref:"User",    }

},
{timestamps:true}

)  

export const Comment=mongoose.models.Comment || mongoose.model("Comment",commentSchema); 