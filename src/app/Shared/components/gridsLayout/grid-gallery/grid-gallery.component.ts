import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  ChangeDetectionStrategy
} from '@angular/core';

export interface ImageGridItem {
  id: string | number;
  title: string;
  dateIso?: string;
  thumbUrl?: string;
  fullUrl?: string;
  linkText?: string;
  linkPayload?: any;
  alt?: string;
  mimeTypeHint?: string;
}

@Component({
  selector: 'app-grid-gallery',
  standalone: false,
  templateUrl: './grid-gallery-simple.component.html',
  styleUrls: ['./grid-gallery.component.scss']
  // Temporarily removed OnPush for debugging
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridGalleryComponent implements OnInit, OnChanges {
  @Input() items: ImageGridItem[] = [];
  @Input() selectedLanguage: 'en' | 'de' | string = 'en';
  @Input() enableDownload = false;
  @Input() enableCopyLink = false;
  @Input() enableOpenInNewTab = false;
  @Input() enableSearchBox = false;
  @Input() enableKeyboardNextPrev = false;
  @Output() linkClick = new EventEmitter<any>();
  @Output() action = new EventEmitter<{ type: 'download' | 'copy' | 'open'; item: ImageGridItem }>();

  searchQuery: string = '';
  filteredItems: ImageGridItem[] = [];

  // Preview state
  showHoverPreview = false;
  hoverIndex = -1;
  hoverTimeout: any = null;

  ngOnInit() {
    console.log('GridGalleryComponent initialized with items:', this.items.length);
    this.filterItems();
  }

  ngOnChanges() {
    this.filterItems();
    console.log('ngOnChanges called, items:', this.items.length, 'filteredItems:', this.filteredItems.length);
  }

  trackByFn(index: number, item: ImageGridItem): string | number {
    return item.id;
  }

  filterItems(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredItems = !query ? this.items : this.items.filter(item =>
      item.title.toLowerCase().includes(query) ||
      (item.dateIso || '').toLowerCase().includes(query)
    );
    console.log('filterItems called, filteredItems:', this.filteredItems.length);
  }

  onImageHover(item: ImageGridItem): void {
    console.log('Image hover triggered:', item.title);
    
    // Clear any existing timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    // Set a small delay to prevent flickering on quick mouse movements
    this.hoverTimeout = setTimeout(() => {
      this.hoverIndex = this.filteredItems.findIndex(i => i.id === item.id);
      this.showHoverPreview = true;
      console.log('Hover preview should show:', this.showHoverPreview, 'Index:', this.hoverIndex);
      console.log('Filtered items length:', this.filteredItems.length);
      console.log('Item at index:', this.filteredItems[this.hoverIndex]);
    }, 100); // Reduced delay to 100ms for better responsiveness
  }

  onImageLeave(): void {
    console.log('Image leave triggered');
    
    // Clear timeout if mouse leaves before delay completes
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    
    // Hide hover preview immediately
    this.showHoverPreview = false;
    this.hoverIndex = -1;
    console.log('Hover preview hidden');
  }

  onLinkClick(item: ImageGridItem): void {
    console.log('[GridGallery] Data Link:', item.linkPayload || item);
    this.linkClick.emit(item.linkPayload || item);
  }

  onQuickAction(type: 'download' | 'copy' | 'open', item: ImageGridItem): void {
    this.action.emit({ type, item });

    const url = item.fullUrl || item.thumbUrl || '';
    if (type === 'copy' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    if (type === 'open') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    if (type === 'download') {
      const a = document.createElement('a');
      a.href = url;
      a.download = item.title || 'image';
      a.click();
    }
  }

  get hoverItem(): ImageGridItem | null {
    const item = this.filteredItems[this.hoverIndex] || null;
    console.log('Hover item getter called:', {
      hoverIndex: this.hoverIndex,
      filteredItemsLength: this.filteredItems.length,
      itemTitle: item?.title,
      showHoverPreview: this.showHoverPreview
    });
    return item;
  }
}