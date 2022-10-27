const ethers = require('ethers')
const optimismSDK = require("@eth-optimism/sdk")
const ResolverAbi = require('./OptimismResolverStub.json').abi
if(!(process.env.L1_PROVIDER_URL && process.env.L2_PROVIDER_URL)){
    throw "Set L1_PROVIDER_URL and L2_PROVIDER_URL "
}
console.log(process.env.L1_PROVIDER_URL)
const l1_provider = new ethers.providers.JsonRpcProvider(process.env.L1_PROVIDER_URL);
const l2_provider = new ethers.providers.JsonRpcProvider(process.env.L2_PROVIDER_URL);
const network = 'goerli'

const l1resolverAddress = '0x3D72aB34049A285569819Cc533E3923E021ee9D6'
const l2resolverAddress = '0xfa87477cF5281D9b9B9A2a9bE2A75B267AEDAF8c'

const main = async () => {
    const resolver = new ethers.Contract(l1resolverAddress, ResolverAbi, l1_provider);
    // test.test
    const node = '0x28f4f6752878f66fd9e3626dc2a299ee01cfe269be16e267e71046f1022271cb'
    const addrSlot = ethers.utils.keccak256(node + '00'.repeat(31) + '01');
    const number = await l1_provider.getBlock('latest')
    const addressData = await l2_provider.getStorageAt(l2resolverAddress, addrSlot)
    console.log(1,{
      number:number.number, l2resolverAddress, addrSlot,
      addressData
    })
    const crossChainMessenger = new optimismSDK.CrossChainMessenger({
      l1ChainId: 5,
      l2ChainId: 420,
      l1SignerOrProvider: l1_provider,
      l2SignerOrProvider: l2_provider
    })
    const beforeTime = new Date()
    console.log('*** before calling getStorageProof', beforeTime)
    const storageProof = await crossChainMessenger.getStorageProof(l2resolverAddress, addrSlot, 'finalized')
    const afterTime = new Date()
    console.log('*** before calling getStorageProof', afterTime)
    console.log('*** Time took', afterTime - beforeTime)
    const data =  resolver.interface.encodeFunctionData('addrWithProof', [node, storageProof])
    const result = await resolver.provider.call({
        to: l1resolverAddress,
        data,
    });
    const decodedResult = resolver.interface.decodeFunctionResult("addrWithProof", result);
    console.log(5, {decodedResult})
  }

main()