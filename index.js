const express = require('express'); 
const http = require('http');
const WebSocket = require('ws');
const Twitter = require('twitter');
const _ = require('lodash');

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
var client = new Twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
});
wss.on('connection', function connection(ws) {
    client.get('search/tweets', { q: 'funny -filter:media', result_type: 'popular', language: 'en' }, function(error, tweets, response) {
        const filtered = _.map(tweets.statuses, (tweet) => ({ 'name': tweet.user.screen_name, 'source': tweet.id_str }))
        ws.send(JSON.stringify(filtered));
    });
    ws.on('message', function incoming(query) {
        try {
            query = (JSON.parse(query))
        } catch (err) {
            console.log(err.message);
            return
        }
        client.get('search/tweets', { q: `${query.contentInfo} ${query.includeImages ? 'filter:images' : "-filter:images"} ${query.includeVideos ? 'filter:native_video' : "-filter:native_video"}`, result_type: 'popular', language: 'en' }, function(error, tweets, response) {
            const filtered = _.map(tweets.statuses, (tweet) => ({ 'name': tweet.user.screen_name, 'source': tweet.id_str }))
            ws.send(JSON.stringify(filtered));
        });
    });

    ws.send('something');
});

server.listen(8080, () => console.log('Example app listening on port 8080!'))