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

// const l1resolverAddress = '0x3D72aB34049A285569819Cc533E3923E021ee9D6'
// const l2resolverAddress = '0xfa87477cF5281D9b9B9A2a9bE2A75B267AEDAF8c'
const l1resolverAddress = '0x4e4B335f818Ebfc6CBF211d8A9aFd1E3b9eD1e01'
const l2resolverAddress = '0xD363EC90C77988b90Ed6659E63a9Aa9efBBDFf12'


const main = async () => {
    const resolver = new ethers.Contract(l1resolverAddress, ResolverAbi, l1_provider);
    // test.test
    // const node = '0x28f4f6752878f66fd9e3626dc2a299ee01cfe269be16e267e71046f1022271cb'
    // opresolver.eth
    const node = '0xacdd24943af2f161ccb59a28f62738275e07c40b6148234d4d2a549396286453'
    const addrSlot = ethers.utils.keccak256(node + '00'.repeat(31) + '01');
    const number = await l1_provider.getBlock('latest')
    const addressData = await l2_provider.getStorageAt(l2resolverAddress, addrSlot)
    const proof = await l2_provider.send('eth_getProof', [
      l2resolverAddress,
      [addrSlot],
      'latest'
      // '0x' + BigNumber.from(l2BlockNumber).toHexString().slice(2).replace(/^0+/, '')
  ]);
    console.log(1,{
      number:number.number, l2resolverAddress, addrSlot,
      addressData
    })
    console.log(2, proof)
    const crossChainMessenger = new optimismSDK.CrossChainMessenger({
      l1ChainId: 5,
      l2ChainId: 420,
      l1SignerOrProvider: l1_provider,
      l2SignerOrProvider: l2_provider
    })
    const beforeTime = new Date()
    console.log('*** before calling getStorageProof', beforeTime)
    const storageProof = await crossChainMessenger.getStorageProof(l2resolverAddress, addrSlot, {
      l1BlocksAgo: 2000
      // blockTag:'finalized'
    })
    const afterTime = new Date()
    console.log({storageProof})
    console.log('*** before calling getStorageProof', afterTime)
    console.log('*** Time took', afterTime - beforeTime)
    const data =  resolver.interface.encodeFunctionData('addrWithProof', [node, storageProof])
    const result = await resolver.provider.call({
        to: l1resolverAddress,
        data,
    });
    console.log(4, {result})
    const decodedResult = resolver.interface.decodeFunctionResult("addrWithProof", result);
    console.log(5, {decodedResult})
  }

main()