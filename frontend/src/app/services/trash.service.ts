import { Injectable, inject } from '@angular/core';
import { WorldStoreService } from './world-store.service';

export interface TrashItem {
  type: 'item' | 'rune' | 'spell' | 'skill';
  data: any;
  deletedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class TrashService {
  private store = inject(WorldStoreService);

  getTrash(): TrashItem[] {
    return this.store.worldValue?.trash || [];
  }

  addToTrash(type: 'item' | 'rune' | 'spell' | 'skill', data: any) {
    const world = this.store.worldValue;
    if (!world) return;

    const newTrash = [...(world.trash || []), {
      type,
      data,
      deletedAt: Date.now()
    }];

    this.store.applyPatch({
      path: 'trash',
      value: newTrash
    });
  }

  restoreFromTrash(index: number) {
    const world = this.store.worldValue;
    if (!world || !world.trash) return;

    const trashItem = world.trash[index];
    const newTrash = [...world.trash];
    newTrash.splice(index, 1);

    // Restore to appropriate library
    switch (trashItem.type) {
      case 'item':
        this.store.applyPatch({
          path: 'itemLibrary',
          value: [...world.itemLibrary, trashItem.data]
        });
        break;
      case 'rune':
        this.store.applyPatch({
          path: 'runeLibrary',
          value: [...world.runeLibrary, trashItem.data]
        });
        break;
      case 'spell':
        this.store.applyPatch({
          path: 'spellLibrary',
          value: [...world.spellLibrary, trashItem.data]
        });
        break;
      case 'skill':
        this.store.applyPatch({
          path: 'skillLibrary',
          value: [...world.skillLibrary, trashItem.data]
        });
        break;
    }

    // Update trash
    this.store.applyPatch({
      path: 'trash',
      value: newTrash
    });
  }

  permanentlyDelete(index: number) {
    const world = this.store.worldValue;
    if (!world || !world.trash) return;

    const newTrash = [...world.trash];
    newTrash.splice(index, 1);

    this.store.applyPatch({
      path: 'trash',
      value: newTrash
    });
  }

  emptyTrash() {
    this.store.applyPatch({
      path: 'trash',
      value: []
    });
  }
}
