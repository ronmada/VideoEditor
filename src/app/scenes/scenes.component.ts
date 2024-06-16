import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

const SCENES = [
  'https://content.shuffll.com/files/background-music/1.mp4',
  'https://content.shuffll.com/files/background-music/2.mp4',
  'https://content.shuffll.com/files/background-music/3.mp4',
] as const;

@Component({
  selector: 'app-scenes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid">
      <div>
        <div>all scenes</div>
        @for (scene of scenes; track scene; let i = $index) {
        <video
          class="hide-video"
          #sceneElem
          [src]="scene"
          (loadedmetadata)="onSceneLoadedmetadata(sceneElem)"
        ></video>
        <div
          id="source"
          class="scene-bar"
          draggable="true"
          (dragstart)="drag(sceneElem, i + 1)"
        >
          <div class="get-flex">
            <span>Scene {{ i + 1 }}</span>
            <span class="smlr-txt">duration: {{ duration[i] }}s</span>
          </div>
          <button
            type="button"
            class="justify-end button"
            (click)="onSceneClick(sceneElem)"
          ></button>
        </div>
        } @empty {
        {{ 'no scenes' }}
        }
      </div>
      <div>
        <div>Preview</div>
        @if(selectedSceneSrc){
        <video
          #selectedScene
          class="adjust-preview-dimen"
          [src]="selectedSceneSrc"
          loop
          (loadedmetadata)="onLoadedPreviewVideo(selectedScene)"
        ></video>
        }@else {
        <div class="no-scene-selected-for-preview">Preview video here</div>
        }
      </div>
    </div>

    <div
      id="target"
      class="scene-track"
      (drop)="drop()"
      (dragover)="allowDrop($event)"
    >
      @for (trackScene of trackScenes; track trackScene) { Scene
      {{ trackScene.index }} {{ trackScene.elem.duration }} }
    </div>
  `,
  styleUrl: './scenes.component.scss',
})
export class ScenesComponent {
  @ViewChildren('sceneElem') sceneElem!: QueryList<
    ElementRef<HTMLVideoElement>
  >;
  @ViewChild('selectedScene') selectedScene?: ElementRef<HTMLVideoElement>;
  public duration: number[] = [];
  public selectedSceneSrc!: string;
  public trackScenes: Array<{ elem: HTMLVideoElement; index: number }> = [];
  public draggedScene!: { elem: HTMLVideoElement; index: number };
  get scenes() {
    return SCENES;
  }

  public onSceneLoadedmetadata(sceneElem: HTMLVideoElement) {
    this.duration.push(sceneElem.duration);
  }

  public onSceneClick(scene: HTMLVideoElement) {
    this.selectedSceneSrc = scene.src;
    if (this.selectedScene) {
      if (this.selectedScene.nativeElement.paused)
        this.selectedScene.nativeElement.play();
      else this.selectedScene.nativeElement.pause();
    }
  }

  public onLoadedPreviewVideo(selectedScene: HTMLVideoElement) {
    selectedScene.play();
  }

  public drag(elem: HTMLVideoElement, index: number) {
    this.draggedScene = { elem, index };
  }

  public drop() {
    this.trackScenes = [...this.trackScenes, this.draggedScene];
  }

  public allowDrop(event: DragEvent) {
    event.preventDefault();
  }
}
