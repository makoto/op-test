const ethers = require('ethers')
const optimismSDK = require("@eth-optimism/sdk")

if(!(process.env.L1_PROVIDER_URL && process.env.L2_PROVIDER_URL)){
    throw "Set L1_PROVIDER_URL and L2_PROVIDER_URL "
}
console.log(process.env.L1_PROVIDER_URL)
const l1_provider = new ethers.providers.JsonRpcProvider(process.env.L1_PROVIDER_URL);
const l2_provider = new ethers.providers.JsonRpcProvider(process.env.L2_PROVIDER_URL);

const main = async () => {
    // test.test
    const node = '0x28f4f6752878f66fd9e3626dc2a299ee01cfe269be16e267e71046f1022271cb'
    const l1resolverAddress = '0x3D72aB34049A285569819Cc533E3923E021ee9D6'
    const l2resolverAddress = '0xfa87477cF5281D9b9B9A2a9bE2A75B267AEDAF8c'
    const addrSlot = ethers.utils.keccak256(node + '00'.repeat(31) + '01');
    const number = await l1_provider.getBlock('latest')
    const addressData = await l2_provider.getStorageAt(l2resolverAddress, 0)
    console.log(1,{
      number:number.number, l2resolverAddress, addrSlot,
      addressData
    })
    const {accountProof, storageProof, storageValue, storageRoot } = await optimismSDK.makeStateTrieProof(l1_provider, number.number, l2resolverAddress, addrSlot)
    // should they be the same?
    console.log({addressData, storageValue:storageValue.toNumber()})
}

main()