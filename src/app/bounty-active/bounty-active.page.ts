import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { api_key } from './google_maps_api_key.js';
declare var google

const { Geolocation } = Plugins;

@Component({
  selector: 'app-bounty-active',
  templateUrl: './bounty-active.page.html',
  styleUrls: ['./bounty-active.page.scss'],
})
export class BountyActivePage implements OnInit {
  @ViewChild('mapCanvas', {static: true}) mapElement: ElementRef;
    public map: any;
    public userLocation: any;
    public bountyLocation: any = {
      latitude: 41.45076091238562,
      longitude: -96.45316363085408
    }
    private watcherId: string;
    private userRawPosition: any = {
      coords: {}
    }
    private userMarker: any;
    private bountyCircle: any;
    private userLocationObject: any;

  constructor(private router: Router) { }
    
  ngOnInit() {

    const loader = new Loader({
      apiKey: api_key,
      version: "weekly",
      libraries: ['geometry'],
    });

    loader.load().then( () => {

      this.loadMap()

    }).then( () => {

      this.watchLocation();

    })
  }

  
  loadMap() {
    return Geolocation.getCurrentPosition().then( position => {
      
      this.userLocationObject = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      // Users position
      

      const mapOptions = {
        zoom: 13,
        center: this.userLocationObject
      }
  
      this.map = new google.maps.Map(
        this.mapElement.nativeElement, 
        mapOptions
        )

        return Promise.resolve()
    })

  }


  watchLocation() {
    console.log('hmm');

    const positionOptions = {
      maximumAge: 0,
      enableHighAccuracy: false
    }

    this.watcherId = Geolocation.watchPosition(positionOptions, (position) => {

      console.log('Got watched position', position);

      if(
        !position ||
        !position.coords ||
        (this.userRawPosition.coords.latitude === position.coords.latitude &&
        this.userRawPosition.coords.longitude === position.coords.longitude)

      ) {
        console.log('Same location, skipping rest of fuction', this.userRawPosition, position);
        return false
      }


      this.userRawPosition = position;

      console.log('Position', position);

      this.updateUserLocation();
      this.updateBountyCircle();
    })
  }

  updateUserLocation() {

    this.userLocationObject = new google.maps.LatLng(
      this.userRawPosition.coords.latitude,
      this.userRawPosition.coords.longitude
    )


    if(this.userMarker) this.userMarker.setMap(null);
    this.userMarker = new google.maps.Marker({
      map: this.map,
      position: this.userLocationObject,
      animation: google.maps.Animation.DROP
    })
  }

  updateBountyCircle() {

        //bounty lat/long
        //41.45076091238562, -96.45316363085408
        const bountyLocationObject = new google.maps.LatLng(this.bountyLocation.latitude, this.bountyLocation.longitude);

        const bountyMarker = new google.maps.Marker({
          map: this.map,
          position: bountyLocationObject,
          animation: google.maps.Animation.DROP
        })

        const distanceToBounty = Math.round(
          google.maps.geometry.spherical.computeDistanceBetween(this.userLocationObject, bountyLocationObject)
          )
        let radius

        if(distanceToBounty > 1000){
          radius = 500
        } else if (distanceToBounty <= 1000 && distanceToBounty > 500) {
          radius = 300
        } else if (distanceToBounty <= 500 && distanceToBounty > 100){
          radius = 100;
        }

        if(this.bountyCircle) this.bountyCircle.setMap(null);


        this.bountyCircle = new google.maps.Circle({
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
          map: this.map,
          center: bountyLocationObject,
          radius
        });
 
  }

  goToBountyClaim() {
    this.router.navigateByUrl('/bounty-claim');
  }
}
