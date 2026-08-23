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
