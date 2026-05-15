import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialBlock, MaterialStats, createEmptyMaterialBlock } from '../../model/forging.model';

@Component({
  selector: 'app-material-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './material-editor.component.html',
  styleUrl: './material-editor.component.css',
})
export class MaterialEditorComponent implements OnInit {
  @Input() material: MaterialBlock = createEmptyMaterialBlock();
  @Output() save = new EventEmitter<MaterialBlock>();
  @Output() cancel = new EventEmitter<void>();

  edit: MaterialBlock = createEmptyMaterialBlock();

  ngOnInit(): void {
    this.edit = JSON.parse(JSON.stringify(this.material));
    this.ensureStats();
    this.ensureDefaults();
  }

  private ensureStats(): void {
    if (!this.edit.weaponStats) {
      this.edit.weaponStats = this.emptyWeaponStats();
    }
    if (!this.edit.armorStats) {
      this.edit.armorStats = this.emptyArmorStats();
    }
  }

  private ensureDefaults(): void {
    if (!this.edit.rarity) this.edit.rarity = 'COMMON';
    if (this.edit.stackable === undefined) this.edit.stackable = false;
    if (!this.edit.stackLevels) this.edit.stackLevels = [];
  }

  private emptyWeaponStats(): MaterialStats {
    return { haltbarkeit: 50, haltbarkeitSkalierung: 10, effektivitaet: 5, effektivitaetSkalierung: 2, extraEffect: '', weight: 1, reqBase: 0, reqScaling: 0 };
  }

  private emptyArmorStats(): MaterialStats {
    return { haltbarkeit: 80, haltbarkeitSkalierung: 15, effektivitaet: 5, effektivitaetSkalierung: 2, extraEffect: '', weight: 2, ruestungsmalus: 0, reqBase: 0, reqScaling: 0 };
  }

  onWeaponToggle(): void {
    if (this.edit.canBeWeaponMaterial && !this.edit.weaponStats) {
      this.edit.weaponStats = this.emptyWeaponStats();
    }
  }

  onArmorToggle(): void {
    if (this.edit.canBeArmorMaterial && !this.edit.armorStats) {
      this.edit.armorStats = this.emptyArmorStats();
    }
  }

  onStackableChange(): void {
    if (this.edit.stackable && (!this.edit.stackLevels || this.edit.stackLevels.length === 0)) {
      this.edit.stackLevels = [''];
    }
  }

  addStackLevel(): void {
    if (!this.edit.stackLevels) this.edit.stackLevels = [];
    this.edit.stackLevels.push('');
  }

  removeStackLevel(index: number): void {
    if (!this.edit.stackLevels || index <= 0) return;
    this.edit.stackLevels.splice(index, 1);
  }

  onSave(): void {
    if (!this.edit.name?.trim()) return;
    this.save.emit(this.edit);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
