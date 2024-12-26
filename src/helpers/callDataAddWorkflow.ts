import { IExecution } from "../interfaces/IExecution";
import { encodeFunctionData } from 'viem';

export function getAddWorkflowCallData(
    inits: IExecution[],
    actions: IExecution[],
    maxGasPrice: bigint, 
    maxGasLimit: bigint,
    count: bigint
): `0x${string}` {
   
    // Подготовка параметров для encodeFunctionData
    const encodedData = encodeFunctionData({
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