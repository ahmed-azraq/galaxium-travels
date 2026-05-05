import type { ReactNode } from 'react';
import { Modal as CarbonModal } from '@carbon/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  const carbonSize =
    size === 'sm' ? 'xs' :
    size === 'md' ? 'md' :
    size === 'lg' ? 'lg' : 'md';

  return (
    <CarbonModal
      open={isOpen}
      onRequestClose={onClose}
      modalHeading={title}
      passiveModal
      size={carbonSize}
      className="space-modal"
    >
      {children}
    </CarbonModal>
  );
};

// Made with Bob
