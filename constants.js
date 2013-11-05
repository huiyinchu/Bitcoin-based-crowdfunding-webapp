var Constants = {
  APP_NAME: "Bitstarter", 
  FUNDING_TARGET: 10.00,
  FUNDING_UNIT_SYMBOL: "mBTC",
  FUNDING_SI_SCALE: 1000,
  FUNDING_END_DATE: new Date("September 8, 2013"),
  PRODUCT_NAME: "Product: Development Version",
  PRODUCT_SHORT_DESCRIPTION: "One sentence description.",
  TWITTER_USERNAME: "nodejs",
  TWITTER_TWEET: "This student crowdfunder looks interesting.",
  COINBASE_PREORDER_DATA_CODE: "a0e2d8b5b95f38608a991239c5baf755",
  days_left: function() {
      return Math.max(Math.ceil((this.FUNDING_END_DATE - new Date()) / (1000*60*60*24)), 0);
  }
};

module.exports = Constants;
