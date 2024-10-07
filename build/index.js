"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
// Set network (can be MAINNET, TESTNET, DEVNET based on environment variable)
const APTOS_NETWORK = ts_sdk_1.NetworkToNetworkName[(_a = process.env.APTOS_NETWORK) !== null && _a !== void 0 ? _a : ts_sdk_1.Network.MAINNET];
// Create an Aptos instance with the specified network
const config = new ts_sdk_1.AptosConfig({ network: APTOS_NETWORK });
const aptos = new ts_sdk_1.Aptos(config);
// Hardcoded private key of the sender
const privateKeyString = ""; // Replace with your private key here
const privateKey = new ts_sdk_1.Ed25519PrivateKey(privateKeyString);
const sender = ts_sdk_1.Account.fromPrivateKey({ privateKey });
console.log("New build");
// Hardcoded recipient address
const recipients = [
    "0x95e99cc2790440d84bc3f7a5b293a0ca103766635d7725523e1fad12b9c30b8d",
    "0x9de06b8662fece31e50117b7648806de06cfcd685132d8ca90659dc1a05b2d75",
    "0x937a4e29ddcf236f0af026ae9b87bc583cd6d1b756cefa4d8d938ff3a0a533d2",
    "0x48b6200aca64abe5a3ae5198a6bfc5840d8897915741d6c008d62f81b2e6c3b4",
    "0xbd3510928504af77d73b479a0bf0f7ef3df7313f2e9699b3c7d1615df6038121",
    "0x38180f561f569cbad1fe6469032e4e7fa62ab9db2da2e361d830333e2e1b1031",
    "0xa79f069be7dd69927c88d42b19f01b9dcb6c0686fe85eeea0ba2f4f8d475ade2",
    "0x6a82bb29ebb8d7f49a0522322310004d2174c040229cc5d853725f02d4a8a18c"
]; // Replace with the recipient's account address here
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const accountSequence = yield aptos.getAccountInfo({ accountAddress: sender.accountAddress });
        console.log(`This is the account's starting sequence: ${accountSequence.sequence_number}`);
        const transactionsCount = 10; // Number of transactions to the same recipient
        const totalTransactions = transactionsCount;
        const start = Date.now() / 1000; // Current time in seconds
        console.log("Starting...");
        console.log(`Sender: ${sender.accountAddress.toString()}`);
        let last = Date.now() / 1000;
        try {
            const accountInfo = yield aptos.getAccountInfo({ accountAddress: sender.accountAddress });
            console.log(`Sender account balance checked: ${accountInfo.sequence_number} in ${Date.now() / 1000 - last} seconds`);
            last = Date.now() / 1000;
        }
        catch (error) {
            console.error("Error fetching sender account balance:", error);
        }
        // Create the transactions
        const payloads = [];
        for (let j = 0; j < transactionsCount; j += 1) {
            for (let i = 0; i < recipients.length; i++) {
                const txn = {
                    function: "0x1::aptos_account::transfer",
                    functionArguments: [recipients[i], 100], // Transfer 1 APT each time
                };
                payloads.push(txn);
            }
        }
        console.log(`Sending ${totalTransactions} transactions to ${aptos.config.network}....`);
        // Emit batch transactions
        try {
            yield aptos.transaction.batch.forSingleAccount({ sender, data: payloads });
            console.log("Batch transactions submitted successfully.");
        }
        catch (error) {
            console.error("Error sending batch transactions:", error);
        }
        // Listen to transaction events
        aptos.transaction.batch.on(ts_sdk_1.TransactionWorkerEventsEnum.TransactionSent, (data) => __awaiter(this, void 0, void 0, function* () {
            console.log("Transaction sent:", data.transactionHash);
        }));
        // Listen for execution finish and verify account sequence number
        aptos.transaction.batch.on(ts_sdk_1.TransactionWorkerEventsEnum.ExecutionFinish, (data) => __awaiter(this, void 0, void 0, function* () {
            console.log(data.message);
            // Verify sender's sequence number after transactions
            const accountData = yield aptos.getAccountInfo({ accountAddress: sender.accountAddress });
            console.log(`Sender account sequence number is now: ${accountData.sequence_number}`);
            // Unsubscribe from event listeners
            aptos.transaction.batch.removeAllListeners();
        }));
    });
}
main().catch(console.error);
