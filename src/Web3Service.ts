import Web3, { Contract, ContractAbi } from "web3";

import ABI from "./abi.json"
import { AbiType } from "./AbiType";
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
    return new web3.eth.Contract(ABI as AbiType, CONTRACT_ADDRESS, {from: localStorage.getItem("account") || undefined});
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

export function doLogout(){
    localStorage.removeItem("account");
    localStorage.removeItem("isAdmin");
}

export type Dashboard = {
    bid?: string;
    commission?: number;
    address?: string;
    feeSum?: string;
}

export async function getDashboard(): Promise <Dashboard>{
    const contract = getContract(); //inicializa um WEB3 do zero;

    /*
    const address = await contract.methods.getImplementationAddress().call();

    if(/^(0x00+)$/.test(String(address)))
        return {bid: Web3.utils.toWei("0.01", "ether"), commission: 10, address} as Dashboard;
    */

    const web3 = getWeb3();


    const ownerAddress = await contract.methods.owner().call();


    const bid = await contract.methods.bidMin().call();
    const commission = await contract.methods.commission().call();
    const feeSum = await web3.eth.getBalance(String(ownerAddress).toLocaleLowerCase());
    console.log("Fee sum: ", feeSum);

    return {
        bid: String(bid), 
        commission: Number(commission), 
        address: String(contract.options.address).toLocaleLowerCase(),
        feeSum: String(feeSum)
    } as Dashboard;    
}

export async function setCommission(newCommission: number): Promise<string>{
    const contract = getContract();
    const tx = await contract.methods.setComission(BigInt(newCommission)).send();
    return tx.transactionHash;
}

export async function setBid(newBid: string): Promise<string>{
    const contract = getContract();
    const tx = await contract.methods.setBid(newBid).send();
    return tx.transactionHash;
}