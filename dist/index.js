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
const PROJECT_ID = '49e58f7f-c1ec-4ccb-ad44-0d3a0b806bfe';
const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}`;
// const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${PROJECT_ID}`
const chain = chains_1.polygon;
const entryPoint = (0, constants_1.getEntryPoint)("0.7");
const kernelVersion = constants_1.KERNEL_V3_1;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const privateKey = '0x9af9740f589c55da5d642602b1c1f6791f064639c013249239a5e4011fdecc13';
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
            address: "0x320A88Af954ACbDA0faC3D9198060E9f296a5b25",
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
        const userOpHash = yield kernelClient.sendUserOperation({
            callData: yield kernelClient.account.encodeCalls([{
                    to: "0x53d759e049aCe12323ba223453AEDa2f5B766B73",
                    value: BigInt(0),
                    data: "0xe2ac6af800000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000174876e800000000000000000000000000000000000000000000000000000000000007a12000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000120000000000000000000000000c2132d05d31c914a87c6611c10748aeb04b58e8f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc4500000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000c2132d05d31c914a87c6611c10748aeb04b58e8f0000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf127000000000000000000000000000000000000000000000000000000000000001f4000000000000000000000000320a88af954acbda0fac3d9198060e9f296a5b2500000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000012e7a868f01d7f13f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                }]),
        });
        console.log("UserOp hash:", userOpHash);
        console.log("Waiting for UserOp to complete...");
        yield kernelClient.waitForUserOperationReceipt({
            hash: userOpHash,
            timeout: 1000 * 15,
        });
        console.log("View completed UserOp here: https://jiffyscan.xyz/userOpHash/" + userOpHash);
    });
}
main();
