const express = require('express')
require('dotenv').config()
const cors = require('cors')
const Yotubechannellist = require('./model/youtubeChannelSchema')
const PORT = process.env.PORT || 5000
const app = express()
app.use(cors())
app.use(express.json())


// const youtubeChannelList = require('./scrapAndRewrite/youtubeChannelList')
// const youtubeChannelScrap = require('./scrapAndRewrite/youtubeChannelScrap')
// const youtubeVideoSubtitleScrap = require('./scrapAndRewrite/youtubeVideoSubtitleScrap')
// const subtitleToArticle = require('./scrapAndRewrite/subtitleToArticle')
// const genrateImageFromTitle = require('./scrapAndRewrite/genrateImageFromTitle')
// const articleToExcel = require('./scrapAndRewrite/articleToExcel')

// youtubeChannelList();
// youtubeChannelScrap();
// youtubeVideoSubtitleScrap();
// subtitleToArticle();
// genrateImageFromTitle();
// articleToExcel();


app.use(require('./router/youtubeChannelList'))
app.use(require('./router/channelCategory'))
app.use(require('./router/categorySubReddit'))

app.get('/', function (req, res) {
    res.send('Hello World')
})


app.listen(PORT, () => {
    console.log(`server listing on port number : ${PORT}`);
})