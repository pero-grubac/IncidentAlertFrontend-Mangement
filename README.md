<!DOCTYPE html>
<html>
<body>
   <h1 align="center">🛠️ Incident Alert Management Frontend</h1>

  <p align="center">
    <img src="https://img.shields.io/badge/React-Frontend-blue?logo=react" />
    <img src="https://img.shields.io/badge/Redux-State_Management-purple?logo=redux&logoColor=white" />
    <img src="https://img.shields.io/badge/Docker-Containerized-2496ed?logo=docker&logoColor=white" />
    <img src="https://img.shields.io/badge/Google_Maps_API-Enabled-yellow?logo=googlemaps&logoColor=white" />
    <img src="https://img.shields.io/badge/Google_Translate_API-Integrated-lightgrey?logo=googletranslate&logoColor=white" />
  </p>
    <p>
        Incident Alert Management Frontend is an application designed for moderators who oversee the verification and management of reported incidents. When a user reports an incident, it is sent to the moderator for verification. The moderator can review, approve, delete, or reject incidents. Additionally, moderators can view incident statistics, examine grouped incidents using machine learning, and log in via username/password or OAuth using their student email (<code>@student.etf.unibl.org</code>).
    </p>

  <h2>✨ Features</h2>
    <ul>
        <li>🔍 <strong>Incident Verification:</strong> Moderators can approve, reject, or delete reported incidents.</li>
        <li>📊 <strong>Statistics Overview:</strong> Moderators have access to various statistics regarding incidents.</li>
        <li>🤖 <strong>Machine Learning for Grouping Incidents:</strong> The application uses machine learning to group similar incidents, making it easier for moderators to review and manage incidents.</li>
        <li>🔐 <strong>OAuth Authentication:</strong> Moderators can log in using either a username and password or via OAuth with their student email (<code>@student.etf.unibl.org</code>).</li>
        <li>🗺️ <strong>Map Integration with Leaflet and OpenStreetMap:</strong> Provides an interactive map interface for moderators to locate and manage incidents.</li>
        <li>🌐 <strong>Google Translate Support:</strong> Offers translation features to assist with multi-language incident descriptions.</li>
        <li>📍 <strong>Location Search with Google Places and Geolocation:</strong> Facilitates location searching and incident mapping.</li>
    </ul>

  <h2>⚙️ Setup Instructions</h2>
    <p>
        Before using the application, you need to configure the URLs for the backend service, machine learning service, statistics service, and the Google services API key. These values should be set in both <code>src/environments/config.development.json</code> and <code>src/environments/config.production.json</code>:
    </p>
    <pre>
{
  "baseServiceUrl": "",
  "mlServiceUrl": "",
  "statisticsServiceUrl": "",
  "REACT_APP_GOOGLE_API_TOKEN": "",
  "REACT_APP_GOOGLE_API_KEY": ""
}
    </pre>

  <h2>📋 TODO</h2>
    <ul>
        <li>🧹 <strong>Code Clean-up:</strong> Refactor the codebase for better readability and maintainability.</li>
        <li>📦 <strong>Modularization:</strong> Break down the code into components that separate functional logic from the presentation.</li>
        <li>📱 <strong>Responsive Design:</strong> Improve the UI to ensure it is fully responsive across all devices.</li>
        <li>💡 <strong>Autocomplete Improvement:</strong> Enhance the autocomplete functionality for location search to correctly interact with the Google Places API.</li>
        <li>📈 <strong>Enhanced Statistics Display:</strong> Improve the aesthetics of the statistics view by using more visually appealing charts and UI elements.</li>
        <li>🖼️ <strong>Improved Grouped Incidents Display:</strong> Refine the presentation of grouped incidents after machine learning processing for better user experience.</li>
    </ul>

  <h2>🚀 Future Enhancements</h2>
    <p>
        While not a current requirement, there is potential to expand the application by adding an admin role to manage moderators. An admin panel or separate application could be developed to allow administrators to add, remove, and oversee moderator accounts, which would further streamline the incident verification process.
    </p>
</body>
</html>
