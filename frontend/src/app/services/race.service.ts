import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Race } from '../model/race.model';

@Injectable({ providedIn: 'root' })
export class RaceService {
  private racesSubject = new BehaviorSubject<Race[]>([]);
  races$ = this.racesSubject.asObservable();

  private loaded = false;

  constructor(private http: HttpClient) {}

  /** Load all races from server */
  async loadRaces(): Promise<Race[]> {
    const races = await firstValueFrom(this.http.get<Race[]>('/api/races'));
    this.racesSubject.next(races || []);
    this.loaded = true;
    return races || [];
  }

  /** Get all races (loads from server if not already loaded) */
  async getRaces(): Promise<Race[]> {
    if (!this.loaded) {
      return this.loadRaces();
    }
    return this.racesSubject.value;
  }

  /** Get a single race by ID */
  async getRace(id: string): Promise<Race | null> {
    const races = await this.getRaces();
    return races.find(r => r.id === id) || null;
  }

  /** Save a race (create or update) */
  async saveRace(race: Race): Promise<Race> {
    const response = await firstValueFrom(
      this.http.post<{ success: boolean; race: Race }>('/api/races', race)
    );

    // Update local cache
    const races = this.racesSubject.value;
    const existingIndex = races.findIndex(r => r.id === race.id);
    if (existingIndex >= 0) {
      races[existingIndex] = response.race;
    } else {
      races.push(response.race);
    }
    this.racesSubject.next([...races]);

    return response.race;
  }

  /** Delete a race */
  async deleteRace(id: string): Promise<boolean> {
    const response = await firstValueFrom(
      this.http.delete<{ success: boolean }>(`/api/races/${id}`)
    );

    if (response.success) {
      // Update local cache
      const races = this.racesSubject.value.filter(r => r.id !== id);
      this.racesSubject.next(races);
    }

    return response.success;
  }

  /** Generate a unique ID for a new race */
  generateId(): string {
    return 'race_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /** Upload race image separately to avoid payload size issues */
  async uploadRaceImage(raceId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await firstValueFrom(
      this.http.post<{ success: boolean; imageUrl: string }>(`/api/races/${raceId}/image`, formData)
    );

    // Update local cache with new image
    const races = this.racesSubject.value;
    const race = races.find(r => r.id === raceId);
    if (race) {
      race.baseImage = response.imageUrl;
      this.racesSubject.next([...races]);
    }

    return response.imageUrl;
  }
}
