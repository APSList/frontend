import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';

import type { PropertyImage } from '../../types/property.types';

type StagedFile = { file: File; objectURL: string };

@Component({
  standalone: true,
  selector: 'property-image-uploader',
  templateUrl: './property-image-uploader.html',
  providers: [MessageService],
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DialogModule,
    FileUploadModule,
    GalleriaModule,
    ToastModule,
    ProgressBarModule,
    BadgeModule,
    NgOptimizedImage
  ]
})
export class PropertyImageUploader {
  @Input() editable = false;
  @Input() maxUploadBytes = 8_000_000;

  @Input() set images(value: PropertyImage[] | null | undefined) {
    const imgs = value ?? [];
    this.existingImagePaths.set(imgs.map(x => x.storagePath)); // pričakuje že URL
    this.clearStagedFiles();
    this.rebuildPreview();
  }

  @Output() previewChange = new EventEmitter<string[]>();

  uploadDialogOpen = signal(false);

  readonly existingImagePaths = signal<string[]>([]);
  readonly stagedFiles = signal<StagedFile[]>([]);

  readonly previewUrls = signal<string[]>([]);
  readonly activeIndex = signal(0);

  totalSize = signal(0);
  totalSizePercent = computed(() =>
    Math.min(100, Math.round((this.totalSize() / this.maxUploadBytes) * 100))
  );

  // pomaga ohranjati trenutno sliko ob spremembi seznama
  private lastActiveUrl: string | null = null;

  constructor(private readonly messageService: MessageService) {}

  // ===== Active index binding (PrimeNG 21: [(activeIndex)]) =====
  private clampIndex(idx: number, len: number): number {
    if (!Number.isFinite(idx)) return 0;
    if (len <= 0) return 0;
    const n = Math.trunc(idx);
    return Math.min(Math.max(n, 0), len - 1);
  }

  private setActiveIndexSafe(idx: number): void {
    const len = this.previewUrls().length;
    this.activeIndex.set(this.clampIndex(idx, len));
    this.lastActiveUrl = this.previewUrls()[this.activeIndex()] ?? null;
  }

  get activeIndexModel(): number {
    return this.clampIndex(this.activeIndex(), this.previewUrls().length);
  }

  set activeIndexModel(v: number) {
    // PrimeNG zna kdaj poslati undefined/NaN -> zaščitimo
    this.setActiveIndexSafe(v);
  }

  // ===== UI =====
  openUpload(): void {
    if (!this.editable) return;
    this.uploadDialogOpen.set(true);
  }

  closeUpload(): void {
    this.uploadDialogOpen.set(false);
  }

  /** Parent calls this on save */
  getUpsertImagesPayload(): { existingImagePaths: string[]; images: File[] } {
    return {
      existingImagePaths: this.existingImagePaths(),
      images: this.stagedFiles().map(x => x.file)
    };
  }

  /** Remove image by index from preview (either existing path or staged) */
  removeByIndex(index: number): void {
    if (!this.editable) return;

    // poskusi ohraniti trenutno sliko po URL-ju
    this.lastActiveUrl = this.previewUrls()[this.activeIndexModel] ?? null;

    const urls = this.previewUrls();
    const target = urls[index];
    if (!target) return;

    if (target.startsWith('blob:')) {
      const staged = this.stagedFiles();
      const match = staged.find(x => x.objectURL === target);
      if (match) {
        try { URL.revokeObjectURL(match.objectURL); } catch {}
        this.stagedFiles.set(staged.filter(x => x.objectURL !== target));
      }
    } else {
      this.existingImagePaths.set(this.existingImagePaths().filter(p => p !== target));
    }

    this.rebuildPreview();
  }

  // ===== PrimeNG file upload callbacks =====
  choose(event: Event, chooseCallback: Function): void {
    event.preventDefault();
    chooseCallback();
  }

  uploadEvent(uploadCallback: Function): void {
    uploadCallback(); // triggers uploadHandler
  }

  onSelectedFiles(event: any): void {
    const files: any[] = event?.currentFiles ?? event?.files ?? [];
    const bytes = files.reduce((sum, f) => sum + (f?.size ?? 0), 0);
    this.totalSize.set(bytes);

    // Nekatere PrimeNG verzije ne nastavijo objectURL za preview — dodamo ga sami
    for (const f of files) {
      if (f && !f.objectURL && f.type?.startsWith?.('image/')) {
        try { f.objectURL = URL.createObjectURL(f); } catch {}
      }
    }
  }

  onRemoveTemplatingFile(event: Event, file: any, removeFileCallback: Function, index: number): void {
    removeFileCallback(event, index);
    this.totalSize.set(Math.max(0, this.totalSize() - (file?.size ?? 0)));

    // Če smo mi ustvarili objectURL za pending, ga pospravi
    if (file?.objectURL?.startsWith?.('blob:')) {
      try { URL.revokeObjectURL(file.objectURL); } catch {}
    }
  }

  /** User clicks Upload -> stage files into preview + close modal */
  onTemplatedUpload(event: any): void {
    const files: File[] = event?.files ?? [];
    if (!files.length) return;

    // ohrani trenutno aktivno sliko
    this.lastActiveUrl = this.previewUrls()[this.activeIndexModel] ?? null;

    const next = [...this.stagedFiles()];
    let added = 0;

    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      const objectURL = URL.createObjectURL(f);
      next.push({ file: f, objectURL });
      added++;
    }

    this.stagedFiles.set(next);

    this.totalSize.set(0);
    this.rebuildPreview();
    this.closeUpload();

    this.messageService.add({
      severity: 'success',
      summary: 'Added',
      detail: `${added} photo(s) added to preview.`
    });
  }

  private clearStagedFiles(): void {
    for (const s of this.stagedFiles()) {
      try { URL.revokeObjectURL(s.objectURL); } catch {}
    }
    this.stagedFiles.set([]);
    this.totalSize.set(0);
    // activeIndex namerno ne resetamo vedno; rebuildPreview bo poskrbel za clamp
  }

  /**
   * Stabilno rebuildanje:
   * - nastavi previewUrls
   * - ohrani trenutno sliko, če je še prisotna (po URL-ju)
   * - drugače clamp-a indeks
   */
  private rebuildPreview(): void {
    const urls = [
      ...this.existingImagePaths(),
      ...this.stagedFiles().map(x => x.objectURL)
    ];

    this.previewUrls.set(urls);

    const len = urls.length;
    if (len === 0) {
      this.activeIndex.set(0);
      this.lastActiveUrl = null;
      this.previewChange.emit(urls);
      return;
    }

    const currentUrl =
      this.lastActiveUrl ??
      urls[this.clampIndex(this.activeIndex(), len)] ??
      null;

    if (currentUrl) {
      const newIdx = urls.indexOf(currentUrl);
      if (newIdx >= 0) {
        this.activeIndex.set(newIdx);
      } else {
        this.activeIndex.set(this.clampIndex(this.activeIndex(), len));
      }
    } else {
      this.activeIndex.set(this.clampIndex(this.activeIndex(), len));
    }

    this.lastActiveUrl = urls[this.activeIndex()] ?? null;
    this.previewChange.emit(urls);
  }

  formatSize(bytes: number): string {
    if (!bytes && bytes !== 0) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
    const value = bytes / Math.pow(k, i);
    return `${value.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
  }

  // če uporabljaš custom gumbe
  prev(): void {
    const len = this.previewUrls().length;
    if (len <= 1) return;
    const i = this.activeIndexModel;
    this.activeIndexModel = (i - 1 + len) % len;
  }

  next(): void {
    const len = this.previewUrls().length;
    if (len <= 1) return;
    const i = this.activeIndexModel;
    this.activeIndexModel = (i + 1) % len;
  }
}
