const {
  ethers
} = require('ethers')
const ERC721_ABI = require('../contracts/CoolCats.json')
const CacheService = require('../cache')
const fetch = require('node-fetch');
const fs = require("fs");
const ttl = 30; //cache for 30 seconds by default, overriden to 0 (unlimited) for getById below;
const cache = new CacheService(ttl);
console.log(process.env)
const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const erc721Contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ERC721_ABI.abi, provider);

const MetadataRepo = {
  getAll() {
    return cache.get("TotalSupply", () => erc721Contract.totalSupply().then((bigNumber) => bigNumber.toNumber()))
      .then((total) => {
        return total;
      });
  },

  getById(id) {
    return cache.get(`Token_${id}`, () => {
        return erc721Contract
          .ownerOf(id)
          .then(() => true)
          .catch(() => false);
      }, 0)
      .then((exists) => {
        if (exists) {
          // return fetch(`${process.env.SOURCE_BASE_URI}${id}.json`, {method: 'GET'})
          //   .then(res => {
          //     return res.json();
          //   })
          //   .then((data) => {
          //     return data;
          //   })

          // Get it from local
          let data;
          try {
            data = fs.readFileSync(`${process.env.SOURCE_BASE_URI}/${id}.json`);
            data = JSON.parse(data);
            return data;
          } catch (error) {
            return {
              error: `Token ${id} metadata not found`
            }
          }

        } else {
          return {
            error: `Token ${id} doesn't exist`
          };
        }
      });
  }
};

module.exports = MetadataRepo;