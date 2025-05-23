import mongoose,{Schema} from 'mongoose';

const subscriptionSchema = new Schema({
subscriber :{
    type: mongoose.Schema.Types.ObjectId, // one whos subscribing
    ref: 'User'
},
channel :{
    type: mongoose.Schema.Types.ObjectId, // one whos subscribed
    ref: 'Channel'
},
},{
    timestamps: true
}
)

export const Subscription = mongoose.model('Subscription', subscriptionSchema);