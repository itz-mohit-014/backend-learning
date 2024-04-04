import {mongoose, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
        videoFile:{
            type:String,  // third party URL (cloudinary)
            required:true
        },
        thumbnail:{
            type:String,    // third party URL (cloudinary)
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:'User'
        },
        title:{
            type:String,  
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:number,   // comes from Cloudinary 
            required:true
        },

        views:{
            type:number,
            default:0

        },
        isPublished:{
            type:Boolean,
            default:true
        },
    },
    {timestamps:true}
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video',videoSchema)