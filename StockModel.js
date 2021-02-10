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

module.exports = Stock
