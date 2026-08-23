using GEPF.Components;
using GEPF.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// The answers are one person's, and they are carried from the form to the
// figures worked out from them.
builder.Services.AddScoped(sp => new InputValues());

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

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
