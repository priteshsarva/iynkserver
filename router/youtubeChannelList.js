const express = require('express')
const router = express.Router();
require("../db/conn")
const Yotubechannellist = require("../model/youtubeChannelSchema")

const puppeteer = require('puppeteer');


const getcoverimageyoutube = async (youtubeChannellURL) => {


    if (youtubeChannellURL) {

        const browser = await puppeteer.launch({ headless: true });


        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });


        // Replace with the YouTube channel link
        const channelLink = youtubeChannellURL;


        try {
            await page.goto(channelLink);
            // Wait for the profile picture to load
            // await page.waitForSelector('img.yt-img-shadow');
            await page.waitForFunction('document.readyState === "complete"');

            // Get the profile picture URL
            const profilePictureUrl = await page.evaluate(() => {
                const profilePicture = document.querySelector("#page-header > yt-page-header-renderer > yt-page-header-view-model > div > div.page-header-view-model-wiz__page-header-headline > yt-decorated-avatar-view-model > yt-avatar-shape > div > div > div > img")
                return profilePicture.src;
            });




            await page.goto(channelLink + "/videos");


            // Wait for the profile picture to load
            // await page.waitForSelector('img.yt-img-shadow');
            await page.waitForFunction('document.readyState === "complete"');

            const pageVideoInfo = await page.evaluate(() => {
                const latestvide = document.querySelector("#video-title-link")
                return [latestvide.ariaLabel, latestvide.href]
            });



            await browser.close();
            // console.log("by array");
            // console.log(pageVideoInfo[1]);
            return [profilePictureUrl, pageVideoInfo[0], pageVideoInfo[1]]


        } catch (error) {
            await browser.close();
            return { "message": "Page no Found" }
        }
    } else {
        return { "message": "Url Not Valid" }
    }
};

router.post('/youtubeChannelList', async function (req, res) {

    const youtubeChannellName = req.body.cname
    const youtubeChannellURL = req.body.curl
    const youtubecategory = req.body.youtubecategory
    var latestVideoTitle = req.body.vtitle
    var latestVideoURL = req.body.vurl

    var datatoupload = {}


    var profilePictureUrl = await getcoverimageyoutube(youtubeChannellURL);

    if (profilePictureUrl.message) {

        if (!latestVideoTitle) {
            datatoupload.latestVideoTitle = ""
        }
        if (!latestVideoURL) {
            datatoupload.latestVideoTitle = ""
            latestVideoURL = latestVideoURL
        }

        // temp need to change in future
        datatoupload.profilePictureUrl = profilePictureUrl.message


    } else {
        if (!latestVideoTitle) {
            datatoupload.latestVideoTitle = profilePictureUrl[1]
        }
        if (!latestVideoURL) {
            datatoupload.latestVideoURL = profilePictureUrl[2]
        }

        // temp need to change in future

        datatoupload.profilePictureUrl = profilePictureUrl[0]
    }

    if (!youtubeChannellName || !youtubeChannellURL || !youtubecategory) {
        return res.status(422).json({ message: "Please fill all the fields" })
    } else {
        datatoupload.youtubeChannellName = youtubeChannellName
        datatoupload.youtubeChannellURL = youtubeChannellURL
        datatoupload.youtubecategory = youtubecategory
    }
    datatoupload.Date = Date.now()
    // console.log(datatoupload);

    Yotubechannellist.findOne({ youtubeChannellName }).then((youtubeChannellNameExist) => {
        if (youtubeChannellNameExist) {
            return res.status(409).json({ message: "Channel name already exist" })
        }
        const newEntry = new Yotubechannellist(datatoupload)
        try {
            newEntry.save().then(
                res.status(201).json({ message: "Data Save Succefully" })
            )
        } catch (error) {
            res.status(500).json({ message: "could not be able to save data" })
        }


    }).catch(err => {
        // console.log(err)
    })

    // res.json({ message: { youtubeChannellName, youtubeChannellURL, latestVideoTitle, latestVideoURL } })
})




// Get all Data in youtubeChannelList

router.get('/youtubeChannelList', async (req, res) => {

    await Yotubechannellist.find().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    })

})

// Upadte Data in youtubeChannelList
router.patch('/youtubeChannelList/:id', async (req, res) => {



    const document = req.params.id;

    const youtubeChannellName = req.body.youtubeChannellName;
    const youtubeChannellURL = req.body.youtubeChannellURL;
    const youtubecategory = req.body.youtubecategory;
    const latestVideoTitle = req.body.latestVideoTitle;
    const latestVideoURL = req.body.latestVideoURL;


    var profilePictureUrl = await getcoverimageyoutube(youtubeChannellURL);

    if (profilePictureUrl) {
        profilePictureUrl = profilePictureUrl[0]
    }

    var data = await Yotubechannellist.findOne({ _id: document })

    youtubeChannellName ? youtubeChannellName : data.youtubeChannellName
    youtubeChannellURL ? youtubeChannellURL : data.youtubeChannellURL
    youtubecategory ? youtubecategory : data.youtubecategory
    latestVideoTitle ? latestVideoTitle : data.latestVideoTitle
    latestVideoURL ? latestVideoURL : data.latestVideoURL

    


    await Yotubechannellist.updateOne({ _id: document }, {
        $set: { youtubeChannellName, youtubeChannellURL, profilePictureUrl, youtubecategory, latestVideoTitle, latestVideoURL }
    }).then((data) => {
        res.status(201).json({ message: "Data Update Succefully" });
    }).catch((err) => {
        res.status(500).json({ message: "Error occurred try again later" });
    })

})


// Delete Data in youtubeChannelList

router.delete('/youtubeChannelList/:id', async (req, res) => {

    const document = req.params.id;

    await Yotubechannellist.deleteOne({ _id: document })
        .then((data) => {
            res.status(201).json({ message: "Data Deleted Succefully", data });
        }).catch((err) => {
            res.status(500).json({ message: "Error occurred try again later" });
        })
})


module.exports = router;