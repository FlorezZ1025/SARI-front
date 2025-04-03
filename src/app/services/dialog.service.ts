import { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  private readonly dialog = inject(MatDialog);

  constructor() { }

  open(component: ComponentType<any>, config?: MatDialogConfig<any>){
    return this.dialog.open(component, config);
  }
}