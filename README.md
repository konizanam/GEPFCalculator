# Kuleni Retirement Calculator

A member of a retirement fund says what they have and what they would like to
retire on, and this works out whether the two meet — and, where they do not,
what it would take: a top up to the fund, or a bigger monthly contribution.

Two screens. **Your details** asks the questions; **Results** reads the figures
back. Blazor Server, .NET 10.

## Look and feel

The look is the Kuleni loan application's, and not a copy of it made by hand:
`wwwroot/css/site.css`, `wwwroot/js/live-validation.js` and
`wwwroot/js/sidebar.js` are that application's own files, and the pages are
built out of the same classes its screens are built out of —
`loan-application-container admin-shell` → `admin-header`/`admin-title` →
`admin-panel`, with `form-label` above `form-control` or `form-select`, and
`admin-actions` carrying the buttons.

Which means the house rules apply here too:

* **Flat and square.** No `border-radius`, no `box-shadow`, anywhere.
* **Mandatory fields mark themselves green** the moment they hold something
  acceptable, and red once they have been left empty — never red before they
  have been touched. Nothing on a page opts into this; a field is marked
  `required` and the behaviour follows.
* **Type sizes come from `--form-font-size`, `--form-label-size` and
  `--form-heading-size`.** No page sets a font size by hand.

`live-validation.js` differs from the loan application's in one place, and the
file says where: Blazor replaces fields as the answers change, so fields are
bound as they appear rather than once when the document loads.

## Running locally

```
dotnet build -c Release
ASPNETCORE_ENVIRONMENT=Development dotnet bin/Release/net10.0/GEPF.dll --urls "https://localhost:7035;http://localhost:5115"
```

The environment matters when running the built output rather than the
published output: `_framework/blazor.web.js` is served from the static web
asset manifest, and outside Development that manifest is not loaded — the page
renders but nothing on it responds. `dotnet publish` writes the framework files
into `wwwroot` and has no such condition.

## Publishing

Into `publish/`, as the loan application publishes:

```
dotnet publish GEPF.csproj -c Release -o "publish/GEPF"
```

`publish/` is not committed. Unlike the loan application, `appsettings.json` is
published with the rest: there is no connection string, no mail account and no
key in it, so there is nothing on a server for a deployment to overwrite.

Run the published output **from its own folder**, or the content root is
wherever you started it from and `wwwroot/_framework` is looked for in the
wrong place:

```
cd publish/GEPF
dotnet GEPF.dll --urls "https://localhost:7035;http://localhost:5115"
```

`web.config` is published alongside it for IIS, and
`Properties/PublishProfiles/IISProfile.pubxml` holds the Web Deploy settings
for knowyourbenefits.co.za.

## Where it is hosted, and what that costs

Live, this is **not** a site of its own. It is a child application at
**https://www.kuleni.com.na/gepf/**, under a WordPress site — which is why the
published `web.config` removes the rewrite rule it would otherwise inherit
from its parent.

Everything the browser asks for is therefore asked for relative to `/gepf/`,
not to the host. Two rules follow, and breaking either takes the whole page
down while leaving it looking like it loaded:

* **`<base href>` is written from the request**, in `Components/App.razor`. A
  hard `"/"` sends every stylesheet, script and image to the parent site's
  root, where a WordPress answers 404 to all of them.
* **Navigation is relative.** `NavigateTo("Results")`, never
  `NavigateTo("/Results")` — a leading slash is measured from the host and
  lands outside the application.

To stand the same arrangement up locally, give Kestrel the path IIS would
otherwise supply:

```
cd publish/GEPF
PathBase=gepf dotnet GEPF.dll --urls "https://localhost:7035;http://localhost:5115"
```

and browse `https://localhost:7035/gepf/`. Without `PathBase` the app serves
from the root, as before.

The application folder is `\\10.224.172.21\gepf`, and the path is closed to
the public: IIS asks for a username and password (Basic) before anything under
`/gepf/` is served, the calculator's own pages and its stylesheets alike.

Deploying is a copy of `publish/GEPF\*` into that folder. The app runs
in-process, so IIS holds `GEPF.dll` open: drop an `app_offline.htm` in the
folder first (or recycle the pool) or the copy is refused, and the old build
keeps serving until it restarts either way.

```
1. write app_offline.htm into the folder, and wait a few seconds
2. robocopy publish\GEPF \\10.224.172.21\gepf /E
3. delete app_offline.htm
4. load https://www.kuleni.com.na/gepf/ and check that nothing 404s
```

Step 4 is not a formality. The two ways this has broken so far — assets
resolved against the parent site, and a published `web.config` written over a
hand edit — both leave a page that arrives looking fine.
