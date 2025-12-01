import { createPublicClient, http, encodeFunctionData, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createBundlerClient } from "viem/account-abstraction";
import TestTokenAbi from "./TestToken.abi.json" with { type: "json" };

// -----------------------------
// Configuration
// -----------------------------
const CHAIN_RPC = "http://127.0.0.1:8545";     // Anvil
const BUNDLER_RPC = "http://127.0.0.1:3000";   // Alto bundler

const ENTRYPOINT = {
  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`,
  version: "0.6" as const
};

const SCA_NUMBER = 75;

const SIMPLE_ACCOUNT_ADDRESSES: `0x${string}`[] = [
        "0x41d6B63F46E1B1B80406FA8feE1434708DadC26f",
        "0x06B00B6D82C5FDeC739d06C1ad3B09dedeC780D9",
        "0x9b8B092CFDC5A15c0861a4dBb63Fb22Ca6332f24",
        "0x6a5cdC93dAA51cd0B398c258755d4880a98593dc",
        "0x2e4320a98f4df31f36FfD0CA75DD9c621A106E7F",
        "0xDD0Ada4A43FC15c1956274A14C996421673D7EEc",
        "0xd7D5af65eC4e6AE3Aa8eC1742c95552b5b59dA5A",
        "0xAA6e31Fae57701924254270606f4d0499AEbF55f",
        "0x34911D351C826d9cE213649EDCeEeCD1BF06cABE",
        "0x5fDb18a48658104AeF42c8aAdE830DF44631D054",
        "0xfFe7c735839b65bF42663757cc634689c5A388d6",
        "0x3DC259D502877ad49c9e009f6693a438Cd247834",
        "0xCEeFfafD8973404C4856aBb7aD97d03Fb2Be6bda",
        "0x6b1DF479B3B344378A37e7D80184b91e413627a8",
        "0xD311111EBe3ba593E5afD446C48b37282489C184",
        "0x8F943602a45675EaCdF18fBCe7b79a991415FA72",
        "0x8D4Eef4C3FAdAbf187c99c2Cb84CA7cDc51897B6",
        "0x0Fb09e820aF5A196A784AEAe87c77038E65e52dB",
        "0x6F78c6093Bd774283856E4250fC2B60a1cc5bBb2",
        "0xD3604e59b2D290Cd7A4F11A52223088d29BebB39",
        "0xb58A837252E91b4Bda0abf256d6494361E17BB0d",
        "0x311160247F5F89149CcEF66B344f319DB61856fd",
        "0x0197a860B9D4434C154078E44247Db485E0f1D21",
        "0x6B35574790c5670E10e2345B0f8344A0D88018F9",
        "0xD6f4772473F9BdCe2761200d7091614A9E73346F",
        "0xcE048E9Cf48F268d3ef8CbF5b18f81b4d29269AB",
        "0xf9483e27e09589914b83b62F863E00726C5064B4",
        "0x3779eCB9D82A0696fda0954A97eeE80c7D386E6B",
        "0xc28e8660a06e274537eEf905b17B00C8626E5FB7",
        "0xCC72bcaA27DdB0ffF02471387D994ce6334488a1",
        "0xD1b0BF1C925ce46a9F82Cd1aCF530e28C244244d",
        "0x8af2bA78Cc8867AB4C13cCC7165d618F0f9c8207",
        "0x3BC87E595E228caa72FFD96B5E0819B27fD99759",
        "0x387B1aA6975B5c6f5aD319377a2b1E3FDe406051",
        "0xD812e76A37e95cE5bc1Df1B33Db2163480b1959a",
        "0xfb04C39B686DEE0bE16D697e2cdCE4C6F4517a04",
        "0xF874282a369DcC6735310F824BF367b09981864A",
        "0x0268eaf536B58407127115Ee8883e4Ca00D7B431",
        "0xa25951e74dD8B38c9f5E1A5fac00526C09C4E8e0",
        "0xCe38adf1CE0d03c365bB032FD35E41A57E10Cf1C",
        "0xB86856c73F3cCAc8E5974bFDc959f85304E2FA1F",
        "0x0eb6183Fd8115600f380D0d742C9d81Eaf88d36E",
        "0x48fcE22F0EA529b7Cba9021cF85ce869FAe76aA1",
        "0x46a24966814fcc47a158cc8DDb06aabbD708Fd75",
        "0x07cb3bC75a4636E31bd82D5EB1623e87a4ea6504",
        "0x8228D00364DD20b1ee6866E1F8583591840778e6",
        "0xeDcDadF2D7A0693590aD56166Dcc66538fD04f38",
        "0xF7Fd0DF8a026F399359Bf9660BBA852b63c6b049",
        "0xB4DbbeeD228f139105d365E1c6073F69152e5bab",
        "0xA628f449f9a58eF627d4544c3BC88E7d2060bEf4",
        "0xBEF8c46ba677860Ec02dc280805aE1004994E7d1",
        "0x17C99da1752ca52e3E0057642407459a29EeD56A",
        "0x53bc8e71ee6ea039357098FbC1C3057EaAdAE315",
        "0xB1f3167c504e7e077c6992ef79631426C491f40b",
        "0x258ec776DD6725d007567e6bdf9DEF95fFD39DC0",
        "0x2353493103D0BA4Dd337533896f73D25393e6911",
        "0xfbD6C12C5ec9a9B4bF9201Eaf98426EF79cbD321",
        "0xD14D0943e3B2E0ea264Fd48863DD83643F496797",
        "0xCEE9E0093e3681FA6DB6DA79a277E8F4a20a6792",
        "0x15B83b71Ee3B8e68f314f427F7b2a79A69f620F7",
        "0x534E6D17A7fCB0aD65d07C4Be2B4CCf041eF9cA7",
        "0xF735123d2E247c492b12Dd7D32FB03E4248382CA",
        "0xE2352BCB22c637a6ECc92eF8D37c0ECbf83Da05c",
        "0xf5299CFB156F6a7090b3C757c4b01E4Ff734B08A",
        "0x481e3c269a22655fC9CcB7611CB91914A02e3C89",
        "0xA4e0E0B1Cc3BAA64C221eaAbE681126790ed917F",
        "0x25128c2c3f75a006b22dBfF1498C73BDE9b3787A",
        "0x16BDC9d4ADE7a568F2d1302A7Cd1399d60AcC5FF",
        "0xDB5477899896CC757EE6428040c68c0c07f4aa7c",
        "0x0099a14F92F430Bf4d4880Eb956A9Bc99b842831",
        "0xF0ae078c0DF6eE61D04475c257598ee2eC1b43b4",
        "0xB6C732d783232B583608D2790E55861c4A2b1298",
        "0x8f814899878aec3080E40738F044419511790235",
        "0xb6c2Fe890d339572d43d6FA5972A18d648B32DEA",
        "0x16285079b65997Dc2ad4b930Af7E60E8fCf8b4F9",
        /*"0xCF89837Ce01219CEd3756219A17b870Eaa520E16",
        "0xe52d83E1b7521D60cE182a40fA7ad27AD094a068",
        "0x6bCDf51FE28cB4F7f7877970Ea976AD2962a8b99",
        "0x72017761247F04e3735989F2c41cF9624Ef19710",
        "0xD4650FA77D6d7110Decc67585A028a0517f3aa32",
        "0x002FdF33B95c99486E28ABBAD5205Ada46FC1839",
        "0xC4BaCC8D583Fb26585c6F7FDa91B226A88B4d56c",
        "0x18483051214FC557A6Ae4f5EFD8237d3C4e79254",
        "0x4c6c5bE9c918b076CE26C500A4b13Afab45621c8",
        "0xF998AceB6e7d60da0fAceE0A38753cE5E9E93a8F",
        "0xFB3Bc4E864e485757a3003E545c1b387E92921EC",
        "0xF505727988659be0919E4B1F96758Fd13EEdb4f3",
        "0x54C1f46bfadE91895DE9699d3BEb4b99924450B4",
        "0x42F69412c016B9f4DC8c3126d3d932BC9ED56eaC",
        "0x921977b30c4aef811d5416cd3c8541ee73371C2f",
        "0x100e5f7b749A4a4dd099e92396FF7bA87FaCa6c2",
        "0x74cB56cC7A10561Fc5Ef457484650D3f3502fc93",
        "0xBefe0d86C71C5493f06F080305021C6df4775c33",
        "0xc85DFD6d3EEA41d217c283d39245C45b2c091c8A",
        "0x73E2B555974F6dF3217AfF086Ec71628d827B89E",
        "0x1e6E69CA9B586E3ae6E856A4A0eCb50Ec5639Dbd",
        "0xe34e30299E4a95153f1Be78bDFD8B35b4f6B7003",
        "0xa78BAEc9759442B422B886A64Ea287450A48C1A3",
        "0x07Da1A8D26a1F0F1981d83d91C8D58B697E2A4c2",
        "0xBaDC495Ce40F95E8563B7C117b52D5963A14ADcf"*/
];

const SCA_OWNERS_NUMBER = 10;

const SIMPLE_ACCOUNT_OWNER_KEYS: `0x${string}`[] = [
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
    "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
    "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
    "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
    "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
    "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6"
];

const ERC20_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" as `0x${string}`;

const THROTTLE_TIME = 25;
const ROUNDS_TOTAL = 150;


// -----------------------------
// Precompute accounts + calldata once
// -----------------------------
async function prepareAccounts(publicClient: any) {
  return await Promise.all(
    SIMPLE_ACCOUNT_ADDRESSES.map((addr, i) => {
      const owner = privateKeyToAccount(
        SIMPLE_ACCOUNT_OWNER_KEYS[i % SCA_OWNERS_NUMBER]
      );

      return toSimpleSmartAccount({
        owner,
        client: publicClient,
        entryPoint: ENTRYPOINT,
        address: addr,
      });
    })
  );
}

function prepareCalldata() {
  return SIMPLE_ACCOUNT_ADDRESSES.map((_, i) =>
    encodeFunctionData({
      abi: TestTokenAbi,
      functionName: "transfer",
      args: [SIMPLE_ACCOUNT_ADDRESSES[SCA_NUMBER - 1 - i], 1n], // send 1 token
    })
  );
}

// Small sleep helper
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -----------------------------
// Run one round (two-step: send, then wait)
// -----------------------------
async function runRound(
  round: number,
  bundlerClient: any,
  simpleAccounts: any[],
  calldatas: string[]
) {
  console.log(`\n================ ROUND ${round} START ================`);

  // Step 1: send all user operations (throttled burst)
  const sendPromises: Promise<{ i: number; userOpHash: string | null }>[] = [];

  for (let i = 0; i < simpleAccounts.length; i++) {
    const account = simpleAccounts[i];
    const calldata = calldatas[i];

    // create the send promise
    const promise = (async () => {
      try {
        const userOpHash = await bundlerClient.sendUserOperation({
          account,
          calls: [{ to: ERC20_ADDRESS, value: 0n, data: calldata }],
          callGasLimit: 300_000n,
          verificationGasLimit: 150_000n,
          preVerificationGas: 150_000n,
          maxPriorityFeePerGas: 10n,
          maxFeePerGas: 30n,
        });

        console.log(
          `[Round ${round}] UserOperation #${i + 1} sent → hash: ${userOpHash}`
        );
        return { i, userOpHash };
      } catch (error) {
        console.error(
          `[Round ${round}] UserOperation #${i + 1} failed to send:`,
          error
        );
        return { i, userOpHash: null };
      }
    })();

    sendPromises.push(promise);

    // throttle: wait 100ms between sends
    await sleep(THROTTLE_TIME);
  }

  const sentOps = await Promise.all(sendPromises);

  // Step 2: wait for confirmations in parallel
  const waitPromises = sentOps.map(async ({ i, userOpHash }) => {
    if (!userOpHash) return null;

    try {
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      console.log(
        `[Round ${round}] UserOperation #${i + 1} confirmed in block ${receipt.receipt.blockNumber}!`
      );
      return receipt;
    } catch (error) {
      console.error(
        `[Round ${round}] UserOperation #${i + 1} failed to confirm:`,
        error
      );
      return null;
    }
  });

  const receipts = await Promise.all(waitPromises);

  console.log(`\n================ ROUND ${round} COMPLETE ================`);
  receipts.forEach((r, i) => {
    if (r) {
      console.log(
        `[Round ${round}] #${i + 1}: confirmed in block ${r.receipt.blockNumber}`
      );
    } else {
      console.log(`[Round ${round}] #${i + 1}: failed`);
    }
  });
}

// -----------------------------
// Main
// -----------------------------
async function main() {
  // Public client
  const publicClient = createPublicClient({
    chain: {
      id: 1337,
      name: "anvil",
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: [CHAIN_RPC] } },
    },
    transport: http(CHAIN_RPC),
  });

  // Bundler client
  const bundlerClient = createBundlerClient({
    client: publicClient,
    transport: http(BUNDLER_RPC),
  });

  // Prepare reusable objects once
  const simpleAccounts = await prepareAccounts(publicClient);
  const calldatas = prepareCalldata();

  // Run N rounds sequentially
  for (let round = 1; round <= ROUNDS_TOTAL; round++) {
    await runRound(round, bundlerClient, simpleAccounts, calldatas);
  }

  console.log("\n=== All rounds finished ===");
}

// Run
main().catch(console.error);
