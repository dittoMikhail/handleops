import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient, getUserOperationGasPrice } from "@zerodev/sdk"
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import { http, createPublicClient, zeroAddress } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { polygon } from "viem/chains"

const PROJECT_ID = ''
const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}`
// const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${PROJECT_ID}`
 
const chain = polygon
const entryPoint = getEntryPoint("0.7")
const kernelVersion = KERNEL_V3_1


async function main() {
    const privateKey = '' // 0x...
    const signer = privateKeyToAccount(privateKey)
    const RPC_URL = "https://polygon.rpc.subquery.network/public"

    // Construct a public client
    const publicClient = createPublicClient({
        // Use your own RPC provider (e.g. Infura/Alchemy).
        transport: http(RPC_URL),
        chain
    })

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        entryPoint,
        kernelVersion
    })

    const account = await createKernelAccount(publicClient, {
        address: "0x320A88Af954ACbDA0faC3D9198060E9f296a5b25", // add this field, if account already exists
        plugins: {
          sudo: ecdsaValidator,
        },
        entryPoint,
        kernelVersion
    })

    const kernelClient = createKernelAccountClient({
        account,
        chain,
        bundlerTransport: http(BUNDLER_RPC),
        // Required - the public client
        client: publicClient,
     
        // Required - the default gas prices might be too high
        userOperation: {
          estimateFeesPerGas: async ({bundlerClient}) => {
              return getUserOperationGasPrice(bundlerClient)
          }
        }
      })
     
    const accountAddress = kernelClient.account.address
    console.log("My account:", accountAddress)

    const userOpHash = await kernelClient.sendUserOperation({
        callData: await kernelClient.account.encodeCalls([{
          to: "0x53d759e049aCe12323ba223453AEDa2f5B766B73",
          value: BigInt(0),
          data: "0xe2ac6af800000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000174876e800000000000000000000000000000000000000000000000000000000000007a12000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000120000000000000000000000000c2132d05d31c914a87c6611c10748aeb04b58e8f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc4500000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000c2132d05d31c914a87c6611c10748aeb04b58e8f0000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf127000000000000000000000000000000000000000000000000000000000000001f4000000000000000000000000320a88af954acbda0fac3d9198060e9f296a5b2500000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000012e7a868f01d7f13f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        }]),
    })

    console.log("UserOp hash:", userOpHash)
    console.log("Waiting for UserOp to complete...")
   
    await kernelClient.waitForUserOperationReceipt({
      hash: userOpHash,
      timeout: 1000 * 15,
    })
   
    console.log("View completed UserOp here: https://jiffyscan.xyz/userOpHash/" + userOpHash)
}
main();