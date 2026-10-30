import React from 'react';
import { HumanChatSpace } from './HumanChatSpace';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[90vh] sm:h-[750px] shadow-2xl">
        <HumanChatSpace
          initialSubject={initialMessageText}
          isModal={true}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
