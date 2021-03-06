import factory
from apps.catalog.tests.factories import CategoryFactory

from apps.advertisers.models import BannerType, HeadBasis
from apps.catalog.models import Category


class AdvertiserProfileFactory(factory.django.DjangoModelFactory):
    account = factory.Faker('credit_card_number')
    inn = factory.Sequence(lambda n: n)
    bik = factory.Faker('ean8')
    kpp = factory.Faker('ean8')
    korr = factory.Faker('ean8')
    bank = 'Сбербанк'
    address = factory.Faker('street_name')
    legal_address = factory.Faker('street_name')
    contact_name = factory.Faker('name')
    contact_phone = factory.Faker('phone_number')
    head_name = factory.Faker('name')
    head_basis = HeadBasis.charter
    type = 10

    class Meta:
        model = 'advertisers.AdvertiserProfile'


class MerchantFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: 'merchant {}'.format(n))
    image = factory.SubFactory('apps.mediafiles.tests.factories.ImageFactory')
    advertiser = factory.SubFactory('apps.users.tests.factories.UserFactory')
    is_active = True
    banner_mailings_count = 0
    moderation_status = 2

    class Meta:
        model = 'advertisers.Merchant'


class BannerFactory(factory.django.DjangoModelFactory):

    id = factory.Sequence(lambda n: n)
    type = BannerType.ACTION
    image = factory.SubFactory('apps.mediafiles.tests.factories.ImageFactory')
    url = factory.Faker('url')
    on_main = False
    in_mailing = False
    merchant = factory.SubFactory(MerchantFactory)

    @factory.post_generation
    def categories(obj, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for i in extracted:
                if Category.objects.filter(id=i).exists():
                    cat = Category.objects.get(id=i)
                else:
                    cat = CategoryFactory.create(id=i)

            obj.categories.add(cat)

    @classmethod
    def _adjust_kwargs(cls, **kwargs):
        if isinstance(kwargs.get('type', None), str):
            kwargs['type'] = BannerType.get(kwargs['type'])
        return kwargs

    class Meta:
        model = 'advertisers.Banner'
