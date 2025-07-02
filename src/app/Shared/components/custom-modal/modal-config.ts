import { TemplateRef, Type } from '@angular/core';
export interface ModalConfig {
  component?: Type<any>;
  template?: TemplateRef<any>;
  data?: any;
  width?: string;
  height?: string;
  draggable?: boolean;
  headerColor?: string;
  showFooter?: boolean;
  destroyOnClose?: boolean;
  closeChildrenOnParentClose?: boolean;
  title?: string;
  closeOnBackdropClick?: boolean;
  allowBackgroundInteraction?: boolean;
  closeOnEscape?: boolean; // NEW: allows disabling ESC-to-close
}
