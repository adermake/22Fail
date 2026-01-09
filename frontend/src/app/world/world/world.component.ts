import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../shared/card/card.component';

@Component({
  selector: 'app-world',
  imports: [CommonModule, CardComponent],
  templateUrl: './world.component.html',
  styleUrl: './world.component.css',
})
export class WorldComponent implements OnInit {
  worldName: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.worldName = params['worldName'];
      console.log('Loading world:', this.worldName);
      // TODO: Load world data from backend
    });
  }
}