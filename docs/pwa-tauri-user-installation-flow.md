# Link-Up User Flow

Link-Up is a complete Progressive Web App (PWA) that can be used without installation. Installation changes how the app is launched, not what the user can do.

On Android and iPhone, the installation banner directs users to the Tauri 2 mobile app. On other supported platforms, it installs the PWA.

```mermaid
flowchart TD
    A["User visits Link-Up"] --> B["Landing and sign-in page"]
    B --> C["Show optional installation banner"]
    C --> D{"Install now?"}

    D -- "No" --> E["Sign in or create account in browser"]
    D -- "Yes" --> F{"Android or iPhone?"}

    F -- "No" --> G["Install PWA"]
    F -- "Yes" --> H["Open app-store listing"]
    H --> I["Install Tauri 2 app"]

    G --> J["Launch installed PWA"]
    I --> K["Launch Tauri mobile app"]

    J --> L["Load shared PWA frontend"]
    K --> L
    L --> M["Sign in or create account"]

    E --> N["Enter Link-Up"]
    M --> N

    N --> O["Use the complete app"]
    O --> P["Load cacheable frontend locally"]
    P --> Q["Prefer P2P and third-party APIs"]
    Q --> R["Minimize Link-Up server load"]
```

The browser, installed PWA, and Tauri mobile app all converge on the same frontend and complete Link-Up experience.
