/**
 * SafeModal - A wrapper around React Native's Modal that handles focus properly
 * Fixes the aria-hidden warning by blurring active elements before opening
 */

import React, { useEffect } from "react";
import { Modal, ModalProps, Platform } from "react-native";

interface SafeModalProps extends ModalProps {
  visible: boolean;
}

export const SafeModal: React.FC<SafeModalProps> = ({ visible, ...props }) => {
  useEffect(() => {
    // Only needed for web platform
    if (Platform.OS === "web" && visible) {
      // Blur any currently focused element to prevent aria-hidden warning
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
    }
  }, [visible]);

  return <Modal visible={visible} {...props} />;
};
