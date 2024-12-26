import { encodeFunctionData } from 'viem';

export function getApproveCalldata(spender: string, amount: bigint): `0x${string}` {
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
  const calldata = encodeFunctionData({
    abi: [approveAbi],
    functionName: 'approve',
    args: [spender, amount],
  });

  return calldata;
}

