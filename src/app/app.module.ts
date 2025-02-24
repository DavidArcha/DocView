import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ResultPageComponent } from './components/result-page/result-page.component';
import { SideNavbarComponent } from './Shared/components/side-navbar/side-navbar.component';
import { SimpleSearchComponent } from './Shared/components/simple-search/simple-search.component';
import { LanguageService } from './Shared/services/language.service';
import { HomepageComponent } from './components/HomePage/homepage.component';
import { HeaderComponent } from './components/header/header.component';
import { CustomButtonsComponent } from './Shared/components/custom-buttons/custom-buttons.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LocalizedDropdownComponent } from './Shared/components/localized-dropdown/localized-dropdown.component';
import { MultilevelAccordionComponent } from './Shared/components/multilevel-accordion/multilevel-accordion.component';
import { AccordionSectionComponent } from './Shared/components/accordion-section/accordion-section.component';
import { SavedGroupAccordionComponent } from './Shared/components/saved-group-accordion/saved-group-accordion.component';
import { TextsurveyComponent } from './Shared/components/textsurvey/textsurvey.component';
import { QueryTableComponent } from './Shared/components/query-table/query-table.component';
import { VideoPlayerComponent } from './Shared/components/video-player/video-player.component';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TestingLevelComponent } from './Shared/components/testing-level/testing-level.component';
import { TableDropdownComponent } from './Shared/components/table-dropdown/table-dropdown.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    HeaderComponent,
    SideNavbarComponent,
    NotFoundComponent,
    DashboardComponent,
    SimpleSearchComponent,
    ResultPageComponent,
    CustomButtonsComponent,
    LocalizedDropdownComponent,
    MultilevelAccordionComponent,
    AccordionSectionComponent,
    SavedGroupAccordionComponent,
    TextsurveyComponent,
    QueryTableComponent,
    VideoPlayerComponent,
    TestingLevelComponent,
    TableDropdownComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    CommonModule,
    RouterOutlet,
    AgGridModule,
    FontAwesomeModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [LanguageService],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}
