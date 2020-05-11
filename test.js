const http = require('http');
const ETH_Sender_HOST = '127.0.0.1';

let requestForERC20Transfer = function (tokenSymbol, toAddr, amount, accessKey) {
    let postData = JSON.stringify({
                tokenSymbol:tokenSymbol,
                toAddr:toAddr,
                amount:amount,
                accessKey:accessKey
            }
        );
    let options = {
        hostname: ETH_Sender_HOST,
        port: 6666,
        path: '/api/v1/do-transfer',
        method: 'POST',
        headers: {
            'Content-Type': "application/json;charset=utf-8",
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    let req = http.request(options, (res) => {
        console.log('statusCode:', res.statusCode);

        res.on('data', (data) => {
            console.log("response data:", data.toString());
            let tmpObj = JSON.parse(data);
        });

        res.on("end", () => {
            console.log("response end");
        });
    });

    req.on("error", (e) => {
        console.error("request error:", e);
    });
    req.write(postData);
    req.end();
}

/*
requestForERC20Transfer("IFOOD",
    "0x8D131F20c2Ecf61e8efBe3b8001B7dde1790C3a7",
    12,"55ef6100e7cac696648a78688f664f014836b03a261873f4ff78701745e6f09a");
*/
requestForERC20Transfer("OP-ERC20",
    "0x14fB3B7eE19E2cc540fa616FF922e8317d4f9b12",
    110.0000007,
    "55ef6100e7cac696648a78688f664f014836b03a261873f4ff78701745e6f09a");
