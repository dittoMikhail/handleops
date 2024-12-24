import { createKernelAccount, createKernelAccountClient, getUserOperationGasPrice } from "@zerodev/sdk"
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import { http, createPublicClient, encodeAbiParameters, Hex } from "viem"
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts"
import { polygon } from "viem/chains"

const PROJECT_ID = ''
const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}`
// const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${PROJECT_ID}`
 
const chain = polygon
const entryPoint = getEntryPoint("0.7")
const kernelVersion = KERNEL_V3_1

const addressSmartAccount = '0x0123456789012345678901234567890123456789'
const privateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' 

const abiEncodeWithSelector = (selector: string, abiTypes: any[], args: any[]): Hex => {
  const encodedArgs = encodeAbiParameters(abiTypes, args);
  return `0x${selector + encodedArgs.slice(2)}`;
};

function getInstallModuleCallData(moduleAddress: string): Hex {
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

async function getClient() {
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
        address: addressSmartAccount, // add this field, if account already exists
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
    
    return kernelClient;
}

async function installModuleDitto() {
  const client = await getClient();

  const addressModule = "";
  
  const userOpHash = await client.sendUserOperation({
      callData: await client.account.encodeCalls([{
        to: addressSmartAccount,
        value: BigInt(0),
        data: getInstallModuleCallData(addressModule),
      }]),
  })

  console.log("UserOp hash:", userOpHash)
  console.log("Waiting for UserOp to complete...")
  
  await client.waitForUserOperationReceipt({
    hash: userOpHash,
    timeout: 1000 * 15,
  })
  
  console.log("View completed UserOp here: https://jiffyscan.xyz/userOpHash/" + userOpHash)
}

installModuleDitto();
