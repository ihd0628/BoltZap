export const theme = {
  colors: {
    // 다크 테마 - 블랙/그레이 기반
    primary: '#1A1A1A', // 다크 그레이
    accent: '#F7931A', // 비트코인 오렌지 (포인트 컬러)
    background: {
      main: '#0D0D0D', // 거의 블랙
      card: '#1A1A1A', // 다크 그레이
      logs: '#0A0A0A', // 더 진한 블랙
      tabBar: '#141414', // 탭바 배경
    },
    text: {
      primary: '#FFFFFF', // 화이트
      secondary: '#8E8E93', // 라이트 그레이
      white: '#FFFFFF',
      dark: '#1A1A1A', // 다크 (버튼 텍스트 등)
      placeholder: '#4A4A4A',
      muted: '#666666',
    },
    button: {
      primary: '#2D2D2D', // 그레이
      secondary: '#1A1A1A', // 다크 그레이
      success: '#30D158', // 애플 그린
      accent: '#F7931A', // 비트코인 오렌지
    },
    border: '#2D2D2D',
    // 탭 컬러
    tab: {
      active: '#F7931A', // 비트코인 오렌지
      inactive: '#666666',
    },
    // 상태 컬러
    status: {
      success: '#30D158',
      warning: '#FF9F0A',
      error: '#FF453A',
    },
  },
  gap: {
    g04: 4,
    g08: 8,
    g10: 10,
    g12: 12,
    g15: 15,
    g16: 16,
    g20: 20,
    g24: 24,
  },
  radius: {
    r05: 5,
    r08: 8,
    r10: 10,
    r12: 12,
    r16: 16,
  },
  font: {
    size: {
      s10: 10,
      s12: 12,
      s14: 14,
      s16: 16,
      s18: 18,
      s20: 20,
      s24: 24,
      s28: 28,
      s32: 32,
    },
    weight: {
      normal: '400' as const,
      medium: '500' as const,
      w600: '600' as const,
      bold: 'bold' as const,
    },
  },
};
