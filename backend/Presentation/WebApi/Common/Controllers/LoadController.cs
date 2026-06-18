using Application.CQRS.ChatCQ.Commands;
using Application.CQRS.LoadCQ.Commands.BookLoad;
using Application.CQRS.LoadCQ.Commands.CreateLoad;
using Application.CQRS.LoadCQ.Commands.DeleteLoad;
using Application.CQRS.LoadCQ.Commands.Draft;
using Application.CQRS.LoadCQ.Commands.Draft.Create;
using Application.CQRS.LoadCQ.Commands.SaveLoad;
using Application.CQRS.LoadCQ.Commands.UploadFiles;
using Application.CQRS.LoadCQ.Queries.Draft;
using Application.CQRS.LoadCQ.Queries.Load.Detail;
using Application.CQRS.LoadCQ.Queries.Load.List;
using Application.CQRS.LoadCQ.Queries.Load.Saved;
using Application.CQRS.LoadCQ.Queries.Load.Users;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.DTO;
using Application.DTO.Load;
using WebApi.Common.Controllers.Abstract;

namespace WebApi.Common.Controllers;

/// <summary>
/// Контроллер по управлению грузами (Load) и черновиками (Draft).
/// </summary>
[Authorize]
public class LoadController(IMediator mediator) : BaseLoadController(mediator)
{
    #region Основные грузы (LoadEntity)

    /// <summary>
    /// Получить список активных заказов (грузов). Доступно анонимно.
    /// </summary>
    /// <param name="query">Параметры фильтрации и сортировки.</param>
    /// <returns>Массив грузов, соответствующих фильтру.</returns>
    /// <response code="200">Список грузов успешно получен.</response>
    [AllowAnonymous]
    [HttpGet]
    [ProducesResponseType(typeof(LoadListVm[]), StatusCodes.Status200OK)]
    public async Task<ActionResult<LoadListVm[]>> GetList([FromQuery] GetLoadListQuery query)
    {
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(query)
                )
            );
    }

    /// <summary>
    /// Получить детали конкретного заказа. Доступно анонимно.
    /// </summary>
    /// <param name="id">Идентификатор груза.</param>
    /// <returns>Детальная информация о грузе.</returns>
    /// <response code="200">Детали груза получены.</response>
    /// <response code="404">Груз не найден.</response>
    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(LoadDetailsVm), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoadDetailsVm>> GetDetails(Guid id)
    {
        return Ok(
            ChangeVmForUser(
                await Mediator.Send(new GetLoadDetailQuery(id))
                )
            );
    }

    /// <summary>
    /// Получить список заказов текущего авторизованного пользователя.
    /// </summary>
    /// <param name="status">Фильтр по статусу (по умолчанию Active).</param>
    /// <returns>Массив грузов текущего пользователя.</returns>
    /// <response code="200">Список грузов получен.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpGet("me")]
    [ProducesResponseType(typeof(LoadListVm[]), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoadListVm[]>> GetMy([FromQuery] string status = "Active")
    {
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(new GetUserLoadsQuery { UserId = UserId, Status = status})
                )
            );
    }
    
    /// <summary>
    /// Получить список сохранённых заказов текущего авторизованного пользователя.
    /// </summary>
    /// <returns>Массив сохранённых грузов.</returns>
    /// <response code="200">Список сохранённых грузов получен.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpGet("user/saved")]
    [ProducesResponseType(typeof(LoadListVm[]), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoadListVm[]>> GetMySaved()
    {
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(new GetUserSavedQuery { UserId = UserId })
            )
        );
    }

    /// <summary>
    /// Создать заказ (полная валидация). Груз попадает на модерацию (статус Pending).
    /// </summary>
    /// <param name="command">Данные нового груза.</param>
    /// <returns>Идентификатор созданного груза.</returns>
    /// <response code="200">Груз успешно создан.</response>
    /// <response code="400">Ошибка валидации данных.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateLoadCommand command)
    {
        command.UserId = UserId;
        var settings = UserSettings;
        foreach (var route in command.RoutePoints)
        {
            route.ArrivalTime = route.ArrivalTime.AddHours(-settings.timezone);
        }

        if (!settings.isMetric)
        {
            foreach (var payload in command.Payloads)
            {
                payload.Height *= ToMeter;
                payload.Width *= ToMeter;
                payload.Length *= ToMeter;

                payload.Weight *= 0.4536;
            }
        }
        return Ok(await Mediator.Send(command));
    }

    /// <summary>
    /// Добавить или убрать заказ из сохранённых (toggle).
    /// </summary>
    /// <param name="id">Идентификатор груза.</param>
    /// <returns>true — добавлен в сохранённые, false — убран из сохранённых.</returns>
    /// <response code="200">Операция выполнена.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="403">Доступ запрещён.</response>
    /// <response code="404">Груз не найден.</response>
    [HttpPost("{id:guid}/save")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Save(Guid id)
    {
        var command = new SaveLoadCommand(id, UserId);
        return Ok(await Mediator.Send(command));
    }
    
    /// <summary>
    /// Удалить заказ. Доступно только владельцу.
    /// </summary>
    /// <param name="id">Идентификатор груза.</param>
    /// <response code="204">Груз успешно удалён.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="403">Пользователь не является владельцем груза.</response>
    /// <response code="404">Груз не найден.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(Guid id)
    {
        await Mediator.Send(new DeleteLoadCommand(id, UserId));
        return NoContent();
    }

    /// <summary>
    /// Забронировать груз. Создаёт чат с владельцем и отправляет системное сообщение.
    /// </summary>
    /// <param name="id">Идентификатор груза.</param>
    /// <returns>Идентификатор созданного чата.</returns>
    /// <response code="200">Груз забронирован, чат создан.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="404">Груз не найден.</response>
    [HttpPost("{id:guid}/book")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Guid>> BookLoad(Guid id)
    {
        var command = new BookLoadCommand(id, UserId);
        var (bookerName, article, ownerId) = await Mediator.Send(command);
        var chatCommand = new StartChatCommand()
        {
            CurrentUserId = command.UserId,
            TargetUserId = ownerId,
            LoadId = id
        };
        var chatId = await Mediator.Send(chatCommand);
        var messageCommand = new SendMessageCommand
        {
            ChatId = chatId,
            SenderId = command.UserId,
            Text = $"{bookerName} has been booked load {article}."
        };
        await Mediator.Send(messageCommand);
        return Ok(chatId);
    }

    /// <summary>
    /// Загрузить файлы к заказу (документы, фото). Доступно только владельцу.
    /// </summary>
    /// <param name="id">Идентификатор груза.</param>
    /// <param name="files">Массив загружаемых файлов.</param>
    /// <response code="204">Файлы успешно загружены.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="403">Пользователь не является владельцем груза.</response>
    /// <response code="404">Груз не найден.</response>
    [HttpPut("{id:guid}/files")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> PutFiles(Guid id, [FromForm] IFormFile[] files)
    {
        await Mediator.Send(new UploadLoadFilesCommand { LoadId = id, UserId = UserId, Files = files });
        return NoContent();
    }

    #endregion

    #region Работа с черновиками (LoadDraft)

    /// <summary>
    /// Создать новый пустой или частично заполненный черновик.
    /// </summary>
    /// <param name="command">Данные черновика.</param>
    /// <returns>Идентификатор созданного черновика.</returns>
    /// <response code="200">Черновик успешно создан.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpPost("draft")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Guid>> CreateDraft([FromBody] CreateLoadDraftCommand command)
    {
        command.UserId = UserId;
        var settings = UserSettings;
        foreach (var route in command.RoutePoints ?? [])
        {
            route.ArrivalTime = route.ArrivalTime.AddHours(-settings.timezone);
        }

        if (!settings.isMetric)
        {
            foreach (var payload in command.Payloads ?? [])
            {
                payload.Height *= ToMeter;
                payload.Width *= ToMeter;
                payload.Length *= ToMeter;

                payload.Weight *= 0.4536;
            }
        }
        return Ok(await Mediator.Send(command));
    }

    /// <summary>
    /// Получить список черновиков текущего авторизованного пользователя.
    /// </summary>
    /// <returns>Массив черновиков.</returns>
    /// <response code="200">Список черновиков получен.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="404">Черновики не найдены.</response>
    [HttpGet("draft/me")]
    [ProducesResponseType(typeof(LoadDraftVm[]), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoadDraftVm[]>> GetMyDrafts()
    {
        var command = new GetUserLoadDraftQuery(UserId);
        var vms = await Mediator.Send(command);
        return vms.Select(vm => ChangeDraftVmForUser(vm)).ToArray();
    }
    
    /// <summary>
    /// Получить данные черновика по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор черновика.</param>
    /// <returns>Данные черновика.</returns>
    /// <response code="200">Черновик найден.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="404">Черновик не найден.</response>
    [HttpGet("draft/{id:guid}")]
    [ProducesResponseType(typeof(LoadDraftVm), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoadDraftVm>> GetDraft(Guid id)
    {
        var vm = await Mediator.Send(new GetLoadDraftQuery { Id = id, UserId = UserId });
        
        return Ok(ChangeDraftVmForUser(vm));
    }

    /// <summary>
    /// Обновить данные черновика (без строгой валидации).
    /// </summary>
    /// <param name="id">Идентификатор черновика.</param>
    /// <param name="command">Обновлённые данные черновика.</param>
    /// <returns>Идентификатор обновлённого черновика.</returns>
    /// <response code="200">Черновик успешно обновлён.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="404">Черновик не найден.</response>
    [HttpPut("draft/{id:guid}")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Guid>> UpdateDraft(Guid id, [FromBody] UpdateLoadDraftCommand command)
    {
        command.Id = id;
        command.UserId = UserId;
        return Ok(await Mediator.Send(command));
    }

    /// <summary>
    /// Удалить черновик.
    /// </summary>
    /// <param name="id">Идентификатор черновика.</param>
    /// <response code="204">Черновик успешно удалён.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpDelete("draft/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> DeleteDraft(Guid id)
    {
        await Mediator.Send(new DeleteLoadDraftCommand(id, UserId));
        return NoContent();
    }

    #endregion
}
