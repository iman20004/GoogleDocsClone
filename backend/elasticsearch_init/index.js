const fs = require('fs')
const path = require('path');
const { Client } = require('@elastic/elasticsearch')

const client = new Client({ 
    node: 'https://209.151.151.49:9200',
    auth: {
        username: 'elastic',
        password: '57DCyAUYJgbAPZ1meR0C'
    },
    tls: {
        ca: fs.readFileSync(path.join(__dirname,'elasticsearch_ca.crt')),
        rejectUnauthorized: false
    }
});

client.indices.create({
    index: "docs",
    body: {
        settings: {
            analysis: {
                analyzer: {
                    default:{
                        type: "custom",
                        tokenizer: "standard",
                        filter: ["lowercase", "stop", "stemmer"]
                    }
                }
            }
        }
    }
}).catch((err) => {});


module.exports = client; 

