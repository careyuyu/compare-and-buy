var express = require('express');
var cors = require('cors');
var app = express();
const bodyParser = require("body-parser");
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const schedule = require('node-schedule');
const product_service = require('./services/product-service')



const port = process.env.PORT || 8000;

//controller for getting product list
app.get("/product_search/:product_name", async function(req, res) {
    console.log("got product_search request on: "+req.params["product_name"])
    const productName = req.params["product_name"].toLowerCase()
    Promise.all([product_service.getAmazonProducts(productName), 
                product_service.getEbayProducts(productName),
                product_service.getWalmartProducts(productName)]).then((values)=>{
                    res.send(values.flat());
    }).catch((err)=>{res.send([])});
});

//controller for getting comments
app.post("/comment_search/:website", async function(req, res) {
    console.log("got comment_search request on:"+req.params["page_url"])
    const website = req.params["website"]
    const url = req.body["url"]
    result = []
    if(website==="Amazon") {
        result = await product_service.getAmazonComments(url)
    }
    else if(website==="ebay") {
        result = await product_service.getEbayComments(url)
    }
    else if(website==="walmart") {
        result = await product_service.getWalmartComments(url)
    }
    res.send(result)
});

//routes for testing
// app.get("/test_walmart/:url", async function(req, res) {
//     result = await product_service.getWalmartProducts(req.params["url"])
//     res.send(result)
// });

// app.get("/test_ebay/:url", async function(req, res) {
//     result = await product_service.getEbayProducts(req.params["url"])
//     res.send(result)
// });

// app.get("/test_ama/:url", async function(req, res) {
//     result = await product_service.getAmazonProducts(req.params["url"])
//     res.send(result)
// });

app.get("/get_deal", async function(req, res) {
    result = await product_service.getDeals()
    res.send(result)
});

app.get("/test_update_deal", async function(req,res) {
    await product_service.updateDeals()
    res.send("")
})



app.listen(port, function() {
    console.log("ecommerce-scraper-api listening on "+port)
    //schedule the job for scraping daily deals
    let rule = new schedule.RecurrenceRule();
    rule.hour = 10;
    rule.minute = 0;
    rule.second =0;
    let job = schedule.scheduleJob(rule, () => {
        console.log(new Date());
        product_service.updateDeals()
      });
});