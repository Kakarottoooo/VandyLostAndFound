import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    dateFound: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    urgent: { 
        type: Boolean, 
        default: false // ✅ Added urgent field with default value false
    },
}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);

export default Item;
