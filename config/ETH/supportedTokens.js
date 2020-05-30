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
            symbol:"NKN-ERC20",
            contractAddr:"0x5cf04716ba20127f1e2297addcf4b5035000c9eb",
            decimals:18
        },{
            symbol:"USDT-ERC20",
            contractAddr:"0xdac17f958d2ee523a2206206994597c13d831ec7",
            decimals:6
        },{
            symbol:"OP-ERC20",
            contractAddr:"0x2ff9c84987b713302a054a4435c19d479407d3db",
            decimals:18
        }
    ]
} else if(process.env.NODE_ENV === "development") {
    allSupportedTokenList = [
        {
            symbol:"IFOOD",
            contractAddr:"0xf9698aD246086064F4C09df83b56Dc9460600CdE",
            decimals:18
        },{
            symbol:"USDT-ERC20",
            contractAddr:"0xa8618B875a26da5CD11C6c7969BE46259b96fC1E",
            decimals:6
        },{
            symbol:"OP-ERC20",
            contractAddr:"0x102b14b6c1c53e4520d8b6eb22DB469527EDdCDd",
            decimals:18
        }
    ]
} else {
    allSupportedTokenList = [
        {
            symbol:"IFOOD",
            contractAddr:"0xf9698aD246086064F4C09df83b56Dc9460600CdE",
            decimals:18
        },{
            symbol:"USDT-ERC20",
            contractAddr:"0xa8618B875a26da5CD11C6c7969BE46259b96fC1E",
            decimals:6
        },{
            symbol:"OP-ERC20",
            contractAddr:"0x102b14b6c1c53e4520d8b6eb22DB469527EDdCDd",
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
