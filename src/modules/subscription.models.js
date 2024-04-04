import mongoose, { Schema } from "mongoose";


const subscriptionSchema  = new Schema({
    // one who is subscribing the channel.
    subscriber: {
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    // main channal that subscribed.
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }


    
}, {timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)