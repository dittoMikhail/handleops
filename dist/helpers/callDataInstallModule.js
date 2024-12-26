"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstallModuleCallData = getInstallModuleCallData;
const viem_1 = require("viem");
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
