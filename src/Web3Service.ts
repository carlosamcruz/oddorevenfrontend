import Web3 from "web3";

import ABI from "./abi.json"
import { contract } from "web3/lib/commonjs/eth.exports";

type LoginResult = {
    account: string;
    isAdmin: boolean;
}

const CONTRACT_ADDRESS = `${process.env.REACT_APP_CONTRACT_ADDRESS}`;

export async function doLogin() : Promise <LoginResult> {

    if(!window.ethereum) 
        throw new Error("No Metamask found");

    const web3 = new Web3(window.ethereum);
    
    const accounts = await web3.eth.requestAccounts();

    if (!accounts || !accounts.length)
        throw new Error("Account not found/allowed.");


    console.log("process.env.REACT_APP_CONTRACT_ADDRESS: ", CONTRACT_ADDRESS);
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS, {from: accounts[0]});  

    const ownerAddress = await contract.methods.owner().call();

    console.log("ownerAddress: ", ownerAddress);

    localStorage.setItem("account", accounts[0]);
    localStorage.setItem("isAdmin", `${accounts[0] === String(ownerAddress).toLocaleLowerCase()}`);

    return {
        account: accounts[0],
        isAdmin: accounts[0] === String(ownerAddress).toLocaleLowerCase()
    } as LoginResult;
}