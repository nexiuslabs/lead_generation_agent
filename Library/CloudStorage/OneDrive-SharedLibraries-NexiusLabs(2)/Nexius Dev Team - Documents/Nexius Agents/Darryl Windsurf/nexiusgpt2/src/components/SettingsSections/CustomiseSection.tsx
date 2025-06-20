import { UserCircle } from 'lucide-react';

type CustomiseSectionProps = {
  onNavigateProfile?: () => void;
};

export default function CustomiseSection({ onNavigateProfile }: CustomiseSectionProps): JSX.Element {
  return (
    <div>
      {/* Customise settings content */}
      <button
        onClick={() => onNavigateProfile?.()}
        className="mt-4 flex items-center space-x-2 text-blue-600 hover:underline"
      >
        <UserCircle size={18} />
        <span>Profile Settings</span>
      </button>
    </div>
  );
}
