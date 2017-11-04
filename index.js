const http = require("http")
const https = require("https")

const queryCryptocompareApi = (date) => {
	return new Promise((resolve, reject) => {
		const options = {
			host: 'min-api.cryptocompare.com',
			port: 443,
			path: '/data/pricehistorical?fsym=ETH&tsyms=USD&ts=' + date,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		}
		const port = options.port == 443 ? https : http
		const req = port.request(options, (res) => {
			let output = ''
			res.setEncoding('utf8')
			res.on('data', (chunk) => {
				output += chunk
			})
			res.on('end', function() {
				var data = JSON.parse(output)
				resolve({
					statusCode: res.statusCode,
					data: data
				})
			})
		})
		req.on('error', (err) => {
			reject(err)
		})
		req.end()
	})
}

const roi = (buyDate, sellDate, amount) => {
	try {
		buyDate = parseInt(buyDate)
		sellDate = parseInt(sellDate)
		amount = parseInt(amount)
		if (sellDate > buyDate) {
			return queryCryptocompareApi(buyDate).then(buyDateResult => {
				if(buyDateResult.statusCode == 200) {
					console.log('Buy date values : ', buyDateResult)
					return queryCryptocompareApi(sellDate).then(sellDateResult => {
						console.log('Sell date values : ', sellDateResult)
						let gain = sellDateResult.data.ETH.USD * amount
						let cost = buyDateResult.data.ETH.USD * amount
						let roi = ( gain - cost ) / cost
						console.log('\nReturn on investment : ', roi)
						return roi
					}).catch(exception => { console.error(exception) })
        			} else {
          				throw new Error('cannot connect to min-api.cryptocompare.com')
        			}
			}).catch(exception => { console.error(exception) })
		} else {
			throw new Error('sellDate must be greater than buyDate')
		}
	} catch(exception) {
		console.error(exception)
	}
}

roi(process.argv[2], process.argv[3], process.argv[4])

module.exports = roi
