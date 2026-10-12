using Shop.Api.Models;
using Shop.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<OrderStore>();

var app = builder.Build();

// Prepare the catalog when the application starts, before customer requests arrive.
_ = app.Services.GetRequiredService<CatalogService>();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/api/products", (
    CatalogService catalog,
    string? search,
    string? category,
    string? sort) =>
{
    return Results.Ok(catalog.Find(search, category, sort));
});

app.MapGet("/api/categories", (CatalogService catalog) =>
    Results.Ok(catalog.Categories()));

app.MapPost("/api/orders", (
    CreateOrderRequest request,
    CatalogService catalog,
    OrderStore orders) =>
{
    try
    {
        var order = orders.Place(request, catalog);
        return Results.Created("/api/orders/" + order.Id, order);
    }
    catch (ShopValidationException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
});

app.MapGet("/api/orders/{id:guid}", (Guid id, OrderStore orders) =>
{
    var order = orders.Find(id);
    return order is null ? Results.NotFound() : Results.Ok(order);
});

app.Run();
