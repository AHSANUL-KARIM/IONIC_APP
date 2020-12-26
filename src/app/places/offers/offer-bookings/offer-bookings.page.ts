import { PlacesService } from './../../places.service';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Place } from './../../place.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-offer-bookings',
  templateUrl: './offer-bookings.page.html',
  styleUrls: ['./offer-bookings.page.scss'],
})
export class OfferBookingsPage implements OnInit, OnDestroy {

  place: Place;
  private placeSub: Subscription;

  constructor( private route: ActivatedRoute, private navCtrl: NavController, private placeService: PlacesService) { }

  ngOnInit() {

    this.route.paramMap.subscribe( paramMap => {

      if(!paramMap.has('placeId'))
      {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }

      this.placeSub  = this.placeService.getPlace(paramMap.get('placeId')).subscribe( place => {
        this.place = place;
      });

    });
  }

  ngOnDestroy() {
    if(this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }


}
 