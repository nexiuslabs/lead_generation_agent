import React from 'react';

type DefaultSectionProps = {
  sectionId: string;
};

export default function DefaultSection({ sectionId }: DefaultSectionProps): JSX.Element {
  return (
    <div>
      {/* Default content for section {sectionId} */}
    </div>
  );
}
