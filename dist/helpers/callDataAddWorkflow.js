"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddWorkflowCallData = getAddWorkflowCallData;
const viem_1 = require("viem");
function getAddWorkflowCallData(inits, actions, maxGasPrice, maxGasLimit, count) {
    // Подготовка параметров для encodeFunctionData
    const encodedData = (0, viem_1.encodeFunctionData)({
        abi: [
            {
                type: 'function',
                name: 'addWorkflow',
                inputs: [
                    {
                        type: 'tuple[]',
                        name: '_inits',
                        components: [
                            { type: 'address', name: 'target' },
                            { type: 'uint256', name: 'value' },
                            { type: 'bytes', name: 'callData' },
                        ],
                    },
                    {
                        type: 'tuple[]',
                        name: '_actions',
                        components: [
                            { type: 'address', name: 'target' },
                            { type: 'uint256', name: 'value' },
                            { type: 'bytes', name: 'callData' },
                        ],
                    },
                    { type: 'uint256', name: '_maxGasPrice' },
                    { type: 'uint256', name: '_maxGasLimit' },
                    { type: 'uint88', name: '_count' },
                ],
                outputs: [],
            },
        ],
        functionName: 'addWorkflow',
        args: [
            inits,
            actions,
            maxGasPrice,
            maxGasLimit,
            count,
        ],
    });
    return encodedData;
}
