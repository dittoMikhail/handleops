"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApproveCalldata = getApproveCalldata;
const viem_1 = require("viem");
function getApproveCalldata(spender, amount) {
    // ABI of the ERC-20 approve function
    const approveAbi = {
        name: 'approve',
        type: 'function',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
    };
    // Generate calldata
    const calldata = (0, viem_1.encodeFunctionData)({
        abi: [approveAbi],
        functionName: 'approve',
        args: [spender, amount],
    });
    return calldata;
}
