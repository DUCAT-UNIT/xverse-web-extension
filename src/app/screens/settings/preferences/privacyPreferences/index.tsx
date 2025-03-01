import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { Container, SubTitle, Title } from '@screens/settings/index.styles';
import { hasOptedInMixPanelTracking, optInMixPanel, optOutMixPanel } from '@utils/mixpanel';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Switch from 'react-switch';
import styled, { useTheme } from 'styled-components';

const SwitchContainer = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: 500,
}));

const CustomSwitch = styled(Switch)`
  .react-switch-handle {
    background-color: ${({ checked }) =>
      checked ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)'} !important;
    border: ${({ checked }) => (checked ? '' : '4px solid rgba(255, 255, 255, 0.2)')} !important;
  }
`;

function PrivacyPreferencesScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const selectedAccount = useSelectedAccount();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const handleSwitchChange = (checked: boolean) => {
    setIsEnabled(checked);

    if (checked) {
      optInMixPanel(selectedAccount.masterPubKey);
    } else {
      optOutMixPanel();
    }
  };

  const checkMixpanelTrackingStatus = async () => {
    const hasOptedIn = await hasOptedInMixPanelTracking();

    if (hasOptedIn) {
      setIsEnabled(true);
    }
  };

  useEffect(() => {
    checkMixpanelTrackingStatus();
  }, []);

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('PRIVACY_PREFERENCES.TITLE')}</Title>
        <SubTitle>{t('PRIVACY_PREFERENCES.DESCRIPTION')}</SubTitle>
        <SwitchContainer>
          <div>{t('PRIVACY_PREFERENCES.AUTHORIZE_DATA_COLLECTION')}</div>
          <CustomSwitch
            onColor={theme.colors.orange_main}
            offColor={theme.colors.background.elevation3}
            onChange={handleSwitchChange}
            checked={isEnabled}
            uncheckedIcon={false}
            checkedIcon={false}
          />
        </SwitchContainer>
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default PrivacyPreferencesScreen;
