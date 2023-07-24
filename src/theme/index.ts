const Theme = {
  colors: {
    action: {
      classic: '#FFFFFF',
      classicLight: 'rgba(255, 255, 255, 0.85)',
      classic800: 'rgba(85, 101, 247, 0.2)',
    },
    white: {
      0: '#FFFFFF',
      200: 'rgba(255, 255, 255, 0.8)',
      400: 'rgba(255, 255, 255, 0.6)',
      600: 'rgba(255, 255, 255, 0.2)',
      800: 'rgba(255, 255, 255, 0.20)',
      850: 'rgba(255, 255, 255, 0.15)',
      900: 'rgba(255, 255, 255, 0.1)',
    },
    background: {
      elevation0: '#12151E',
      elevation1: '#1D2032', // deprecated?
      elevation_1: '#070A13',
      elevation2: '#272A44',
      elevation3: '#303354',
      elevation6: '#4C5187',
      elevation6_600: 'rgba(76, 81, 135, 0.4)',
      elevation6_800: 'rgba(76, 81, 135, 0.2)',
      elevation8: '#7E89AB',
      elevation9: 'rgba(76, 81, 135, 0.2)',
      elevation10: 'rgba(76, 81, 135, 0.35)',
      modalBackdrop: 'rgba(18,21,30,0.6)',
      selectBackground:
        'linear-gradient(0deg, rgba(115, 131, 255, 0.05), rgba(115, 131, 255, 0.05)), #1D2032',
    },
    border: {
      select: 'rgba(115, 131, 255, 0.4)',
    },
    feedback: {
      success: '#51D6A6',
      caution: '#F2A900',
      error: '#D33C3C',
      error_700: 'rgba(211, 60, 60, 0.3)',
    },
    grey: '#24252C',
    purple_main: '#5E41C5',
    orange_main: ' #EE7A30',
  },
  headline_category_m: {
    fontFamily: 'DMSans-Medium',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
    letterSpacing: 0.02,
    textTransform: 'uppercase',
  },
  headline_category_s: {
    fontFamily: 'DMSans-Medium',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 0.02,
  },
  body_bold_l: {
    fontFamily: 'DMSans-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 16,
  },
  body_medium_l: {
    fontFamily: 'DMSans-Regular',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
  },
  body_l: {
    fontFamily: 'DMSans-Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 16,
  },
  body_bold_m: {
    fontFamily: 'DMSans-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 14,
  },
  body_medium_m: {
    fontFamily: 'DMSans-Medium',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 14,
  },
  body_m: {
    fontFamily: 'DMSans-Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
  },
  body_s: {
    fontFamily: 'DMSans-Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 12,
  },
  body_xs: {
    fontFamily: 'DMSans-Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 12,
  },
  headline_xl: {
    fontFamily: 'IBMPlexSans-Regular',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 42,
    letterSpacing: 0.02,
  },
  tile_text: {
    fontFamily: 'Satoshi-Regular',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.02,
  },
  bold_tile_text: {
    fontFamily: 'Satoshi-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.02,
  },
  headline_l: {
    fontFamily: 'IBMPlexSans-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 34,
    letterSpacing: 0.02,
  },
  headline_m: {
    fontFamily: 'IBMPlexSans-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: 0.02,
  },
  headline_s: {
    fontFamily: 'IBMPlexSans-Medium',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 21,
    letterSpacing: 0.02,
  },
  breakpoints: {
    s: '0px',
    md: '700px',
    lg: '1025px',
    xlg: '1536px',
  },
  spacing: (multiple: number) => multiple * 2,
  radius: (multiple: number) => multiple * 4 + 4,
};
export default Theme;
