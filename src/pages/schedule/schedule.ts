import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, PopoverController} from 'ionic-angular';
import {Team} from '../../model/Team';
import {Match} from '../../model/Match';
import {Filter, filter} from "../../model/filter";
import {CleanUpOnViewWillUnload} from '../../app/CleanupOnViewWillUnload';
import {FilterPopoverPage} from '../filter-popover/filter-popover';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {MatchDetailPage} from '../match-detail/match-detail';
import {TeamsProvider} from "../../providers/team/team.provider";
import {Observable} from "rxjs/Observable";
import {MatchesProvider} from "../../providers/match/match.provider";

/**
 * Generated class for the SchedulePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html',
})
export class SchedulePage extends CleanUpOnViewWillUnload {
  matches: Array<Match> = [];  // todo convert to RxJS
  matches$: Observable<Match[]>;  // todo convert to RxJS
  filteredMatches$: BehaviorSubject<Array<Match>>;
  teams: Array<Team>;
  filters$: BehaviorSubject<Array<Filter>>;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public popoverCtrl: PopoverController,
              private matchService: MatchesProvider,
              private teamsProvider: TeamsProvider) {
    super();
    this.filteredMatches$ = new BehaviorSubject([]);
    this.filters$ = new BehaviorSubject([]);
  }

  openFilterPopover() {
    const popover = this.popoverCtrl.create(FilterPopoverPage);
    popover.present();

    popover.onDidDismiss(response => {
      this.filters$.next(response);
    })
  }

  ionViewDidLoad() {
    this.matches$ = this.matchService.fetchAll()
      .takeUntil(this.ngUnsubscribe);

    //todo combine matches and filters observables

    this.matches$.subscribe(matches => {
        this.matches = matches.filter((match: Match) => filter.filterMatch(match, this.filters$.value));
        this.filteredMatches$.next(this.matches);
      });

    this.filters$.subscribe((filters: Array<Filter>) => {
      this.filteredMatches$.next(this.matches.filter((match: Match) => filter.filterMatch(match, filters)));
    });

    this.teamsProvider.fetchAll()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(teams => this.teams = teams);
  }

  onCardTapped(m: any) {
    console.log(m);
    this.navCtrl.push(MatchDetailPage, {
      match: m
    });
  }
}
