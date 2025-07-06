import { TemplateRef, Type } from '@angular/core';

export type ChildMinimizeBehavior = 'minimize' | 'close' | 'none';

export interface ModalConfig {
  component?: Type<any>;
  template?: TemplateRef<any>;
  data?: any;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  autoSize?: boolean;
  draggable?: boolean;
  headerColor?: string;
  showFooter?: boolean;
  footerTemplate?: TemplateRef<any>;
  footerComponent?: Type<any>;
  footerData?: any;
  destroyOnClose?: boolean;
  closeChildrenOnParentClose?: boolean;
  childMinimizeBehavior?: ChildMinimizeBehavior; // New property
  title?: string;
  middleText?: string;
  preActionText?: string;
  closeOnBackdropClick?: boolean;
  allowBackgroundInteraction?: boolean;
  closeOnEscape?: boolean;
  showBackdrop?: boolean; 
}
