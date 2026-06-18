using Application.DTO.Load;
using MediatR;

namespace WebApi.Common.Controllers.Abstract;

public class BaseLoadController(IMediator mediator) : BaseController(mediator)
{
    
    protected double ToFt = 1 / 0.3048;
    protected double ToMeter = 0.3048;
    
    protected LoadDetailsVm ChangeVmForUser(LoadDetailsVm vm)
    {
        if (UserId == Guid.Empty) return vm;
        var settings = UserSettings;
        vm.Created = vm.Created.AddHours(settings.timezone);
        foreach (var route in vm.RoutePoints)
        {
            route.ArrivalTime = route.ArrivalTime.AddHours(settings.timezone);
        }

        if (!settings.isMetric)
        {
            vm.TotalWeight *= ToFt;
            vm.TotalVolume *= ToFt;
            foreach (var payload in vm.Payloads)
            {
                payload.Height *= ToFt;
                payload.Width *= ToFt;
                payload.Length *= ToFt;

                payload.Weight *= 2.20462;
            }
        }

        return vm;
    }
    
    protected LoadListVm[] ChangeListVmForUser(LoadListVm[] vms)
    {
        if (UserId == Guid.Empty) return vms;
        var settings = UserSettings;
        foreach (var vm in vms)
        {
            vm.Created = vm.Created.AddHours(settings.timezone);
            vm.StartDate = vm.StartDate.AddHours(settings.timezone);
            if (!settings.isMetric)
            {
                vm.TotalWeight *= ToFt;
                vm.TotalVolume *= ToFt;
            }
        }

        return vms;
    }
    
    protected LoadDraftVm ChangeDraftVmForUser(LoadDraftVm vm)
    {
        if (UserId == Guid.Empty) return vm;
        var settings = UserSettings;
        foreach (var route in vm.RoutePoints)
        {
            route.ArrivalTime = route.ArrivalTime.AddHours(settings.timezone);
        }

        if (!settings.isMetric)
        {
            foreach (var payload in vm.Payloads)
            {
                payload.Height *= ToFt;
                payload.Width *= ToFt;
                payload.Length *= ToFt;

                payload.Weight *= 2.20462;
            }
        }

        return vm;
    }
}