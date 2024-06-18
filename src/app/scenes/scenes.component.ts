import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { RoundTwoDecimalsPipe } from '../round-two-decimals.pipe';

type TrackScene = {
  src: string;
  index: number;
  width: number;
  id: number;
};
const SCENES = [
  'https://content.shuffll.com/files/background-music/1.mp4',
  'https://content.shuffll.com/files/background-music/2.mp4',
  'https://content.shuffll.com/files/background-music/3.mp4',
] as const;

@Component({
  selector: 'app-scenes',
  standalone: true,
  imports: [CommonModule, RoundTwoDecimalsPipe],
  styleUrl: './scenes.component.scss',
  template: `
    <div class="grid">
      <div>
        <div>all scenes</div>
        @for (scene of scenes; track scene; let i = $index) {
        <video
          class="hide-video"
          #sceneElem
          [src]="scene"
          (loadedmetadata)="onSceneLoadedmetadata()"
        ></video>
        <div
          class="scene-bar"
          draggable="true"
          (dragstart)="onDragScene(sceneElem, i + 1)"
        >
          <div class="get-flex">
            <span>Scene {{ i + 1 }}</span>
            <span class="smlr-txt"
              >duration: @if(sceneElem.duration){
              {{ (sceneElem.duration | roundTwoDecimals) + 's' }}} @else{
              loading video metadata }
            </span>
          </div>
          <button
            type="button"
            class="justify-end scene-button"
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
          (loadedmetadata)="onLoadedPreviewVideo(selectedScene)"
          (ended)="onVideoEnded()"
        ></video>
        }@else {
        <div class="no-scene-selected-for-preview">Preview video here</div>
        }
      </div>
    </div>
    <button
      type="button"
      class="main-play-button"
      [disabled]="!trackScenes.length"
      (click)="onPlayClick()"
    >
      <span>
        @if(!scenePreviewMode && isTrackPlaying) {Pause} @else {Play}
      </span>
      <div
        class="button-symbol"
        [class.pause-button]="!scenePreviewMode && isTrackPlaying"
      ></div>
    </button>
    <div class="track-ruler">
      @for(trackTime of trackTimes; track trackTime){
      <span>{{ trackTime }}</span>
      }
    </div>
    <div
      id="scene-track"
      class="scene-track"
      (drop)="onDropSceneOnTrack($event)"
      (dragover)="onDragOver($event)"
    >
      @for (trackScene of trackScenes; track trackScene.id) {
      <span
        [style.width.px]="trackScene.width"
        draggable="true"
        (dragover)="onDragOver($event)"
        (drop)="onSwitchTracksPlacement(trackScene)"
        (dragstart)="onDragSceneInTrack(trackScene)"
        >Scene {{ trackScene.index }}</span
      >
      }
    </div>
  `,
})
export class ScenesComponent implements AfterViewInit {
  @ViewChildren('sceneElem') sceneElem!: QueryList<
    ElementRef<HTMLVideoElement>
  >;
  @ViewChild('selectedScene') selectedScene?: ElementRef<HTMLVideoElement>;
  public duration: number[] = [];
  public selectedSceneSrc!: string;
  public trackScenes: Array<TrackScene> = [];
  public draggedScene!: TrackScene;
  trackTotalWidth!: number;
  scenePreviewMode = true;
  videoPlayingIndex = 0;
  trackTimes: number[] = [];
  isTrackPlaying = false;
  get scenes() {
    return SCENES;
  }

  get maxSceneWidth() {
    if (this.trackScenes.length === 0) return 20;
    return Math.max(...this.trackScenes.map((trackScene) => trackScene.width));
  }

  ngAfterViewInit() {
    this.trackTotalWidth = document
      .getElementById('scene-track')!
      .getBoundingClientRect().width;
    setTimeout(() => {
      this.trackTimes = [
        ...Array(Math.ceil(this.trackTotalWidth / 30)).keys(),
      ].map((x) => x);
    });
  }

  public onSceneLoadedmetadata() {}

  public onSceneClick(scene: HTMLVideoElement) {
    this.scenePreviewMode = true;
    this.selectedSceneSrc = scene.src;
    if (this.selectedScene) {
      if (this.selectedScene.nativeElement.paused)
        this.selectedScene.nativeElement.play();
      else this.selectedScene.nativeElement.pause();
    }
  }

  public onLoadedPreviewVideo(selectedScene: HTMLVideoElement) {
    selectedScene.play().then(() => {
      this.isTrackPlaying = true;
    });
  }

  public onDragScene(elem: HTMLVideoElement, index: number) {
    console.log(this.trackScenes);
    this.draggedScene = {
      src: elem.src,
      index,
      width: Math.ceil(elem.duration * 20),
      id: this.trackScenes.length,
    };
  }

  public onDropSceneOnTrack(_event: DragEvent) {
    // const a = this.trackTotalWidth / this.maxSceneWidth;
    this.trackScenes = [...this.trackScenes, this.draggedScene];
    console.log(this.trackScenes);
  }

  public onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  public onPlayClick() {
    this.scenePreviewMode = false;
    // this.videoPlayingIndex = 0;
    this.selectedSceneSrc = this.trackScenes[this.videoPlayingIndex].src;
    if (this.selectedScene) {
      if (this.selectedScene.nativeElement.paused) {
        this.selectedScene.nativeElement.play();
        this.isTrackPlaying = true;
      } else {
        this.selectedScene.nativeElement.pause();
        this.isTrackPlaying = false;
      }
    }
    // this.selectedScene?.nativeElement.load();
  }

  public onVideoEnded() {
    this.videoPlayingIndex++;
    if (
      !this.scenePreviewMode &&
      this.videoPlayingIndex < this.trackScenes.length
    ) {
      this.selectedSceneSrc = this.trackScenes[this.videoPlayingIndex].src;
      this.selectedScene?.nativeElement.load();
    } else {
      this.videoPlayingIndex = 0;
      this.isTrackPlaying = false;
      // if you want to show default preview image on video end
      // this.selectedSceneSrc = '';
    }
  }

  public onSwitchTracksPlacement(trackScene: TrackScene) {
    console.log('🚀 ~ ScenesComponent ~ trackScene:', trackScene);
  }

  public onDragSceneInTrack(trackScene: TrackScene) {
    this.draggedScene = {
      ...trackScene,
      id: this.trackScenes.length,
    };
  }
}
