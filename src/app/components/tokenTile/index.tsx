import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import { NumericFormat } from 'react-number-format';
import { CurrencyTypes, LoaderSize } from '@utils/constants';
import BarLoader from '@components/barLoader';
import { microstacksToStx, satsToBtc } from '@utils/walletUtils';
import { ftDecimals, getTicker } from '@utils/helper';
import stc from 'string-to-color';
import { FungibleToken } from '@secretkeylabs/xverse-core/types';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import { StoreState } from '@stores/index';
import { useSelector } from 'react-redux';

interface TileProps {
  margin?:number;
}
const TileContainer = styled.div<TileProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  backgroundColor: props.color,
  paddingLeft: props.theme.spacing(9),
  paddingRight: props.theme.spacing(9),
  paddingTop: props.theme.spacing(9),
  paddingBottom: props.margin ?? props.theme.spacing(9),
  borderRadius: props.theme.radius(2),
  marginHorizontal: props.theme.spacing(7),
  marginBottom: props.theme.spacing(6),
}));

const TickerImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
  height: 32,
  width: 32,
}));

const TickerIconContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 32,
  width: 32,
  marginRight: props.theme.spacing(3),
  borderRadius: props.theme.radius(2),
  backgroundColor: props.color,
}));

const TickerIconText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
  wordBreak: 'break-all',
  fontSize: 10,
}));

const TextContainer = styled.div((props) => ({
  flex: 2,
  marginLeft: props.theme.spacing(6),
}));

const AmountContainer = styled.div((props) => ({
  alignContent: 'flex-end',
  flex: 1,
}));

const LoaderMainContainer = styled.div((props) => ({
  flex: 1,
  flexDirection: 'column',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  marginLeft: props.theme.spacing(15),
}));

const LoaderImageContainer = styled.div((props) => ({
  flex: 0.5,
}));

const CoinTickerText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['0'],
  textTransform: 'uppercase',
}));

const SubText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  fontSize: 12,
}));

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  fontSize: 12,
  textAlign: 'end',
}));

const CoinBalanceText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  textAlign: 'end',
}));

interface Props {
  title: string;
  icon?: string;
  underlayColor: string;
  margin?: number;
  currency?: CurrencyTypes;
  onPress?: (event: any) => void;
  fungibleToken?: FungibleToken;
}
const TokenTile = ({
  icon,
  title,
  underlayColor,
  margin,
  currency,
  onPress,
  fungibleToken,
}: Props) => {
  const { fiatCurrency, stxBalance, btcBalance, stxBtcRate, btcFiatRate, loadingWalletData } =
    useSelector((state: StoreState) => state.walletState);

  function getFtTicker() {
    if (fungibleToken?.ticker) {
      return fungibleToken.ticker.toUpperCase();
    } else if (fungibleToken?.name) {
      return getTicker(fungibleToken.name).toUpperCase();
    } else return '';
  }

  function getTickerTitle() {
    if (currency === 'STX' || currency === 'BTC') return `${currency}`;
    else return `${getFtTicker()}`;
  }

  function getBalance() {
    return currency === 'STX'
      ? renderStxBalanceView()
      : currency === 'BTC'
      ? renderBtcBalanceView()
      : renderFtBalanceView();
  }

  function getFtBalance(fungibleToken: FungibleToken) {
    if (fungibleToken.decimals) {
      return ftDecimals(fungibleToken.balance, fungibleToken.decimals);
    }
    return fungibleToken.balance;
  }

  function getBalanceAmount() {
    switch (currency) {
      case 'STX':
        return microstacksToStx(new BigNumber(stxBalance)).toString();
      case 'BTC':
        return satsToBtc(new BigNumber(btcBalance)).toString();
      case 'FT':
        return fungibleToken ? getFtBalance(fungibleToken) : '';
    }
  }

  function renderStxBalanceView() {
    return (
      <NumericFormat
        value={getBalanceAmount()}
        displayType={'text'}
        thousandSeparator={true}
        renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
      />
    );
  }

  function renderBtcBalanceView() {
    return (
      <NumericFormat
        value={getBalanceAmount()}
        displayType={'text'}
        thousandSeparator={true}
        renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
      />
    );
  }

  function renderFtBalanceView() {
    return (
      <NumericFormat
        value={getBalanceAmount()}
        displayType={'text'}
        thousandSeparator={true}
        renderText={(value: string) => <CoinBalanceText>{value}</CoinBalanceText>}
      />
    );
  }

  function getFtFiatEquivalent() {
    if (fungibleToken?.tokenFiatRate) {
      const balance = new BigNumber(getFtBalance(fungibleToken));
      const rate = new BigNumber(fungibleToken.tokenFiatRate);
      return balance.multipliedBy(rate).toFixed(2).toString();
    } else return '';
  }

  function getFiatEquivalent() {
    switch (currency) {
      case 'STX':
        return microstacksToStx(new BigNumber(stxBalance))
          .multipliedBy(new BigNumber(stxBtcRate))
          .multipliedBy(new BigNumber(btcFiatRate))
          .toFixed(2)
          .toString();
      case 'BTC':
        return satsToBtc(new BigNumber(btcBalance))
          .multipliedBy(new BigNumber(btcFiatRate))
          .toFixed(2)
          .toString();
      case 'FT':
        return getFtFiatEquivalent();
      default:
        return '';
    }
  }

  function renderFiatEquivalentView() {
    switch (currency) {
      case 'STX':
        return (
          <NumericFormat
            value={getFiatEquivalent()}
            displayType={'text'}
            thousandSeparator={true}
            prefix={`${currencySymbolMap[fiatCurrency]} `}
            suffix={` ${fiatCurrency}`}
            renderText={(value) => <FiatAmountText>{value}</FiatAmountText>}
          />
        );
      case 'BTC':
        return (
          <NumericFormat
            value={getFiatEquivalent()}
            displayType={'text'}
            thousandSeparator={true}
            prefix={`${currencySymbolMap[fiatCurrency]} `}
            suffix={` ${fiatCurrency}`}
            renderText={(value) => <FiatAmountText>{value}</FiatAmountText>}
          />
        );
      case 'FT':
        if (fungibleToken?.tokenFiatRate)
          return (
            <NumericFormat
              value={getFiatEquivalent()}
              displayType={'text'}
              thousandSeparator={true}
              prefix={`${currencySymbolMap[fiatCurrency]} `}
              suffix={` ${fiatCurrency}`}
              renderText={(value) => <FiatAmountText>{value}</FiatAmountText>}
            />
          );
    }
  }

  function renderFTIcon() {
    if (!loadingWalletData) {
      if (fungibleToken?.image) {
        return <TickerImage src={fungibleToken.image} />;
      } else {
        // render ticker icon
        let ticker = fungibleToken?.ticker;
        if (!ticker && fungibleToken?.name) {
          ticker = getTicker(fungibleToken?.name);
        }
        const background = stc(ticker);
        ticker = ticker && ticker.substring(0, 4);
        return (
          <TickerIconContainer color={background}>
            <TickerIconText>{ticker}</TickerIconText>
          </TickerIconContainer>
        );
      }
    } else {
      return (
        <LoaderImageContainer>
          <BarLoader loaderSize={LoaderSize.LARGE} />
        </LoaderImageContainer>
      );
    }
  }
  function renderIcon() {
    if (currency === 'STX' || currency === 'BTC') return <TickerImage src={icon} />;
    else return renderFTIcon();
  }

  function renderLoader() {
    return (
      <LoaderMainContainer>
        <BarLoader loaderSize={LoaderSize.LARGE} />
        <BarLoader loaderSize={LoaderSize.MEDIUM} />
      </LoaderMainContainer>
    );
  }

  return (
    <TileContainer color={underlayColor} margin={margin} onClick={onPress}>
      {renderIcon()}
      <TextContainer>
        <CoinTickerText>{getTickerTitle()}</CoinTickerText>
        <SubText>{title}</SubText>
      </TextContainer>
      {loadingWalletData ? (
        renderLoader()
      ) : (
        <AmountContainer>
          {getBalance()}
          {renderFiatEquivalentView()}
        </AmountContainer>
      )}
    </TileContainer>
  );
};

export default TokenTile;
