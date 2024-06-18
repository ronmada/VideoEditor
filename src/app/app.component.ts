import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { RoundTwoDecimalsPipe } from './round-two-decimals.pipe';
import { SCENES } from './scenes';
import { TrackScene } from './app.component.types';

@Component({
  selector: 'app-root',
  standalone: true,
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
  imports: [RoundTwoDecimalsPipe],
})
export class AppComponent {
  /**hold every video element from the list of available preview scenes */
  @ViewChildren('sceneElem') sceneElem!: QueryList<
    ElementRef<HTMLVideoElement>
  >;
  /**holds the playing video VideoElement */
  @ViewChild('selectedScene') selectedScene?: ElementRef<HTMLVideoElement>;
  /**a string the holds the currently playing video Src */
  public selectedSceneSrc!: string;
  /** array of all scenes that are on the track */
  public trackScenes: Array<TrackScene> = [];
  /** a scene that is being dragged from the track or from one of the preview scenes */
  public draggedScene!: TrackScene;
  /** manages state between a preview video playing or the track playing; true if playing a preview scene; false if playing from the track */
  public isScenePreviewMode = true;
  /** if a video is playing then this is true; false otherwise */
  public isTrackPlaying = false;
  /** an array of incremental number that goes from 1 to its own length */
  public trackTimes: number[] = [];
  /** the index of the trackScene that is currently playing */
  private videoPlayingIndex = 0;
  /** when dragging a preview scene this is false; and when dragging a scene from the track itself, this is true */
  private isDraggingSceneInsideTrack = false;

  get scenes() {
    return SCENES;
  }

  ngAfterViewInit() {
    /** calculates the track width */
    const trackTotalWidth = document
      .getElementById('scene-track')!
      .getBoundingClientRect().width;
    /** creates an array with incremental in proportion to the track width */
    setTimeout(() => {
      this.trackTimes = [...Array(Math.ceil(trackTotalWidth / 30)).keys()].map(
        (x) => x
      );
    });
  }

  /** returns unique strings to make each scene in the track unique */
  private generateUniqueId() {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substr(2);
    return dateString + randomness;
  }

  /**to render each preview scene duration */
  public onSceneLoadedmetadata() {}

  public onSceneClick(scene: HTMLVideoElement) {
    this.isScenePreviewMode = true;
    this.selectedSceneSrc = scene.src;
    if (this.selectedScene) {
      if (this.selectedScene.nativeElement.paused)
        this.selectedScene.nativeElement.play();
      else this.selectedScene.nativeElement.pause();
    }
  }

  public onLoadedSelectedSceneVideo(selectedScene: HTMLVideoElement) {
    selectedScene.play().then(() => {
      this.isTrackPlaying = true;
    });
  }

  public onDragScene(elem: HTMLVideoElement, index: number) {
    this.isDraggingSceneInsideTrack = false;
    this.draggedScene = {
      src: elem.src,
      sceneName: `Scene ${index}`,
      width: Math.ceil(elem.duration * 20),
      id: this.generateUniqueId(),
    };
  }

  public onDropSceneOnTrack(_event: DragEvent) {
    if (!this.isDraggingSceneInsideTrack) {
      this.trackScenes = [...this.trackScenes, this.draggedScene];
    }
  }

  public onDragOver(event: DragEvent) {
    /** in the dragover event handler for the target container, we call event.preventDefault(), which enables it to receive drop events. */
    event.preventDefault();
  }

  public onTrackPlayClick() {
    this.isScenePreviewMode = false;
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
  }

  public onVideoEnded() {
    this.videoPlayingIndex++;
    if (
      !this.isScenePreviewMode &&
      this.videoPlayingIndex < this.trackScenes.length
    ) {
      this.selectedSceneSrc = this.trackScenes[this.videoPlayingIndex].src;
      this.selectedScene?.nativeElement.load();
    } else {
      /** this is when the track is over  */
      this.videoPlayingIndex = 0;
      this.isTrackPlaying = false;
      // if you want to show default preview image on video end
      // this.selectedSceneSrc = '';
    }
  }

  public onSwitchTracksPlacement(event: DragEvent) {
    if (this.isDraggingSceneInsideTrack) {
      const sourceIndex = parseInt(event.dataTransfer!.getData('index'), 10);
      // this.trackScenes
      const trackSceneIds: string[] = [];
      for (let i = 0; i < this.trackScenes.length; i++) {
        trackSceneIds.push('scene-track-' + i);
      }
      const droppedTargetElement = trackSceneIds.find(
        (trackSceneId) => trackSceneId === (event.target as HTMLElement).id
      );
      //on one of the elements
      if (droppedTargetElement) {
        const targetIndex = parseInt(
          droppedTargetElement.substring('scene-track-'.length),
          10
        );
        // this replaces between the scenes on the track
        [this.trackScenes[sourceIndex], this.trackScenes[targetIndex]] = [
          this.trackScenes[targetIndex],
          this.trackScenes[sourceIndex],
        ];
      }
    }
  }

  public onDragSceneInTrack(
    event: DragEvent,
    trackScene: TrackScene,
    index: number
  ) {
    this.isDraggingSceneInsideTrack = true;
    event.dataTransfer?.setData('index', index.toString());
    this.draggedScene = trackScene;
  }

  public onDragEnd(event: DragEvent, index: number) {
    // if the track scene dropped is out of the track
    if (event.dataTransfer?.dropEffect === 'none') {
      // this removes the dropped scene from the track without mutation
      this.trackScenes = this.trackScenes
        .slice(0, index)
        .concat(this.trackScenes.slice(index + 1));
    }
  }
}
