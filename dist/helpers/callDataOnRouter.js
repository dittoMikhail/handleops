"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExactInputSingleCalldata = getExactInputSingleCalldata;
const viem_1 = require("viem");
// Определение ABI для метода exactInputSingle
const exactInputSingleAbi = [
    {
        "inputs": [
            {
                "components": [
                    { "internalType": "address", "name": "tokenIn", "type": "address" },
                    { "internalType": "address", "name": "tokenOut", "type": "address" },
                    { "internalType": "uint24", "name": "fee", "type": "uint24" },
                    { "internalType": "address", "name": "recipient", "type": "address" },
                    { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
                    { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" },
                    { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
                ],
                "internalType": "struct ISwapRouter.ExactInputSingleParams",
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "exactInputSingle",
        "outputs": [
            { "internalType": "uint256", "name": "amountOut", "type": "uint256" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
// Функция для подготовки calldata
function getExactInputSingleCalldata(tokenIn, tokenOut, fee, recipient, amountIn, amountOutMinimum, sqrtPriceLimitX96) {
    const calldata = (0, viem_1.encodeFunctionData)({
        abi: exactInputSingleAbi,
        functionName: 'exactInputSingle',
        args: [
            {
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: fee,
                recipient: recipient,
                amountIn: amountIn,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: sqrtPriceLimitX96,
            },
        ],
    });
    return calldata;
}
