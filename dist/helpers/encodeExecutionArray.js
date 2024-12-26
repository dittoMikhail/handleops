"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeExecutionArray = encodeExecutionArray;
const viem_1 = require("viem");
function encodeExecutionArray(structs) {
    // ABI описывает формат массива структур
    const structAbi = (0, viem_1.parseAbiParameters)([
        '(address target, uint256 value, bytes callData)[]',
    ]);
    // Кодируем массив структур
    const calldata = (0, viem_1.encodeAbiParameters)(structAbi, [structs]);
    return calldata;
}
