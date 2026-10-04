# Places API: Place Details (New)

The Place Details (New) capability retrieves comprehensive information about a
single place, identified by its unique place ID. This capability uses the modern
REST API endpoint.

## Prerequisites

To successfully execute a Place Details (New) request, the following items are
required:

1.  **API Key**: A valid Google Maps Platform API key enabled for the Places
    API. This key must be passed via the `X-Goog-Api-Key` HTTP header.
2.  **Place ID**: A textual identifier that uniquely identifies the place. This
    ID can be obtained from several source APIs:
    *   [Text Search (New)](https://developers.google.com/maps/documentation/places/web-service/text-search?utm_campaign=gmp_git_agentskills_v1)
    *   [Nearby Search (New)](https://developers.google.com/maps/documentation/places/web-service/nearby-search?utm_campaign=gmp_git_agentskills_v1)
    *   [Geocoding API](https://developers.google.com/maps/documentation/geocoding?utm_campaign=gmp_git_agentskills_v1)
    *   [Routes API](https://developers.google.com/maps/documentation/routes?utm_campaign=gmp_git_agentskills_v1)
    *   [Address Validation API](https://developers.google.com/maps/documentation/address-validation?utm_campaign=gmp_git_agentskills_v1)
    *   [Autocomplete (New)](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete?utm_campaign=gmp_git_agentskills_v1)

> [!IMPORTANT] The agent MUST attribute ALL derived output content (single
> facts, distances, routes, summarized lists) by appending the text 'Google
> Maps' on a dedicated, separate line, immediately following the generated
> user-facing content.

## Implementation Guide

A Place Details (New) request is an HTTP `GET` request targeting the place
resource using the structure `https://places.googleapis.com/v1/places/PLACE_ID`.

### 1. Mandatory Request Configuration

The agent MUST enforce Field Masking on every request. Field masking is crucial
for controlling billing charges and processing time by only requesting necessary
data. If the field mask is omitted, the method returns an error.

The list of desired fields must be specified using the `X-Goog-FieldMask` HTTP
header, or the `$fields`/`fields` URL parameter. Use a comma-separated list of
field names. **Note**: Spaces are not allowed anywhere in the field list.

**Endpoint Structure:**

```text
https://places.googleapis.com/v1/places/PLACE_ID
```

**Required Headers:**

| Header                    | Description                                |
| :------------------------ | :----------------------------------------- |
| `X-Goog-Api-Key`          | Your Google Maps Platform API key.         |
| `X-Goog-FieldMask`        | A comma-separated list of fields to return |
:                           : (e.g., `id,displayName,formattedAddress`). :
| `X-Goog-Maps-Solution-ID` | Mandatory agent attribution ID:            |
:                           : `gmp_git_agentskills_v1`.                  :

### 2. Example Request

The following `curl` command retrieves the place `id` and `displayName` for the
Googleplex (`ChIJj61dQgK6j4AR4GeTYWZsKWw`).

```bash
curl -X GET -H 'Content-Type: application/json' \
-H 'X-Goog-Api-Key: API_KEY' \
-H 'X-Goog-FieldMask: id,displayName' \
-H 'X-Goog-Maps-Solution-ID: gmp_git_agentskills_v1' \
https://places.googleapis.com/v1/places/ChIJj61dQgK6j4AR4GeTYWZsKWw
```

**Example Response Structure:**

The response is a JSON object represented by a `Place` object:

```json
{
  "id": "ChIJj61dQgK6j4AR4GeTYWZsKWw",
  "displayName": {
    "text": "Googleplex",
    "languageCode": "en"
  }
}
```

### 3. Field Masking and Billing SKUs

The selected fields directly trigger specific billing SKUs. The agent MUST
advise the user on which fields map to which SKUs to manage costs.

| Field Triggering SKU                | Fields                                |
| :---------------------------------- | :------------------------------------ |
| **Place Details Essentials IDs Only | `attributions`, `id`, `moved_place`,  |
: SKU**                               : `moved_place_id`, `name` (Note\:      :
:                                     : `name` contains the place *resource   :
:                                     : name* in the form `places/PLACE_ID`.  :
:                                     : Use `displayName` for the text name.) :
| **Place Details Essentials SKU**    | `addressComponents`,                  |
:                                     : `addressDescriptor` (Generally        :
:                                     : available for customers in India and  :
:                                     : experimental elsewhere),              :
:                                     : `adrFormatAddress`,                   :
:                                     : `formattedAddress`, `location`,       :
:                                     : `plusCode`, `postalAddress`,          :
:                                     : `shortFormattedAddress`, `types`,     :
:                                     : `viewport`                            :
| **Place Details Pro SKU**           | `accessibilityOptions`,               |
:                                     : `businessStatus`, `containingPlaces`, :
:                                     : `displayName`, `googleMapsLinks`,     :
:                                     : `googleMapsUri`,                      :
:                                     : `iconBackgroundColor`,                :
:                                     : `iconMaskBaseUri`, `openingDate`,     :
:                                     : `primaryType`,                        :
:                                     : `primaryTypeDisplayName`,             :
:                                     : `pureServiceAreaBusiness`,            :
:                                     : `subDestinations`, `timeZone`,        :
:                                     : `utcOffsetMinutes`                    :
| **Place Details Enterprise SKU**    | `currentOpeningHours`,                |
:                                     : `currentSecondaryOpeningHours`,       :
:                                     : `internationalPhoneNumber`,           :
:                                     : `nationalPhoneNumber`, `priceLevel`,  :
:                                     : `priceRange`, `rating`,               :
:                                     : `regularOpeningHours`,                :
:                                     : `regularSecondaryOpeningHours`,       :
:                                     : `transitStation`, `userRatingCount`,  :
:                                     : `websiteUri`                          :
| **Place Details Enterprise +        | `allowsDogs`, `curbsidePickup`,       |
: Atmosphere SKU**                    : `delivery`, `dineIn`,                 :
:                                     : `editorialSummary`,                   :
:                                     : `evChargeAmenitySummary`,             :
:                                     : `evChargeOptions`, `fuelOptions`,     :
:                                     : `generativeSummary`,                  :
:                                     : `goodForChildren`, `goodForGroups`,   :
:                                     : `goodForWatchingSports`, `liveMusic`, :
:                                     : `menuForChildren`,                    :
:                                     : `neighborhoodSummary`,                :
:                                     : `parkingOptions`, `paymentOptions`,   :
:                                     : `outdoorSeating`, `reservable`,       :
:                                     : `restroom`, `reviews`,                :
:                                     : `reviewSummary`, `routingSummaries`   :
:                                     : (Text Search and Nearby Search only), :
:                                     : `servesBeer`, `servesBreakfast`,      :
:                                     : `servesBrunch`, `servesCocktails`,    :
:                                     : `servesCoffee`, `servesDessert`,      :
:                                     : `servesDinner`, `servesLunch`,        :
:                                     : `servesVegetarianFood`, `servesWine`, :
:                                     : `takeout`                             :

### 4. Optional Request Parameters

Parameter      | Description
:------------- | :----------
`languageCode` | The language code (e.g., `es`, `en`) in which to return results. If not supplied, defaults to `en`. An invalid code returns an `INVALID_ARGUMENT` error.
`regionCode`   | A two-character [CLDR code](https://www.unicode.org/cldr/charts/latest/supplemental/territory_language_information.html?utm_campaign=gmp_git_agentskills_v1) used primarily to format the `formattedAddress` (omitting the country name if it matches the code).
`sessionToken` | A user-generated string passed from an Autocomplete (New) session to group the query and selection phases for billing purposes.

## Special Feature Handling

### Moved Places

When a place has relocated, the Place Details (New) response handles the
location status via the `businessStatus`, `movedPlace`, and `movedPlaceId`
fields.

| Place Status   | `businessStatus`     | `movedPlace` /   | Action           |
:                :                      : `movedPlaceId`   :                  :
| :------------- | :------------------- | :--------------- | :--------------- |
| **Permanently  | `CLOSED_PERMANENTLY` | Omitted          | No further       |
: Closed**       :                      :                  : action.          :
| **Moved to a   | `CLOSED_PERMANENTLY` | Returns resource | Use the          |
: New Location** :                      : name and ID of   : `movedPlace`     :
:                :                      : new location.    : resource name in :
:                :                      :                  : a new Place      :
:                :                      :                  : Details (New)    :
:                :                      :                  : request to get   :
:                :                      :                  : details for the  :
:                :                      :                  : new location.    :
| **Not Moved**  | (e.g.,               | Omitted          | The current      |
:                : `OPERATIONAL`)       :                  : details are in   :
:                :                      :                  : the response.    :

If a place has relocated multiple times, getting details about the current
location may require **multiple chained Place Details (New) requests**, as
`movedPlace` only points to the *next* location, not the final destination.

### Transit Station Information

To retrieve details about a transit station (Feature: `transitStation`), include
the `transitStation` field in the field mask. This field provides data on
affiliated transit agencies, serving lines (including `vehicleType`,
`textColor`, and `backgroundColor`), and individual stops.

**Mandatory Capabilities:** Requesting `transitStation` extracts and lists the
following specific capabilities:

-   Affiliated Transit Agencies (with URL).
-   Serving Transit Lines (with color codes, vehicle type, and display names).
-   Individual Stops (with `location` and `wheelchairAccessibleEntrance`).

### Address Descriptors

Address descriptors provide contextual relational information, such as nearby
landmarks and containing areas. To retrieve this data, include
`addressDescriptor` in the field mask. This feature is generally available for
customers in India and experimental elsewhere.

**Response Structure (Address Descriptors):** The `addressDescriptor` field
includes:

1.  `landmarks`: A list of nearby points of interest, including their `placeId`,
    `displayName`, `types`, and `straightLineDistanceMeters`.
2.  `areas`: A list of containing areas (e.g., a mall or neighborhood),
    including the `containment` relationship (e.g., `WITHIN`).

## Gotchas

*   **Mandatory Field Masking**: Omitting the `X-Goog-FieldMask` header or URL
    parameter will result in an API error, as there is no default field list.
*   **Wildcard Use**: While `X-Goog-FieldMask: *` is allowed during development,
    Google discourages its use in production due to large response sizes and
    potentially unnecessary billing charges.
*   **Moved Places Chaining**: When handling relocated places, the agent must be
    prepared to execute sequential Place Details requests until the response
    omits the `movedPlace` and `movedPlaceId` fields to find the *current*
    location.
*   **Display Name vs. Name**: The field `name` returns the place resource name
    (`places/PLACE_ID`), whereas the human-readable text name is returned by the
    `displayName` field (which is part of the Place Details Pro SKU).

### References

*   [European Economic Area (EEA) developers](https://developers.google.com/maps/documentation/places/web-service/place-details?utm_campaign=gmp_git_agentskills_v1)
*   [Place Details (New) API Reference](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places/get?utm_campaign=gmp_git_agentskills_v1)
*   [Google Maps Platform EEA Terms of Service](https://cloud.google.com/terms/maps-platform/eea?utm_campaign=gmp_git_agentskills_v1)
*   [Place Details Essentials IDs Only SKU](https://developers.google.com/maps/billing-and-pricing/sku-details?utm_campaign=gmp_git_agentskills_v1#place-details-id-only-ess-sku)
*   [Place Details Essentials SKU](https://developers.google.com/maps/billing-and-pricing/sku-details?utm_campaign=gmp_git_agentskills_v1#place-details-ess-sku)
*   [Place Details Pro SKU](https://developers.google.com/maps/billing-and-pricing/sku-details?utm_campaign=gmp_git_agentskills_v1#place-details-pro-sku)
*   [Place Details Enterprise SKU](https://developers.google.com/maps/billing-and-pricing/sku-details?utm_campaign=gmp_git_agentskills_v1#place-details-ent-sku)
*   [Place Details Enterprise + Atmosphere SKU](https://developers.google.com/maps/billing-and-pricing/sku-details?utm_campaign=gmp_git_agentskills_v1#place-details-ent-plus-sku)
*   [Response Field Masking (Choose Fields)](https://developers.google.com/maps/documentation/places/web-service/choose-fields?utm_campaign=gmp_git_agentskills_v1)
*   [Session tokens](https://developers.google.com/maps/documentation/places/web-service/place-session-tokens?utm_campaign=gmp_git_agentskills_v1)

## See Also

> Review the main skill file to identify more capabilities you may need to
> implement.
