using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using Application.Common.Extensions;

namespace Application.DTO.Attributes;

/// <summary>
/// Атрибут, указывающий Swagger, что это строковое свойство
/// должно отображаться как многострочное текстовое поле с примером JSON.
/// </summary>
[AttributeUsage(AttributeTargets.Property)]
public class SwaggerJsonDefault : Attribute
{
    /// <summary>
    /// Пример JSON
    /// </summary>
    public string ExampleJson { get; }

    private static JsonSerializerOptions opts = new()
    {
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
        ReadCommentHandling = JsonCommentHandling.Skip,
        NumberHandling = JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        PropertyNameCaseInsensitive = true,
    };
    
    /// <param name="exampleType">тип элемента</param>
    /// <param name="count">количество элементов</param>
    public SwaggerJsonDefault(Type exampleType, int count = 0)
    {
        if (exampleType == typeof(DateOnly) || exampleType == typeof(DateTime) )
        {
            ExampleJson = DateTime.Now.AddDays(1).ToDateOnly().ToString("yyyy-MM-dd");
            return;
        }
        if (count == 0)
        {
            ExampleJson = JsonSerializer.Serialize(Activator.CreateInstance(exampleType), opts);
        }
        else
        {
            ExampleJson = JsonSerializer.Serialize(Enumerable
                .Range(0, count)
                .Select(i => Activator.CreateInstance(exampleType))
                .ToArray(), opts
            );
        }
    }
}