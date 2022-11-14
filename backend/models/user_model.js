const { model, Schema, ObjectId } = require("mongoose");

const UserSchema = new Schema(
    {
        name: {type: String, required: true},
        email: { type: String, required: true },
        passwordHash: { type: String, required: true },
        key: { type: String, required: true },
        verified: { type: Boolean, required: true },
        docs: { type: [{id: {type: String, required: true}, name: {type: String, required: true}}], required: [true, []]}
    },
    { timestamps: true },
)

module.exports = model('User', UserSchema);