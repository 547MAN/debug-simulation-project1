using System.Text.Json;
using Shop.Api.Models;

namespace Shop.Api.Services;

public sealed class OrderStore
{
    private readonly object _gate = new();
    private readonly string _path;
    private readonly List<OrderReceipt> _orders;
    private readonly JsonSerializerOptions _jsonOptions =
        new(JsonSerializerDefaults.Web) { WriteIndented = true };

    public OrderStore()
    {
        var directory = Path.Combine(AppContext.BaseDirectory, "App_Data");
        Directory.CreateDirectory(directory);
        _path = Path.Combine(directory, "orders.json");
        _orders = File.Exists(_path)
            ? JsonSerializer.Deserialize<List<OrderReceipt>>(
                File.ReadAllText(_path), _jsonOptions) ?? new List<OrderReceipt>()
            : new List<OrderReceipt>();
    }

    public OrderReceipt? Find(Guid id)
    {
        lock (_gate)
        {
            return _orders.FirstOrDefault(order => order.Id == id);
        }
    }

    public OrderReceipt Place(CreateOrderRequest request, CatalogService catalog)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
            throw new ShopValidationException("Please enter your name.");
        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
            throw new ShopValidationException("Please enter a valid email address.");
        if (string.IsNullOrWhiteSpace(request.Address))
            throw new ShopValidationException("Please enter a delivery address.");
        if (request.Items is null || request.Items.Count == 0)
            throw new ShopValidationException("Your cart is empty.");

        var lines = new List<OrderLine>();
        foreach (var group in request.Items.GroupBy(item => item.ProductId))
        {
            var product = catalog.FindById(group.Key);
            if (product is null)
                throw new ShopValidationException("An item in your cart is no longer available.");
            if (group.Any(item => item.Quantity <= 0))
                throw new ShopValidationException("Item quantities must be greater than zero.");

            var quantity = group.Sum(item => item.Quantity);
            if (quantity > product.Stock)
                throw new ShopValidationException(
                    "Not enough stock for " + product.Name + ". Maximum: " + product.Stock + ".");

            lines.Add(new OrderLine(
                product.Id, product.Name, quantity, product.Price, product.Price * quantity));
        }

        var order = new OrderReceipt(
            Guid.NewGuid(), DateTimeOffset.UtcNow,
            request.CustomerName.Trim(), request.Email.Trim(), request.Address.Trim(),
            lines, lines.Sum(line => line.LineTotal));

        lock (_gate)
        {
            _orders.Add(order);
            File.WriteAllText(_path, JsonSerializer.Serialize(_orders, _jsonOptions));
        }
        return order;
    }
}
