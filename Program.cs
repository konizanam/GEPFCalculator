using GEPF.Components;
using GEPF.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// The answers are one person's, and they are carried from the form to the
// figures worked out from them.
builder.Services.AddScoped(sp => new InputValues());

// One password for everybody, Login:Password in appsettings, and nothing
// else: the calculator holds nobody's details, so there is no account to sign
// in to — only a door. A visitor who has given the password carries a cookie
// for as long as the browser stays open. The cookie's path is the app's own
// (/gepf/ live), so it is never sent to the WordPress around it.
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login";
        options.Cookie.Name = "GEPF.SignedIn";
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// Served from a path rather than a site's own root — /gepf/ under
// kuleni.com.na. Under IIS the path comes from the child application itself
// and nothing needs setting; Kestrel has to be told, which is what this is
// for: it is how the live arrangement is reproduced locally, and how the app
// would sit behind a proxy that adds a prefix.
// Written with or without its slashes — "gepf", "/gepf" and "/gepf/" are the
// same path, and a setting that reads perfectly well should not stop the app
// from starting.
var pathBase = (builder.Configuration["PathBase"] ?? string.Empty).Trim().Trim('/');
if (pathBase.Length > 0)
{
    app.UsePathBase("/" + pathBase);
}

app.UseHttpsRedirection();

// Stylesheets, scripts and the logo are served ahead of the door, so the
// sign-in page is dressed like the rest.
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

// Every page needs the password except the ones marked [AllowAnonymous]:
// Login itself, and Error.
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .RequireAuthorization();

// Back to the sign-in page under the request's own path base — /gepf/Login
// live, not the parent site's /Login.
app.MapPost("/Logout", async (HttpContext context) =>
{
    await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    context.Response.Redirect($"{context.Request.PathBase}/Login");
});

app.Run();
