var http = require("http");
var https = require("https");

function queryCryptocompareApi(date, resolve) {	
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
			var obj = JSON.parse(output);
			resolve(res.statusCode, obj);
		});
	});

	req.on('error', function(err) {
		throw new Error(err);
	});

	req.end();
};

function roi(buyDate, sellDate, amount) {
	if(		buyDate.constructor.name == 'Number'
		 && sellDate.constructor.name == 'Number'
		 && amount.constructor.name == 'Number'
	) {
		if(sellDate > buyDate) {
			try {
				queryCryptocompareApi(buyDate, function(statusCode, buyDateResult) {
          try {
            if(statusCode == 200) {
              if( ! ( buyDateResult.Response && buyDateResult.Response == 'Error' ) ) {
                try {
                  queryCryptocompareApi(sellDate, function(statusCode, sellDateResult) {
                    if( ! ( sellDateResult.Response && sellDateResult.Response == 'Error' ) ) {
                      var gain = sellDateResult.ETH.USD * amount;
                      var cost = buyDateResult.ETH.USD * amount;
                      var roi = ( gain - cost ) / cost;
                      console.log('gain : ' + gain + ', cost : ' + cost);
                      console.log('Return on investment : ', roi);
                      return roi;
                    } else {
                      throw new Error(sellDateResult.Message);
                    }
                  });
                } catch(exception) {
                  throw exception;
                }
              } else {
                throw new Error(buyDateResult.Message);
              }
            } else {
              throw new Error('cannot connect to min-api.cryptocompare.com');
            }
          } catch(exception) {
            throw exception;
          }
				});
			} catch(exception) {
				throw exception;
			}
		} else {
			throw new Error('sellDate must be greater than buyDate');
		}
	} else {
		throw new Error('invalid arguments');
	}
}

module.exports = roi;
