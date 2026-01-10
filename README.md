# Frontend

Ta projekt je bil ustvarjen z [Angular CLI](https://github.com/angular/angular-cli) različice 18.0.6.

## Razvojni strežnik (Development server)

Za zagon razvojnega strežnika poženi ukaz `ng serve`. Odpri `http://localhost:4200/`. Aplikacija se bo samodejno osvežila, če spremeniš katero koli izvorno datoteko.

## Konfiguracija okolja (Environment)

Projekt uporablja konfiguracijske datoteke, ki se nahajajo v mapi `src/environments/`:
* `environment.ts` (Privzeta konfiguracija)
* `environment.dev.ts` (Razvojna konfiguracija)

### Struktura konfiguracije
Zagotovi, da imajo okoljske datoteke naslednjo strukturo z ustreznimi vrednostmi:

```typescript
export const environment = {
  production: false, // true za environment.ts, false za dev
  apiBaseUrl: 'URL_DO_PROPERTY_API',
  paymentBaseUrl: 'URL_DO_PAYMENT_API',
  graphqlUrl: 'URL_DO_GRAPHQL_ENDPOINTA',
  bookingBaseUrl: 'URL_DO_BOOKING_API',
  profileBaseUrl: 'URL_DO_PROFILE_API',
  supabaseUrl: 'URL_DO_SUPABASE_INSTANCE',
  supabaseKey: 'SUPABASE_JAVNI_KLJUC'
};
