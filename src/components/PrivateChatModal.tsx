import React from 'react';
import { MessengerWidget } from './MessengerWidget';

interface PrivateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessageText?: string;
}

export const PrivateChatModal: React.FC<PrivateChatModalProps> = ({
  isOpen,
  onClose,
  initialMessageText
}) => {
  return (
    <MessengerWidget
      externalTriggerOpen={isOpen}
      onClose={onClose}
      initialText={initialMessageText}
    />
  );
};
