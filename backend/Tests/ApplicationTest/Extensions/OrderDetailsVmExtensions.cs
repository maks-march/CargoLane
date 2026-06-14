/*using Domain.Enums;

namespace ApplicationTest.Extensions;

public static class OrderDetailsVmExtensions
{
    public static bool CheckFields(this OrderDetailsVm vm)
    {
        vm.Id.Should().NotBeEmpty();
        vm.Created.Should().BeBefore(DateTime.Now);
        vm.Status.Should().NotBeEmpty();
        vm.StartDate.Should().BeAfter(DateOnly.FromDateTime(DateTime.Now));
        
        vm.Payment.Should().NotBeNull();
        
        vm.Payment.PaymentType.Should().NotBeEmpty();
        if (vm.Payment.PaymentType != nameof(PaymentType.Request))
        {
            if (vm.Payment.IsByCash)
                vm.Payment.ByCash.Should().NotBe(0);
            if (vm.Payment.IsTaxedByCard)
                vm.Payment.TaxedByCard.Should().NotBe(0);
            if (vm.Payment.IsNotTaxedByCard)
                vm.Payment.NotTaxedByCard.Should().NotBe(0);
        }
        vm.Payment.Prepayment.Should().BeInRange(0, 100);
        
        vm.Transport.Should().NotBeNull();
        vm.Transport.BodyType.Should().NotBeEmpty();
        vm.Transport.Vehicles.Should().BeGreaterThan(0);
        vm.Transport.Adr.Should().BeInRange(1, 9);
        if (vm.Transport is { TemperatureFrom: not null, TemperatureTo: not null })
            vm.Transport.TemperatureFrom.Should().BeLessThanOrEqualTo((int)vm.Transport.TemperatureTo);
        
        vm.Payloads.Should().NotBeEmpty();
        vm.Payloads.Count.Should().BeGreaterThan(0);
        foreach (var payload in vm.Payloads)
        {
            payload.Should().NotBeNull();
            payload.Name.Should().NotBeEmpty();
            payload.Volume.Should().BeGreaterThan(0);
            payload.Weight.Should().BeGreaterThan(0);
            payload.Amount.Should().BeGreaterThan(0);
        }
        
        vm.RoutePoints.Should().NotBeEmpty();
        vm.RoutePoints.Count.Should().BeGreaterThan(1);
        
        foreach (var route in vm.RoutePoints)
        {
            route.Should().NotBeNull();
            route.City.Should().NotBeEmpty();
            route.Address.Should().NotBeEmpty();
            route.LoadTimeStart.Should().BeLessThanOrEqualTo(route.LoadTimeStart);
            route.Date.Should().BeAfter(DateOnly.FromDateTime(DateTime.Now));
        }
        vm.RoutePoints.First().IsLoad.Should().BeTrue();
        vm.RoutePoints.Last().IsLoad.Should().BeFalse();

        return true;
    }

    public static bool CheckDifference(this OrderDetailsVm vm, OrderDetailsVm other)
    {
        vm.Id.Should().Be(other.Id);
        vm.Created.Should().Be(other.Created);
        vm.Status.Should().NotBe(other.Status);
        vm.StartDate.Should().NotBe(other.StartDate);
        
        vm.Payment.PaymentType.Should().NotBe(other.Payment.PaymentType);
        if (vm.Payment.PaymentType != nameof(PaymentType.Request))
        {
            vm.Payment.IsByCash.Should().NotBe(other.Payment.IsByCash);
            vm.Payment.ByCash.Should().NotBe(other.Payment.ByCash);
            vm.Payment.IsTaxedByCard.Should().NotBe(other.Payment.IsTaxedByCard);
            vm.Payment.TaxedByCard.Should().NotBe(other.Payment.ByCash);
            vm.Payment.IsNotTaxedByCard.Should().NotBe(other.Payment.IsNotTaxedByCard);
            vm.Payment.NotTaxedByCard.Should().NotBe(other.Payment.ByCash);
        }
        vm.Payment.Prepayment.Should().NotBe(other.Payment.Prepayment);
        
        vm.Transport.BodyType.Zip(other.Transport.BodyType, (actual, expected) => 
            actual.Should().NotBe(expected)).ToArray();
        vm.Transport.Vehicles.Should().NotBe(other.Transport.Vehicles);
        vm.Transport.Adr.Should().NotBe(other.Transport.Adr);
        if (vm.Transport is { TemperatureFrom: not null, TemperatureTo: not null })
            vm.Transport.TemperatureFrom.Should().BeLessThanOrEqualTo((int)vm.Transport.TemperatureTo);
        
        vm.Payloads.Count.Should().NotBe(other.Payloads.Count);
        foreach (var (payload, otherPayload) in vm.Payloads.Zip(other.Payloads))
        {
            payload.Should().NotBeNull();
            payload.Name.Should().NotBe(otherPayload.Name);
            payload.Volume.Should().NotBe(otherPayload.Volume);
            payload.Weight.Should().NotBe(otherPayload.Weight);
            payload.Amount.Should().NotBe(otherPayload.Amount);
            payload.Wrap.Should().NotBe(otherPayload.Wrap);
        }
        
        vm.RoutePoints.Count.Should().NotBe(other.RoutePoints.Count);
        foreach (var (route, otherRoute) in vm.RoutePoints.Zip(other.RoutePoints))
        {
            route.Should().NotBeNull();
            route.City.Should().NotBe(otherRoute.City);
            route.Address.Should().NotBe(otherRoute.Address);
            route.LoadTimeStart.Should().NotBe(otherRoute.LoadTimeStart);
            route.Date.Should().NotBe(otherRoute.Date);
        }
        vm.RoutePoints.First().IsLoad.Should().BeTrue();
        vm.RoutePoints.Last().IsLoad.Should().BeFalse();

        return true;
    }
}*/