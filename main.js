require("dotenv").config();
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const mongoose = require("mongoose");

const Word = require("./word");

const query = "netmot.exe?SearchWord=*&dic=1&page=list&UI=fi80&Start="
const baseUrl = "https://2018.kielitoimistonsanakirja.fi/";

const minDelay = 15 * 1000; // seconds
const maxDelay = minDelay;
const waitEvery = 1;

const main = async () => {

    await connectDatabase();
    const count = await Word.getWordCount();
    let start = count;

    while(true) {
        const res = await fetch(baseUrl + query + start);
        const body = await res.text();
        const $ = cheerio.load(body);
        
        console.log(res.status);
        if(res.status !== 200) {
            return;
        }
        
        let words = scrapeWords($);

        if(words.length === 0) {
            console.log("Done scraping.");
            break;
        }

        for(let i=0, count=words.length; i < count; i++) {
            if(i % waitEvery === 0 && i !== 0) {
                await sleep(randomNumber(minDelay, maxDelay));
            }
    
            words[i].definition = await scrapeDefinitions(words[i].link);
    
            if(!words[i].definition) {
                console.log(`${i}: Got captcha at: ${words[i].word}`);
                process.exit();
            }
    
            console.log(`${i}: ${words[i].word} - ${words[i].definition}`);
            let newWord = new Word({
                word: words[i].word,
                link: baseUrl + words[i].link,
                definition: words[i].definition
            });
            const existingWord = await Word.getWord(newWord.word);
            if(existingWord) {
                console.log(`Word ${newWord.word} exists already, skipping.`);
            } else {
                await Word.addWord(newWord);
            }

        }
        start += words.length;
    }
}

const scrapeWords = ($) => {
    const ps = $("a nobr").parent();
    let words = [];

    ps.each((i, elem) => {
        const word = ($(elem).children("nobr").text());
        const link = ($(elem).attr("href"));
        
        words.push({word: word, link: link});
    });

    return(words);
}

const scrapeDefinitions = async (link) => {
    const res = await fetch(baseUrl + link);
    const body = await res.text();
    const $ = cheerio.load(body);

    
    const definitions = $("div.entry span[lang=fi]");
    let definition = definitions.first().contents().not("span, font, sup").text().trim();
    
    // In case numbered because of multiple definitions
    if(definition.length === 0) {
        definition = definitions.eq(1).contents().not("span, font, sup").text().trim();
    }
    
    // In case no definition is still not found
    if(definition.length === 0) {
        // Test if captcha
        if($(".g-recaptcha").length) {
            return(null);
        }
        return("-");
    }

    definition = definition.charAt(0).toUpperCase() + definition.slice(1);

    return(definition);
}

const connectDatabase = async() => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@mongo-v8pg3.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log("Connected to database");
    } catch (err) {
        console.log("Failed to connect to database. Quitting...");
        process.exit();
    }
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const randomNumber = (start, end) => {
    return Math.floor(Math.random() * (start - end)) + end;
}

main();

