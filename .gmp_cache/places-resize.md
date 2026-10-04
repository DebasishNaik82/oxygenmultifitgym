## Overview

The Place Photos (New) service is a read-only API that allows retrieval and
resizing of millions of high-quality photographic content associated with Places
results (Feature: Place Photos (New)). To access this functionality, the agent
must first obtain a photo resource `name` from a recent Place Details (New),
Nearby Search (New), or Text Search (New) request.

### Prerequisites

1.  **API Key:** A valid Google Maps Platform API key.
2.  **Photo Resource Name:** The string identifier (`name`) for the target
    photo, obtained from the `photos[]` array of a Place Details (New), Nearby
    Search (New), or Text Search (New) response.

### Available Tools

The Place Photos (New) capability is accessed via a RESTful HTTP GET request.

API                | Method | Endpoint Structure
:----------------- | :----- | :-----------------
Place Photos (New) | `GET`  | `https://places.googleapis.com/v1/NAME/media?key=API_KEY&PARAMETERS`

> [!IMPORTANT] To comply with Google Maps Platform data attribution
> requirements, the downstream agent MUST attribute ALL derived output content
> (including the photo itself, its URI, or related metadata) by appending the
> text `Google Maps` on a dedicated, separate line immediately following the
> generated user-facing content.

## Implementation Guide: Fetching and Resizing Place Photos

The process requires two main steps: obtaining the unique photo identifier and
then executing the specialized Place Photos (New) request with specified
dimensions.

### 1. Obtain the Photo Resource Name

The photo identifier (`name`) must be retrieved dynamically from a Place Details
(New), Nearby Search (New), or Text Search (New) request.

-   [ ] Execute a Place request (e.g., Place Details (New)) ensuring the field
    mask includes the `photos` field (`places.photos` for Search endpoints).
-   [ ] Parse the resulting `photos[]` array. Each element contains:
    *   `name`: The resource name string, required for the photo request.
        (Format: `places/PLACE_ID/photos/PHOTO_RESOURCE`).
    *   `heightPx`: The maximum original height of the image.
    *   `widthPx`: The maximum original width of the image.
    *   `authorAttributions[]`: Required attribution details if present. If this
        array contains values, these attributions **must** be displayed
        alongside the photo.

### 2. Construct the Place Photos (New) Request

To resize and retrieve the photo, construct a `GET` request using the retrieved
`name` and specific sizing parameters.

#### Required Parameters for Resizing

You MUST specify at least one of the following parameters, with values
restricted to an integer between **1 and 4800**:

Parameter     | Type      | Description
:------------ | :-------- | :-----------------------------------------------
`maxHeightPx` | `integer` | Specifies the maximum intended height in pixels.
`maxWidthPx`  | `integer` | Specifies the maximum intended width in pixels.

The image is scaled to match the smaller of the two specified dimensions while
restricting the output to the original aspect ratio.

#### Optional Control Parameter

| Parameter          | Default | Description                                 |
| :----------------- | :------ | :------------------------------------------ |
| `skipHttpRedirect` | `false` | If `true`, the API returns a JSON object    |
:                    :         : containing the `photoUri` instead of        :
:                    :         : performing an HTTP redirect directly to the :
:                    :         : image file.                                 :

### Example Request

The following example shows a request to retrieve an image, resized to a maximum
of 400x400 pixels, ensuring the mandatory attribution ID is appended for
traceability:

```text
https://places.googleapis.com/v1/places/ChIJ2fzCmcW7j4AR2JzfXBBoh6E/photos/PHOTO_RESOURCE/media?maxHeightPx=400&maxWidthPx=400&key=API_KEY&solution_id=gmp_git_agentskills_v1
```

If `skipHttpRedirect=true` is used, the response body will contain the direct
image URI:

```json
{
  "name": "places/ChIJj61dQgK6j4AR4GeTYWZsKWw/photos/Aaw_FcKly0DEv3EWmDJyHiEqXIP5mowOc99lN1GzBun6KHH52AZ5fFA/media",
  "photoUri": "https://lh3.googleusercontent.com/a-/AD_cFT-b=s100-p-k-no-mo"
}
```

## Mandatory Operational Best Practices

When interacting with Place Photos (New), adhere to the following operational
mandates:

### Caching and Expiration

-   [ ] **Verification Checkpoint:** When encountering a `400 Invalid request`
    error, check if the issue is an expired `name`.
-   [ ] **Trigger Condition:** If the photo `name` has expired, the agent MUST
    explicitly instruct the user that they must request a new `name` via Place
    Details (New), Nearby Search (New), or Text Search (New) (Section
    3.2.3(b)(No Caching) of the Google Maps Platform Terms of Service).
-   [ ] **Instruction:** The photo resource `name` itself cannot be cached.

### Error Handling

-   [ ] **Trigger Condition:** If the user reports HTTP status `429 Too many
    requests`.
-   [ ] **Instruction:** The agent MUST recommend loading photos on demand
    rather than attempting to load all images for a place simultaneously. If the
    issue persists, the user may need to contact Support to request a quota
    increase.
-   [ ] **Validation Loop:** If an HTTP status `400 Invalid request` is
    returned, verify that both the `name` is correctly specified and that either
    `maxHeightPx` or `maxWidthPx` (or both) are present and contain valid,
    non-null integer values between 1 and 4800.

## Gotchas

*   **Format Variation:** Google does not guarantee the image format returned.
    Standard formats (JPEG, PNG, GIF) are supported, but the output format may
    vary.
*   **Mandatory Attribution:** Even if the `authorAttributions` field is empty,
    the general attribution requirement specified in the `> [!IMPORTANT]` block
    still applies to the derived content (image data).

### References

*   [Google Maps Platform EEA Terms of Service](https://cloud.google.com/terms/maps-platform/eea?utm_campaign=gmp_git_agentskills_v1)
*   [Google Maps Platform Terms of Service](https://cloud.google.com/maps-platform/terms?utm_campaign=gmp_git_agentskills_v1)
*   [Place Photos (New) Documentation](https://developers.google.com/maps/documentation/places/web-service/place-photos?utm_campaign=gmp_git_agentskills_v1)
*   [Place Details (New)](https://developers.google.com/maps/documentation/places/web-service/place-details?utm_campaign=gmp_git_agentskills_v1)
*   [Nearby Search (New)](https://developers.google.com/maps/documentation/places/web-service/nearby-search?utm_campaign=gmp_git_agentskills_v1)
*   [Text Search (New)](https://developers.google.com/maps/documentation/places/web-service/text-search?utm_campaign=gmp_git_agentskills_v1)

## See Also

> Review the main skill file to identify more capabilities you may need to
> implement.
