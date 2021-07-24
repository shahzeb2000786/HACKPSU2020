const Stock = require("./StockModel.js");
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
  let testArr = []
  var baseUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&outputsize=full&symbol="
  baseUrl = baseUrl + ticker + "&apikey=" + apiKey
  let promise = axios.get(baseUrl)
  let dataPromise = promise.then((response) => response.data["Time Series (Daily)"])

  return dataPromise
    .catch(function (err) {
      console.log(err)
      return -1
    })

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

app.get("/daily/:ticker/:numberOfDays", async (req, res) => {
  let numberOfDays = parseInt(req.params.numberOfDays);
  let dailyStockPricess = await getDailyStock(req.params.ticker)
  let dailyStocks = []
  console.log(typeof(dailyStockPricess))
  //daily
  for (objectKey in dailyStockPricess){
    //console.log(dailyStockPricess[objectKey])
        let stock = new Stock();
        let stockJSON = dailyStockPricess[objectKey];
        let close = (stockJSON["5. adjusted close"]);
        stock.price = close;
        stock.open = stockJSON["1. open"];
        stock.high = stockJSON["2. high"];
        stock.low = stockJSON["3. low"];
        stock.date = objectKey;
        stock.volume = stockJSON["6. volume"];
        dailyStocks.push(stock);

    }
    if (numberOfDays > dailyStockPricess.length){
      res.json(dailyStocksPricess)
    }
    if (numberOfDays == null){
      res.json(dailyStockPrices)
    }
    dailyStocks = dailyStocks.slice((dailyStocks.length-1) - numberOfDays, dailyStocks.length)
  res.json(dailyStocks)
})


app.listen(process.env.PORT || 3000, function() {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
