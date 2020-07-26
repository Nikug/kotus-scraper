require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");

const Word = require("./word");

const fileName = "kotus.json"; 

const main = async() => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@mongo-v8pg3.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log("Connected to database");
    } catch (err) {
        console.log("Failed to connect to database. Quitting...");
        process.exit();
    }

    words = await Word.getAllWords();


    let dict = {};
    for(let i=0, count=words.length; i < count; i++) {
        const word = words[i];
        dict[word.word] = word.link;
    }

    const dictString = JSON.stringify(dict);
    fs.writeFileSync(fileName, dictString);
    process.exit();
}

main();