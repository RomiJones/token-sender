let allSupportedTokenList = null;

if(process.env.NODE_ENV === "production") {
    allSupportedTokenList = [
        {
            symbol:"KTO",
            contractAddr:"0x8c9ec3849d41b077ee20abe5bdf342a2b841108e",
            decimals:18
        },{
            symbol:"IFOOD",
            contractAddr:"0x81e74a3ea4bab2277aa3b941e9d9f37b08ac5374",
            decimals:18
        },{
            symbol:"HGH",
            contractAddr:"0x18be1e39D4F628F1034Ab531d9EE3Ac4364260d0",
            decimals:18
        },{
            symbol:"NKN",
            contractAddr:"0x5cf04716ba20127f1e2297addcf4b5035000c9eb",
            decimals:18
        }
    ]
} else if(process.env.NODE_ENV === "development") {
    allSupportedTokenList = [
        {
            symbol:"IFOOD",
            contractAddr:"0xf9698aD246086064F4C09df83b56Dc9460600CdE",
            decimals:18
        }
    ]
} else {
    allSupportedTokenList = [
        {
            symbol:"IFOOD",
            contractAddr:"0xf9698aD246086064F4C09df83b56Dc9460600CdE",
            decimals:18
        }
    ];
}

let allSupportedTokenMap = {}
for(let i = 0 ; i < allSupportedTokenList.length ; i++) {
    let tmp = allSupportedTokenList[i];
    allSupportedTokenMap[tmp.symbol] = tmp;
}

function getTokenList() {
  return allSupportedTokenList;
}

function getToken(symbol) {
    return allSupportedTokenMap[symbol];
}

module.exports = {
    getTokenList,
    getToken
}
