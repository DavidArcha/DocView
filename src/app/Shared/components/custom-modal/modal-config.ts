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
  childMinimizeBehavior?: ChildMinimizeBehavior;
  title?: string;
  middleText?: string;
  preActionText?: string;
  closeOnBackdropClick?: boolean;
  allowBackgroundInteraction?: boolean;
  closeOnEscape?: boolean;
  showBackdrop?: boolean;
  closeOnNavigationOrRefresh?: boolean;

  /**
   * Controls how modals behave when overlapping and clicked
   * - 'reposition': Move overlapping modals aside (default)
   * - 'stack': Just bring to front without moving others
   */
  overlapBehavior?: 'reposition' | 'stack';

  /**
   * Direction preference for repositioning overlapping modals
   * - 'auto': Choose best direction based on available space (default)
   * - 'right': Prefer moving overlapping modals to the right
   * - 'left': Prefer moving overlapping modals to the left
   * - 'up': Prefer moving overlapping modals upward
   */
  repositionDirection?: 'auto' | 'right' | 'left' | 'up';
}
