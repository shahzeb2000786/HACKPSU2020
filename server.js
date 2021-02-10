//const Stock = require("./StockModel.js");
class Stock {
  constructor(ticker,open,high,low, price, volume, date, previousClose, change,
    changePercent, exchange, sector, industry, fiftyTwoHigh, fiftyTwoLow,
    peRatio, marketCap,dividendYield, fiftyDayMovingAverage, description){
    this.ticker = ticker
    this.open = open;
    this.high = high;
    this.low = low;
    this.price = price
    this.volume = volume;
    this.date = date;
    this.previousClose = previousClose;
    this.change = change;
    this.changePercent = changePercent;
    this.exchange = exchange
    this.sector = sector
    this.industry = industry
    this.fiftyTwoHigh = fiftyTwoHigh;
    this.fiftyTwoLow = fiftyTwoLow;
    this.peRatio = peRatio;
    this.marketCap = marketCap;
    this.dividendYield = dividendYield;
    this.fiftyDayMovingAverage = fiftyDayMovingAverage
    this.description = description;

  }//end of constructor
}
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const fs = require("fs");
const PORT = process.env.PORT || 5000;
const app = express();
const axios = require('axios');
const apiKey = process.env.api_key
let dailyStockPrices = [];
let currentStock = new Stock();
let companyOverView = null;

async function getDailyStock(ticker) {
  dailyStockPrices = []
  var baseUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol="
  baseUrl = baseUrl + ticker + "&apikey=" + apiKey
  axios.get(baseUrl)
    .then(function (response) {
      // handle success
      let dailyJSONStockArray = response.data["Time Series (Daily)"]

      for (objectKey in dailyJSONStockArray){
        let stock = new Stock();
        let stockJSON = dailyJSONStockArray[objectKey];
        let close = (stockJSON["5. adjusted close"]);
        stock.price = close;
        stock.open = stockJSON["1. open"];
        stock.high = stockJSON["2. high"];
        stock.low = stockJSON["3. low"];
        stock.date = objectKey;
        stock.volume = stockJSON["6. volume"];
        dailyStockPrices.unshift(stock);
      }

    })
    .catch(function (err) {
      // handle error
      console.log(err)
      return -1
    })
    .then(function () {
      console.log("executed");
      return 0
    });
}

function convertJSONToStock(stockData){

        let stockGlobalQuote = stockData["Global Quote"]
        let ticker = (stockGlobalQuote["01. symbol"])
        let open = (stockGlobalQuote["02. open"])
        let high = (stockGlobalQuote["03. high"])
        let low = (stockGlobalQuote["04. low"])
        let price = (stockGlobalQuote["05. price"])
        let volume = (stockGlobalQuote["06. volume"])
        let date = (stockGlobalQuote["07. latest trading day"])
        let previousClose = (stockGlobalQuote["08. previous close"])
        let change = (stockGlobalQuote["09. change"])
        let changePercent = (stockGlobalQuote["10. change percent"])

      currentStock = new Stock(ticker,open,high,low,price,volume,date,previousClose,change,changePercent);
      testStock = new Stock(ticker,open,high,low,price,volume,date,previousClose,change,changePercent);
      return testStock
}

async function getCurrentStock(ticker) {
  let testStock = new Stock()
  var baseurl = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol="
  baseurl = baseurl + ticker + "&apikey="  + apiKey

  const promise = axios.get(baseurl)
  const dataPromise = promise.then((response) => response.data)
  return dataPromise

    .catch((err) => {
      // handle error
      console.log(err);
      return -1
    })


}


function addOverViewToStockObject(dataToParse, stockObject){
  let stockOverViewObject = JSON.parse(JSON.stringify(dataToParse))
  let peRatio = stockOverViewObject.PERatio
  let marketCapitalization = stockOverViewObject.MarketCapitalization
  let description = stockOverViewObject.Description
  let exchange = stockOverViewObject.Exchange
  let sector = stockOverViewObject.Sector
  let industry = stockOverViewObject.Industry
  let fiftyTwoWeekHigh = stockOverViewObject["52WeekHigh"]
  let fiftyTwoWeekLow = stockOverViewObject["52WeekLow"]
  let dividendYield = stockOverViewObject["DividendYield"]
  let fiftyDayMovingAverage = stockOverViewObject["50DayMovingAverage"]

  stockObject.exchange = exchange
  stockObject.sector = sector
  stockObject.industry = industry
  stockObject.fiftyTwoHigh = fiftyTwoWeekHigh
  stockObject.fiftyTwoLow = fiftyTwoWeekLow
  stockObject.peRatio = peRatio
  stockObject.marketCap = marketCapitalization
  stockObject.dividendYield = dividendYield
  stockObject.fiftyDayMovingAverage = fiftyDayMovingAverage
  stockObject.description = description
  return stockObject
}

async function getCompanyOverview(ticker) {
  var baseurl = "https://www.alphavantage.co/query?function=OVERVIEW&symbol="
  baseurl = baseurl + ticker + "&apikey=" + apiKey
  const promise = axios.get(baseurl)
  const dataPromise = promise.then((response) => response.data)
  return dataPromise
    .catch(function (error) {
      console.log(error);
      return -1;
    })
}


app.get("/current/:ticker", async (req, res) => {
  let stock = await getCurrentStock(req.params.ticker)
  let convertedStock = convertJSONToStock(stock)
  let overViewData = await getCompanyOverview(req.params.ticker)
  let finalStock = addOverViewToStockObject(overViewData, convertedStock)
  res.json(finalStock)
})

app.get("/ticker-symbols", (req,res) => {
  let rawTickerData = fs.readFileSync("tickersymbols.json")
  let tickerJSONData = JSON.parse(rawTickerData)
  res.json(tickerJSONData)
})


app.get("/overview/:ticker", (req,res) => {
  currentStock = new Stock()
  getCompanyOverview(req.params.ticker)
  res.json(req.params.ticker)
})


//---------------------------------------------To edit------------------------------------

app.get("/daily/:ticker", (req, res) => {

  getDailyStock(req.params.ticker)
  setTimeout(function() {
    if (dailyStockPrices == []) {
      res.json({
        error: "Error making request to alpha vantage api"
      })
    } else {
      //console.log(dailyStockPrices)
      res.json(dailyStockPrices)
    }
    dailyStockPrices = []
  }, 1000)

})
app.listen(process.env.PORT || 3000, function() {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});