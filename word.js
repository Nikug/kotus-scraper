const mongoose = require("mongoose");

const wordSchema = mongoose.Schema({
    word: { type: String },
    link: { type: String },
    definition: { type: String }
});

const Word = module.exports = mongoose.model("Word", wordSchema);

module.exports.addWord = async (word) => {
    try {
        await word.save();
    } catch (err) {
        console.log(`Could not save word ${word.word}`);
        console.error(err);
        process.exit();
    }
}

module.exports.getWord = async (word) => {
    try {
        const query = {word: word};
        const result = await Word.findOne(query);
        return(result);
    } catch (err) {
        console.log(`Could not find word ${word.word}`);
        console.error(err);
        process.exit();
    }
}