import React from 'react';
type AppearanceSectionProps = {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};
export default function AppearanceSection({ theme, onThemeChange }: AppearanceSectionProps): JSX.Element {
  return (
    <div>
      {/* Appearance settings content */}
    </div>
  );
}
