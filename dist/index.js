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
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@zerodev/sdk");
const constants_1 = require("@zerodev/sdk/constants");
const ecdsa_validator_1 = require("@zerodev/ecdsa-validator");
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("viem/chains");
const PROJECT_ID = '';
const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}`;
// const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${PROJECT_ID}`
const chain = chains_1.polygon;
const entryPoint = (0, constants_1.getEntryPoint)("0.7");
const kernelVersion = constants_1.KERNEL_V3_1;
const addressSmartAccount = '0x0123456789012345678901234567890123456789';
const privateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const abiEncodeWithSelector = (selector, abiTypes, args) => {
    const encodedArgs = (0, viem_1.encodeAbiParameters)(abiTypes, args);
    return `0x${selector + encodedArgs.slice(2)}`;
};
function getInstallModuleCallData(moduleAddress) {
    const installModuleSelector = "9517e29f";
    const abiTypes = [
        { name: 'moduleType', type: 'uint' },
        { name: 'module', type: 'address' },
        { name: 'initData', type: 'bytes' }
    ];
    const initDataKernel = "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000c6578656375746f724461746100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    const args = [BigInt(2), moduleAddress, initDataKernel];
    const encodedData = abiEncodeWithSelector(installModuleSelector, abiTypes, args);
    return encodedData;
}
function getClient() {
    return __awaiter(this, void 0, void 0, function* () {
        const signer = (0, accounts_1.privateKeyToAccount)(privateKey);
        const RPC_URL = "https://polygon.rpc.subquery.network/public";
        // Construct a public client
        const publicClient = (0, viem_1.createPublicClient)({
            // Use your own RPC provider (e.g. Infura/Alchemy).
            transport: (0, viem_1.http)(RPC_URL),
            chain
        });
        const ecdsaValidator = yield (0, ecdsa_validator_1.signerToEcdsaValidator)(publicClient, {
            signer,
            entryPoint,
            kernelVersion
        });
        const account = yield (0, sdk_1.createKernelAccount)(publicClient, {
            address: addressSmartAccount, // add this field, if account already exists
            plugins: {
                sudo: ecdsaValidator,
            },
            entryPoint,
            kernelVersion
        });
        const kernelClient = (0, sdk_1.createKernelAccountClient)({
            account,
            chain,
            bundlerTransport: (0, viem_1.http)(BUNDLER_RPC),
            // Required - the public client
            client: publicClient,
            // Required - the default gas prices might be too high
            userOperation: {
                estimateFeesPerGas: (_a) => __awaiter(this, [_a], void 0, function* ({ bundlerClient }) {
                    return (0, sdk_1.getUserOperationGasPrice)(bundlerClient);
                })
            }
        });
        const accountAddress = kernelClient.account.address;
        console.log("My account:", accountAddress);
        return kernelClient;
    });
}
function installModuleDitto() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield getClient();
        const addressModule = "";
        const userOpHash = yield client.sendUserOperation({
            callData: yield client.account.encodeCalls([{
                    to: addressSmartAccount,
                    value: BigInt(0),
                    data: getInstallModuleCallData(addressModule),
                }]),
        });
        console.log("UserOp hash:", userOpHash);
        console.log("Waiting for UserOp to complete...");
        yield client.waitForUserOperationReceipt({
            hash: userOpHash,
            timeout: 1000 * 15,
        });
        console.log("View completed UserOp here: https://jiffyscan.xyz/userOpHash/" + userOpHash);
    });
}
installModuleDitto();
