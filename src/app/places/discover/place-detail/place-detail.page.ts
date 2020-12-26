import { CreateBookingComponent } from './../../../bookings/create-booking/create-booking.component';
import { Place } from './../../place.model';
import { PlacesService } from './../../places.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { BookingService } from 'src/app/bookings/booking.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {

  place: Place;
  isBookable = false;
  isLoading = false;
  private placesSub: Subscription;

  constructor(
    private route: ActivatedRoute, 
    private navCtrl: NavController,
    private placeService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')){
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }

      this.isLoading = true;
      let fetchedUserId: string;

      this.authService.userId.pipe(
        take(1),
        switchMap(userId => {
        if (!userId) {
          throw new Error('Found no user!');
        }
        fetchedUserId = userId;
        return this.placeService
          .getPlace(paramMap.get('placeId'));
      })).subscribe( place => {
        this.place = place;
        this.isBookable = place.userId !== fetchedUserId;
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create({
          header: 'An error occurred!',
          message: 'Could not load place.',
          buttons: [{ text: 'Okay', handler: () => {
            this.router.navigate(['/places/tabs/discover']);
          }}]
        })
        .then(alertEl => alertEl.present());
      });
    });
  }

  onBookPlace() {
    //this.router.navigateByUrl('/places/tabs/discover');
    //this.navCtrl.navigateBack('/places/tabs/discover'); 
    //this.navCtrl.pop();

    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'Cancel'
        }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    })
  
  }

  openBookingModal (mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl
    .create({
      component: CreateBookingComponent,
      componentProps: {selectedPlace: this.place, selectedMode: mode}
    })
      .then(modelEl => {
        modelEl.present();
        return modelEl.onDidDismiss();
    })
    .then(resultData => {
      
      if(resultData.data === 'confirm'){

        this.loadingCtrl.create({message: 'Booking place...'}).then(loadingEl => {
          loadingEl.present();
          const data = resultData.data.bookingData;
          this.bookingService.addBooking(
            this.place.id,
            this.place.title,
            this.place.imageUrl,
            data.firstName,
            data.lastName,
            data.guestNumber,
            data.startDate,
            data.endDate
          ).subscribe(() => {
            loadingEl.dismiss();
          });
        });
       
      }
    });

  }

  onShowFullMap() {
    this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        center: {
          lat: this.place.location.lat,
          lng: this.place.location.lng
        },
        selectable: false,
        closeButtonText: 'Close',
        title: this.place.location.address
      }
    }).then( modalEl => {
      modalEl.present();
    });
  }

  ngOnDestroy() {
    if(this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

}
