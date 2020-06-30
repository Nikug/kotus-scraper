const fetch = require("node-fetch");
const cheerio = require("cheerio");

const query = "netmot.exe?SearchWord=*&dic=1&page=list&UI=fi80&Start="
const baseUrl = "https://2018.kielitoimistonsanakirja.fi/";

const minDelay = 10 * 1000; // seconds
const maxDelay = minDelay;
const waitEvery = 1;

const main = async () => {
    let start = 102000;

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
            return;
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

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const randomNumber = (start, end) => {
    return Math.floor(Math.random() * (start - end)) + end;
}

main();

