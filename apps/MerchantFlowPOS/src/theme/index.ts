export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceSubtle: string;
  card: string;
  border: string;
  borderSubtle: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  primaryLight: string;
  success: string;
  successLight: string;
  danger: string;
  dangerLight: string;
  badgeBg: string;
  inputBg: string;
}

export const lightTheme: ThemeColors = {
  isDark: false,
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#CBD5E1',
  text: '#0F172A',
  textMuted: '#334155',
  textSubtle: '#64748B',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  success: '#16A34A',
  successLight: '#DCFCE7',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  badgeBg: '#F1F5F9',
  inputBg: '#FFFFFF',
};

export const darkTheme: ThemeColors = {
  isDark: true,
  background: '#0B0F19',
  surface: '#111827',
  surfaceSubtle: '#1F2937',
  card: '#1F2937',
  border: '#374151',
  borderSubtle: '#4B5563',
  text: '#F9FAFB',
  textMuted: '#E5E7EB',
  textSubtle: '#9CA3AF',
  primary: '#3B82F6',
  primaryLight: '#1E3A8A',
  success: '#22C55E',
  successLight: '#064E3B',
  danger: '#F87171',
  dangerLight: '#7F1D1D',
  badgeBg: '#374151',
  inputBg: '#1F2937',
};
