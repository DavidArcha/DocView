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
  footerTemplate?: TemplateRef<any>;
  footerComponent?: Type<any>;
  footerData?: any;
  destroyOnClose?: boolean;
  closeChildrenOnParentClose?: boolean;
  title?: string;
  middleText?: string;
  preActionText?: string;
  closeOnBackdropClick?: boolean;
  allowBackgroundInteraction?: boolean;
  closeOnEscape?: boolean;
}
