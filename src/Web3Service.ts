import Web3, { Contract, ContractAbi } from "web3";

import ABI from "./abi.json"
import { AbiType } from "./AbiType";
import { contract } from "web3/lib/commonjs/eth.exports";

type LoginResult = {
    account: string;
    isAdmin: boolean;
}

export type GameData = {
    hashOptionP1: string; // Hash of Player 1's option
    timeOut: string;      // Timeout duration in seconds (uint64)
    timeOutP1: string;    // Player 1 timeout timestamp (uint256)
    timeOutP2: string;    // Player 2 timeout timestamp (uint256)
    nLockTime: string;    // Lock time for the game (uint256)
    isOdd: boolean;       // Whether the game is Odd/Even (bool)
    player1: string;      // Player 1's address (address)
    player2: string;      // Player 2's address (address)
    optionP2: number;     // Player 2's option (int8)
    optionP1: number;     // Player 1's option (int8)
    keyGame: string;      // Player 1's keygame
  };

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

export enum Options {
    EVEN = 0,
    ODD = 1,
} // 0, 1, 2, 3 - definir os números de forma explicita é opcional

export let gameData: GameData = {
    hashOptionP1: "0x0000000000000000000000000000000000000000000000000000000000000000",
    timeOut: "",
    timeOutP1: "",
    timeOutP2: "",
    nLockTime: "",
    isOdd: false,
    player1: "",
    player2: "",
    optionP2: -1,
    optionP1: -1,
    keyGame: ""
  };

export async function gameState() : Promise <GameData> {
    const web3 = getWeb3();
    const contract = getContract(web3);

    //gameData = fetchGameData(await contract.methods.gameData().call());

    return fetchGameData(await contract.methods.gameData().call());
}

export async function insertGameKey(gameKeyIn: string) : Promise <string> {
    const web3 = getWeb3();
    const contract = getContract(web3);

    gameData = fetchGameData(await contract.methods.gameData().call());

    console.log("gameData.optionP1:", gameData.optionP1);
    if(gameData.optionP1 != -1)
        throw new Error("Player 1 already started game.");

    //let keySeed = hexStringToUint8Array (gameKeyIn)
    //let gameKey = web3.utils.keccak256(keySeed);

    gameData.keyGame = gameKeyIn;

    console.log("Game Key:", gameData.keyGame);
    return gameData.keyGame;
}

export async function insertPlayerOption(playerOption: number, player1: boolean) : Promise <Number> {

    console.log("gameData.optionP1:", gameData.optionP1);

    if(player1 && gameData.keyGame == "")
        throw new Error("Player 1 must insert his keygame first.");

    //let keySeed = hexStringToUint8Array (gameKeyIn)
    //let gameKey = web3.utils.keccak256(keySeed);
    player1 ? gameData.optionP1 = playerOption : gameData.optionP2 = playerOption;

    return player1 ? gameData.optionP1: gameData.optionP2;
}

export async function initGame(isOdd: boolean) : Promise <GameData> {
    const web3 = getWeb3();
    const contract = getContract(web3);

    if(gameData.keyGame == "" || gameData.optionP1 == -1)
        throw new Error("Player 1 must insert his keygame and option first.");

    let keygame = gameData.keyGame;
    let optionP1In = gameData.optionP1;
    let optionP1str = optionP1In.toString(16);

    while(optionP1str.length % 2 === 1 )
      optionP1str = "0" + optionP1str;

    let hashOptionP1In = (web3.utils.keccak256(hexStringToUint8Array(keygame + optionP1str)));

    let bidMin = await contract.methods.bidMin().call(); 

    await contract.methods.playerInit(isOdd, hashOptionP1In).send({value: String(bidMin)});

    gameData = fetchGameData(await contract.methods.gameData().call());

    return gameData;
}

export async function cancel() : Promise <GameData> {
    const web3 = getWeb3();
    const contract = getContract(web3);

    gameData = fetchGameData(await contract.methods.gameData().call());

    if(gameData.player1 == "0x0000000000000000000000000000000000000000" || gameData.optionP2 != -1)
        throw new Error("Cannot cancel this game.");

    await contract.methods.quitGame().send();

    gameData = fetchGameData(await contract.methods.gameData().call());

    return gameData;
}

export async function acceptGame() : Promise <GameData> {
    const web3 = getWeb3();
    const contract = getContract(web3);

    console.log("gameData.hashOptionP1: ", gameData.hashOptionP1);
    console.log("gameData.optionP2: ", gameData.optionP2);

    if(gameData.optionP2 == -1)
        throw new Error("Player 2 must insert his option first.");

    let bidMin = await contract.methods.bidMin().call(); 

    await contract.methods.acceptGame(gameData.optionP2).send({value: String(bidMin)});

    gameData = fetchGameData(await contract.methods.gameData().call());

    return gameData;
}

export async function resultGame() : Promise <GameData> {
    const web3 = getWeb3();
    const contract = getContract(web3);

    if(gameData.keyGame == "" || gameData.optionP1 == -1)
        throw new Error("Player 1 must insert his keygame and option first.");

    let keygame = gameData.keyGame;
    let optionP1In = gameData.optionP1;
    
    await contract.methods.resultGame(hexStringToUint8Array(keygame), optionP1In).send();

    gameData = fetchGameData(await contract.methods.gameData().call());

    return gameData;
}
 
export function fetchGameData(rawGameData: any) {
    
    const gameData: GameData = {
      hashOptionP1: rawGameData[0],
      timeOut: rawGameData[1],
      timeOutP1: rawGameData[2],
      timeOutP2: rawGameData[3],
      nLockTime: rawGameData[4],
      isOdd: rawGameData[5],
      player1: rawGameData[6],
      player2: rawGameData[7],
      optionP2: Number(rawGameData[8]),
      optionP1: Number(rawGameData[9]),
      keyGame: rawGameData[10]
    };
    return gameData;
  }
  
  export function hexStringToUint8Array(hexString: string): Uint8Array {
    // Ensure the hex string length is even
    if (hexString.length % 2 !== 0) {
        throw new Error("Hex string must have an even length");
    }
  
    // Convert the string into an array of bytes
    const byteArray = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < byteArray.length; i++) {
        const byte = hexString.substr(i * 2, 2);
        byteArray[i] = parseInt(byte, 16);
    }
  
    return byteArray;
  }