import { Pipe, PipeTransform } from '@angular/core';
import { ImageService } from '../services/image.service';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  constructor(private imageService: ImageService) {}

  transform(imageIdOrData: string | null | undefined): string | null {
    return this.imageService.getImageUrl(imageIdOrData);
  }
}
