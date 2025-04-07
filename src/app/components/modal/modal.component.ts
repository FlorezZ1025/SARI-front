import { Component } from '@angular/core';
import { MatDialogContent } from '@angular/material/dialog';
import { MatLabel, MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select'

const MATERIAL_MODULES = [MatLabel, MatFormField, MatInputModule, MatDialogContent, MatDatepickerModule, MatSelectModule]

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [MATERIAL_MODULES],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {

}
