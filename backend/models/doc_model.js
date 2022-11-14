const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocSchema = new Schema(
    {
        name: {type: String, required: true},
        update: {type: [Number], required: [true, []]}
    }, 
    {timestamps: true}
);

module.exports = mongoose.model('Docs', DocSchema);