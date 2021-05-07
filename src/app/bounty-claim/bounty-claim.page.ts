import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import  jsQR  from 'jsqr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bounty-claim',
  templateUrl: './bounty-claim.page.html',
  styleUrls: ['./bounty-claim.page.scss'],
})
export class BountyClaimPage implements OnInit {
  @ViewChild('qrCanvas', { static: true }) canvasElement: ElementRef<HTMLCanvasElement>;
  @ViewChild('qrVideo', { static: true }) videoElement: ElementRef<HTMLVideoElement>;

  private canvasContext: CanvasRenderingContext2D;

  constructor(private router: Router) { }

  ngOnInit() {
    this.canvasContext = this.canvasElement.nativeElement.getContext('2d');

    this.claimBounty();
    
  }

  claimBounty() {
    navigator.mediaDevices.getUserMedia({ video: 
      { facingMode: "environment" } 
    }).then( stream => {
      console.log(stream);

      this.videoElement.nativeElement.srcObject = stream;
      this.videoElement.nativeElement.play();

      requestAnimationFrame( () => this.tick())

    })
  }

  tick() {
   if(this.videoElement.nativeElement.readyState === this.videoElement.nativeElement.HAVE_ENOUGH_DATA) {
     this.canvasContext.canvas.height = this.videoElement.nativeElement.videoHeight;
     this.canvasContext.canvas.height = this.videoElement.nativeElement.videoWidth;
    // takes video element and writes it to canvas
     this.canvasContext.drawImage(
       this.videoElement.nativeElement, 
       0, 
       0, 
       this.canvasContext.canvas.width, 
       this.canvasContext.canvas.height
       )
      // extract raw image data from canvas to store in variable
       const imageData = this.canvasContext.getImageData(
         0,
         0,
         this.canvasContext.canvas.width,
         this.canvasContext.canvas.height
       )

       // feed image data to plugin that reads QRs
       const code = jsQR(imageData.data, imageData.width, imageData.height, { 
         inversionAttempts: "dontInvert"
       })

       if(code) {
         console.log("code");
        this.router.navigateByUrl('/bounty-board');
       }
   }
    
    requestAnimationFrame( () => this.tick())
  }

}
