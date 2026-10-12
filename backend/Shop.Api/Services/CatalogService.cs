using System.Text.Json;
using Shop.Api.Models;

namespace Shop.Api.Services;

public sealed class CatalogService
{
    private readonly List<Product> _products;

    public CatalogService()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Data", "products.json");
        var json = File.ReadAllText(path);
        _products = JsonSerializer.Deserialize<List<Product>>(
            json, new JsonSerializerOptions(JsonSerializerDefaults.Web)) ?? new List<Product>();
    }

    public Product? FindById(int id) =>
        _products.FirstOrDefault(product => product.Id == id);

    public IReadOnlyList<string> Categories() => _products
        .Select(product => product.Category)
        .Distinct()
        .OrderBy(category => category)
        .ToList();

    public IReadOnlyList<Product> Find(string? search, string? category, string? sort)
    {
        IEnumerable<Product> query = _products;

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
            query = query.Where(product =>
                string.Equals(product.Category, category, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var text = search.Trim();
            query = query.Where(product =>
                product.Name.Contains(text, StringComparison.OrdinalIgnoreCase) ||
                product.Description.Contains(text, StringComparison.OrdinalIgnoreCase) ||
                product.Category.Contains(text, StringComparison.OrdinalIgnoreCase));
        }

        return sort switch
        {
            "price-asc" => query.OrderBy(product => product.Price).ToList(),
            "price-desc" => query.OrderByDescending(product => product.Price).ToList(),
            "name" => query.OrderBy(product => product.Name).ToList(),
            _ => query.OrderBy(product => product.Id).ToList()
        };
    }
}
