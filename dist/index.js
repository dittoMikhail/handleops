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
const callDataOnRouter_1 = require("./helpers/callDataOnRouter");
const callDataForApprove_1 = require("./helpers/callDataForApprove");
const callDataInstallModule_1 = require("./helpers/callDataInstallModule");
const callDataAddWorkflow_1 = require("./helpers/callDataAddWorkflow");
const PROJECT_ID = '';
const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}`;
// const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${PROJECT_ID}`
const chain = chains_1.polygon;
const entryPoint = (0, constants_1.getEntryPoint)("0.7");
const kernelVersion = constants_1.KERNEL_V3_1;
const addressSmartAccount = '0x0123456789012345678901234567890123456789';
const privateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
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
                    data: (0, callDataInstallModule_1.getInstallModuleCallData)(addressModule),
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
function limitOrder() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield getClient();
        const uniswapRouter = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
        const tokenIn = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
        const tokenOut = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
        const poolFee = 500;
        const recipient = addressSmartAccount;
        const amountIn = BigInt(500000000000000000);
        const amountOut = BigInt(500000000);
        const callDataApprove = (0, callDataForApprove_1.getApproveCalldata)(uniswapRouter, amountIn);
        const callDataOnRouter = (0, callDataOnRouter_1.getExactInputSingleCalldata)(tokenIn, tokenOut, poolFee, recipient, amountIn, amountOut, BigInt(0));
        const initsArray = [];
        const actionsArray = [
            {
                target: tokenIn,
                value: BigInt(0),
                callData: callDataApprove
            },
            {
                target: uniswapRouter,
                value: BigInt(0),
                callData: callDataOnRouter
            },
        ];
        const maxGasPrice = BigInt(100000000000); //100 gwei
        const maxGasLimit = BigInt(500000); // 500_000
        const count = BigInt(1);
        const addWorkflowCallData = (0, callDataAddWorkflow_1.getAddWorkflowCallData)(initsArray, actionsArray, maxGasPrice, maxGasLimit, count);
        const userOpHash = yield client.sendUserOperation({
            callData: yield client.account.encodeCalls([{
                    to: addressSmartAccount,
                    value: BigInt(0),
                    data: addWorkflowCallData,
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
