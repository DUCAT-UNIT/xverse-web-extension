import { SwapToken } from '@screens/swap/useSwap';
import { ReactNode } from 'react';
import { Currency } from 'alex-sdk';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  broadcastSignedTransaction,
  signTransaction,
  sponsorTransaction,
} from '@secretkeylabs/xverse-core';
import { StacksTransaction } from '@stacks/transactions';
import useNetworkSelector from '@hooks/useNetwork';
import { useNavigate } from 'react-router-dom';
import useSponsoredTransaction from '@hooks/useSponsoredTransaction';
import { ApiResponseError } from '@secretkeylabs/xverse-core/types';

export type SwapConfirmationInput = {
  from: Currency;
  to: Currency;
  fromToken: SwapToken;
  toToken: SwapToken;
  fromAmount: number;
  minToAmount: number;
  lpFeeAmount: number;
  lpFeeFiatAmount?: number;
  address: string;
  routers: { image: ReactNode; name: string }[];
  unsignedTx: StacksTransaction;
  functionName: string;
};

const XVERSE_SPONSOR_2_URL = 'https://sponsor2.xverse.app';

export function useConfirmSwap(
  input: SwapConfirmationInput,
): SwapConfirmationInput & { onConfirm: () => Promise<void> } {
  const { selectedAccount, seedPhrase } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();
  const { isSponsored } = useSponsoredTransaction(XVERSE_SPONSOR_2_URL);
  const navigate = useNavigate();
  return {
    ...input,
    onConfirm: async () => {
      const signed = await signTransaction(
        input.unsignedTx,
        seedPhrase,
        selectedAccount?.id ?? 0,
        selectedNetwork,
      );
      try {
        let broadcastResult: string | null;
        if (isSponsored) {
          broadcastResult = await sponsorTransaction(signed, XVERSE_SPONSOR_2_URL);
        } else {
          broadcastResult = await broadcastSignedTransaction(signed, selectedNetwork);
        }
        if (broadcastResult) {
          navigate('/tx-status', {
            state: {
              txid: broadcastResult,
              currency: 'STX',
              error: '',
              browserTx: true,
            },
          });
        }
      } catch (e) {
        if (e instanceof Error) {
          navigate('/tx-status', {
            state: {
              txid: '',
              currency: 'STX',
              error: e instanceof ApiResponseError ? e.data.message : e.message,
              sponsored: isSponsored,
              browserTx: true,
            },
          });
        }
      }
    },
  };
}
