import { map } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss'],
  providers: [
    {
       provide: NG_VALUE_ACCESSOR,
       useExisting: forwardRef(() => KanbanComponent),
       multi: true
    }
  ]
})
export class KanbanComponent implements OnInit {
  @Input() cards: any[] = [];
  @Output() callback: EventEmitter<any> = new EventEmitter();

  constructor(
    private router: Router
  ) {
  }

  normalizeHeight(){
    var drags = document.querySelectorAll<HTMLElement>('.kanban-drag')
    var h = 50
    for(var i = 0; i < drags.length; i++){
      drags[i].style.height = "auto";
    }
    for(var i = 0; i < drags.length; i++){
      if (drags[i].clientHeight > h){
        h = drags[i].clientHeight
      }
    }
    for(var i = 0; i < drags.length; i++){
      if (drags[i].clientHeight < h){
        drags[i].style.height = (h - 1) + "px";
      }
    }
  }

  ngOnInit(): void {
    this.cards = this.cards.sort((n1,n2) => {
      if (n1.order > n2.order) {
          return 1;
      }
      if (n1.order < n2.order) {
          return -1;
      }
      return 0;
    });
    setInterval(() => {
      this.normalizeHeight()
    }, 2000);
  }

  connectedTo(card: any){
    if (card?.connectedTo){
      return card.connectedTo
    }
    return this.cards.map((card) => {
      return card.id
    })
  }

  drop(event: CdkDragDrop<string[]>) {
    let item = null
    if (event.previousContainer === event.container) {
      item = {
        card_id: event.container.id,
        object: event.container.data[event.currentIndex]
      }
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      item = {
        card_id: event.container.id,
        object: event.previousContainer.data[event.previousIndex]
      }
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.callback.emit(item)
    }
  }

  link(item: any){
    this.router.navigate([item?.route])
    // window.open(item?.route, '_blank');
  }
}
