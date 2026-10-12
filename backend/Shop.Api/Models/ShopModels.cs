namespace Shop.Api.Models;

public sealed record Product(
    int Id, string Name, string Category, string Description,
    decimal Price, int Stock, string Emoji, string Accent, string? Badge);

public sealed record CreateOrderItem(int ProductId, int Quantity);

public sealed record CreateOrderRequest(
    string CustomerName, string Email, string Address, List<CreateOrderItem> Items);

public sealed record OrderLine(
    int ProductId, string Name, int Quantity, decimal UnitPrice, decimal LineTotal);

public sealed record OrderReceipt(
    Guid Id, DateTimeOffset CreatedAt, string CustomerName, string Email,
    string Address, List<OrderLine> Items, decimal Total);

public sealed class ShopValidationException(string message) : Exception(message);
