import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];


  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required ],
    country: ['', Validators.required ],
    border : ['', Validators.required ],
  })



  constructor(
    private fb:FormBuilder,
    private countriesService: CountriesService,
    ){}

  //Se ubica despues del constructor y el ya internamente sabe los elementos que tiene el constructor
  //y ya puede tener acceso a los servicios inyectados
  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();

  }

    get regions(): Region[]{
      //Obtiene los valores por referencia como si fueran una propiedad publica
      return this.countriesService.regions;
    }

  //Esta funcion extrae los paises y los almacena en countries
  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
    .pipe(
      //Cuando cambie la region no quede el campo vacio sino que apunte al value de "sellecione un pais"
      tap( () => this.myForm.get('country')!.setValue('') ),
      tap( () => this.borders = [] ),
      //Se ingresa a las propiedades de region y se le asignan a la region con todas las propiedades
      switchMap( (region) => this.countriesService.getCountriesByRegion( region ) ),
      )
    .subscribe( countries => {
      this.countriesByRegion = countries;
    });
  }

  onCountryChanged(): void {

    this.myForm.get('country')!.valueChanges
    .pipe(
      //Cuando cambie la region no quede el campo vacio sino que apunte al value de "sellecione un pais"
      tap( () => this.myForm.get('border')!.setValue('') ),
      filter( (value: string) => value.length > 0 ),
      //Se ingresa a las propiedades de region y se le asignan a la region con todas las propiedades
      switchMap( (alphaCode) => this.countriesService.getCountryByAlphaCode( alphaCode ) ),
      switchMap( (country) => this.countriesService.getCountryBordersByCodes( country.borders )),
    )
    .subscribe( countries => {
      this.borders = countries;
    });
  }


}
