import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    OnInit,
    Output,
    Renderer2
} from '@angular/core';

@Directive({
    selector: '[ngFileDrop]'
})
export class DragAndDropDirective implements OnInit {

    @Output() private filesChange: EventEmitter<FileList> = new EventEmitter();
    private overlayElement: HTMLElement;
    private iconElement: HTMLElement;
    private dragging = 0;

    constructor(private el: ElementRef, private renderer: Renderer2) {
        this.overlayElement = this.renderer.createElement('div');
        this.iconElement = this.renderer.createElement('i');
    }

    ngOnInit() {
        this.setOverlayStyle();
        this.renderer.addClass(this.overlayElement, 'file-drop-overlay');
        this.setIconStyle();

        this.renderer.appendChild(this.overlayElement, this.iconElement);
        this.renderer.appendChild(this.el.nativeElement, this.overlayElement);

        // Set position relative for overlay to be placed properly (this will break if host element is absolute etc...)
        this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    }

    @HostListener('dragenter', ['$event'])
    @HostListener('dragleave', ['$event'])
    public onDragEnter(event) {
        event.stopPropagation();
        event.preventDefault();

        // Reference-counting-like drag state calculating...
        event.type === 'dragenter' ? this.dragging++ : this.dragging--;
        this.dragging > 0 ? this.showOverlay() : this.hideOverlay();

        // To make upload icon fit almost any container, set font size as one third of smaller dimension.
        // Todo: maybe move it so font size is not calculated so often (resize event maybe?)
        const sizeValue = Math.min(this.overlayElement.clientWidth, this.overlayElement.clientHeight);
        this.renderer.setStyle(this.overlayElement, 'font-size', sizeValue / 3 + 'px');
    }

    @HostListener('drop', ['$event'])
    public onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        this.filesChange.emit(event.dataTransfer.files);
        this.dragging = 0;
        this.hideOverlay();
    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    showOverlay() {
        this.renderer.setStyle(this.overlayElement, 'display', 'block');
    }

    hideOverlay() {
        this.renderer.setStyle(this.overlayElement, 'display', 'none');
    }


    // TODO: Inline styles are just temporary. Move this inline styles to separate scss file or something for easier customization.
    private setIconStyle() {
        // For readers... just in case.
        this.renderer.setProperty(this.iconElement, 'aria-hidden', true);

        this.renderer.addClass(this.iconElement, 'fa');
        this.renderer.addClass(this.iconElement, 'fa-upload');
        this.renderer.setStyle(this.iconElement, 'position', 'absolute');
        this.renderer.setStyle(this.iconElement, 'top', '50%');
        this.renderer.setStyle(this.iconElement, 'left', '50%');
        this.renderer.setStyle(this.iconElement, 'transform', 'translateX(-50%) translateY(-50%)');
        this.renderer.setStyle(this.iconElement, 'color', 'white');
    }

    private setOverlayStyle() {
        this.renderer.setStyle(this.overlayElement, 'position', 'absolute');
        this.renderer.setStyle(this.overlayElement, 'top', '0');
        this.renderer.setStyle(this.overlayElement, 'left', '0');
        this.renderer.setStyle(this.overlayElement, 'width', '100%');
        this.renderer.setStyle(this.overlayElement, 'height', '100%');
        this.renderer.setStyle(this.overlayElement, 'background-color', 'rgba(150, 150, 150, 0.50)');
        this.renderer.setStyle(this.overlayElement, 'display', 'none');
        this.renderer.setStyle(this.overlayElement, 'z-index', '999999');
        this.renderer.setStyle(this.overlayElement, 'border', '4px dashed white');
    }

}
