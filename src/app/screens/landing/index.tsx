import styled from 'styled-components';
import logo from '@assets/img/full_logo_vertical.svg';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setWalletAction } from '@stores/wallet/actions/actionCreators';
import { newWallet } from '@secretkeylabs/xverse-core/wallet';
import { saveAccountsList, saveSelectedAccount } from '@utils/localStorage';
import { Account } from '@core/types/accounts';

const TopSectionContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
  flex: 0.5,
});

const LandingTitle = styled.h1((props) => ({
  ...props.theme.tile_text,
  paddingTop: props.theme.spacing(15),
  paddingLeft: props.theme.spacing(34),
  paddingRight: props.theme.spacing(34),
  color: props.theme.colors.white['200'],
  textAlign: 'center',
}));

const ActionButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flex: 0.5,
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingLeft: props.theme.spacing(10),
  paddingRight: props.theme.spacing(10),
  marginBottom: props.theme.spacing(30),
}));

const CreateButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  marginBottom: props.theme.spacing(8),
  width: '100%',
  height: 44,
}));

const RestoreButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.background.elevation0,
  border: `0.5px solid ${props.theme.colors.background.elevation2}`,
  width: '100%',
  height: 44,
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['200'],
  textAlign: 'center',
}));

function Landing(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'LANDING_SCREEN' });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePressCreate = async () => {
    try {
      const wallet = await newWallet();
      dispatch(setWalletAction(wallet));
      navigate('/onboarding');
    } catch (err) {
      console.log(err);
    }
  };

  const handlePressRestore = async () => {
    try {
      const wallet = await newWallet();
      dispatch(setWalletAction(wallet));
      navigate('/onboarding');
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <TopSectionContainer>
        <img src={logo} width={100} alt="logo" />
        <LandingTitle>{t('SCREEN_TITLE')}</LandingTitle>
      </TopSectionContainer>
      <ActionButtonsContainer>
        <CreateButton onClick={handlePressCreate}>
          <ButtonText>{t('CREATE_WALLET_BUTTON')}</ButtonText>
        </CreateButton>
        <RestoreButton onClick={handlePressRestore}>
          <ButtonText>{t('RESTORE_WALLET_BUTTON')}</ButtonText>
        </RestoreButton>
      </ActionButtonsContainer>
    </>
  );
}
export default Landing;
