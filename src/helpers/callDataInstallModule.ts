import { encodeAbiParameters, Hex } from "viem"
import { IExecution } from "../interfaces/IExecution";


const abiEncodeWithSelector = (selector: string, abiTypes: any[], args: any[]): Hex => {
  const encodedArgs = encodeAbiParameters(abiTypes, args);
  return `0x${selector + encodedArgs.slice(2)}`;
};

export function getInstallModuleCallData(moduleAddress: string): Hex {
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
