var http = require("http");
var https = require("https");

function queryCryptocompareApi(date) {
  return new Promise(function(resolve, reject) {
    var options = {
      host: 'min-api.cryptocompare.com',
      port: 443,
      path: '/data/pricehistorical?fsym=ETH&tsyms=USD&ts=' + date,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    var port = options.port == 443 ? https : http;
    var req = port.request(options, function(res) {
      var output = '';
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
        output += chunk;
      });

      res.on('end', function() {
        var data = JSON.parse(output);
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', function(err) {
      reject(err);
    });

    req.end();
  });
};

function roi(buyDate, sellDate, amount) {
	if(		buyDate.constructor.name == 'Number'
		 && sellDate.constructor.name == 'Number'
		 && amount.constructor.name == 'Number'
	) {
		if(sellDate > buyDate) {
      return queryCryptocompareApi(buyDate).then(function(buyDateResult) {
        if(buyDateResult.statusCode == 200) {
          console.log(buyDateResult);
          return queryCryptocompareApi(sellDate).then(function(sellDateResult) {
            var gain = sellDateResult.data.ETH.USD * amount;
            var cost = buyDateResult.data.ETH.USD * amount;
            var roi = ( gain - cost ) / cost;
            console.log('gain : ' + gain + ', cost : ' + cost);
            console.log('Return on investment : ', roi);
            return roi;
          }).catch(function(exception) { console.error(exception); });
        } else {
          throw new Error('cannot connect to min-api.cryptocompare.com');
        }
      }).catch(function(exception) { console.error(exception); });
		} else {
			throw new Error('sellDate must be greater than buyDate');
		}
	} else {
		throw new Error('invalid arguments');
	}
}

module.exports = roi;
