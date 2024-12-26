import { encodeFunctionData, AbiItem } from 'viem';

// Определение ABI для метода exactInputSingle
const exactInputSingleAbi: AbiItem[] = [
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
export function getExactInputSingleCalldata(
  tokenIn: string,
  tokenOut: string,
  fee: number,
  recipient: string,
  amountIn: bigint,
  amountOutMinimum: bigint,
  sqrtPriceLimitX96: bigint
): `0x${string}` {
  const calldata = encodeFunctionData({
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
