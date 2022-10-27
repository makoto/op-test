const ethers = require('ethers')
const optimismSDK = require("@eth-optimism/sdk")
const toRpcHexString = require('@eth-optimism/core-utils').toRpcHexString
const abi = require('./StateCommitmentChain.json').abi
if(!(process.env.L1_PROVIDER_URL && process.env.L2_PROVIDER_URL)){
    throw "Set L1_PROVIDER_URL and L2_PROVIDER_URL "
}
console.log(process.env.L1_PROVIDER_URL)
const l1_provider = new ethers.providers.JsonRpcProvider(process.env.L1_PROVIDER_URL);
const l2_provider = new ethers.providers.JsonRpcProvider(process.env.L2_PROVIDER_URL);
const network = 'goerli'

const main = async () => {
    // test.test
    // await getLatestStateBatchHeader()
    console.log(1)
    const ovmStateCommitmentChain = new ethers.Contract('0x9c945aC97Baf48cB784AbBB61399beB71aF7A378', abi, l1_provider);
    console.log(2)
    const totalElements  = await  ovmStateCommitmentChain.getTotalElements()
    console.log(3, totalElements)
    const node = '0x28f4f6752878f66fd9e3626dc2a299ee01cfe269be16e267e71046f1022271cb'
    const l1resolverAddress = '0x3D72aB34049A285569819Cc533E3923E021ee9D6'
    const l2resolverAddress = '0xfa87477cF5281D9b9B9A2a9bE2A75B267AEDAF8c'
    const addrSlot = ethers.utils.keccak256(node + '00'.repeat(31) + '01');
    const number = await l1_provider.getBlock('latest')
    const addressData = await l2_provider.getStorageAt(l2resolverAddress, addrSlot)
    console.log(1,{
      number:number.number, l2resolverAddress, addrSlot,
      addressData
    })
    // const {accountProof, storageProof, storageValue, storageRoot } = await optimismSDK.makeStateTrieProof(l1_provider, number.number, l2resolverAddress, addrSlot)
    // should they be the same?
    // console.log(2,{addressData, storageValue:storageValue.toNumber()})
    const blockNumber = toRpcHexString(number.number)
    console.log(2, 
        l2resolverAddress,
        [addrSlot],
        '0x22980b'
    )
    const proof = await l2_provider.send('eth_getProof', [
        '0xfa87477cF5281D9b9B9A2a9bE2A75B267AEDAF8c',
        ['0x41a7ecb4c66365897e613b13cbcff4071e0a1216c2ed9184cdfd10a7914415a8'],
        '0x22980b'
        // l2resolverAddress,
        // [addrSlot],
        // blockNumber,
    ])
    console.log({proof}, number.number - 1000)
    const r = await optimismSDK.makeStateTrieProof(l2_provider, totalElements, l2resolverAddress, addrSlot)
    console.log({r})

    const crossChainMessenger = new optimismSDK.CrossChainMessenger({
      l1ChainId: network === "goerli" ? 5 : 1,    
      l2ChainId: network === "goerli" ? 420 : 10,
      l1SignerOrProvider: l1_provider,
      l2SignerOrProvider: l2_provider
    })
    option = {
      address: l2resolverAddress,
      slot: addrSlot,
      blockTag: 'finalized'
    }
    console.log({option})
    const rr = await crossChainMessenger.getStorageProof(l2resolverAddress, addrSlot, 'finalized')
    console.log({rr})
}

main()