const express = require('express')
const router = express.Router();
require("../db/conn")
const channelCategory = require('../model/channelCategorySchema')
const subReddit = require('../model/subRedditSchema')



router.post('/channelCategory', function (req, res) {

    const categoryName = req.body.categoryName
    var subReddits = req.body.subReddits

    if (!categoryName) {
        return res.status(422).json({ message: "Please fill all the fields" })
    }
    if (!subReddits) {
        subReddits = []
    }

    // temp need to change in future

    channelCategory.findOne({ categoryName }).then((categoryNameExist) => {
        if (categoryNameExist) {
            return res.status(409).json({ message: "Category name already exist" })
        }
        const newEntry = new channelCategory({ categoryName, subReddits })
        newEntry.save().then((e) => {
            res.status(201).json({ message: "Data Update Succefully" })

            e.subReddits.map((subRedditsID) => {
                subReddit.findOne({ _id: subRedditsID }).then(async (subRedditsfound) => {
                    // console.log(subRedditsfound.subReddits);
                    var list = subRedditsfound.subRedditCategory
                    if (!list) {
                        list = []
                    }
                    list.push(e._id)
                    // console.log(list);


                    await subReddit.updateOne({ _id: subRedditsfound }, {
                        $set: { "subRedditCategory": list }
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

router.get('/channelCategory', async (req, res) => {

    await channelCategory.find().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    })

})

// Upadte Data in youtubeChannelList
router.patch('/channelCategory/:id', async (req, res) => {

    const document = req.params.id;
    const categoryName = req.body.categoryName;
    const subReddits = req.body.subReddits;


    var data = await channelCategory.findOne({ _id: document })

    categoryName ? categoryName : data.categoryName
    subReddits ? subReddits : data.subReddits


    await channelCategory.updateOne({ _id: document }, {
        $set: { categoryName, subReddits }
    }).then((e) => {

        // to add ID of subreddit in category tree
        subReddits.map((subRedditsID) => {
            subReddit.findOne({ _id: subRedditsID }).then(async (subRedditsfound) => {

                // console.log(subRedditsfound.subReddits);
                var list = subRedditsfound.subRedditCategory
                if (!list) {
                    list = []
                }

                if (subRedditsfound.subRedditCategory.includes(document)) {
                    // console.log("Value is in the array");
                } else {
                    // console.log("Value not found");
                    list.push(document)
                    // console.log(list);
                }

                await subReddit.updateOne({ _id: subRedditsfound }, {
                    $set: { "subRedditCategory": list }
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


        // console.log("req.body.subReddits");
        // console.log(req.body.subReddits);
        // console.log("data.subReddits");
        // console.log(data.subReddits);



        //new
        const arr1 = req.body.subReddits

        //old
        const arr2 = data.subReddits

        const diff = arr2.filter(x => !arr1.includes(x));

        if (diff) {

            diff.map(idvaluetoremove => {
                subReddit.findOne({ _id: idvaluetoremove }).then(async (subRedditsfound) => {

                    // console.log(subRedditsfound);
                    var list = subRedditsfound.subRedditCategory
                    if (!list) {
                        list = []
                    }
                    // console.log("list");
                    // console.log(list); // [1, 2, 4, 5]

                    // console.log("idvaluetoremove");
                    // console.log(document); // [1, 2, 4, 5]

                    const newArr = list.filter(x => x !== document);

                    // console.log("newArr");
                    // console.log(newArr); // [1, 2, 4, 5]

                    await subReddit.updateOne({ _id: subRedditsfound._id }, {
                        $set: { "subRedditCategory": newArr }
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

router.delete('/channelCategory/:id', async (req, res) => {

    const document = req.params.id;

    await channelCategory.deleteOne({ _id: document })
        .then((data) => {
            res.status(201).json({ message: "Data Deleted Succefully", data });
        }).catch((err) => {
            res.status(500).json({ message: "Error occurred try again later" });
        })
})


module.exports = router;