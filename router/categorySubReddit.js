const express = require('express')
const router = express.Router();
require("../db/conn")
const puppeteer = require('puppeteer');


const subReddit = require('../model/subRedditSchema')
const channelCategory = require('../model/channelCategorySchema')



const getsubRedditImageUrl = async (youtubeChannellURL) => {


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
                const profilePicture = document.querySelector("body > shreddit-app > div > div.subgrid-container.m\\:col-start-2.box-border.flex.flex-col.order-2.w-full.m\\:w-\\[1120px\\].m\\:max-w-\\[calc\\(100vw-272px\\)\\].xs\\:px-md.mx-auto.xs\\:gap-sm > div.masthead.w-full.relative > section > div > div.flex.items-end.justify-start.xs\\:justify-center.gap-\\[8px\\].w-100.xs\\:w-auto > div.xs\\:w-\\[88px\\].xs\\:h-\\[88px\\].w-2xl.h-2xl.text-48.shrink-0 > faceplate-img").shadowRoot.querySelector("div > img")
                return profilePicture.src;
            });





            await browser.close();

            return profilePictureUrl


        } catch (error) {
            await browser.close();
            return "Page no Found"
        }
    } else {
        return "Url Not Valid"
    }
};


router.post('/subReddit', async function (req, res) {

    const subRedditName = req.body.subRedditName
    const subRedditUrl = req.body.subRedditUrl
    const subRedditImageUrl = await getsubRedditImageUrl(req.body.subRedditUrl)
    var subRedditCategory = req.body.subRedditCategory

    if (!subRedditName) {
        return res.status(422).json({ message: "Please fill all the fields" })
    }
    if (!subRedditCategory) {
        subRedditCategory = []
    }

    // temp need to change in future

    subReddit.findOne({ subRedditName }).then((subRedditNameExist) => {
        if (subRedditNameExist) {
            return res.status(409).json({ message: "Category name already exist" })
        }



        const newEntry = new subReddit({ subRedditName, subRedditUrl, subRedditImageUrl, subRedditCategory })
        newEntry.save().then((e) => {
            res.status(201).json({ message: "Data Update Succefully" })

            e.subRedditCategory.map((subRedditCategoryID) => {
                channelCategory.findOne({ _id: subRedditCategoryID }).then(async (catgoryfound) => {
                    // console.log(catgoryfound.subReddits);
                    var list = catgoryfound.subReddits
                    if(!list){
                        list = []
                    }
                    list.push(e._id)
                    // console.log(list);


                    await channelCategory.updateOne({ _id: catgoryfound }, {
                        $set: { "subReddits": list }
                    }).then((data) => {
                        // console.log({ message: "Data Update Succefully" });
                        // res.status(201).json({ message: "Data Update Succefully" });
                    }).catch((err) => {
                        // console.log({ message: "Error occurred try again later" });
                        // res.status(500).json({ message: "Error occurred try again later" });
                    })

                })
            })

        }

        ).catch(err => {
            res.status(500).json({ message: "could not be able to save data" })
        })




    }).catch(err => {
        // console.log(err)
    })

})




// Get all Data in youtubeChannelList

router.get('/subReddit', async (req, res) => {

    await subReddit.find().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    })

})

// Upadte Data in youtubeChannelList
router.patch('/subReddit/:id', async (req, res) => {

    const document = req.params.id;
    const subRedditName = req.body.subRedditName;
    const subRedditUrl = req.body.subRedditUrl

    const subRedditCategory = req.body.subRedditCategory;


    var data = await subReddit.findOne({ _id: document })

    subRedditName ? subRedditName : data.subRedditName
    subRedditUrl ? subRedditUrl : data.subRedditUrl

    subRedditCategory ? subRedditCategory : data.subRedditCategory


    await subReddit.updateOne({ _id: document }, {
        $set: { subRedditName, subRedditUrl, subRedditCategory }
    }).then((e) => {

        // to add ID of subreddit in category tree
        subRedditCategory.map((subRedditCategoryID) => {
            channelCategory.findOne({ _id: subRedditCategoryID }).then(async (catgoryfound) => {

                // console.log(catgoryfound.subReddits);
                var list = catgoryfound.subReddits
                if(!list){
                    list = []
                }

                if (catgoryfound.subReddits.includes(document)) {
                    // console.log("Value is in the array");
                } else {
                    // console.log("Value not found");
                    list.push(document)
                    // console.log(list);
                }

                await channelCategory.updateOne({ _id: catgoryfound }, {
                    $set: { "subReddits": list }
                }).then((data) => {
                    // console.log({ message: "Data Update Succefully" });
                    // res.status(201).json({ message: "Data Update Succefully" });
                }).catch((err) => {
                    // console.log({ message: "Error occurred try again later " });
                    // res.status(500).json({ message: "Error occurred try again later" });
                })
            })
        })

        //to remove Subreddit id from Category       

        // update data req.body.subRedditUrl
        // old data data.subRedditUrl


        // console.log("req.body.subRedditCategory");
        // console.log(req.body.subRedditCategory);
        // console.log("data.subRedditCategory");
        // console.log(data.subRedditCategory);



        //new
        const arr1 = req.body.subRedditCategory

        //old
        const arr2 = data.subRedditCategory

        const diff = arr2.filter(x => !arr1.includes(x));

        if (diff) {

            diff.map(idvaluetoremove => {
                channelCategory.findOne({ _id: idvaluetoremove }).then(async (catgoryfound) => {

                    var list = catgoryfound.subReddits
                    if(!list){
                        list = []
                    }
                    // console.log("list");
                    // console.log(list); // [1, 2, 4, 5]

                    // console.log("idvaluetoremove");
                    // console.log(idvaluetoremove); // [1, 2, 4, 5]
                    // console.log("TO Remove");
                    // console.log(document);


                    const newArr = list.filter(x => x !== document);

                    // console.log("newArr");
                    // console.log(newArr); // [1, 2, 4, 5]

                    await channelCategory.updateOne({ _id: catgoryfound._id }, {
                        $set: { "subReddits": newArr }
                    }).then((data) => {
                        // console.log({ message: "Data Update Succefully" });
                        // res.status(201).json({ message: "Data Update Succefully" });
                    }).catch((err) => {
                        // console.log({ message: "Error occurred try again later " });
                        // res.status(500).json({ message: "Error occurred try again later" });
                    })

                })
            })
        }


        res.status(201).json({ message: "Data Update Succefully" });
    }).catch((err) => {
        res.status(500).json({ message: "Error occurred try again later" });
    })

})


// Delete Data in youtubeChannelList

router.delete('/subReddit/:id', async (req, res) => {

    const document = req.params.id;

    await subReddit.deleteOne({ _id: document })
        .then((data) => {
            res.status(201).json({ message: "Data Deleted Succefully", data });
        }).catch((err) => {
            res.status(500).json({ message: "Error occurred try again later" });
        })
})


module.exports = router;