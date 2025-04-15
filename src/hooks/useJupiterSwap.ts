import { createJupiterApiClient } from "@jup-ag/api";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { CoinlistItem } from "@/types/CoinList";

export default function useJupiterSwap(
  connection: Connection,
  wallet: PublicKey | undefined,
  inputToken: CoinlistItem | null,
  outputToken: CoinlistItem | null,
  inputAmount: string,
  slippage: number
) {
  const jupiterApiClient = createJupiterApiClient();

  const [swapping, setSwapping] = useState(false);
  const [quote, setQuote] = useState("0");
  const [quoting, setQuoting] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);
  const [inputTokenAmount, setInputTokenAmount] = useState<any>(null);
  const [outputTokenAmount, setOutputTokenAmount] = useState<any>(null);

  useEffect(() => {
    async function getQuote() {
      if (!inputToken || !outputToken || !inputAmount || Number(inputAmount) <= 0) {
        console.log("Missing required parameters for quote", {
          inputToken: !!inputToken,
          outputToken: !!outputToken,
          inputAmount
        });
        setQuote("0");
        setQuoting(false);
        return;
      }

      try {
        console.log("useJupiterSwap: Starting quote fetch...", {
          inputMint: inputToken.mint.toBase58(),
          outputMint: outputToken.mint.toBase58(),
          amount: Number(inputAmount) * Math.pow(10, inputToken.decimals),
          slippage: Math.round(Number(slippage) * 100)
        });
        
        setQuoting(true);
        const amountLamports = Number(inputAmount) * Math.pow(10, inputToken.decimals);
        
        const quoteResponse = await jupiterApiClient.quoteGet({
          inputMint: inputToken.mint.toBase58(),
          outputMint: outputToken.mint.toBase58(),
          amount: amountLamports.toString() as any,
          slippageBps: Math.round(Number(slippage) * 100) as any,
          onlyDirectRoutes: false,
          asLegacyTransaction: false,
        });

        if (quoteResponse) {
          console.log("useJupiterSwap: Quote received successfully", {
            outAmount: quoteResponse.outAmount,
            routes: quoteResponse.routePlan?.length || 0
          });
          
          const outAmount = quoteResponse.outAmount;
          const uiAmount = Number(outAmount) / Math.pow(10, outputToken.decimals);
          setQuote(uiAmount.toString());
          setInputTokenAmount(amountLamports);
          setOutputTokenAmount(outAmount);
          setTransaction(quoteResponse);
        } else {
          console.warn("useJupiterSwap: Empty quote response received");
          setQuote("0");
        }
      } catch (error) {
        console.error("Error getting Jupiter quote:", error);
        if (error instanceof Error) {
          console.error("Error details:", error.message, error.stack);
        }
        setQuote("0");
      } finally {
        setQuoting(false);
        console.log("useJupiterSwap: Quote fetch completed", { success: quote !== "0" });
      }
    }

    if (quoting) {
      getQuote();
    }
  }, [inputToken, outputToken, inputAmount, slippage, quoting, jupiterApiClient]);

  async function executeSwap(signTransaction: any, sendTransaction: any) {
    if (!wallet || !transaction || !inputToken || !outputToken) {
      console.error("Missing required parameters for swap", {
        wallet: !!wallet,
        transaction: !!transaction,
        inputToken: !!inputToken,
        outputToken: !!outputToken
      });
      return false;
    }
    
    try {
      setSwapping(true);
      
      const swapResponse = await jupiterApiClient.swapPost({
        swapRequest: {
          quoteResponse: transaction,
          userPublicKey: wallet.toBase58(),
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto" as any,
        },
      });
      
      if (swapResponse?.swapTransaction) {
        const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, "base64");
        const tx = VersionedTransaction.deserialize(swapTransactionBuf);
        
        if (signTransaction) {
          const signedTx = await signTransaction(tx);
          const txid = await sendTransaction(signedTx, connection, {
            skipPreflight: true,
          });
          console.log("Transaction sent:", txid);
          return txid;
        }
      }
      return false;
    } catch (error) {
      console.error("Error executing Jupiter swap:", error);
      return false;
    } finally {
      setSwapping(false);
    }
  }

  return {
    quote,
    quoting,
    setQuoting,
    swapping,
    setSwapping,
    executeSwap,
    inputTokenAmount,
    outputTokenAmount
  };
}
