import Web3, { Contract, ContractAbi } from "web3";

import ABI from "./abi.json"
import { contract } from "web3/lib/commonjs/eth.exports";

type LoginResult = {
    account: string;
    isAdmin: boolean;
}

const CONTRACT_ADDRESS = `${process.env.REACT_APP_CONTRACT_ADDRESS}`;

function getWeb3(): Web3 {

    if(!window.ethereum) 
        throw new Error("No Metamask found");

    return new Web3(window.ethereum);
}

function getContract(web3?: Web3) : Contract <ContractAbi>{

    if(!web3)
        web3 = getWeb3();

    //return new web3.eth.Contract(ABI, CONTRACT_ADDRESS, {from: accounts[0]});

    //undefined assume o padrão MetaMask
    return new web3.eth.Contract(ABI, CONTRACT_ADDRESS, {from: localStorage.getItem("account") || undefined});
}

export async function doLogin() : Promise <LoginResult> {

    const web3 = getWeb3();
    
    const accounts = await web3.eth.requestAccounts();

    if (!accounts || !accounts.length)
        throw new Error("Account not found/allowed.");


    //const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS, {from: accounts[0]});
    
    const contract = getContract(web3);

    const ownerAddress = await contract.methods.owner().call();

    localStorage.setItem("account", accounts[0]);
    localStorage.setItem("isAdmin", `${accounts[0] === String(ownerAddress).toLocaleLowerCase()}`);

    return {
        account: accounts[0],
        isAdmin: accounts[0] === String(ownerAddress).toLocaleLowerCase()
    } as LoginResult;
}