import { createKernelAccount, createKernelAccountClient, getUserOperationGasPrice } from "@zerodev/sdk"
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import { http, createPublicClient, encodeAbiParameters, Hex } from "viem"
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts"
import { polygon } from "viem/chains"
import { getExactInputSingleCalldata } from "./helpers/callDataOnRouter"
import { getApproveCalldata } from "./helpers/callDataForApprove"
import { IExecution } from "./interfaces/IExecution"
import { getInstallModuleCallData } from "./helpers/callDataInstallModule"
import { getAddWorkflowCallData } from "./helpers/callDataAddWorkflow"

const PROJECT_ID = ''
const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}`
// const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${PROJECT_ID}`
 
const chain = polygon
const entryPoint = getEntryPoint("0.7")
const kernelVersion = KERNEL_V3_1

const addressSmartAccount = '0x0123456789012345678901234567890123456789'
const privateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' 

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

async function limitOrder() {
  const client = await getClient();

  const uniswapRouter = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

  const tokenIn = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
  const tokenOut = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  const poolFee = 500;
  const recipient = addressSmartAccount;
  const amountIn = BigInt(500000000000000000);
  const amountOut = BigInt(500000000);

  const callDataApprove = getApproveCalldata(
    uniswapRouter,
    amountIn
  )

  const callDataOnRouter = getExactInputSingleCalldata(
    tokenIn,
    tokenOut,
    poolFee, 
    recipient,
    amountIn,
    amountOut,
    BigInt(0)
  )

  const initsArray: IExecution[] = [];
  const actionsArray: IExecution[] = [
    {
      target: tokenIn,
      value: BigInt(0),
      callData: callDataApprove
    },
    {
      target: uniswapRouter,
      value: BigInt(0),
      callData: callDataOnRouter
    },
  ];

  const maxGasPrice = BigInt(100000000000) //100 gwei
  const maxGasLimit = BigInt(500000); // 500_000
  const count = BigInt(1);

  const addWorkflowCallData = getAddWorkflowCallData(
    initsArray,
    actionsArray,
    maxGasPrice,
    maxGasLimit,
    count
  );

  const userOpHash = await client.sendUserOperation({
    callData: await client.account.encodeCalls([{
      to: addressSmartAccount,
      value: BigInt(0),
      data: addWorkflowCallData,
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
