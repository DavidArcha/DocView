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
  middleText?: string;
  preActionText?: string;
  closeOnBackdropClick?: boolean;
  allowBackgroundInteraction?: boolean;
  closeOnEscape?: boolean;
}
