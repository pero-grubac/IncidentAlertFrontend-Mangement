# Incident Alert Management Frontend

Incident Alert Management Frontend is an application designed for moderators who oversee the verification and management of reported incidents. When a user reports an incident, it is sent to the moderator for verification. The moderator can review, approve, delete, or reject incidents. Additionally, moderators can view incident statistics, examine grouped incidents using machine learning, and log in via username/password or OAuth using their student email (@student.etf.unibl.org).

## Features

- **Incident Verification**: Moderators can approve, reject, or delete reported incidents.
- **Statistics Overview**: Moderators have access to various statistics regarding incidents.
- **Machine Learning for Grouping Incidents**: The application uses machine learning to group similar incidents, making it easier for moderators to review and manage incidents.
- **OAuth Authentication**: Moderators can log in using either a username and password or via OAuth with their student email (@student.etf.unibl.org).
- **Map Integration with Leaflet and OpenStreetMap**: Provides an interactive map interface for moderators to locate and manage incidents.
- **Google Translate Support**: Offers translation features to assist with multi-language incident descriptions.
- **Location Search with Google Places and Geolocation**: Facilitates location searching and incident mapping.

## Setup Instructions

Before using the application, you need to configure the URLs for the backend service, machine learning service, statistics service, and the Google services API key. These values should be set in both `src/environments/config.development.json` and `src/environments/config.production.json`:

```json
{
  "baseServiceUrl": "",
  "mlServiceUrl": "",
  "statisticsServiceUrl": "",
  "REACT_APP_GOOGLE_API_TOKEN": "",
  "REACT_APP_GOOGLE_API_KEY": ""
}
```

## TODO

- **Code Clean-up**: Refactor the codebase for better readability and maintainability.
- **Modularization**: Break down the code into components that separate functional logic from the presentation.
- **Responsive Design**: Improve the UI to ensure it is fully responsive across all devices.
- **Autocomplete Improvement**: Enhance the autocomplete functionality for location search to correctly interact with the Google Places API.
- **Enhanced Statistics Display**: Improve the aesthetics of the statistics view by using more visually appealing charts and UI elements.
- **Improved Grouped Incidents Display**: Refine the presentation of grouped incidents after machine learning processing for better user experience.

## Future Enhancements

While not a current requirement, there is potential to expand the application by adding an admin role to manage moderators. An admin panel or separate application could be developed to allow administrators to add, remove, and oversee moderator accounts, which would further streamline the incident verification process.
