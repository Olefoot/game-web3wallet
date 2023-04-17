import "regenerator-runtime/runtime";
import { ethers } from "ethers";
import { parseUnits, hexlify } from "ethers/lib/utils";

let provider;
let signer;

document.addEventListener("DOMContentLoaded", loadApp());

async function loadApp() {
  //modified//
  if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined' && window.web3.currentProvider.isMetaMask)) {
    // Metamask está instalado e o objeto web3 está disponível
    //displayResponse("Follow the instructions for connecting to MetaMask:<br><br>1- Enter MetaMask with your username and password;<br>2- Select the account in Next;<br>3- Allow the site to connect;<br>4- Sign the transaction in Sign;<br><br>If you have any questions, please email<br>support@olecoin.io");
    displayResponse("Follow the instructions for connecting to MetaMask:<br><br>1- Enter MetaMask with your username and password;<br>2- Select the account in Next;<br>3- Allow the site to connect;<br>4- Sign the transaction in Sign;<br><br>If you have any questions, please email<br>" + <p id="clickable-text">Click me!</p>);
    var clickableText = document.getElementById("clickable-text");

    clickableText.addEventListener("click", function() {
      // Perform action when text is clicked
      redirectToLink("support@olecoin.io");
    });

  } else {
    // Metamask não está instalado ou o objeto web3 não está disponível
    displayResponse("MetaMask not installed in the browser!<br><br>Install the MetaMask plugin or copy the link below and open it in a browser with the plugin installed.<br>" + window.location.href + "<br><br>If you have questions about installation, click the button below and follow the instructions.<br>https://support.metamask.io/hc/en-us/articles/360015489531-Getting-started-with-MetaMask");
  }
  //----

  provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  signer = provider.getSigner();
  if (!signer) window.location.reload();
  await provider.send("eth_requestAccounts", []);

  //modified//
  displayResponse("Follow the instructions for connecting to MetaMask:<br><br>1- Enter MetaMask with your username and password;<br>2- Select the account in Next;<br>3- Allow the site to connect;<br>4- Sign the transaction in Sign;<br><br>If you have any questions, please email<br>support@olecoin.io");
  processAction();
  //----
}

function processAction() {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get("action");
  const message = urlParams.get("message");
  const chainId = urlParams.get("chainId") || 1;
  const to = urlParams.get("to");
  const value = urlParams.get("value");
  const data = urlParams.get("data") || "";
  const gasLimit = urlParams.get("gasLimit") || undefined;
  const gasPrice = urlParams.get("gasPrice") || undefined;

  if (action === "sign" && message) {
    return signMessage(message);
  }

  if (action === "send" && to && value) {
    return sendTransaction(chainId, to, value, gasLimit, gasPrice, data);
  }

  displayResponse("Invalid URL");
}

async function sendTransaction(chainId, to, value, gasLimit, gasPrice, data) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const network = await provider.getNetwork();
    if (network.chainId !== chainId) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${parseInt(chainId, 10).toString(16)}` }], // chainId must be in hexadecimal numbers
      });
    }
    const from = await signer.getAddress();
    const tx = await signer.sendTransaction({
      from,
      to,
      value: parseUnits(value, "wei"),
      gasLimit: gasLimit ? hexlify(Number(gasLimit)) : gasLimit,
      gasPrice: gasPrice ? hexlify(Number(gasPrice)) : gasPrice,
      data: data ? data : "0x",
    });
    console.log({ tx });
    displayResponse("Connect MetaMask in game.<br><br>Click the button below to connect and then go back to the game", tx.hash);
  } catch (error) {
    copyToClipboard("Error");
    displayResponse("Transaction denied");
  }
}

async function signMessage(message) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const signature = await signer.signMessage(message);
    console.log({ signature });
    displayResponse("Connect MetaMask in game.<br><br>Click the button below to connect and then go back to the game", signature);
  } catch (error) {
    copyToClipboard("Error");
    displayResponse("Transaction denied");
  }
}

async function copyToClipboard(response) {
  try {
    // focus from metamask back to browser
    window.focus();
    // wait to finish focus
    await new Promise((resolve) => setTimeout(resolve, 500));
    // copy tx hash to clipboard
    await navigator.clipboard.writeText(response);

    //modified
    //document.getElementById("response-button").innerHTML = "Copiado";
    displayResponse("Connection with MetaMask successful!<br><br>Go back to the game");
    const responseButton = document.getElementById("response-button");
    responseButton.className = "disabled";
    //---------
  } catch {
    // for metamask mobile android
    const input = document.createElement("input");
    input.type = "text";
    input.value = response;
    document.body.appendChild(input);
    input.select();
    document.execCommand("Copy");
    input.style = "visibility: hidden";

    //modified
    //document.getElementById("response-button").innerHTML = "Copiado";
    displayResponse("Connection with MetaMask successful!<br><br>Go back to the game");
    const responseButton = document.getElementById("response-button");
    responseButton.className = "disabled";
    //---------
  }
}

//modified
async function redirectToLink(response) {
  window.open(response, '_blank');
}
//-------

function displayResponse(text, response,redirect) {
  // display error or response
  const responseText = document.getElementById("response-text");
  responseText.innerHTML = text;
  responseText.className = "active";

  if (response) {
    // display button to copy tx.hash or signature
    const responseButton = document.getElementById("response-button");
    responseButton.className = "active";    
    responseButton.onclick = () => copyToClipboard(response);

  }
}
