import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { VgApiService } from '@videogular/ngx-videogular/core';

@Component({
  selector: 'app-video-player',
  standalone: false,
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss'
})
export class VideoPlayerComponent implements AfterViewInit {
  @ViewChild('media', { static: true }) mediaElement!: ElementRef<HTMLVideoElement>;
  videoSrc: string = '/assets/videos/video.mp4';
  media: any;

  constructor(private vgApi: VgApiService) {}

  ngAfterViewInit() {
    this.media = this.vgApi.getDefaultMedia();
  }

  onVolumeChange(event: any) {
    const videoElement = this.mediaElement.nativeElement;
    if (videoElement) {
      videoElement.volume = event.target.value;
    }
  }
}
