import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    avatarUrl: { type: String },
    address: {
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String },
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipcode: { type: String },
        country: { type: String },
        phone: { type: String }
    },
    addresses: [{
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String },
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipcode: { type: String },
        country: { type: String },
        phone: { type: String }
    }]
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model('user',userSchema);

export default userModel