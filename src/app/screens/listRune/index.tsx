import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useRuneFloorPriceQuery from '@hooks/queries/runes/useRuneFloorPriceQuery';
import { useVisibleRuneFungibleTokens } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useRuneSellPsbt from '@hooks/queries/runes/useRuneSellPsbt';
import useRuneUtxosQuery from '@hooks/queries/runes/useRuneUtxosQuery';
import useCoinRates from '@hooks/queries/useCoinRates';
import useHasFeature from '@hooks/useHasFeature';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowClockwise } from '@phosphor-icons/react';
import ListRuneItem from '@screens/listRune/listRuneItem';
import { ListRunesReducer, initialListRunesState } from '@screens/listRune/reducer';
import SetRunePriceItem from '@screens/listRune/setRunePriceItem';
import {
  FeatureId,
  currencySymbolMap,
  getBtcFiatEquivalent,
  satsToBtc,
} from '@secretkeylabs/xverse-core';
import Button, { LinkButton } from '@ui-library/button';
import { StickyButtonContainer, StyledP } from '@ui-library/common.styled';
import Spinner from '@ui-library/spinner';
import { formatToXDecimalPlaces, ftDecimals } from '@utils/helper';
import { getFullTxId, getTxIdFromFullTxId, getVoutFromFullTxId } from '@utils/runes';
import BigNumber from 'bignumber.js';
import { useEffect, useReducer } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import theme from 'theme';
import {
  ButtonImage,
  Container,
  Header,
  ListRunesContainer,
  ListingDescContainer,
  ListingDescriptionRow,
  LoaderContainer,
  MockContainer,
  NoItemsContainer,
  PaddingContainer,
  RightAlignStyledP,
  ScrollContainer,
  SetRunePricesButtonsContainer,
  SetRunePricesContainer,
  SetRunePricesListContainer,
  StyledButton,
  TabButton,
  TabButtonsContainer,
  TabContainer,
} from './index.styled';
import WrapperComponent from './listRuneWrapper';
import SetCustomPriceModal from './setCustomPriceModal';

export default function ListRuneScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'LIST_RUNE_SCREEN' });
  const navigate = useNavigate();
  const { runeId } = useParams();
  const { visible: runesCoinsList } = useVisibleRuneFungibleTokens(false);
  const selectedRune = runesCoinsList.find((ft) => ft.principal === runeId);
  const { fiatCurrency } = useWalletSelector();
  const { btcFiatRate } = useCoinRates();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const locationFrom = params.get('from');
  const showRunesListing =
    useHasFeature(FeatureId.RUNES_LISTING) || process.env.NODE_ENV === 'development';

  if (!showRunesListing) {
    navigate(-1);
  }

  useTrackMixPanelPageViewed();

  const {
    data: listItemsResponse,
    isInitialLoading: listItemsLoading,
    isRefetching: listItemsRefetching,
    refetch,
  } = useRuneUtxosQuery(selectedRune?.name ?? '', 'unlisted', false);

  const {
    data: runeFloorPrice,
    isInitialLoading: floorPriceLoading,
    isRefetching: floorPriceRefetching,
  } = useRuneFloorPriceQuery(selectedRune?.name ?? '', false);

  const noFloorPrice = runeFloorPrice === 0;

  const isLoading =
    listItemsLoading || listItemsRefetching || floorPriceLoading || floorPriceRefetching;

  useResetUserFlow('/list-rune');

  const [listRunesState, dispatch] = useReducer(ListRunesReducer, initialListRunesState);

  const {
    listItemsMap,
    section,
    selectAllToggle,
    runePriceOption,
    customRunePrice,
    individualCustomItem,
    toggleCustomPriceModal,
  } = listRunesState;

  const {
    getRuneSellPsbt,
    signPsbtPayload,
    loading: psbtLoading,
    error: psbtError,
  } = useRuneSellPsbt(selectedRune?.name ?? '', listItemsMap);

  const selectedListItems = Object.values(listItemsMap).filter((item) => item.selected);

  const totalListedRuneAmount = selectedListItems.reduce(
    (acc, item) => acc + Number(item.amount),
    0,
  );

  const totalListedRuneAmountSats = selectedListItems.reduce(
    (acc, item) => acc + item.amount * item.priceSats,
    0,
  );

  const totalListedRuneAmountFiat = getBtcFiatEquivalent(
    BigNumber(totalListedRuneAmountSats),
    BigNumber(btcFiatRate),
  );

  const lowestSelectedRuneAmount = selectedListItems.reduce((minAmount, currentItem) => {
    const curAmount = currentItem.amount;
    return curAmount < minAmount ? curAmount : minAmount;
  }, Infinity);
  const minGlobalPriceSats = 10000 / lowestSelectedRuneAmount;

  const highestSelectedRuneAmount = selectedListItems.reduce((maxAmount, currentItem) => {
    const curAmount = currentItem.amount;
    return curAmount > maxAmount ? curAmount : maxAmount;
  }, 0);
  const maxGlobalPriceSats = 1_000_000_000 / highestSelectedRuneAmount;

  const invalidListings: boolean = selectedListItems.some(
    (item) => item.amount * item.priceSats < 10000 || item.amount * item.priceSats > 1000000000,
  );

  const individualCustomPriceUsed = selectedListItems.some((item) => item.useIndividualCustomPrice);

  const handleGoBack = () => {
    if (locationFrom === 'swap') {
      // TODO: when navigating back from swap, there is flash of token dashboard screen
      navigate(-1);
    }

    if (section === 'SELECT_RUNES') {
      navigate(`/coinDashboard/FT?ftKey=${selectedRune?.principal}&protocol=runes`);
    } else {
      dispatch({ type: 'SET_SECTION', payload: 'SELECT_RUNES' });
    }
  };

  const getDesc = () => {
    switch (section) {
      case 'SELECT_RUNES':
        return t('SELECT_RUNES_SECTION');
      case 'SET_PRICES':
        return t('SET_PRICES_SECTION');
      default:
        return '';
    }
  };

  const handleSelectedListItem = async (key: string) => {
    const updatedSelectedListItem = {
      ...listItemsMap[key],
      selected: !listItemsMap[key].selected,
    };
    dispatch({ type: 'UPDATE_ONE_LIST_ITEM', key, payload: updatedSelectedListItem });
    if (
      Object.values(listItemsMap).filter((listItem) => listItem.selected).length ===
        listItemsResponse?.length ??
      0
    ) {
      dispatch({ type: 'SET_SELECT_ALL_TOGGLE', payload: true });
    }
    if (
      Object.values(listItemsMap).filter((listItem) => !listItem.selected).length ===
        listItemsResponse?.length ??
      0
    ) {
      dispatch({ type: 'SET_SELECT_ALL_TOGGLE', payload: false });
    }
  };

  useEffect(() => {
    if (runePriceOption === 'custom') return;
    dispatch({ type: 'SET_CUSTOM_RUNE_PRICE', payload: null });
    dispatch({
      type: 'SET_ALL_LIST_ITEMS_PRICES',
      payload: (runeFloorPrice ?? 0) * runePriceOption,
    });
  }, [runeFloorPrice, runePriceOption]);

  useEffect(() => {
    if (customRunePrice) {
      dispatch({ type: 'SET_ALL_LIST_ITEMS_PRICES', payload: customRunePrice });
    }
  }, [customRunePrice]);

  useEffect(() => {
    // if navigate back from psbt screen - repopulate screen state
    if (location.state) {
      dispatch({
        type: 'RESTORE_STATE_FROM_PSBT',
        payload: location.state,
      });
    } else if (listItemsResponse && runeFloorPrice !== undefined && selectedRune) {
      dispatch({
        type: 'INITIATE_LIST_ITEMS',
        payload: listItemsResponse.reduce(
          (map, item) => ({
            ...map,
            [getFullTxId(item)]: {
              selected: listItemsMap[getFullTxId(item)]?.selected ?? false,
              useIndividualCustomPrice: false,
              satAmount: BigNumber(item.value).toNumber(),
              amount: Number(
                ftDecimals(Number(item.runes?.[0][1].amount), selectedRune?.decimals ?? 0),
              ),
              priceSats: runeFloorPrice,
            },
          }),
          {},
        ),
      });
    }
  }, [listItemsResponse, runeFloorPrice, location.state, selectedRune]);

  useEffect(() => {
    if (signPsbtPayload) {
      navigate(`/psbt-signing-request?magicEdenPsbt=true&runeId=${runeId}`, {
        state: {
          payload: signPsbtPayload,
          selectedRune,
          listRunesState,
        },
      });
    }
  }, [listRunesState, signPsbtPayload, navigate, selectedRune, runeId]);

  useEffect(() => {
    if (!psbtLoading && psbtError) {
      toast.error(psbtError);
    }
  }, [psbtError, psbtLoading]);

  if (isLoading) {
    return (
      <WrapperComponent
        handleGoBack={handleGoBack}
        selectedRuneId={selectedRune?.principal ?? ''}
        getDesc={getDesc}
      >
        <LoaderContainer>
          <Spinner color="white" size={25} />
        </LoaderContainer>
      </WrapperComponent>
    );
  }

  if (listItemsResponse && !listItemsResponse.length) {
    return (
      <WrapperComponent
        handleGoBack={handleGoBack}
        selectedRuneId={selectedRune?.principal ?? ''}
        getDesc={getDesc}
      >
        <NoItemsContainer>{t('NO_UNLISTED_ITEMS')}</NoItemsContainer>
      </WrapperComponent>
    );
  }

  if (
    listItemsResponse &&
    runeFloorPrice !== undefined &&
    Object.keys(listItemsMap).length === listItemsResponse.length
  ) {
    return (
      <>
        <TopRow onClick={handleGoBack} />
        <Container>
          <PaddingContainer>
            <Header>{t('LIST_RUNES')}</Header>
            <StyledP color="white_200" typography="body_m">
              {getDesc()}
            </StyledP>
          </PaddingContainer>
          <>
            {section === 'SELECT_RUNES' && (
              <>
                <PaddingContainer>
                  <TabContainer>
                    <TabButtonsContainer>
                      <TabButton
                        isSelected
                        onClick={() => navigate(`/list-rune/${selectedRune?.principal}`)}
                      >
                        {t('NOT_LISTED')}
                      </TabButton>
                      <TabButton
                        isSelected={false}
                        onClick={() => navigate(`/unlist-rune/${selectedRune?.principal}`)}
                      >
                        {t('LISTED')}
                      </TabButton>
                    </TabButtonsContainer>
                    <ButtonImage data-testid="reload-button" onClick={() => refetch()}>
                      <ArrowClockwise color={theme.colors.white_400} size="20" />
                    </ButtonImage>
                  </TabContainer>
                  <MockContainer>
                    <div />
                    <LinkButton
                      title={
                        selectAllToggle || Object.values(listItemsMap).some((item) => item.selected)
                          ? t('DESELECT_ALL')
                          : t('SELECT_ALL')
                      }
                      variant="tertiary"
                      onClick={() => {
                        const newSelectAllToggle = !Object.values(listItemsMap).some(
                          (item) => item.selected,
                        );
                        dispatch({ type: 'SET_SELECT_ALL_TOGGLE', payload: newSelectAllToggle });
                        dispatch({ type: 'TOGGLE_ALL_LIST_ITEMS', payload: newSelectAllToggle });
                      }}
                    />
                  </MockContainer>
                </PaddingContainer>
                <ScrollContainer>
                  <PaddingContainer>
                    <ListRunesContainer>
                      {Object.entries(listItemsMap).map(([fullTxId, item]) => (
                        <ListRuneItem
                          key={fullTxId}
                          txId={getTxIdFromFullTxId(fullTxId)}
                          vout={getVoutFromFullTxId(fullTxId)}
                          runeAmount={String(item.amount)}
                          runeSymbol={selectedRune?.runeSymbol ?? ''}
                          satAmount={item.satAmount}
                          selected={item.selected}
                          onSelect={() => handleSelectedListItem(fullTxId)}
                        />
                      ))}
                    </ListRunesContainer>
                  </PaddingContainer>
                </ScrollContainer>
                <PaddingContainer>
                  <StickyButtonContainer>
                    <Button
                      title={t('SET_PRICES')}
                      onClick={() => dispatch({ type: 'SET_SECTION', payload: 'SET_PRICES' })}
                      variant="primary"
                      disabled={!Object.values(listItemsMap).some((item) => item.selected)}
                    />
                  </StickyButtonContainer>
                </PaddingContainer>
              </>
            )}
            {section === 'SET_PRICES' && (
              <>
                <PaddingContainer>
                  <SetRunePricesContainer>
                    <SetRunePricesButtonsContainer>
                      <StyledButton
                        title="Floor"
                        disabled={noFloorPrice}
                        onClick={() => dispatch({ type: 'SET_RUNE_PRICE_OPTION', payload: 1 })}
                        variant={
                          runePriceOption === 1 && !noFloorPrice && !individualCustomPriceUsed
                            ? 'primary'
                            : 'secondary'
                        }
                      />
                      <StyledButton
                        title="+5%"
                        disabled={noFloorPrice}
                        onClick={() => dispatch({ type: 'SET_RUNE_PRICE_OPTION', payload: 1.05 })}
                        variant={
                          runePriceOption === 1.05 && !individualCustomPriceUsed
                            ? 'primary'
                            : 'secondary'
                        }
                      />
                      <StyledButton
                        title="+10%"
                        disabled={noFloorPrice}
                        onClick={() => dispatch({ type: 'SET_RUNE_PRICE_OPTION', payload: 1.1 })}
                        variant={
                          runePriceOption === 1.1 && !individualCustomPriceUsed
                            ? 'primary'
                            : 'secondary'
                        }
                      />
                      <StyledButton
                        title="+20%"
                        disabled={noFloorPrice}
                        onClick={() => dispatch({ type: 'SET_RUNE_PRICE_OPTION', payload: 1.2 })}
                        variant={
                          runePriceOption === 1.2 && !individualCustomPriceUsed
                            ? 'primary'
                            : 'secondary'
                        }
                      />
                      <StyledButton
                        title="Custom"
                        onClick={() =>
                          dispatch({ type: 'SET_TOGGLE_CUSTOM_PRICE_MODAL', payload: true })
                        }
                        variant={
                          runePriceOption === 'custom' && !individualCustomPriceUsed
                            ? 'primary'
                            : 'secondary'
                        }
                      />
                    </SetRunePricesButtonsContainer>
                    <StyledP typography="body_medium_s" color="white_200">
                      {noFloorPrice
                        ? t('NO_FLOOR_PRICE', { symbol: selectedRune?.runeSymbol })
                        : t('MAGIC_EDEN_FLOOR_PRICE', {
                            sats: formatToXDecimalPlaces(runeFloorPrice, 5),
                            symbol: selectedRune?.runeSymbol,
                          })}
                    </StyledP>
                  </SetRunePricesContainer>
                </PaddingContainer>
                <ScrollContainer>
                  <PaddingContainer>
                    <SetRunePricesListContainer>
                      {Object.entries(listItemsMap)
                        .filter((item) => item[1].selected)
                        .map(([fullTxId, item]) => (
                          <SetRunePriceItem
                            key={fullTxId}
                            runeAmount={item.amount}
                            runeSymbol={selectedRune?.runeSymbol ?? ''}
                            satAmount={item.satAmount}
                            floorPriceSats={runeFloorPrice}
                            satPrice={
                              listItemsMap[fullTxId].useIndividualCustomPrice
                                ? listItemsMap[fullTxId].priceSats
                                : runePriceOption === 'custom' && customRunePrice
                                ? customRunePrice
                                : runeFloorPrice * Number(runePriceOption)
                            }
                            handleShowCustomPriceModal={() => {
                              dispatch({ type: 'SET_INDIVIDUAL_CUSTOM_ITEM', payload: fullTxId });
                              dispatch({ type: 'SET_TOGGLE_CUSTOM_PRICE_MODAL', payload: true });
                            }}
                          />
                        ))}
                      <ListingDescContainer>
                        <ListingDescriptionRow>
                          <StyledP typography="body_medium_m" color="white_200">
                            {t('TOTAL_LISTED')}
                          </StyledP>
                          <NumericFormat
                            value={formatToXDecimalPlaces(totalListedRuneAmount, 5)}
                            displayType="text"
                            suffix={` ${selectedRune?.runeSymbol}`}
                            thousandSeparator
                            renderText={(value: string) => (
                              <StyledP typography="body_medium_m" color="white_0">
                                {value}
                              </StyledP>
                            )}
                          />
                        </ListingDescriptionRow>
                        <ListingDescriptionRow>
                          <StyledP typography="body_medium_m" color="white_200">
                            {t('TOTAL_RECEIVED_IF_SOLD')}
                          </StyledP>
                          <NumericFormat
                            value={formatToXDecimalPlaces(
                              satsToBtc(BigNumber(totalListedRuneAmountSats)).toNumber(),
                              5,
                            )}
                            displayType="text"
                            suffix=" BTC"
                            thousandSeparator
                            renderText={(value: string) => (
                              <StyledP
                                data-testid="send-amount"
                                typography="body_medium_m"
                                color="white_0"
                              >
                                {value}
                              </StyledP>
                            )}
                          />
                        </ListingDescriptionRow>
                        <ListingDescriptionRow>
                          <div />
                          <NumericFormat
                            value={String(totalListedRuneAmountFiat)}
                            displayType="text"
                            prefix={`~ ${currencySymbolMap[fiatCurrency]}`}
                            suffix={` ${fiatCurrency}`}
                            thousandSeparator
                            decimalScale={2}
                            renderText={(value: string) => (
                              <RightAlignStyledP
                                data-testid="send-currency-amount"
                                typography="body_medium_s"
                                color="white_200"
                              >
                                {value}
                              </RightAlignStyledP>
                            )}
                          />
                        </ListingDescriptionRow>
                      </ListingDescContainer>
                    </SetRunePricesListContainer>
                  </PaddingContainer>
                </ScrollContainer>
                <PaddingContainer>
                  <StickyButtonContainer>
                    <Button
                      title={t('CONTINUE')}
                      disabled={invalidListings}
                      loading={psbtLoading}
                      onClick={getRuneSellPsbt}
                      variant="primary"
                    />
                  </StickyButtonContainer>
                </PaddingContainer>
                <SetCustomPriceModal
                  runeSymbol={selectedRune?.runeSymbol ?? ''}
                  visible={toggleCustomPriceModal}
                  title={t('SET_PRICES')}
                  floorPriceSats={runeFloorPrice}
                  minPriceSats={
                    individualCustomItem
                      ? 10000 / listItemsMap[individualCustomItem].amount
                      : minGlobalPriceSats
                  }
                  maxPriceSats={
                    individualCustomItem
                      ? 1_000_000_000 / listItemsMap[individualCustomItem].amount
                      : maxGlobalPriceSats
                  }
                  onClose={() => {
                    dispatch({ type: 'SET_INDIVIDUAL_CUSTOM_ITEM', payload: null });
                    dispatch({ type: 'SET_TOGGLE_CUSTOM_PRICE_MODAL', payload: false });
                  }}
                  onApplyPrice={(priceSats: number) => {
                    if (individualCustomItem) {
                      listItemsMap[individualCustomItem].priceSats = priceSats;
                      listItemsMap[individualCustomItem].useIndividualCustomPrice = true;
                    } else {
                      dispatch({ type: 'SET_CUSTOM_RUNE_PRICE', payload: priceSats });
                      dispatch({ type: 'SET_RUNE_PRICE_OPTION', payload: 'custom' });
                    }
                    dispatch({ type: 'SET_INDIVIDUAL_CUSTOM_ITEM', payload: null });
                    dispatch({ type: 'SET_TOGGLE_CUSTOM_PRICE_MODAL', payload: false });
                  }}
                />
              </>
            )}
          </>
        </Container>
        <BottomBar tab="dashboard" />
      </>
    );
  }
}
