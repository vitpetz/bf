from django_filters import filterset, filters

from apps.users.models import User

from ..models import Invoice


class InvoiceFilter(filterset.FilterSet):
    strict = filterset.STRICTNESS.RAISE_VALIDATION_ERROR

    advertiser = filters.ModelChoiceFilter(name='merchant__advertiser', queryset=User.objects.filter(profile__isnull=False))
    date = filters.DateFilter(name='created_datetime', lookup_expr='date')

    min_sum = filters.NumberFilter(name='sum', lookup_expr='gte')
    max_sum = filters.NumberFilter(name='sum', lookup_expr='lte')

    status = filters.ChoiceFilter(choices=Invoice.STATUSES)

    class Meta:
        model = Invoice
        fields = ['date', 'advertiser', 'id', 'min_sum', 'max_sum', 'status']