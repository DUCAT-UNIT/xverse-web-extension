import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useWalletSelector from '@hooks/useWalletSelector';
import { mapFTProtocolToSwapProtocol } from '@screens/swap/utils';
import {
  getXverseApiClient,
  type FungibleToken,
  type TokenBasic,
} from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { handleRetries } from '@utils/query';
import BigNumber from 'bignumber.js';

const useFromTokens = (to?: TokenBasic) => {
  const { network } = useWalletSelector();
  const { visible: runesCoinsList } = useVisibleRuneFungibleTokens();
  const { data: btcBalanceSats } = useBtcWalletData();

  const filteredRunesTokensObject = runesCoinsList.reduce((acc, ft) => {
    if (new BigNumber(ft.balance).gt(0)) {
      acc[ft.principal] = ft;
    }
    return acc;
  }, {} as Record<FungibleToken['principal'], FungibleToken>);

  const runesBasicTokens =
    Object.values(filteredRunesTokensObject).map((ft) => ({
      ticker: ft.principal,
      protocol: mapFTProtocolToSwapProtocol(ft.protocol ?? 'runes'),
    })) ?? [];

  const hasBtcBalance = new BigNumber(btcBalanceSats ?? 0).gt(0);
  const btcBasicToken: TokenBasic = { protocol: 'btc', ticker: 'BTC' };
  const userTokens = [...(hasBtcBalance ? [btcBasicToken] : [])].concat(runesBasicTokens);

  const queryFn = async () => {
    const response = await getXverseApiClient(network.type).swaps.getSourceTokens({
      to,
      userTokens,
    });

    return response
      .filter((token) => token.protocol === 'btc' || !!filteredRunesTokensObject[token.ticker])
      .map((token) => {
        if (token.protocol === 'btc') {
          return 'BTC';
        }
        if (token.protocol === 'runes') {
          return filteredRunesTokensObject[token.ticker];
        }

        return token;
      });
  };

  return useQuery({
    enabled: userTokens.length > 0,
    retry: handleRetries,
    queryKey: ['swap-from-tokens', network.type, to, userTokens],
    queryFn,
  });
};

export default useFromTokens;
