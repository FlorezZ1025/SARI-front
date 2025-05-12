import { Directive, ElementRef, inject, input, OnInit } from '@angular/core';

@Directive({
  selector: '[appSpinnerColor]',
  standalone: true,
})
export class SpinnerColorDirective implements OnInit {
  color = input.required<string>();

  private element = inject(ElementRef);

  ngOnInit(): void {
    const circle = this.element.nativeElement.querySelector('circle');
    if (circle) {
      circle.setAttribute('stroke', this.color);
    }
  }
}
