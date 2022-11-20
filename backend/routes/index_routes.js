const express = require('express');
const router = express.Router();
const client = require('../elasticsearch_init');
const datamuse = require('datamuse');

const verify = (req, res, next) => {
    if(!req.session.name) {
        return res.json({ error: true, message: 'Alex is asian'})
    } else {
        next(); 
    }
}

router.get('/search', verify, async (req, res) => {
    console.log('im in');

    const result = await client.search({
        index: 'docs',
        query: {
            multi_match: { 
                query: req.query.q, 
                fields: ["name", "content"]
            }
        },
        highlight: {
            fields: {
                name: {}, 
                content: {}
            }
        }
    });
    var json_stuff = []
    result.hits.hits.forEach((obj) => {
        var snipstring = ""
        if(obj.highlight.content){
            snipstring = obj.highlight.content.join(); 
        } else {
            snipstring = obj.highlight.name.join(); 
        }
        let queryObj = {
            docid: obj._id,
            name: obj._source.name,
            snippet: snipstring
        }
        json_stuff.unshift(queryObj); 
    });
    //console.log(json_stuff); 
    return res.json(json_stuff); 
});

router.get('/suggest', verify, async (req, res) => {
    let words = await datamuse.request(`sug?s=${req.query.q}&max=50`);
    //console.log(words); 
    let found_words = [];
    for(let i = 0; i < words.length; i++){
        const word = words[i]; 
        const result = await client.search({
            index: 'docs',
            query: {
                multi_match: { 
                    query: word.word, 
                    fields: ["name", "content"]
                }
            }
        });
        //console.log(word.word);
        //console.log(result.hits.hits); 
        if(result.hits.hits.length){
            found_words.push({word: word.word, score: result.hits.hits.length});
        }
    }
    
    //console.log(found_words);
    found_words.sort((a,b) => b.score - a.score); 
    const json_words = found_words.map((word) => word.word);
    //console.log(json_words);
    return res.json(json_words); 
});

module.exports = router; 
