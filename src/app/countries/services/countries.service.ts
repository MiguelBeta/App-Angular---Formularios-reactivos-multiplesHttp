import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, map, of  } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [ Region.Africa, Region.Americas, Region.Asia, Region.Europa, Region.Oceania ];

  constructor(
    //Se utiliza la peticion para buscar archivos de la nube
    private http: HttpClient
    ) { }

  get regions(): Region[]{
    //Permite ingresar a los valores de _regios que es private por referencia y no permite que cambien
    //los archivos originales
    return[ ...this._regions ];
  }

  getCountriesByRegion( region: Region ): Observable <SmallCountry[]>{

    if( !region ) return of([]);

    const url: string = `${ this.baseUrl }/region/${ region }?fields=cca3,name,borders`;

    return this.http.get< Country[] >(url)
      .pipe(
        map( countries => countries.map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          //Evalua que bordes no sea un string vacio y devuelve la infomracion
          borders: country.borders ?? [],
        }))),
      )
  }


  getCountryByAlphaCode( alphaCode: string ): Observable<SmallCountry>{

    const url = `${ this.baseUrl }/alpha/${ alphaCode }?fields=cca3,name,borders`;
    //Llama algo que luce como un pais(Por su infomracion)
    return this.http.get< Country >(url)
      .pipe(
        map( country => ({
         name: country.name.common,
         cca3: country.cca3,
         borders: country.borders ?? [],
        }))
      )
  }

  getCountryBordersByCodes( borders: string[] ): Observable<SmallCountry[]> {
    if ( !borders || borders.length === 0 ) return of([]);

    const countriesRequests:Observable<SmallCountry>[]  = [];

    borders.forEach( code => {
      const request = this.getCountryByAlphaCode( code );
      countriesRequests.push( request );
    });


    return combineLatest( countriesRequests );
  }

}
