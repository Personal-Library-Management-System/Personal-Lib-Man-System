import React from 'react';
import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useColorModeValue,
} from '@chakra-ui/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footerContent?: React.ReactNode;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, footerContent, children }) => {
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(12px)" />
      <ModalContent bg={bg} borderRadius="2xl" shadow="2xl" aria-label={title}>
        <ModalCloseButton />
        <ModalBody px={{ base: 4, md: 6 }} pt={6} pb={6}>
          {children}
        </ModalBody>
        {footerContent && (
          <ModalFooter p={0}>
            {footerContent}
          </ModalFooter>
        )}
      </ModalContent>
    </ChakraModal>
  );
};

export default Modal;
